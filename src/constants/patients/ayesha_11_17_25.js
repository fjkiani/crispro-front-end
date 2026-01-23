/**
 * Ayesha (AK) - Complete Patient Profile (January 2025)
 *
 * This is the complete source-of-truth patient profile constant used to power the patient dashboard.
 * It includes data from all 7 reports organized hierarchically in MEDICAL_REPORT_ORGANIZATION_SCHEMA.md:
 * - 2 CT Scans (baseline 2/1/2024, progression 10/28/2025)
 * - 1 PET Scan (11/11/2025)
 * - 3 Pathology Reports (2 cytology 11/17/2025, 1 surgical 11/20/2025)
 * - 1 Genetic Test (germline 11/24/2025)
 *
 * Sources:
 * - MEDICAL_REPORT_ORGANIZATION_SCHEMA.md (complete hierarchical organization)
 * - All 7 reports parsed and organized manually (January 2025)
 */

export const AYESHA_11_17_25_PROFILE = {
  meta: {
    profile_id: "ayesha_11_17_25",
    version: "2.0.0",
    last_updated: "2026-01-13",
    status: "complete", // Updated from "pre_ngs" - now includes all reports including genetic testing
    source_document: "MEDICAL_REPORT_ORGANIZATION_SCHEMA.md",
  },

  patient: {
    patient_id: "AK",
    display_name: "AK",
    demographics: {
      sex: "F", // From genetic test report (11/24/2025)
      age: 40, // From genetic test report (DOB 6/25/1985, Age 40 as of 11/24/2025)
      date_of_birth: "1985-06-25", // From genetic test report
      location_state: "NY",
      location_city: "NYC Metro",
      mrn: "1011021118", // From pathology reports
    },
  },

  disease: {
    type: "ovarian_cancer_hgs",
    stage: "IVB",
    histology: "high_grade_serous_carcinoma",
    primary_site: "ovarian/peritoneal (Mullerian origin)",
    diagnosis_summary:
      "Metastatic high-grade serous carcinoma consistent with Mullerian origin (adnexal or primary peritoneal). Strong WT-1 staining suggests high grade serous carcinoma of adnexal or primary peritoneal origin rather than endometrial primary.",
    diagnosis_provenance: {
      source_files: [
        "MEDICAL_REPORT_ORGANIZATION_SCHEMA.md",
        "Pathology Report CN25-5777 (Right Pleural Fluid - 11/17/2025)",
        "Pathology Report GP25-3371 (Surgical Biopsies - 11/20/2025)",
      ],
      inferred: false,
    },
  },

  clinical: {
    has_ascites: true,
    has_peritoneal_disease: true,
    has_carcinomatosis: true,
    has_pleural_effusions: true,
    has_pleural_metastases: true,
    has_lymph_node_metastases: true,
    has_distant_metastases: true,
    ecog_status: null,
    clinical_provenance: {
      source_files: [
        "CT Abdomen/Pelvis 10/28/2025",
        "PET Scan 11/11/2025",
        "Pathology Reports 11/17-11/20/2025",
      ],
      inferred: false,
    },
  },

  tumor_context: {
    // PLUMBER 2: Add completeness_score (L1: Has IHC + germline, missing NGS/CA-125)
    completeness_score: 0.55, // L1: Has IHC + germline, missing NGS/CA-125
    
    // Somatic mutations (IHC evidence - not full NGS genomic coordinates yet)
    somatic_mutations: [
      {
        gene: "TP53",
        variant: null,
        evidence: "IHC: p53 positive, favor mutant type (from surgical pathology GP25-3371)",
        provenance: { source_file: "Pathology Report GP25-3371", inferred: true },
      },
    ],

    biomarkers: {
      // Mismatch Repair Status
      mmr_status: "PRESERVED",
      msi_status: "MSS", // Microsatellite Stable (inferred from preserved MMR)
      mmr_proteins: ["MLH1", "PMS2", "MSH2", "MSH6"],

      // Hormone Receptors
      er_status: "WEAKLY_POSITIVE",
      er_percent: 50, // From surgical pathology (GP25-3371)
      pr_status: "NEGATIVE",
      pr_percent: "<1%",

      // Tumor Suppressors
      p53_status: "MUTANT_TYPE",
      p16_status: "STRONG_AND_DIFFUSE", // From cytology report CN25-5777

      // Growth Factor Receptors
      her2_status: "NEGATIVE",
      her2_score: 0,

      // Therapeutic Targets
      folr1_status: "NEGATIVE",
      folr1_percent: "<1%",
      folr1_threshold_percent_for_elahere: 75, // Requires ≥75% for ELAHERE eligibility

      pd_l1_status: "POSITIVE",
      pd_l1_assay: "22C3",
      pd_l1_cps: 10, // Combined Positive Score

      ntrk_status: "NEGATIVE",

      // IHC Profile Summary
      ihc_profile:
        "Mullerian origin (WT1+, PAX8+, CK7+, MOC31+, claudin4+); Negative: CK20, SATB2, GATA3, calretinin, CD163, TTF1",
    },

    // Unknown until full NGS report available
    hrd_score: null,
    tmb: null,

    tumor_context_provenance: {
      source_files: [
        "Pathology Report CN25-5777 (Cytology - 11/17/2025)",
        "Pathology Report GP25-3371 (Surgical - 11/20/2025)",
      ],
      inferred: false,
    },
  },

  germline: {
    status: "POSITIVE", // MBD4 homozygous pathogenic mutation detected
    test_date: "2025-11-24",
    lab: "Ambry Genetics",
    panel: "CancerNext-Expanded + RNAinsight (77 genes)",
    accession_number: "25-743747",
    mutations: [
      {
        gene: "MBD4",
        variant: "c.1293delA",
        protein_change: "p.K431Nfs*54",
        zygosity: "homozygous",
        classification: "pathogenic",
        inheritance: "autosomal_recessive",
        syndrome: "MBD4-associated neoplasia syndrome (MANS)",
        risk_increases: ["Acute myelogenous leukemia (AML)", "Colorectal cancer (CRC)"],
      },
      {
        gene: "PDGFRA",
        variant: "c.2263T>C",
        protein_change: "p.S755P",
        zygosity: "heterozygous",
        classification: "VUS",
        inheritance: "unknown",
      },
    ],
    genes_analyzed: 77,
    germline_provenance: {
      source_file: "Ambry Genetics CancerNext-Expanded + RNAinsight Report (11/24/2025)",
      inferred: false,
    },
  },

  imaging: {
    // Keep key name for compatibility with patientGates.js
    ct_abdomen_pelvis_2025_10_28: {
      modality: "CT Abdomen/Pelvis with IV contrast",
      performed_date: "2025-10-28",
      key_findings: [
        "Peritoneal carcinomatosis",
        "Small volume ascites",
        "Abdominopelvic lymphadenopathy",
        "Large bilateral pleural effusions",
        "Ovaries inseparable from peritoneal deposits",
      ],
      impression:
        "Peritoneal carcinomatosis, small volume ascites, and abdominopelvic lymphadenopathy suspicious for metastatic disease. Recommend tissue sampling.",
      clinical_context: "~22 months after baseline - PROGRESSION DETECTED",
      provenance: {
        source_file: "CT Abdomen/Pelvis 10/28/2025 (Progression)",
        inferred: false,
      },
    },
    ct_baseline_2024_02_01: {
      modality: "CT Abdomen/Pelvis with IV contrast",
      performed_date: "2024-02-01",
      key_findings: [
        "Left ovarian cysts (5.2cm inferior, 4.4cm superior)",
        "Lower abdominal wall/rectus collection",
        "NO CARCINOMATOSIS detected",
        "No ascites",
        "No lymphadenopathy",
      ],
      clinical_context: "Baseline scan - status post total colectomy 01/02/2024",
      provenance: {
        source_file: "CT Abdomen/Pelvis 2/1/2024 (Baseline)",
        inferred: false,
      },
    },
    pet_scan_2025_11_11: {
      modality: "PET-CT Skull Base to Mid-Thigh",
      performed_date: "2025-11-11",
      key_findings: [
        "Extensive carcinomatosis",
        "Moderate volume ascites",
        "Bilateral pleural metastatic disease",
        "Extensive cervical, thoracic, and abdominopelvic nodal metastases",
        "SUV max: 15.0",
        "Suspected gynecologic primary (left adnexal, endometrial, or cervical)",
      ],
      impression:
        "Extensive carcinomatosis with widespread metastases. Suspect a gynecologic primary.",
      clinical_context: "~2 weeks after progression CT - WIDESPREAD METASTASES confirmed",
      provenance: {
        source_file: "PET Scan 11/11/2025",
        inferred: false,
      },
    },
  },

  pathology: {
    cytology_right_pleural_2025_11_17: {
      report_number: "CN25-5777",
      report_date: "2025-11-17",
      specimen_type: "Pleural fluid, right",
      specimen_volume: "1400 cc",
      diagnosis: {
        result: "POSITIVE FOR MALIGNANT CELLS",
        tumor_type: "Metastatic adenocarcinoma",
        primary_site: "Mullerian (gynecologic)",
      },
      immunohistochemistry: {
        positive_markers: ["claudin4", "MOC31", "CK7", "PAX8", "WT1"],
        negative_markers: ["calretinin", "CD163", "TTF1", "GATA3", "CK20"],
        special_markers: {
          p16: "strong_and_diffuse",
          p53: "mutant_type",
          ER: { status: "weakly_to_moderately_positive", percent: 60 },
          PR: { status: "negative", percent: 0 },
        },
      },
      note: "Complete IHC workup performed on this specimen",
      provenance: {
        source_file: "Pathology Report CN25-5777 (Right Pleural Fluid)",
        inferred: false,
      },
    },
    cytology_left_pleural_2025_11_17: {
      report_number: "CN25-5778",
      report_date: "2025-11-17",
      specimen_type: "Pleural fluid, left",
      specimen_volume: "1200 cc",
      diagnosis: {
        result: "POSITIVE FOR MALIGNANT CELLS",
        tumor_type: "Metastatic adenocarcinoma",
        primary_site: "Mullerian (gynecologic)",
      },
      clinical_context:
        "Same cytomorphology as right pleural fluid (CN25-5777). References CN25-5777 for complete IHC workup.",
      note: "Bilateral pleural metastases confirmed - same tumor type on both sides",
      provenance: {
        source_file: "Pathology Report CN25-5778 (Left Pleural Fluid)",
        inferred: false,
      },
    },
    surgical_biopsies_2025_11_20: {
      path_number: "GP25-3371",
      report_date: "2025-11-20",
      date_obtained: "2025-11-17",
      specimens: [
        { id: "A", type: "Biopsy of omentum", diagnosis: "Metastatic adenocarcinoma, Mullerian origin" },
        { id: "B", type: "Endometrial curettings", diagnosis: "Fragments of high grade carcinoma" },
        { id: "C", type: "Anterior perineal nodule", diagnosis: "Metastatic adenocarcinoma, Mullerian origin" },
        { id: "D", type: "Biopsy of omentum #2", diagnosis: "Metastatic adenocarcinoma, Mullerian origin" },
      ],
      diagnosis_summary:
        "Similar tumor identified in all parts. Strong WT-1 staining more commonly seen in high grade serous carcinoma of adnexal or primary peritoneal origin than endometrial primary.",
      immunohistochemistry: {
        positive_markers: ["PAX8", "CK7", "WT-1"],
        negative_markers: ["CK20", "SATB2", "GATA3"],
        note: "Per cytology report, also negative for calretinin, positive for MOC31 and Claudin4.",
      },
      biomarkers: {
        mismatch_repair: {
          status: "preserved",
          markers: { MLH1: "positive", PMS2: "positive", MSH2: "positive", MSH6: "positive" },
        },
        hormone_receptors: {
          ER: { status: "weakly_positive", percent: 50 },
          PR: { status: "negative", percent: "<1%" },
        },
        p53: { status: "positive", type: "mutant_type" },
        HER2: { status: "negative", score: 0 },
        FOLR1: {
          status: "negative",
          percent: "<1%",
          note: "Requires ≥75% for ELAHERE eligibility",
        },
        PDL1: {
          assay: "22C3",
          status: "positive",
          cps: 10,
          note: "Combined Positive Score (CPS): PD-L1 positive tumor cells and infiltrating immune cells / total viable tumor cells × 100",
        },
        NTRK: { status: "negative" },
      },
      additional_tests: [
        { name: "Solid Tumor Gynecological Panel", date_signed_out: "2025-12-03" },
        {
          name: "Microsatellite Instability (MSI) Testing",
          date_signed_out: "2025-12-03",
          note: "Likely MSS given preserved MMR",
        },
      ],
      provenance: {
        source_file: "Pathology Report GP25-3371 (Surgical Biopsies)",
        inferred: false,
      },
    },
  },

  labs: {
    ca125_value: null,
    ca125_units: "U/mL",
    ca125_provenance: {
      source_files: ["Not present in attached reports"],
      inferred: false,
      note: "Not present in the attached reports; needs patient lab upload.",
    },
  },

  diagnostic_timeline: [
    {
      date: "2024-02-01",
      report_type: "CT_SCAN",
      finding: "Baseline: Left ovarian cysts (5.2cm, 4.4cm), lower abdominal wall collection. NO CARCINOMATOSIS detected.",
      stage: "baseline",
    },
    {
      date: "2025-10-28",
      report_type: "CT_SCAN",
      finding: "PROGRESSION DETECTED: Extensive peritoneal carcinomatosis, small volume ascites, lymphadenopathy. Ovaries inseparable from peritoneal deposits.",
      stage: "metastatic_detected",
    },
    {
      date: "2025-11-11",
      report_type: "PET_SCAN",
      finding: "WIDESPREAD METASTASES: Extensive carcinomatosis with widespread metastases (SUV max 15.0), suspected gynecologic primary",
      stage: "widespread_metastases",
    },
    {
      date: "2025-11-17",
      report_type: "PATHOLOGY_CYTOLOGY",
      finding: "DIAGNOSIS CONFIRMED: POSITIVE FOR MALIGNANT CELLS - Metastatic adenocarcinoma, Mullerian primary (p53 mutant, ER weakly positive, PR negative). BILATERAL pleural metastases (right and left).",
      stage: "diagnosis_confirmed",
      specimens: ["Pleural fluid, right (CN25-5777)", "Pleural fluid, left (CN25-5778)"],
    },
    {
      date: "2025-11-20",
      report_type: "PATHOLOGY_SURGICAL",
      finding: "TISSUE BIOPSIES CONFIRMED: Metastatic adenocarcinoma, Mullerian origin in all 4 specimens (omentum x2, endometrial curettings, perineal nodule). Comprehensive biomarkers: PD-L1 positive (CPS=10), FOLR1 negative (<1%), MMR preserved (MSS), HER2 negative, NTRK negative.",
      stage: "tissue_confirmed",
      report_number: "GP25-3371",
    },
    {
      date: "2025-11-24",
      report_type: "GENETIC_GERMLINE",
      finding: "GERMLINE TESTING: POSITIVE - MBD4 homozygous pathogenic mutation (c.1293delA) detected. MBD4-associated neoplasia syndrome (MANS) diagnosed. Increased risk for AML and colorectal cancer. PDGFRA VUS also detected.",
      stage: "germline_diagnosis",
    },
  ],

  // Top-level fields for API compatibility (derived from nested structures)
  germline_status: "positive", // Derived from germline.status (MBD4 homozygous pathogenic mutation detected)

  // Fields that are *commonly assumed* but must be explicitly confirmed by patient/clinician.
  inferred_fields: {
    treatment_line: {
      value: 0, // Treatment-naive (not explicitly stated in reports)
      inferred: true,
      reason: "Not explicitly stated in attached reports; assuming treatment-naive based on timeline",
      source_files: [],
    },
    // Note: platinum_response removed - not available in reports and should not be shown as inferred
  },
};
