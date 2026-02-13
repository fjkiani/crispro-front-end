/**
 * useSyntheticLethality Hook
 * 
 * React hook for fetching synthetic lethality analysis from backend API.
 * 
 * Purpose: Fetch SL analysis for patient mutations (e.g., MBD4+TP53 → PARP/ATR opportunities)
 * API Endpoint: POST /api/agents/synthetic_lethality
 * 
 * Returns: { slResult, loading, error, analyzeSL, resetSL }
 */
import { useState, useCallback } from 'react';
import { AYESHA_11_17_25_PROFILE } from '../constants/patients/ayesha_11_17_25';

const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:8000';

function _inferConsequenceFromHgvs(hgvsP, hgvsC, fallback = 'missense_variant') {
  const p = (hgvsP || '').toLowerCase();
  const c = (hgvsC || '').toLowerCase();

  if (p.includes('fs')) return 'frameshift_variant';
  if (p.includes('*')) return 'stop_gained';
  if (c.includes('del') || c.includes('dup') || c.includes('ins')) return 'frameshift_variant';
  return fallback;
}

function _pickHgvsP(m) {
  return (
    m?.protein_change ||
    m?.hgvs_p ||
    (typeof m?.variant === 'string' && m.variant.startsWith('p.') ? m.variant : null) ||
    null
  );
}

function _pickHgvsC(m) {
  return (typeof m?.variant === 'string' && m.variant.startsWith('c.')) ? m.variant : (m?.hgvs_c || null);
}

export const useSyntheticLethality = () => {
  const [slResult, setSlResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeSL = useCallback(async (patientData = AYESHA_11_17_25_PROFILE) => {
    setLoading(true);
    setError(null);

    try {
      // Extract mutations from patient profile
      const mutations = [];
      
      // Germline mutations
      if (patientData.germline?.mutations) {
        mutations.push(...patientData.germline.mutations.map(m => ({
          gene: m.gene,
          hgvs_p: _pickHgvsP(m),
          hgvs_c: _pickHgvsC(m),
          consequence: m.variant_type || m.consequence || _inferConsequenceFromHgvs(_pickHgvsP(m), _pickHgvsC(m), 'missense_variant'),
          chrom: m.chromosome || null,
          pos: m.position || null,
          ref: m.ref || null,
          alt: m.alt || null
        })));
      }
      
      // Somatic mutations
      if (patientData.tumor_context?.somatic_mutations) {
        mutations.push(...patientData.tumor_context.somatic_mutations.map(m => ({
          gene: m.gene,
          hgvs_p: m.protein_change || m.hgvs_p || m.variant || null,
          hgvs_c: m.hgvs_c || (typeof m.variant === 'string' && m.variant.startsWith('c.') ? m.variant : null),
          consequence: m.variant_type || m.consequence || _inferConsequenceFromHgvs(m.protein_change || m.hgvs_p || m.variant, m.hgvs_c, 'missense_variant'),
          chrom: m.chromosome || null,
          pos: m.position || null,
          ref: m.ref || null,
          alt: m.alt || null
        })));
      }

      // If no mutations found, return early
      if (mutations.length === 0) {
        setError('No mutations found in patient profile');
        setLoading(false);
        return;
      }

      // Build request body
      const diseaseType = patientData.disease?.type || 'ovarian_cancer';
      const disease = diseaseType.replace(/_/g, ' ').replace('hgs', '').trim() || 'ovarian_cancer';

      const requestBody = {
        disease: disease,
        mutations: mutations,
        options: {
          model_id: "evo2_7b",
          include_explanations: true,
          explanation_audience: "clinician"
        }
      };

      console.log('[useSyntheticLethality] Request:', {
        disease,
        mutationCount: mutations.length,
        mutations: mutations.map(m => `${m.gene} ${m.hgvs_p || ''}`)
      });

      // Add timeout controller (60 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch(`${API_ROOT}/api/agents/synthetic_lethality`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: `HTTP ${response.status}: ${response.statusText}` }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[useSyntheticLethality] Response:', {
        slDetected: data.synthetic_lethality_detected,
        suggestedTherapy: data.suggested_therapy,
        drugCount: data.recommended_drugs?.length || 0,
        brokenPathways: data.broken_pathways?.length || 0,
        essentialPathways: data.essential_pathways?.length || 0
      });

      setSlResult(data);
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('SL analysis timed out after 60 seconds. The backend may be slow or unresponsive.');
      } else {
        setError(err.message || 'Failed to analyze synthetic lethality');
      }
      console.error('[useSyntheticLethality] Error:', err);
      setSlResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetSL = useCallback(() => {
    setSlResult(null);
    setLoading(false);
    setError(null);
  }, []);

  return { slResult, loading, error, analyzeSL, resetSL };
};
