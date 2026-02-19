export const FRIENDLY_TERMS = {
    'PARP_GERMLINE': 'Genetically Matched (BRCA)',
    'PARP_HRD_RESCUE': 'Tumor Property Match (HRD)',
    'CONFIDENCE_CAP_L1': 'Uncertainty: Limited Data',
    'CONFIDENCE_CAP_L2': 'High Confidence Data',
    'OVARIAN_PATHWAY_GATES': 'Ovarian Cancer Protocol',
    'SPORADIC_SUMMARY': 'Genetic Summary',
    'PENALTY': 'Mismatch Risk',
    'RESCUE': 'Potential Benefit',
    'BOOST': 'Strong Signal',
    'PathwayAligned': 'Pathway Match',
    'SL-Detected': 'Vulnerability Found',
    'frameshift_variant': 'Frame Shift (Major)',
    'missense_variant': 'Point Mutation',
    'stop_gained': 'Truncation (Major)',
    'clinvar_pathogenic': 'ClinVar: Pathogenic'
};

export const safeRender = (val) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string' || typeof val === 'number') return val;
    if (typeof val === 'object') {
        return val.value || val.message || val.name || JSON.stringify(val);
    }
    return String(val);
};

export const humanize = (str) => {
    if (!str) return '';
    const safeStr = safeRender(str);
    if (FRIENDLY_TERMS[safeStr]) return FRIENDLY_TERMS[safeStr];

    // Split CamelCase if no direct match
    const separated = safeStr.replace(/([A-Z])/g, ' $1').trim();
    return separated.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
};

export const getTierColor = (tier) => {
    const t = safeRender(tier).toLowerCase();
    if (t === 'supported') return 'success';
    if (t === 'consider') return 'warning';
    return 'default';
};

export const getBadgeColor = (badge) => {
    const b = safeRender(badge);
    if (b === 'RCT' || b === 'Guideline') return 'success';
    if (b === 'ClinVar-Strong') return 'info';
    return 'default';
};
