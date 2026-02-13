import { useState, useEffect, useCallback } from 'react';
import { useSyntheticLethality } from './useSyntheticLethality';
import { useTimingChemoFeatures } from './useTimingChemoFeatures';
import { AYESHA_11_17_25_PROFILE } from '../constants/patients/ayesha_11_17_25';

const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:8000';

/**
 * useAyeshaCarePlan - The "Central Nervous System" for Ayesha's Digital Twin.
 * 
 * Responsibilities:
 * 1. Centralized Data Fetching (complete_care_v2)
 * 2. Side-Effect Management (SL & Timing computation)
 * 3. Honest State Management (Loading, Error, Data)
 * 
 * @param {Object} patientProfile - Optional override, defaults to AYESHA_11_17_25
 */
export const useAyeshaCarePlan = (patientProfile = AYESHA_11_17_25_PROFILE) => {
    // Core State
    const [data, setData] = useState({
        trials: [],
        // Intelligence Envelopes
        ca125Intelligence: null,
        socRecommendation: null,
        nextTestRecommender: null,
        hintTiles: [],
        mechanismMap: null,
        // Resistance & Safety
        resistanceAlert: null,
        resistancePlaybook: null,
        saeFeatures: null,
        resistancePrediction: null,
        // Clinical Efficacy
        wiwfm: null,
        foodValidation: null,
        // Meta
        provenance: null,
        summary: null
    });

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Sub-Hooks (The "Reflexes")
    const {
        slResult,
        loading: slLoading,
        error: slError,
        analyzeSL
    } = useSyntheticLethality();

    const {
        timingFeatures,
        loading: timingLoading,
        error: timingError,
        computeTimingFeatures
    } = useTimingChemoFeatures();

    // 1. Primary Data Fetch (The "Brain")
    const loadCarePlan = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Build unified request payload from profile
            const payload = buildRequestPayload(patientProfile);

            const response = await fetch(`${API_ROOT}/api/ayesha/complete_care_v2`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const rawData = await response.json();

            // Honest State Update
            setData({
                trials: rawData.trials?.trials || [],
                ca125Intelligence: rawData.ca125_intelligence,
                socRecommendation: rawData.soc_recommendation || null,
                nextTestRecommender: rawData.next_test_recommender || null,
                hintTiles: rawData.hint_tiles?.hint_tiles || [],
                mechanismMap: rawData.mechanism_map || null,
                resistanceAlert: rawData.resistance_alert || null,
                resistancePlaybook: rawData.resistance_playbook || null,
                saeFeatures: rawData.sae_features || null,
                resistancePrediction: rawData.resistance_prediction || null,
                wiwfm: rawData.wiwfm || null,
                foodValidation: rawData.food_validation || null,
                provenance: rawData.provenance,
                summary: rawData.summary
            });

            // trigger secondary calculations if needed
            triggerSecondaryComputations(patientProfile);

        } catch (err) {
            console.error('Failed to load complete care plan:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [patientProfile]);

    // 2. Secondary Computations (The "Reflexes")
    // These run AFTER the main fetch or On Mount to ensure data consistency.
    const triggerSecondaryComputations = (profile) => {
        // A. Trigger Synthetic Lethality Analysis
        // Safe to call idempotent analysis
        analyzeSL(profile);

        // B. Trigger Timing Features
        // Only if treatment history exists and we haven't computed yet
        const treatmentHistory = profile.treatment_history || [];
        if (treatmentHistory.length > 0) {
            // Prepare tables for timing computation
            const timingPayload = buildTimingPayload(profile);
            computeTimingFeatures(timingPayload).catch(err => {
                console.warn("Background timing computation failed (non-critical):", err);
            });
        }
    };

    // Initial Load
    useEffect(() => {
        loadCarePlan();
    }, [loadCarePlan]);

    // 3. Derived Metrics (Opportunity Score)
    const calculateOpportunityScore = () => {
        let score = 0;
        let maxScore = 0;

        // Configurable weights matching the legacy logic
        const sections = [
            { condition: data.trials.length > 0, points: Math.min(data.trials.length * 2, 20), max: 20 },
            { condition: !!data.socRecommendation?.confidence, points: (data.socRecommendation?.confidence || 0) * 15, max: 15 },
            { condition: !!data.ca125Intelligence?.burden_class, points: 10, max: 10 },
            { condition: data.wiwfm?.drugs?.length > 0, points: 20, max: 20 },
            { condition: data.saeFeatures?.dna_repair_capacity !== undefined, points: 15, max: 15 },
            { condition: data.resistancePlaybook?.risks?.length > 0, points: 10, max: 10 },
            { condition: !!data.resistancePrediction?.risk_level, points: 10, max: 10 }
        ];

        sections.forEach(sec => {
            score += sec.condition ? sec.points : 0;
            maxScore += sec.max;
        });

        return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    };

    return {
        ...data,
        opportunityScore: calculateOpportunityScore(),
        isLoading,
        error,
        // Sub-hook states exposed cleanly
        slResult,
        slLoading,
        slError,
        timingFeatures,
        timingLoading,
        timingError,
        // Action to force reload
        refresh: loadCarePlan
    };
};

// ------------------------------------------------------------------
// Internal Helpers (Pure Functions)
// ------------------------------------------------------------------

function buildRequestPayload(profile) {
    const treatmentLineValue = profile.inferred_fields?.treatment_line?.value ?? 0;
    const treatmentLine = treatmentLineValue === 0 ? "frontline" : "recurrent";

    const biomarkers = profile.tumor_context?.biomarkers || {};
    const tumorContext = {
        p53_status: biomarkers.p53_status || null,
        pd_l1: biomarkers.pd_l1_status ? {
            cps: biomarkers.pd_l1_cps || null,
            status: biomarkers.pd_l1_status
        } : null,
        er_percent: biomarkers.er_percent || null,
        er_status: biomarkers.er_status || null,
        pr_status: biomarkers.pr_status || null,
        mmr_status: biomarkers.mmr_status || null,
        her2_status: biomarkers.her2_status || null,
        folr1_status: biomarkers.folr1_status || null,
        ntrk_status: biomarkers.ntrk_status || null,
        somatic_mutations: profile.tumor_context?.somatic_mutations || [],
        germline_variants: profile.germline?.mutations?.map(m => ({
            gene: m.gene,
            variant: m.variant,
            classification: m.classification
        })) || []
    };

    return {
        stage: profile.disease?.stage || "IVB",
        treatment_line: treatmentLine,
        germline_status: profile.germline_status || "positive",
        location_state: profile.patient?.demographics?.location_state || "NY",
        has_ascites: profile.clinical?.has_ascites || false,
        has_peritoneal_disease: profile.clinical?.has_peritoneal_disease || false,
        ca125_value: profile.labs?.ca125_value || null,
        include_trials: true,
        include_soc: true,
        include_ca125: true,
        include_wiwfm: true,
        include_food: true,
        include_resistance: true,
        include_resistance_prediction: true,
        max_trials: 10,
        tumor_context: tumorContext
    };
}

function buildTimingPayload(profile) {
    const treatmentHistory = profile.treatment_history || [];

    const regimenTable = treatmentHistory.map((tx, idx) => ({
        patient_id: profile.patient?.patient_id || 'AK',
        regimen_id: `regimen_${idx + 1}`,
        regimen_start_date: tx.start_date || new Date().toISOString(),
        regimen_end_date: tx.end_date || null,
        regimen_type: tx.regimen_type || (tx.drugs?.join('+') || 'unknown'),
        line_of_therapy: tx.line || idx + 1,
        setting: tx.setting || (idx === 0 ? 'frontline' : 'recurrent'),
        last_platinum_dose_date: tx.last_platinum_dose_date || null,
        progression_date: tx.progression_date || null,
        best_response: tx.outcome || tx.best_response || null,
    }));

    const survivalTable = [{
        patient_id: profile.patient?.patient_id || 'AK',
        vital_status: 'Alive',
        death_date: null,
        last_followup_date: new Date().toISOString(),
    }];

    const clinicalTable = [{
        patient_id: profile.patient?.patient_id || 'AK',
        disease_site: profile.disease?.type?.replace(/_/g, ' ') || 'ovary',
        tumor_subtype: profile.disease?.histology || 'HGSOC',
    }];

    return {
        regimenTable,
        survivalTable,
        clinicalTable,
        ca125MeasurementsTable: profile.labs?.ca125_measurements || null,
    };
}
