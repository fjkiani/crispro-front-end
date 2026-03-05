/**
 * testsUnlocksUtils.js — shared utilities for Tests & Unlocks page components
 */

export function safeArray(v) {
    return Array.isArray(v) ? v : [];
}

export function formatPct(v) {
    if (typeof v !== 'number' || Number.isNaN(v)) return '—';
    return `${Math.round(v * 100)}%`;
}

export function formatDate(d) {
    if (!d) return '—';
    try { return String(d); } catch { return '—'; }
}

export function groupTests(tests) {
    const out = { l2: [], l3: [], other: [] };
    for (const t of safeArray(tests)) {
        const unlocks = safeArray(t?.unlocks).join(' ').toLowerCase();
        if (unlocks.includes('l2')) out.l2.push(t);
        else if (unlocks.includes('l3') || unlocks.includes('resistance')) out.l3.push(t);
        else out.other.push(t);
    }
    return out;
}

/**
 * Lightweight per-test metadata supplement.
 * Keep conservative and RUO-framed — no clinical claims.
 */
export function getTestDetailByName(testName) {
    const name = String(testName || '').toLowerCase();
    if (!name) return null;

    if (name.includes('ca-125') || name.includes('ca125')) {
        return {
            specimen: 'Blood (serum)',
            outputs: ['CA-125 value (U/mL)', 'Serial trend over time'],
            unlocks: ['Burden classification', 'On-therapy kinetics (early resistance signals)'],
            notes: 'Best value is serial measurements (baseline + during therapy).',
        };
    }
    if (name.includes('ctdna') || name.includes('circulating tumor dna')) {
        return {
            specimen: 'Blood (plasma)',
            outputs: ['Somatic variants (often without full tumor tissue)', 'Variant allele fractions (VAFs)'],
            unlocks: ['Faster somatic signal', 'Serial molecular response trend (early resistance)'],
            notes: 'Useful when tissue NGS is pending or limited.',
        };
    }
    if (name.includes('hrd')) {
        return {
            specimen: 'Tumor tissue (preferred) or validated tumor assay output',
            outputs: ['HRD score', 'LOH/TAI/LST (if reported)', 'BRCA1/2 somatic (if included)'],
            unlocks: ['DDR mechanism confidence', 'PARP / platinum sensitivity context'],
            notes: 'HRD is a core unlock for DDR/PARP mechanism.',
        };
    }
    if (name.includes('ngs') || name.includes('cgp') || name.includes('comprehensive genomic')) {
        return {
            specimen: 'Tumor tissue (FFPE) ± matched normal',
            outputs: ['Somatic variants (HGVS + coordinates)', 'Copy number alterations', 'Fusions', 'TMB/MSI'],
            unlocks: ['Real sequence scoring', 'Broader pathway burden', 'More stable WIWFM outputs'],
            notes: 'Coordinates unlock Evo/Fusion scoring and reduce heuristics.',
        };
    }
    if (name.includes('rna') || name.includes('expression')) {
        return {
            specimen: 'Tumor tissue (RNA)',
            outputs: ['Expression signatures', 'Pathway activation proxies'],
            unlocks: ['Mechanism map beyond DNA-only signals', 'Activity confirmation'],
            notes: 'Best used with DNA results (NGS/HRD).',
        };
    }
    if (name.includes('proteomic') || name.includes('proteomics')) {
        return {
            specimen: 'Tumor tissue (protein)',
            outputs: ['Protein abundance / pathway activation proxies'],
            unlocks: ['Activity confirmation for targets and pathways'],
            notes: 'Optional; higher depth when available.',
        };
    }
    return null;
}

/**
 * Build a flat "tests on record" list from the patient profile.
 * Used by ProfileSummaryCard to show what's already available.
 */
export function buildTestsOnRecord(profile) {
    const tests = [];
    if (!profile) return tests;

    // Imaging
    const imaging = profile.imaging || {};
    for (const key of Object.keys(imaging)) {
        const item = imaging[key];
        if (!item) continue;
        tests.push({
            category: 'Imaging',
            name: item.modality || key,
            date: item.performed_date || null,
            details: item.impression || (safeArray(item.key_findings).join('; ') || ''),
        });
    }

    // Pathology / IHC
    const tc = profile.tumor_context || {};
    const bm = tc.biomarkers || {};
    const ihcBits = [];
    if (bm.pd_l1_status) ihcBits.push(`PD‑L1 ${bm.pd_l1_status}${typeof bm.pd_l1_cps === 'number' ? ` (CPS ${bm.pd_l1_cps})` : ''}`);
    if (bm.mmr_status) ihcBits.push(`MMR ${bm.mmr_status}`);
    if (bm.msi_status) ihcBits.push(`MSI ${bm.msi_status}`);
    if (bm.her2_status) ihcBits.push(`HER2 ${bm.her2_status}${typeof bm.her2_score === 'number' ? ` (${bm.her2_score})` : ''}`);
    if (bm.folr1_status) ihcBits.push(`FOLR1 ${bm.folr1_status}${bm.folr1_percent ? ` (${bm.folr1_percent})` : ''}`);
    if (bm.p53_status) ihcBits.push(`p53 ${bm.p53_status}`);
    if (bm.er_status) ihcBits.push(`ER ${bm.er_status}${typeof bm.er_percent === 'number' ? ` (${bm.er_percent}%)` : ''}`);
    if (bm.pr_status) ihcBits.push(`PR ${bm.pr_status}${bm.pr_percent ? ` (${bm.pr_percent})` : ''}`);
    if (ihcBits.length) {
        tests.push({ category: 'Pathology / IHC', name: 'Tumor biomarker panel (IHC)', date: null, details: ihcBits.join(' · ') });
    }

    // Germline
    const gl = profile.germline || {};
    if (gl?.panel || gl?.lab) {
        const muts = safeArray(gl.mutations);
        const top = muts.slice(0, 4)
            .map(m => `${m?.gene || 'GENE'} ${m?.protein_change || m?.variant || '—'}${m?.classification ? ` (${m.classification})` : ''}`)
            .filter(Boolean);
        tests.push({
            category: 'Genetics (germline)',
            name: gl.panel ? `Germline panel: ${gl.panel}` : 'Germline genetic test',
            date: gl.test_date || null,
            details: [
                gl.lab ? `Lab: ${gl.lab}` : null,
                gl.accession_number ? `Accession: ${gl.accession_number}` : null,
                top.length ? `Findings: ${top.join(' · ')}` : null,
            ].filter(Boolean).join(' | '),
        });
    }

    // Labs (CA-125)
    const labs = profile.labs || {};
    tests.push({
        category: 'Labs',
        name: 'CA‑125',
        date: null,
        details: typeof labs.ca125_value === 'number'
            ? `${labs.ca125_value} ${labs.ca125_units || 'U/mL'}`
            : 'No CA‑125 value on record (needs upload).',
    });

    return tests;
}

export function toMarkdownChecklist(tests) {
    const lines = ['## Ayesha — Next Tests & Unlocks (RUO)', ''];
    for (const t of safeArray(tests)) {
        const name = t?.test || 'Test';
        const why = t?.why || '';
        const unlocks = safeArray(t?.unlocks);
        lines.push(`- [ ] **${name}**`);
        if (why) lines.push(`  - Why: ${why}`);
        if (unlocks.length) lines.push(`  - Unlocks: ${unlocks.join(', ')}`);
    }
    lines.push('', '> Research Use Only (RUO): These are coordination prompts, not medical advice.');
    return lines.join('\n');
}
