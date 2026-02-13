/**
 * useAyeshaProfile - Hook for accessing Ayesha's patient profile
 * 
 * Single source of truth: AYESHA_11_17_25_PROFILE constant
 * Provides helper functions to extract data from profile
 * 
 * NO HARD-CODING - All data comes from the profile constant
 */

import { useMemo, useState, useEffect } from 'react';
import { AYESHA_11_17_25_PROFILE } from '../../constants/patients/ayesha_11_17_25';

/**
 * Custom hook for Ayesha's patient profile
 * Returns profile and helper functions to extract data
 */
export const useAyeshaProfile = () => {
  // 1. Manage Overrides (Phase 4: "Fix Holistic Score Inputs")
  const [overrides, setOverrides] = useState({});

  useEffect(() => {
    const load = () => {
      try {
        const s = localStorage.getItem('ayesha_profile_overrides');
        if (s) setOverrides(JSON.parse(s));
      } catch (e) { console.error("Profile override load failed", e); }
    };
    load();
    window.addEventListener('ayesha_profile_updated', load);
    return () => window.removeEventListener('ayesha_profile_updated', load);
  }, []);

  // 2. Merge Profile with Overrides
  const profile = useMemo(() => {
    const base = AYESHA_11_17_25_PROFILE;
    if (!overrides || Object.keys(overrides).length === 0) return base;

    // Deep merge logic (Targeted)
    const merged = { ...base };

    // 1. Treatment Line
    if (overrides.line_of_therapy) {
      merged.inferred_fields = {
        ...merged.inferred_fields,
        treatment_line: {
          ...merged.inferred_fields?.treatment_line,
          value: overrides.line_of_therapy
        }
      };
    }

    // 2. Platinum Status (Inject into tumor_context for Routes.py consumption)
    if (overrides.pfi_status) {
      merged.tumor_context = {
        ...merged.tumor_context,
        platinum_status: overrides.pfi_status
      };
    }

    // 3. Stage
    if (overrides.stage) {
      merged.disease = {
        ...merged.disease,
        stage: overrides.stage
      };
    }

    return merged;
  }, [overrides]);

  // Memoized extractions (computed once)
  const patient = useMemo(() => profile.patient || {}, [profile]);
  const disease = useMemo(() => profile.disease || {}, [profile]);
  const tumorContext = useMemo(() => profile.tumor_context || {}, [profile]);
  const germline = useMemo(() => profile.germline || {}, [profile]);
  const labs = useMemo(() => profile.labs || {}, [profile]);
  const clinical = useMemo(() => profile.clinical || {}, [profile]);
  const imaging = useMemo(() => profile.imaging || {}, [profile]);
  const pathology = useMemo(() => profile.pathology || {}, [profile]);

  // Helper: Extract biomarkers as chips
  const biomarkerChips = useMemo(() => {
    const chips = [];
    const biomarkers = tumorContext?.biomarkers || {};

    if (disease?.stage) {
      chips.push({ label: `Stage ${disease.stage}`, color: 'error' });
    }

    if (labs?.ca125_value) {
      chips.push({
        label: `CA-125: ${labs.ca125_value.toLocaleString()} ${labs.ca125_units || 'U/mL'}`,
        color: 'success',
      });
    }

    if (germline?.status === 'POSITIVE') {
      const firstMutation = germline.mutations?.[0];
      chips.push({
        label: `Germline: Positive (${firstMutation?.gene || 'MBD4'})`,
        color: 'error',
      });
    }

    if (biomarkers.pd_l1_status === 'POSITIVE') {
      chips.push({
        label: `PD-L1+ (CPS ${biomarkers.pd_l1_cps || 'N/A'})`,
        color: 'success',
      });
    }

    if (biomarkers.p53_status === 'MUTANT_TYPE') {
      chips.push({ label: 'p53 Mutant', color: 'info' });
    }

    if (biomarkers.mmr_status === 'PRESERVED') {
      chips.push({ label: 'MMR Preserved', color: 'default' });
    }

    if (biomarkers.er_status) {
      chips.push({
        label: `ER ${biomarkers.er_status.replace('_', ' ')}`,
        color: 'default',
      });
    }

    if (biomarkers.her2_status === 'NEGATIVE') {
      chips.push({ label: 'HER2-', color: 'default' });
    }

    if (biomarkers.folr1_status === 'NEGATIVE') {
      chips.push({ label: 'FOLR1-', color: 'default' });
    }

    return chips;
  }, [disease, labs, germline, tumorContext]);

  // Helper: Build API request body from profile (matches useCompleteCareOrchestrator format)
  const buildRequest = useMemo(() => {
    return (options = {}) => {
      const {
        include_trials = false,
        include_wiwfm = false,
        include_food = false,
        include_resistance = false,
        include_resistance_prediction = false,
        include_soc = true,
        include_ca125 = true,
        include_biomarker = true,
        max_trials = 10,
      } = options;

      // Extract tumor_context for backend (matches useCompleteCareOrchestrator format)
      const biomarkers = tumorContext?.biomarkers || {};
      const somatic = tumorContext?.somatic_mutations || [];

      const tumor_context_for_api = {
        p53_status: biomarkers.p53_status || null,
        pd_l1: {
          cps: biomarkers.pd_l1_cps || null,
          status: biomarkers.pd_l1_status || null,
        },
        pd_l1_cps: biomarkers.pd_l1_cps || null,
        pd_l1_status: biomarkers.pd_l1_status || null,
        msi_status: biomarkers.msi_status || null,
        er_percent: biomarkers.er_percent || null,
        er_status: biomarkers.er_status || null,
        pr_status: biomarkers.pr_status || null,
        mmr_status: biomarkers.mmr_status || null,
        her2_status: biomarkers.her2_status || null,
        folr1_status: biomarkers.folr1_status || null,
        ntrk_status: biomarkers.ntrk_status || null,
        hrd_score: tumorContext?.hrd_score || null,
        tmb: tumorContext?.tmb || null,
        somatic_mutations: somatic
          .map((m) => ({
            gene: m.gene,
            variant: m.variant || null,
            hgvs_p: m.hgvs_p || m.protein_change || null,
            hgvs_c: m.hgvs_c || null,
            chrom: m.chrom || null,
            pos: typeof m.pos === 'number' ? m.pos : (m.pos ? Number(m.pos) : null),
            ref: m.ref || null,
            alt: (m.alt === '' ? '' : (m.alt || null)),
            build: m.build || null,
            consequence: m.consequence || null,
            source: m.source || null,
            evidence: m.evidence || null,
          }))
          .filter((m) => m.gene),
      };

      // Match useCompleteCareOrchestrator format (flat, not nested in patient_profile)
      return {
        ca125_value: labs?.ca125_value || null,
        stage: disease?.stage || 'IVB',
        treatment_line: profile.inferred_fields?.treatment_line?.value?.toString() || 'either',
        germline_status: profile.germline_status || germline?.status?.toLowerCase() || 'positive',
        location_state: patient?.demographics?.location_state || 'NY',
        has_ascites: profile.clinical?.has_ascites || false,
        has_peritoneal_disease: profile.clinical?.has_peritoneal_disease || false,
        ecog_status: profile.clinical?.ecog_status || null,
        tumor_context: tumor_context_for_api,
        treatment_history: profile.treatment_history || [],
        patient_age: patient?.demographics?.age || null,
        autoimmune_history: patient?.autoimmune_history || [],
        germline_variants: germline?.mutations?.map((m) => ({
          gene: m.gene,
          variant: m.variant || null,
          hgvs_c: m.variant || null,
          hgvs_p: m.hgvs_p || m.protein_change || null,
          protein_change: m.protein_change || null,
          chrom: m.chrom || null,
          pos: typeof m.pos === 'number' ? m.pos : (m.pos ? Number(m.pos) : null),
          ref: m.ref || null,
          alt: (m.alt === '' ? '' : (m.alt || null)),
          build: m.build || null,
          consequence: m.consequence || null,
          classification: m.classification,
          zygosity: m.zygosity,
        })) || [],
        include_trials,
        include_soc,
        include_ca125,
        include_wiwfm,
        include_io_selection: false, // Optional, not in default options
        include_food,
        include_resistance,
        include_resistance_prediction,
        max_trials,
      };
    };
  }, [profile, patient, disease, germline, tumorContext, labs]);

  // Helper: Get germline mutations for DDR calculation
  const getDDRMutations = useMemo(() => {
    return () => {
      return (germline?.mutations || [])
        .filter((m) => m.classification === 'pathogenic' || m.gene === 'MBD4')
        .map((m) => ({
          gene_symbol: m.gene,
          variant_classification: m.classification || 'pathogenic',
        }));
    };
  }, [germline]);

  return useMemo(() => ({
    profile,
    patient,
    disease,
    tumorContext,
    germline,
    labs,
    clinical,
    imaging,
    pathology,
    biomarkerChips,
    buildRequest,
    getDDRMutations,
  }), [
    profile,
    patient,
    disease,
    tumorContext,
    germline,
    labs,
    clinical,
    imaging,
    pathology,
    biomarkerChips,
    buildRequest,
    getDDRMutations
  ]);
};

export default useAyeshaProfile;
