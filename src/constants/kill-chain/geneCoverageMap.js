/**
 * Gene Coverage Map — 26 genes across 10 resistance classes
 * ===========================================================
 * Maps gene symbols to their resistance class, primary vector axis,
 * and display group. Used by the Engine Light gene coverage grid.
 *
 * Source: vectors.py L131-174 (GENE_TO_RESISTANCE_CLASS)
 *
 * Authored: 2026-03-04 (ENGINE_LIGHT_DASHBOARD.mdc §4)
 */

// ── 26-Gene Coverage Map ─────────────────────────────────────────────────────
export const GENE_COVERAGE_MAP = {
    // BRCA Reversion (5 genes)
    BRCA1: { resistanceClass: 'BRCA_REVERSION', axis: 'ddr', group: 'BRCA Reversion' },
    BRCA2: { resistanceClass: 'BRCA_REVERSION', axis: 'ddr', group: 'BRCA Reversion' },
    RAD51C: { resistanceClass: 'BRCA_REVERSION', axis: 'ddr', group: 'BRCA Reversion' },
    RAD51D: { resistanceClass: 'BRCA_REVERSION', axis: 'ddr', group: 'BRCA Reversion' },
    PALB2: { resistanceClass: 'BRCA_REVERSION', axis: 'ddr', group: 'BRCA Reversion' },
    // CCNE1 Amplification (2 genes)
    CCNE1: { resistanceClass: 'CCNE1_AMPLIFICATION', axis: 'mapk', group: 'CCNE1 Amplification' },
    CDK2: { resistanceClass: 'CCNE1_AMPLIFICATION', axis: 'mapk', group: 'CCNE1 Amplification' },
    // PTEN / PI3K Bypass (3 genes)
    PTEN: { resistanceClass: 'PTEN_LOSS_BYPASS', axis: 'pi3k', group: 'PTEN/PI3K Bypass' },
    AKT1: { resistanceClass: 'PTEN_LOSS_BYPASS', axis: 'pi3k', group: 'PTEN/PI3K Bypass' },
    PIK3CA: { resistanceClass: 'PTEN_LOSS_BYPASS', axis: 'pi3k', group: 'PTEN/PI3K Bypass' },
    // CDK12 TDP (1 gene)
    CDK12: { resistanceClass: 'CDK12_TDP', axis: 'io', group: 'CDK12 TDP' },
    // NRF2 Activation (3 genes)
    KEAP1: { resistanceClass: 'NRF2_ACTIVATION', axis: 'ddr', group: 'NRF2 Activation' },
    CUL3: { resistanceClass: 'NRF2_ACTIVATION', axis: 'ddr', group: 'NRF2 Activation' },
    RBX1: { resistanceClass: 'NRF2_ACTIVATION', axis: 'ddr', group: 'NRF2 Activation' },
    // Drug Uptake Loss (1 gene)
    SLC31A1: { resistanceClass: 'DRUG_UPTAKE_LOSS', axis: 'efflux', group: 'Drug Uptake' },
    // HR Restoration (4 genes)
    TP53BP1: { resistanceClass: 'HR_RESTORATION_NON_REVERSION', axis: 'ddr', group: 'HR Restoration' },
    SHLD1: { resistanceClass: 'HR_RESTORATION_NON_REVERSION', axis: 'ddr', group: 'HR Restoration' },
    SHLD2: { resistanceClass: 'HR_RESTORATION_NON_REVERSION', axis: 'ddr', group: 'HR Restoration' },
    MAD2L2: { resistanceClass: 'HR_RESTORATION_NON_REVERSION', axis: 'ddr', group: 'HR Restoration' },
    // Lineage Plasticity (1 gene — requires TP53 co-loss)
    RB1: { resistanceClass: 'LINEAGE_PLASTICITY', axis: 'io', group: 'Lineage Plasticity' },
    // Drug Efflux (1 gene)
    ABCB1: { resistanceClass: 'DRUG_EFFLUX', axis: 'efflux', group: 'Drug Efflux' },
    // Antigen Presentation Loss (4 genes)
    B2M: { resistanceClass: 'ANTIGEN_PRESENTATION_LOSS', axis: 'io', group: 'Antigen Presentation' },
    'HLA-A': { resistanceClass: 'ANTIGEN_PRESENTATION_LOSS', axis: 'io', group: 'Antigen Presentation' },
    'HLA-B': { resistanceClass: 'ANTIGEN_PRESENTATION_LOSS', axis: 'io', group: 'Antigen Presentation' },
    TAP1: { resistanceClass: 'ANTIGEN_PRESENTATION_LOSS', axis: 'io', group: 'Antigen Presentation' },
    // SLFN11 Silencing (1 gene)
    SLFN11: { resistanceClass: 'SLFN11_SILENCING', axis: 'ddr', group: 'SLFN11 Silencing' },
};

// ── Gene display order (grouped by resistance class) ─────────────────────────
export const GENE_DISPLAY_ORDER = [
    'BRCA1', 'BRCA2', 'RAD51C', 'RAD51D', 'PALB2',
    'CCNE1', 'CDK2',
    'PTEN', 'AKT1', 'PIK3CA',
    'CDK12',
    'KEAP1', 'CUL3', 'RBX1',
    'SLC31A1',
    'TP53BP1', 'SHLD1', 'SHLD2', 'MAD2L2',
    'RB1',
    'ABCB1',
    'B2M', 'HLA-A', 'HLA-B', 'TAP1',
    'SLFN11',
];
