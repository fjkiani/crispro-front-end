/**
 * RUO Reason Translation Table
 * Maps Python-style ruo_reasons strings to patient-readable text.
 * 🔱 ZETA MANDATE: No code strings in UI. Ever.
 */

const RUO_TRANSLATIONS = {
    // Trial / evidence status
    'no_human_ovarian_trial': 'No ovarian cancer trial yet',
    'no_human_efficacy_signal_gynecologic': 'No human efficacy data in gynecologic cancers',
    'preclinical_mechanism_only': 'Evidence is lab-based only (no human trial)',
    'preclinical_only_ovarian': 'Ovarian evidence is lab-based only',
    'no_human_pk_data': 'No human dosing data available',
    'no_human_safety_at_cancer_doses': 'Not tested at cancer-relevant doses in humans',
    'zero_objective_response_phase1': 'Zero tumor response in Phase I trial',
    'no_efficacy_at_standard_dose': 'No anti-cancer effect at standard dose',
    'no_ASCO_SGO_NCCN_endorsement': 'Not endorsed by oncology guidelines (ASCO/SGO/NCCN)',
    'epidemiologic_signal_only': 'Only population-level signal — no clinical trial',

    // Drug mechanism / context
    'combination_context_only': 'Only studied in combination — not standalone',
    'copper_dependency_requires_monitoring': 'Requires copper supplementation monitoring',
    'primary_role_pk_booster_not_antitumor': 'Primary role is boosting other drugs, not killing cancer',
    'standalone_efficacy_insufficient': 'Insufficient activity as a single agent',
    'veterinary_only_current_use': 'Currently approved for veterinary use only',

    // PK / exposure failures
    'exposure-mismatch': 'Cannot reach effective dose safely',
    'exposure_mismatch_standard_dosing': 'Standard dosing cannot reach effective levels',
    'exposure_mismatch_structural': 'Structurally unable to achieve effective dose',
    'therapeutic-window-absent': 'Safe dose and effective dose do not overlap',
    'parent_compound_bioavailability_fail': 'Drug is destroyed before reaching the tumor',
    'novel_formulation_required': 'Needs a new drug delivery method to work',
    'high_pk_variability': 'Drug levels vary unpredictably between patients',
    'short_half_life_iv_preferred': 'Drug clears too fast — IV delivery preferred',

    // Safety
    'retinal_toxicity_monitoring_required': 'Requires eye monitoring for retinal toxicity',
    'cyp3a4_interaction_complexity': 'Complex drug-drug interactions limit safe dosing',

    // Pharmacodynamic
    'insufficient_pd_as_monotherapy': 'Insufficient single-agent activity',
    'insufficient_pharmacodynamic_impact': 'Insufficient biological impact at safe doses',

    // Longer descriptive strings (already somewhat readable but standardise)
    'IC50 15 µM vs free Cmax 0.003 µM = 5000× gap': 'Effective dose is 5,000× higher than achievable blood level',
    'IC50 25 µM vs free Cmax 0.06 µM = 417× gap': 'Effective dose is 417× higher than achievable blood level',
    '44.4x_exposure_gap_at_99%_ppb': 'Drug is 99% bound to blood proteins — almost none reaches tumor',
    'Standard oral dosing structurally unable to achieve therapeutic concentrations': 'Standard pills cannot deliver enough drug to tumors',
    'Epidemiologic COX-2 signal not translatable to therapeutic dosing': 'Population-level signal does not translate to treatable doses',
    'Antipsychotic plasma concentrations 3 orders of magnitude below ovarian IC50': 'Blood levels are 1,000× too low to affect ovarian cancer',
    'Withdrawn from market in many countries due to cardiac toxicity (QT prolongation) — dose escalation structurally impossible': 'Withdrawn due to heart toxicity — higher doses are unsafe',
    'DISTINCTION: ivermectin fails because you cannot get enough drug in (PK barrier). Thioridazine fails because you would kill the patient trying (toxicological barrier). The therapeutic window does not exist.': 'The gap between a safe dose and an effective dose does not exist',
};

/**
 * Translate a single ruo_reason to human-readable text.
 * Falls back to cleaning up underscores if no translation found.
 */
export const translateRuo = (reason) => {
    if (RUO_TRANSLATIONS[reason]) return RUO_TRANSLATIONS[reason];
    // Fallback: clean up underscores and capitalise first letter
    return reason
        .replace(/_/g, ' ')
        .replace(/^\w/, c => c.toUpperCase());
};

export default RUO_TRANSLATIONS;
