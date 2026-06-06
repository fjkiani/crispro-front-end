/**
 * Clinical Test Registry — Single Source of Truth
 * =================================================
 * Every test and monitoring signal in the Ayesha journey.
 * All kill_chain_axes values verified against vectors.py BASE_STRIKE_VECTOR keys:
 *   ddr, mapk, pi3k, vegf, her2, io, efflux
 *
 * Authored: 2026-03-04 (Doctrine v3, post hardened audit Debrief #26)
 * Self-audited: Debrief #27
 */

// Valid 7D vector axis names (from vectors.py BASE_STRIKE_VECTOR)
export const VALID_AXES = ['ddr', 'mapk', 'pi3k', 'vegf', 'her2', 'io', 'efflux'];

// Validation badge mapping: backend DomainStatus → frontend badge
export const BADGE_MAP = {
  VALIDATED:   { color: '#22c55e', label: 'VALIDATED',   source: 'frontend-only (FDA CDx flag)' },
  DIRECTIONAL: { color: '#f59e0b', label: 'DIRECTIONAL', source: 'DomainStatus.DIRECTIONAL' },
  PROFILED:    { color: '#3b82f6', label: 'PROFILED',    source: 'DomainStatus.PROFILED' },
  UNVERIFIED:  { color: '#ef4444', label: 'UNVERIFIED',  source: 'DomainStatus.UNKNOWN' },
};

export const CLINICAL_TEST_REGISTRY = {
  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 2 — TEST ENTRIES
  // ═══════════════════════════════════════════════════════════════════════════

  rna_expression: {
    id: 'rna_expression',
    type: 'test',
    name: 'RNA Expression Profiling',
    short_desc: 'Transcriptomic pathway quantification for IO response and resistance prediction.',
    priority: 'HIGH',
    what_it_captures: [
      {
        title: 'IO Profile Card',
        description: 'Quantifies 8 IO pathways (TIL, Exhaustion, T Effector, Angiogenesis, TGFβ, Myeloid, Proliferation, Immunoproteasome). Generates HOT/COLD/INTERMEDIATE classification per pathway with population percentiles. NOTE: Only 3 pathways (TIL, T_EFFECTOR, EXHAUSTION) have population reference bands from profile_card.py.',
        icon: 'activity',
      },
      {
        title: 'Pathway Composite Score',
        description: 'Logistic regression composite (0-1) across 8 pathways via logistic_regression_composite(). Directional signal for IO response in melanoma.',
        icon: 'target',
      },
    ],
    resistance_tracked: [
      {
        title: 'Exhaustion Axis Engagement',
        description: 'PD-1/CTLA4/LAG3/TIGIT/TIM-3 upregulation under IO pressure. Ovarian PD signal: Exhaustion Δ=0.643, p=0.034.',
        icon: 'shield',
      },
      {
        title: 'TGFβ-Mediated Exclusion',
        description: 'TGFβ pathway activation correlates with T-cell exclusion from tumor bed — negative predictor of IO response.',
        icon: 'x-circle',
      },
    ],
    // Verified against vectors.py BASE_STRIKE_VECTOR keys
    kill_chain_axes: ['io', 'ddr'],
    io_signals: {
      unlocks_profile_card: true,
      unlocks_domain_boost: true, // Only if domain=DIRECTIONAL (melanoma)
      domain_context: {
        melanoma: 'Response separation: TIL p=0.011, Exhaustion p=0.009',
        ovarian: 'PD signal only: Exhaustion Δ=0.643, p=0.034. No predictor yet.',
      },
    },
    validation: {
      status: 'DIRECTIONAL',
      cohort: 'GSE91061',
      n: 105,
      metrics: {
        apparent_auc: 0.780,       // Overfit — 8 pathways, EPV=2.9
        bootstrap_auc: 0.699,      // Honest metric
        nested_cv_auc: 0.601,      // Conservative
        nested_cv_std: 0.071,
        permutation_p: 0.191,      // NOT significant
      },
      caveats: 'Overfit risk at EPV=2.9. Nested CV near chance. Use as directional signal only.',
      pmid: null,
      computation_date: '2026-03-04',
    },
    limitations: [
      'Melanoma-only validation (n=105). Not validated for other cancer types.',
      '8-pathway model is overfit (EPV=2.9). Bootstrap-corrected AUC=0.699.',
      'Only 3/8 pathways have population reference bands (TIL, T_EFFECTOR, EXHAUSTION).',
      'Ovarian IO prediction requires response labels (extraction in progress).',
      'Requires bulk RNA-seq or equivalent. Single-cell not directly compatible.',
    ],
    unlock_keys: ['io_profile_card', 'pathway_composite', 'domain_boost', 'kc_io'],
    live_scoring: true,
    live_scoring_endpoint: '/api/expression/ingest',
    live_scoring_note: 'Gene-level threshold scoring (IO/VEGF/Efflux/HER2). Not a validated classifier.',
  },

  lpwgs: {
    id: 'lpwgs',
    type: 'test',
    name: 'Low-Pass Whole Genome Sequencing (lpWGS)',
    short_desc: 'Genome-wide copy-number profiling from plasma cfDNA or tissue.',
    priority: 'MEDIUM',
    what_it_captures: [
      {
        title: 'CN7 Structural Instability',
        description: 'Detects chromothripsis and structural chaos. Most prognostically important resistance signal for PARP inhibitors (BriTROC, Macintyre CN signatures).',
        icon: 'dna',
      },
    ],
    resistance_tracked: [
      {
        title: 'Bypass Amplifications',
        description: 'Detects CCNE1 amplifications that emerge under treatment stress — visible as resistance before clinical progression.',
        icon: 'shield',
      },
      {
        title: 'BRCA Reversion Detection',
        description: 'Structural variants restoring BRCA1/2 reading frame. Primary mechanism of acquired PARP resistance.',
        icon: 'refresh-cw',
      },
    ],
    kill_chain_axes: ['ddr'],
    io_signals: { unlocks_profile_card: false, unlocks_domain_boost: false },
    validation: {
      status: 'VALIDATED',
      cohort: 'BriTROC / Macintyre 2018',
      n: 117,
      metrics: { note: 'CN signatures validated in independent cohorts' },
      caveats: 'Requires sufficient tumor fraction if liquid biopsy.',
      pmid: '30017478',
      computation_date: '2018-07-17',
    },
    limitations: [
      'Cannot detect point mutations or epigenetic silencing.',
      'Requires sufficient tumor fraction if run as liquid biopsy.',
      'Resolution ~1Mb — misses focal events smaller than this.',
    ],
    unlock_keys: ['cn7_score', 'kc_ddr', 'early_resistance_warning'],
    live_scoring: true,
    live_scoring_endpoint: '/api/ayesha/lpwgs/score',
    live_scoring_note: 'Sig7 threshold=0.25 (BriTROC, N=117). Post-treatment only. Confidence capped at MEDIUM.',
  },

  hrd: {
    id: 'hrd',
    type: 'test',
    name: 'Homologous Recombination Deficiency (HRD) Score',
    short_desc: 'Quantifies genomic scarring from defective DNA repair — key PARP inhibitor eligibility biomarker.',
    priority: 'HIGH',
    what_it_captures: [
      {
        title: 'Genomic Instability Score (GIS)',
        description: 'Composite of LOH, TAI, and LST. HRD≥42 predicts PARP benefit (Myriad myChoice). Threshold from models.py HRD_SUM_THRESHOLD=42.',
        icon: 'activity',
      },
    ],
    resistance_tracked: [
      {
        title: 'HRD-to-HRP Conversion',
        description: 'Loss of HRD signal under PARP pressure (BRCA reversion, 53BP1/REV7 bypass). HRD score becomes unreliable at resistance.',
        icon: 'alert-triangle',
      },
    ],
    kill_chain_axes: ['ddr'],
    io_signals: { unlocks_profile_card: false, unlocks_domain_boost: false },
    validation: {
      status: 'VALIDATED',
      cohort: 'PRIMA/PAOLA-1/QUADRA',
      n: null,
      metrics: { note: 'FDA-approved companion diagnostic (Myriad myChoice CDx)' },
      caveats: 'Static scar — does not reflect current HR status. BRCA reversion restores HR without changing GIS.',
      pmid: '31562799',
      computation_date: null,
    },
    limitations: [
      'Static scar metric — does not reflect CURRENT HR status.',
      'BRCA reversion restores HR function without changing GIS.',
      'Does not distinguish HRD etiology (BRCA1 vs RAD51C vs epigenetic).',
    ],
    unlock_keys: ['hrd_score', 'kc_ddr', 'parp_eligibility'],
  },

  // Alias: hrd_score slug → same data as hrd (SLUG_ENTRY_FORMS maps both to HRDEntryForm)
  hrd_score: {
    id: 'hrd_score',
    type: 'test',
    name: 'HRD Score (Alias)',
    short_desc: 'Alias for HRD Score entry. Quantifies genomic scarring from defective DNA repair — key PARP inhibitor eligibility biomarker.',
    priority: 'HIGH',
    what_it_captures: [
      {
        title: 'Genomic Instability Score (GIS)',
        description: 'Composite of LOH, TAI, and LST. HRD≥42 predicts PARP benefit (Myriad myChoice). Threshold from models.py HRD_SUM_THRESHOLD=42.',
        icon: 'activity',
      },
    ],
    resistance_tracked: [
      {
        title: 'HRD-to-HRP Conversion',
        description: 'Loss of HRD signal under PARP pressure (BRCA reversion, 53BP1/REV7 bypass). HRD score becomes unreliable at resistance.',
        icon: 'alert-triangle',
      },
    ],
    kill_chain_axes: ['ddr'],
    io_signals: { unlocks_profile_card: false, unlocks_domain_boost: false },
    validation: {
      status: 'VALIDATED',
      cohort: 'PRIMA/PAOLA-1/QUADRA',
      n: null,
      metrics: { note: 'FDA-approved companion diagnostic (Myriad myChoice CDx)' },
      caveats: 'Static scar — does not reflect current HR status. BRCA reversion restores HR without changing GIS.',
      pmid: '31562799',
      computation_date: null,
    },
    limitations: [
      'Static scar metric — does not reflect CURRENT HR status.',
      'BRCA reversion restores HR function without changing GIS.',
      'Does not distinguish HRD etiology (BRCA1 vs RAD51C vs epigenetic).',
    ],
    unlock_keys: ['hrd_score', 'kc_ddr', 'parp_eligibility'],
  },

  tmb: {
    id: 'tmb',
    type: 'test',
    name: 'Tumor Mutational Burden (TMB)',
    short_desc: 'Count of somatic mutations per megabase — IO response biomarker for select cancer types.',
    priority: 'MEDIUM',
    what_it_captures: [
      {
        title: 'Neoantigen Load Proxy',
        description: 'TMB≥10 predicts IO benefit across some tumor types (KEYNOTE-158). TMB≥20 triggers IO boost (1.35x) in the efficacy engine. TMB≥10 triggers 1.25x boost.',
        icon: 'hash',
      },
    ],
    resistance_tracked: [
      {
        title: 'Hypermutator Phenotype',
        // MBD4 added per self-audit — code has {"MBD4", "POLE", "POLD1"}
        description: 'MBD4/POLE/POLD1 mutations → ultra-high TMB. May indicate exceptional IO response OR mismatch repair pathway collapse.',
        icon: 'zap',
      },
    ],
    kill_chain_axes: ['io'],
    io_signals: {
      unlocks_profile_card: false,
      unlocks_domain_boost: true, // TMB≥20 → 1.35x boost as fallback
      domain_context: {
        ovarian: 'TMB-H rare in OC (~3%). When present, IO boost applies even without pathway data.',
      },
    },
    validation: {
      status: 'VALIDATED',
      cohort: 'KEYNOTE-158 (pan-cancer)',
      n: 790,
      metrics: { note: 'FDA-approved companion diagnostic (FoundationOne CDx)' },
      caveats: 'Panel-dependent. WES vs targeted panel give different TMB values.',
      pmid: '32534693',
      computation_date: null,
    },
    limitations: [
      'Panel-dependent — WES vs targeted panel give different TMB values.',
      'Threshold varies by cancer type. 10 mut/Mb may not apply universally.',
      'Does not capture neoantigen quality, only quantity.',
    ],
    unlock_keys: ['tmb_score', 'kc_io', 'io_tmb_boost'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 2 — NEW KILL CHAIN SIGNAL ENTRIES (missing from doctrine v2)
  // ═══════════════════════════════════════════════════════════════════════════

  nrf2_pathway: {
    id: 'nrf2_pathway',
    type: 'test',
    name: 'NRF2 Pathway Activation (KEAP1/CUL3/RBX1)',
    short_desc: 'Disruption of the NRF2-KEAP1 antioxidant pathway — mediates platinum and PARP resistance.',
    priority: 'MEDIUM',
    what_it_captures: [
      {
        title: 'NRF2 Complex Disruption',
        description: 'Inactivating mutations in KEAP1, CUL3, or RBX1 constitutively activate NRF2, upregulating drug efflux pumps and ROS detoxification. Found in ~10% HGSOC (PMID: 25114896).',
        icon: 'shield-off',
      },
    ],
    resistance_tracked: [
      {
        title: 'Multi-Drug Resistance via Efflux',
        description: 'NRF2 activation transcriptionally upregulates ABCB1 (MDR1) and ABCG2. Confers cross-resistance to platinum and PARP inhibitors.',
        icon: 'alert-triangle',
      },
    ],
    kill_chain_axes: ['ddr', 'mapk', 'pi3k'],
    signal_type: 'ACTIVE', // models.py ACTIVE_SIGNALS frozenset
    signal_constant: 'SIGNAL_NRF2_ACTIVATION',
    gene_set: ['KEAP1', 'CUL3', 'RBX1'], // models.py NRF2_COMPLEX_GENES
    io_signals: { unlocks_profile_card: false, unlocks_domain_boost: false },
    validation: {
      status: 'DIRECTIONAL',
      cohort: 'TCGA-OV / CCLE',
      n: null,
      metrics: { note: 'Gene-level loss-of-function. Resistance mechanism validated in vitro.' },
      caveats: 'Clinical impact in OC not prospectively validated.',
      pmid: '25114896',
      computation_date: null,
    },
    limitations: [
      'Functional impact requires loss-of-function (truncating/homozygous). Missense VUS unclear.',
      'Not yet a standard clinical test — requires panel sequencing.',
      '~10% prevalence in HGSOC. Higher in other cancer types.',
    ],
    unlock_keys: ['nrf2_status', 'kc_ddr', 'efflux_risk'],
  },

  slc31a1_expression: {
    id: 'slc31a1_expression',
    type: 'test',
    name: 'SLC31A1 (CTR1) Expression',
    short_desc: 'Platinum uptake transporter — loss confers platinum resistance.',
    priority: 'LOW',
    what_it_captures: [
      {
        title: 'Drug Uptake Transporter Status',
        description: 'SLC31A1 (CTR1) is the primary copper/platinum transporter. Loss of expression (log2FC < -1.5) blocks intracellular platinum accumulation.',
        icon: 'arrow-down-circle',
      },
    ],
    resistance_tracked: [
      {
        title: 'Platinum Uptake Loss',
        description: 'Downregulation of CTR1 reduces intracellular cisplatin/carboplatin to sub-therapeutic levels. Resistance mechanism independent of DNA repair.',
        icon: 'x-circle',
      },
    ],
    kill_chain_axes: ['ddr', 'vegf', 'efflux'],
    signal_type: 'ACTIVE',
    signal_constant: 'SIGNAL_SLC31A1_LOSS',
    threshold: { log2fc: -1.5, direction: 'below' }, // models.py SLC31A1_LOG2FC_THRESHOLD
    io_signals: { unlocks_profile_card: false, unlocks_domain_boost: false },
    validation: {
      status: 'DIRECTIONAL',
      cohort: 'CCLE + clinical cohorts',
      n: null,
      metrics: { note: 'Molecular mechanism validated. Clinical assay not standardized.' },
      caveats: 'Requires RNA-seq or IHC. No FDA-approved test.',
      pmid: '32816860',
      computation_date: null,
    },
    limitations: [
      'No standardized clinical assay — requires RNA-seq or research IHC.',
      'Threshold (log2FC < -1.5) is internal, not clinically validated.',
      'May co-occur with efflux upregulation, confounding attribution.',
    ],
    unlock_keys: ['slc31a1_status', 'kc_ddr', 'platinum_uptake_flag'],
  },

  slfn11_methylation: {
    id: 'slfn11_methylation',
    type: 'test',
    name: 'SLFN11 Methylation Status',
    short_desc: 'Schlafen-11 promoter silencing — predicts platinum and PARP resistance.',
    priority: 'MEDIUM',
    what_it_captures: [
      {
        title: 'DNA Damage Response Sensitizer',
        description: 'SLFN11 is a DNA damage-induced helicase that blocks stressed replication forks. When silenced (β>0.5 methylation), cells tolerate DNA damage from platinum/PARPi. 33.6% of HGSOC have SLFN11 silenced (GSE65820, 40/119 samples).',
        icon: 'lock',
      },
    ],
    resistance_tracked: [
      {
        title: 'Dual Resistance (Platinum + PARP)',
        description: 'SLFN11 silencing confers resistance to BOTH platinum and PARP inhibitors simultaneously. Basket biomarker for DNA-damaging therapy failure.',
        icon: 'shield',
      },
    ],
    kill_chain_axes: ['ddr'],
    signal_type: 'BASELINE', // models.py BASELINE_SIGNALS frozenset
    signal_constant: 'SIGNAL_SLFN11_PRIOR',
    threshold: { methylation_beta: 0.5, direction: 'above' }, // models.py SLFN11_METHYLATION_THRESHOLD
    population_rate: 0.336, // models.py SLFN11_POPULATION_SILENCING_RATE
    io_signals: { unlocks_profile_card: false, unlocks_domain_boost: false },
    validation: {
      status: 'DIRECTIONAL',
      cohort: 'GSE65820 (HM450K, 119 HGSOC samples)',
      n: 119,
      metrics: { silencing_rate: 0.336, probe: 'cg18608055' },
      caveats: 'Population prior applied when individual methylation data unavailable.',
      pmid: null,  // Internal analysis of public data
      computation_date: null,
    },
    limitations: [
      'Methylation assay (HM450K/EPIC) not standard in clinical oncology.',
      'Population prior (33.6%) used when individual data unavailable — crude approximation.',
      'BASELINE signal — does not indicate temporal change, only intake risk.',
    ],
    unlock_keys: ['slfn11_status', 'kc_ddr', 'dual_resistance_flag'],
  },

  repair_capacity: {
    id: 'repair_capacity',
    type: 'monitoring',
    name: 'HR Repair Capacity Shift',
    short_desc: 'Temporal change in homologous recombination repair capacity — active resistance signal.',
    priority: 'MEDIUM',
    what_it_captures: [
      {
        title: 'Repair Capacity Delta',
        description: 'Longitudinal measurement of HR repair capacity (0.0-1.0 scale). Change >0.2 from baseline triggers Kill Chain signal. Rising = HR restoration under PARP pressure.',
        icon: 'trending-up',
      },
    ],
    resistance_tracked: [
      {
        title: 'HR Restoration Under Therapy',
        description: 'Increasing repair capacity indicates tumor is adapting DNA repair pathways to survive PARP/platinum pressure. Mechanisms include 53BP1 loss, REV7 bypass.',
        icon: 'alert-triangle',
      },
    ],
    kill_chain_axes: ['ddr'],
    signal_type: 'ACTIVE',
    signal_constant: 'SIGNAL_REPAIR_SHIFT',
    threshold: { delta: 0.2, direction: 'any' }, // models.py REPAIR_SHIFT_THRESHOLD
    frequency: 'Paired with HRD score at each assessment point',
    trend_interpretation: {
      falling: 'Repair capacity declining — tumor remains DDR-deficient. Favorable.',
      stable: 'No significant change — continue current therapy.',
      rising: 'HR restoration detected. Trigger resistance workup. Consider therapy switch.',
    },
    alert_thresholds: {
      delta_gt_0_2: 'Repair capacity delta >0.2. Kill Chain ACTIVE signal fires.',
    },
    io_signals: { unlocks_profile_card: false, unlocks_domain_boost: false },
    validation: {
      status: 'UNVERIFIED',
      cohort: null,
      n: null,
      metrics: { note: 'Internal threshold. No prospective clinical validation.' },
      caveats: 'Threshold is internal estimate. Functional assay not standardized. Signal direction labeled "improving" in concordance map (repair_capacity rising = HR restoring, ambiguous clinical meaning).',
      pmid: null,
      computation_date: null,
    },
    limitations: [
      'Threshold (delta > 0.2) is internal, not clinically validated.',
      'Functional HR assay (RAD51 foci, BRCA1 foci) not widely available.',
      'SIGNAL_DIRECTION = "improving" per models.py — but "improving" HR means WORSE for PARPi.',
    ],
    unlock_keys: ['repair_capacity_delta', 'kc_ddr', 'hr_restoration_flag'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 4 — MONITORING ENTRIES
  // ═══════════════════════════════════════════════════════════════════════════

  ca125_kinetics: {
    id: 'ca125_kinetics',
    type: 'monitoring',
    name: 'CA-125 Kinetics Monitoring',
    short_desc: 'Serial CA-125 measurements for treatment response assessment and early recurrence detection.',
    priority: 'HIGH',
    what_it_captures: [
      {
        title: 'Response Trajectory',
        description: 'CA-125 half-life <14 days after NACT predicts optimal cytoreduction. Median 11 days (KELIM_DERIVED_BOUNDS). Nadir level correlates with survival.',
        icon: 'trending-down',
      },
    ],
    resistance_tracked: [
      {
        title: 'Rising CA-125 Under Treatment',
        description: 'GCIG criteria: confirmed doubling from nadir (GCIG_DOUBLING_FROM_NADIR_MULTIPLIER=2.0). Early indicator of platinum resistance.',
        icon: 'trending-up',
      },
    ],
    kill_chain_axes: ['ddr'], // CA-125 rising IS SIGNAL_CA125_RISING, an ACTIVE signal
    signal_type: 'ACTIVE',
    signal_constant: 'SIGNAL_CA125_RISING',
    // KELIM Engine integration (ca125_kinetics.py, 702 lines)
    kelim: {
      api_endpoint: 'biomarker-kinetics.org',
      kelim_score_cutoff: 1.0,
      half_life_median_days: 11,
      source: 'GOG-0218 (You et al. JCO 2022)',
      genotype_stratification: {
        BRCA1_germline: { expected: 1.38, sd: 0.42, source: 'ARIEL2_Colomban2023' },
        BRCA2_germline: { expected: 1.22, sd: 0.38, source: 'ARIEL2_Colomban2023' },
        HRD_non_BRCA:   { expected: 1.08, sd: 0.35, source: 'ARIEL2_Colomban2023' },
        HRP:            { expected: 0.92, sd: 0.30, source: 'ARIEL2_Colomban2023' },
      },
      early_warning_multiplier: 1.5, // 1.5x nadir = early warning (not GCIG confirmed)
    },
    io_signals: { unlocks_profile_card: false, unlocks_domain_boost: false },
    frequency: 'Every cycle during treatment, q3mo during maintenance',
    trend_interpretation: {
      falling: 'Response — continue current therapy.',
      stable: 'Disease control — maintain. Consider maintenance transition.',
      rising: 'Potential progression — confirm with imaging. Trigger Kill Chain re-evaluation.',
    },
    alert_thresholds: {
      confirmed_doubling: 'GCIG progression criterion. Initiate restaging.',
      absolute_gt_35: 'Above normal range. Context-dependent (post-surgical inflammation can cause transient rise).',
    },
    validation: {
      status: 'VALIDATED',
      cohort: 'GCIG consensus / multiple phase III trials',
      n: null,
      metrics: { note: 'Standard of care biomarker' },
      caveats: 'Not all OC subtypes express CA-125 (clear cell, mucinous may not).',
      pmid: '21646567',
      computation_date: null,
    },
    limitations: [
      'Not expressed by all OC subtypes (clear cell, mucinous).',
      'Post-surgical inflammation causes transient rises — wait ≥4 weeks.',
      'Does not localize disease — must pair with imaging.',
    ],
    unlock_keys: ['ca125_trajectory', 'resistance_alert', 'kelim_score'],
  },

  ctdna_mrd: {
    id: 'ctdna_mrd',
    type: 'monitoring',
    name: 'ctDNA / Minimal Residual Disease',
    short_desc: 'Circulating tumor DNA quantification for molecular residual disease detection.',
    priority: 'HIGH',
    what_it_captures: [
      {
        title: 'Molecular Residual Disease',
        description: 'Detects circulating tumor fraction post-surgery/chemo. ctDNA clearance at cycle 3 predicts long-term survival.',
        icon: 'droplet',
      },
    ],
    resistance_tracked: [
      {
        title: 'Emerging BRCA Reversions',
        description: 'Serial ctDNA can detect BRCA reversion mutations months before clinical progression.',
        icon: 'alert-circle',
      },
      {
        title: 'Clonal Evolution Under Therapy',
        description: 'New mutations appearing in serial draws indicate treatment-driven selection.',
        icon: 'git-branch',
      },
    ],
    kill_chain_axes: ['ddr'], // ctDNA BRCA reversion detection feeds DDR
    signal_type: 'ACTIVE',
    signal_constant: 'SIGNAL_CTDNA_MRD',
    io_signals: { unlocks_profile_card: false, unlocks_domain_boost: false },
    frequency: 'Baseline, post-cycle 3, post-cycle 6, then q3mo during maintenance',
    trend_interpretation: {
      falling: 'Molecular response. Favorable prognosis.',
      cleared: 'MRD-negative. Strong indicator of durable response.',
      rising: 'Molecular progression. Precedes clinical relapse by 3-6 months typically.',
    },
    alert_thresholds: {
      detectable_post_c3: 'Failure to clear ctDNA by cycle 3 → poor prognosis. Consider treatment escalation.',
      new_variants: 'New somatic variants in serial draw → clonal evolution. Trigger resistance workup.',
    },
    validation: {
      status: 'DIRECTIONAL',
      cohort: 'Multiple prospective studies (OC-specific data emerging)',
      n: null,
      metrics: { note: 'Analytically validated. Clinical utility trials ongoing.' },
      caveats: 'Sensitivity depends on tumor fraction and assay. Low-shedding tumors may be false-negative.',
      pmid: '33836136',
      computation_date: null,
    },
    limitations: [
      'Sensitivity depends on tumor shedding — low-volume disease may be missed.',
      'Assay-dependent (bespoke panel vs fixed panel affects sensitivity).',
      'Not yet standard of care for OC — emerging evidence.',
    ],
    unlock_keys: ['mrd_status', 'brca_reversion_alert', 'clonal_evolution_flag'],
  },
};

/**
 * Runtime validation: ensure all kill_chain_axes use real vector names
 */
export function validateRegistry() {
  const errors = [];
  Object.entries(CLINICAL_TEST_REGISTRY).forEach(([key, entry]) => {
    (entry.kill_chain_axes || []).forEach(axis => {
      if (!VALID_AXES.includes(axis)) {
        errors.push(`${key}: invalid axis "${axis}" — must be one of: ${VALID_AXES.join(', ')}`);
      }
    });
  });
  if (errors.length > 0) {
    console.error('❌ REGISTRY VALIDATION FAILED:');
    errors.forEach(e => console.error(`  - ${e}`));
    throw new Error(`Clinical Test Registry has ${errors.length} invalid axis reference(s)`);
  }
  return true;
}
