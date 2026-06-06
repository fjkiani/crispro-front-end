/**
 * useBiomarkerUpdate — wire test entry forms to the backend biomarker update endpoint.
 *
 * Maps test slug → backend PATCH /api/ayesha/profile/biomarker
 * Handles saving state, success toast, and error surfacing.
 *
 * Usage:
 *   const { update, saving, saved, error } = useBiomarkerUpdate('hrd');
 *   <HRDEntryForm onSave={update} />
 */
import { useState, useCallback } from 'react';
import { API_ROOT } from '../../lib/apiConfig';

// Map test slug → biomarker_type sent to backend
const SLUG_TO_BIOMARKER_TYPE = {
    hrd: 'hrd',
    hrd_score: 'hrd',
    ctdna_mrd: 'ctdna',
    ca125_kinetics: 'ca125',
    repair_capacity: 'repair_capacity',
};

// Fixed patient ID for Ayesha digital twin (session-scoped)
const AYESHA_PATIENT_ID = 'ayesha-digital-twin';

export function useBiomarkerUpdate(slug) {
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState(null);

    const update = useCallback(async (formData) => {
        const biomarker_type = SLUG_TO_BIOMARKER_TYPE[slug];
        if (!biomarker_type) {
            setError(`No biomarker type mapped for slug: ${slug}`);
            return;
        }

        setSaving(true);
        setSaved(false);
        setError(null);

        try {
            const payload = {
                patient_id: AYESHA_PATIENT_ID,
                biomarker_type,
                value: formData,
            };

            const res = await fetch(`${API_ROOT}/api/ayesha/profile/biomarker`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const detail = await res.text().catch(() => res.statusText);
                throw new Error(`Server error ${res.status}: ${detail}`);
            }

            setSaved(true);
            // Bust the therapy-fit bundle sessionStorage cache so the next Treatment page
            // load re-fetches with the new biomarker data (fingerprintLocalInputs reads this key)
            try {
              localStorage.setItem('ayesha_biomarker_updated_at', String(Date.now()));
            } catch {}
            // Auto-clear success state after 3s
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setError(err.message || 'Update failed. Please try again.');
        } finally {
            setSaving(false);
        }
    }, [slug]);

    return { update, saving, saved, error };
}
