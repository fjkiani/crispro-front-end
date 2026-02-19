import { useMemo } from 'react';

export const usePatientStatus = (patientProfile) => {
    return useMemo(() => {
        if (!patientProfile) return { status: null, missingTests: [] };

        // Handle both flat and hierarchical structures
        const disease = patientProfile.disease || (typeof patientProfile.disease === 'string' ? {} : patientProfile.disease) || {};
        const tumorContext = patientProfile.tumor_context || {};
        const germline = patientProfile.germline || {};
        const treatment = patientProfile.treatment || {};

        // Calculate completeness
        const completenessScore = tumorContext.completeness_score ||
            (tumorContext.biomarkers ? 0.3 : 0) +
            (germline.mutations?.length > 0 ? 0.25 : 0) +
            (tumorContext.somatic_mutations?.some(m => m.genomic_coordinate_hg38) ? 0.3 : 0) +
            (patientProfile.ca125_value ? 0.15 : 0);

        const intakeLevel = completenessScore >= 0.7 ? 'L2' : completenessScore >= 0.3 ? 'L1' : 'L0';

        // Determine what's available
        const hasIHC = !!tumorContext.biomarkers;
        const hasGermline = !!germline.mutations && germline.mutations.length > 0;
        const hasNGS = !!tumorContext.somatic_mutations?.some(m => m.genomic_coordinate_hg38);
        const hasCA125 = !!patientProfile.ca125_value || !!patientProfile.ca125_baseline;

        // Get disease info (handle both structures)
        const diseaseType = disease.type || patientProfile.disease || 'Unknown';
        const diseaseStage = disease.stage || patientProfile.stage || 'Unknown';
        const treatmentLine = treatment.line_number || treatment.line || patientProfile.treatment_line || 0;

        // Key biomarkers
        const biomarkers = [];
        if (tumorContext.biomarkers?.pd_l1_status === 'POSITIVE') {
            biomarkers.push(`PD-L1+ (CPS ${tumorContext.biomarkers.pd_l1_cps || ''})`);
        }
        if (tumorContext.biomarkers?.her2_status) {
            biomarkers.push(`HER2 ${tumorContext.biomarkers.her2_status}`);
        }
        if (tumorContext.somatic_mutations?.some(m => m.gene === 'TP53')) {
            biomarkers.push('TP53 Mutant');
        }
        if (germline.mutations?.some(m => m.gene === 'MBD4')) {
            biomarkers.push('MBD4 Germline');
        }

        const patientStatus = {
            diseaseType,
            diseaseStage,
            treatmentLine,
            completenessScore,
            intakeLevel,
            hasIHC,
            hasGermline,
            hasNGS,
            hasCA125,
            biomarkers,
        };

        // Calculate missing tests
        const missingTests = [];
        if (!hasNGS) {
            missingTests.push({
                name: 'Tumor NGS',
                urgency: 'high',
                unlocks: [
                    'Drug Efficacy Predictions (S/P/E)',
                    'Resistance Analysis',
                    'Clinical Trial Matching',
                    'Synthetic Lethality Discovery',
                ],
                value: 'Unlocks personalized drug rankings and trial matching based on your specific mutations',
            });
        }

        if (!hasCA125) {
            missingTests.push({
                name: 'CA-125',
                urgency: 'medium',
                unlocks: [
                    'Disease Monitoring',
                    'Response Tracking',
                    'Progression Alerts',
                ],
                value: 'Enables automated tracking of treatment response and disease burden',
            });
        }

        return { patientStatus, missingTests };
    }, [patientProfile]);
};
