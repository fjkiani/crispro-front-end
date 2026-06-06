/**
 * explainers.js — Pure functions that convert raw drug data into
 * patient-friendly sentences.  Every explanation is derived from
 * the actual data value — nothing is hard-coded.
 */

// ═══════════════════════════════════════════════════════════════════════════
// PATIENT-FRIENDLY SIGNAL LABELS
// ═══════════════════════════════════════════════════════════════════════════

export const SIGNAL_META = {
    sequence: {
        title: 'Tumor DNA Match',
        question: `Does your tumor's DNA match what this drug targets?`,
        icon: '🧬',
    },
    pathway: {
        title: 'Cancer Pathway Alignment',
        question: 'Are the cancer-driving pathways in your tumor ones this drug can attack?',
        icon: '🛤️',
    },
    evidence: {
        title: 'Published Research',
        question: 'How much published evidence supports using this drug for your type of cancer?',
        icon: '📚',
    },
};

// ═══════════════════════════════════════════════════════════════════════════
// WHY-CALLOUTS  (dynamic from data)
// ═══════════════════════════════════════════════════════════════════════════

export function explainNoFdaLabel(drugName) {
    return [
        `The FDA reviews drugs for specific diseases (called "indications"). ${drugName || 'This drug'} has not been reviewed for this patient's specific mutation + cancer type combination.`,
        `This does not mean it won't work — it means no regulatory agency has formally evaluated this exact pairing yet.`,
        'Many drugs in oncology are used "off-label" based on genomic evidence and clinical judgement.',
    ];
}

export function explainNoCitations(drugName, mutationContext) {
    return [
        `Our system searched PubMed for published studies linking ${drugName || 'this drug'} to ${mutationContext || 'the detected mutations'}, but found no direct matches.`,
        'This is common for newer or less-studied drug–mutation combinations.',
        'It does not mean the drug is ineffective — it means clinical evidence has not yet been published for this specific scenario.',
    ];
}

// ═══════════════════════════════════════════════════════════════════════════
// SEQUENCE SIGNAL
// ═══════════════════════════════════════════════════════════════════════════

export function explainSequenceSignal(value, percentile) {
    if (value == null && percentile == null) return null;
    const pctVal = percentile != null ? Math.round(percentile * 100) : null;
    const top = pctVal != null ? 100 - pctVal : null;

    let strength = 'neutral';
    if (pctVal >= 80) strength = 'strong';
    else if (pctVal >= 50) strength = 'moderate';
    else if (pctVal != null) strength = 'weak';

    const sentences = [];

    // Patient-friendly first
    if (strength === 'strong') {
        sentences.push(`Your tumor's DNA has a strong match to what this drug targets — it is in the top ${top}% of all drugs evaluated.`);
    } else if (strength === 'moderate') {
        sentences.push(`Your tumor's DNA shows a moderate match to this drug's target — some overlap was found, but it is not the strongest signal.`);
    } else if (strength === 'weak') {
        sentences.push(`Your tumor's DNA shows limited overlap with what this drug targets.`);
    } else {
        sentences.push(`There is not enough data to assess whether your tumor's DNA matches this drug's target.`);
    }

    return { sentences, strength, pct: pctVal, value, top };
}

// ═══════════════════════════════════════════════════════════════════════════
// PATHWAY SIGNAL
// ═══════════════════════════════════════════════════════════════════════════

export function explainPathwaySignal(percentile, breakdown) {
    if (percentile == null && !breakdown) return null;
    const pctVal = percentile != null ? Math.round(percentile * 100) : null;

    let strength = 'neutral';
    if (pctVal >= 80) strength = 'strong';
    else if (pctVal >= 50) strength = 'moderate';
    else if (pctVal != null) strength = 'weak';

    const sentences = [];

    // Patient-friendly first
    if (strength === 'strong') {
        sentences.push('The cancer-driving pathways in your tumor strongly align with how this drug works.');
    } else if (strength === 'moderate') {
        sentences.push(`There is moderate overlap between your tumor's active pathways and this drug's mechanism.`);
    } else if (strength === 'weak') {
        sentences.push(`The drug's mechanism does not strongly overlap with the pathways active in your tumor.`);
    } else {
        sentences.push('Pathway data is not available at the current data level.');
    }

    // Active pathways
    if (breakdown && typeof breakdown === 'object') {
        const active = Object.entries(breakdown)
            .filter(([, v]) => v > 0)
            .sort(([, a], [, b]) => b - a);
        if (active.length > 0) {
            const parts = active.map(([k, v]) => `${formatPathway(k)} (${(v * 100).toFixed(0)}%)`);
            sentences.push(`Active pathways detected: ${parts.join(', ')}.`);
        }
    }

    return { sentences, strength, pct: pctVal, breakdown };
}

// ═══════════════════════════════════════════════════════════════════════════
// EVIDENCE SIGNAL
// ═══════════════════════════════════════════════════════════════════════════

export function explainEvidenceSignal(strength, citationsCount, meetGate) {
    const sentences = [];
    const level = strength > 3 ? 'strong' : strength > 1 ? 'moderate' : 'weak';

    if (level === 'strong') {
        sentences.push(`There is strong published evidence (${citationsCount || 'multiple'} studies) supporting this drug in similar contexts.`);
    } else if (level === 'moderate') {
        sentences.push(`Some published evidence exists, but it does not yet reach full clinical validation.`);
    } else {
        sentences.push('There is limited or no published evidence linking this drug to your specific mutation profile.');
        if (citationsCount === 0 || citationsCount == null) {
            sentences.push('This is common for newer drug–mutation combinations and does not mean the drug is ineffective.');
        }
    }

    if (meetGate === false) {
        sentences.push('This drug has not met the minimum evidence threshold — it remains an exploratory candidate.');
    }

    return { sentences, level, strength: fmt(strength ?? 0, 1), citationsCount };
}

// ═══════════════════════════════════════════════════════════════════════════
// GATE EXPLAINER
// ═══════════════════════════════════════════════════════════════════════════

const GATE_LABELS = {
    'CONFIDENCE_CAP_L1': 'Level-1 Confidence Cap',
    'CONFIDENCE_CAP_L2': 'Level-2 Confidence Cap',
    'SPORADIC_SUMMARY': 'Overall Gate Summary',
    'GERMLINE_RESCUE': 'Germline Rescue Boost',
    'GERMLINE_PENALTY': 'Germline Penalty',
    'HRD_BOOST': 'HRD Sensitivity Boost',
    'RESISTANCE_PENALTY': 'Resistance Penalty',
    'EVIDENCE_GATE': 'Evidence Threshold Gate',
};

const GATE_PATIENT_EXPLANATIONS = {
    'CONFIDENCE_CAP_L1': 'Because not all biomarker tests are available yet, the system limits how confident it can be. Adding more tests will raise this cap.',
    'CONFIDENCE_CAP_L2': 'Even with a good panel, some tests are still missing. The confidence cap reflects what we can reliably say with the data at hand.',
    'GERMLINE_RESCUE': 'A known inherited (germline) mutation was detected that increases sensitivity to this drug class. This boosted the score.',
    'GERMLINE_PENALTY': 'A germline variant was detected that may reduce effectiveness or safety of this drug. The score was adjusted down.',
    'HRD_BOOST': 'Homologous recombination deficiency was detected — this tumor may be more sensitive to DNA-damaging agents.',
    'RESISTANCE_PENALTY': 'Known resistance mechanisms were detected, which may reduce how well this drug works.',
    'EVIDENCE_GATE': 'This gate checks whether enough published studies exist to support this drug for your specific case.',
};

export function humanizeGateName(gate) {
    return GATE_LABELS[gate] || gate.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function explainGate(gateObj) {
    if (!gateObj) return null;
    const name = humanizeGateName(gateObj.gate);
    const sentences = [];

    // Patient-friendly explanation first
    if (GATE_PATIENT_EXPLANATIONS[gateObj.gate]) {
        sentences.push(GATE_PATIENT_EXPLANATIONS[gateObj.gate]);
    }

    // Then the technical detail
    if (gateObj.reason) sentences.push(gateObj.reason);

    if (gateObj.verdict === 'CAPPED' && gateObj.original_confidence != null) {
        const orig = Math.round(gateObj.original_confidence * 100);
        const capped = Math.round(gateObj.capped_confidence * 100);
        sentences.push(
            `Confidence was reduced from ${orig}% → ${capped}% because data completeness (${Math.round((gateObj.completeness || 0) * 100)}%) limits reliability.`
        );
    }

    if (gateObj.efficacy_delta != null && gateObj.efficacy_delta !== 0) {
        const dir = gateObj.efficacy_delta > 0 ? 'increased' : 'decreased';
        sentences.push(`Match score was ${dir} by ${Math.abs(Math.round(gateObj.efficacy_delta * 100))} points.`);
    }

    return {
        name,
        verdict: gateObj.verdict || (gateObj.gate === 'SPORADIC_SUMMARY' ? 'SUMMARY' : 'APPLIED'),
        sentences,
        raw: gateObj,
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// CLINICAL BAND
// ═══════════════════════════════════════════════════════════════════════════

const BAND_DESCRIPTIONS = {
    'A': { short: 'Approved & Companion Dx', long: 'This drug is FDA-approved with a companion diagnostic test for this type of cancer — the highest level of clinical relevance.' },
    'B': { short: 'Standard of Care', long: 'This drug is a recognized standard treatment with strong evidence for this type of cancer.' },
    'C': { short: 'Emerging Evidence', long: 'There is growing clinical evidence for this drug, with recent trials or guideline mentions.' },
    'D': { short: 'Low / VUS', long: 'The evidence linking this drug to your specific mutations is limited. The variant may be classified as a "Variant of Uncertain Significance" (VUS).' },
    'E': { short: 'Theoretical', long: 'This is a purely computational prediction with no direct clinical evidence yet.' },
};

export function explainClinicalBand(band) {
    if (!band) return null;
    const letter = band.charAt(0).toUpperCase();
    const info = BAND_DESCRIPTIONS[letter];
    if (!info) return { short: band, long: `Clinical evidence band: ${band}` };
    return info;
}

// ═══════════════════════════════════════════════════════════════════════════
// RUO REASONS
// ═══════════════════════════════════════════════════════════════════════════

const RUO_REASONS = {
    'unknown-label': {
        text: 'Regulatory status not curated',
        why: 'Our system has not yet verified FDA approval for this exact cancer + mutation pairing. This is a system default, not a verdict on the drug.',
        note: 'Many effective cancer drugs are used without a specific FDA label for a given mutation — this is called off-label use, and is common in oncology.',
    },
    'no-citations': {
        text: 'No direct PubMed citations found',
        why: 'Our literature search did not find published studies directly linking this drug to your specific mutations.',
        note: 'This is common for newer or less-studied drug–mutation combinations and does not mean the drug is ineffective.',
    },
    'low-evidence': {
        text: 'Evidence below clinical threshold',
        why: 'The aggregate evidence does not yet meet the threshold for a confident clinical recommendation.',
        note: 'This drug remains an exploratory candidate. Your oncologist may have additional clinical context not captured here.',
    },
    'insufficient-signal': {
        text: 'Weak genomic signal',
        why: 'The computational signal from DNA variant and pathway analysis is below the threshold for a strong match.',
        note: 'More complete biomarker data (e.g. HRD, TMB, expression panels) could improve this signal.',
    },
    'off-label': {
        text: 'Off-label use',
        why: 'This drug is FDA-approved, but not specifically for this indication or mutation.',
        note: 'Off-label use is common in oncology and may still be appropriate — always review with your oncologist.',
    },
};

export function explainRuoReason(reason) {
    const info = RUO_REASONS[reason];
    if (info) return info;
    return { text: reason.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), why: '' };
}

// ═══════════════════════════════════════════════════════════════════════════
// PATHWAYS  (patient-friendly names + descriptions)
// ═══════════════════════════════════════════════════════════════════════════

const PATHWAY_INFO = {
    tp53: { name: 'TP53 / Tumor Suppressor', desc: 'Controls cell death — when disrupted, tumor cells survive longer. Higher score = more disruption.' },
    ddr: {
        name: 'DNA Damage Repair', desc: `Your cells' ability to fix DNA damage. Disruption may make the tumor more sensitive to certain drugs.`
    },
    ras_mapk: { name: 'RAS/MAPK Signaling', desc: 'A growth signal. When overactive, it drives uncontrolled cell multiplication.' },
    mapk: { name: 'MAPK', desc: 'Part of the growth signaling chain. When mutated, it can accelerate cancer progression.' },
    pi3k: { name: 'PI3K/AKT/mTOR', desc: 'Controls cell survival and growth. Mutations here may respond to targeted inhibitors.' },
    vegf: { name: 'VEGF / Angiogenesis', desc: 'Drives blood vessel formation to feed the tumor. Blocking it can starve cancer cells.' },
    her2: { name: 'HER2 / ErbB2', desc: 'A growth receptor. Overexpression is a known therapeutic target.' },
    io: { name: 'Immuno-Oncology', desc: 'Immune system markers that determine if immunotherapy might work.' },
    efflux: { name: 'Drug Efflux', desc: 'Measures "drug pumps" that can push treatment out of cancer cells, reducing effectiveness.' },
    rss: { name: 'Resistance Signaling', desc: 'Aggregate score of known resistance mechanisms that could neutralize this drug.' },
};

export function getPathwayInfo(key) {
    const k = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    return PATHWAY_INFO[k] || PATHWAY_INFO[key] || { name: formatPathway(key), desc: `Pathway score for ${formatPathway(key)}.` };
}

// ═══════════════════════════════════════════════════════════════════════════
// INSIGHTS  (patient-friendly)
// ═══════════════════════════════════════════════════════════════════════════

const INSIGHT_INFO = {
    functionality: { label: 'Functional Impact', desc: 'How much the mutation disrupts normal protein function. Higher = more impact on the protein.', icon: '⚙️' },
    chromatin: { label: 'Chromatin Effect', desc: 'Whether the mutation affects how DNA is packaged. Changes here can alter which genes are turned on or off.', icon: '🧬' },
    essentiality: { label: 'Gene Essentiality', desc: 'How critical this gene is to cell survival. Essential genes, when disrupted, may make the tumor more vulnerable.', icon: '🎯' },
    regulatory: { label: 'Regulatory Impact', desc: 'Whether the mutation affects how genes are activated or silenced. Regulatory changes can cascade through many pathways.', icon: '📊' },
};

export function getInsightInfo(key) {
    return INSIGHT_INFO[key] || { label: formatPathway(key), desc: `Score for ${key}.`, icon: '📈' };
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function ordinal(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function formatPathway(key) {
    return key.replace(/_/g, '/').toUpperCase();
}

/** Round a float to d decimal places. Returns '—' for null/undefined. */
export const fmt = (v, d = 2) => v != null && typeof v === 'number' && !Number.isNaN(v) ? Number(v.toFixed(d)) : '—';

export const pct = (v) => v != null && typeof v === 'number' && !Number.isNaN(v) ? `${Math.round(v * 100)}%` : '—';

export const tierColor = (tier) => {
    const map = {
        CONSIDER: { bg: '#dbeafe', fg: '#1e40af' },
        EVALUATE: { bg: '#fef3c7', fg: '#92400e' },
        MONITOR: { bg: '#f3e8ff', fg: '#6b21a8' },
    };
    return map[tier] || { bg: '#f1f5f9', fg: '#475569' };
};

export const signalStrengthColor = (strength) => {
    const map = {
        strong: { bg: '#dcfce7', fg: '#166534', border: '#86efac' },
        moderate: { bg: '#fef3c7', fg: '#92400e', border: '#fcd34d' },
        weak: { bg: '#fef2f2', fg: '#991b1b', border: '#fca5a5' },
        neutral: { bg: '#f8fafc', fg: '#94a3b8', border: '#e2e8f0' },
    };
    return map[strength] || map.neutral;
};
