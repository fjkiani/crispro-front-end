/**
 * Q2C Router - Question to Capability Router
 * Intent patterns and API mappings for clinical questions
 */

// Intent patterns and their API mappings
// ⚔️ NOTE: Order matters! More specific intents should come BEFORE general ones
export const Q2C_INTENTS = {
  // Specific intents first
  trials: {
    patterns: [
      /find.*(clinical.*trial|trial)/i,  // Must mention trial
      /recruiting.*trial/i,
      /trial.*for.*me/i,
      /trial.*match/i,
      /trial.*near.*me/i,
      /enroll.*trial/i
    ],
    endpoint: '/api/trials/agent/search',
    description: 'Find matching clinical trials',
    confidence: 'high'
  },
  ocr_analysis: {
    patterns: [
      /analyze.*(report|text|note)/i,
      /extract.*(data|clinical)/i,
      /read.*(this|report)/i,
      /parse.*(report|text)/i,
      /upload.*(report|file)/i,
      /copy.*paste/i
    ],
    endpoint: '/api/copilot/analyze_report',
    description: 'Analyze clinical text/report',
    confidence: 'high'
  },
  chemo_guidance: {
    patterns: [
      /chemotherapy/i,
      /chemo/i,
      /drug.*class.*guidance/i,
      /on-label.*guidance/i,
      /platinum.*chemotherapy/i,
      /use.*platinum/i
    ],
    endpoint: '/api/guidance/chemo',
    description: 'Chemotherapy guidance with clinical gates',
    confidence: 'high'
  },
  variant_impact: {
    patterns: [
      /what.*impact/i,
      /functional.*impact/i,
      /how.*(variant|mutation).*affect/i,
      /what.*does.*(variant|mutation).*do/i,
      /consequence.*(variant|mutation)/i,
      /(braf|kras|tp53|brca|egfr|alk|ros1|ret).*v\d+/i  // Catch variant mentions like "BRAF V600"
    ],
    endpoint: '/api/evidence/deep_analysis',
    description: 'Analyze functional impact of a genetic variant',
    confidence: 'high'
  },
  drug_efficacy: {
    patterns: [
      /will.*(drug|treatment|therapy).*work/i,
      /is.*(drug|treatment).*effective/i,
      /should.*use.*(drug|treatment)/i,
      /benefit.*from.*(drug|treatment)/i,
      /(drug|treatment).*response/i,
      /(drug|treatment).*efficacy/i,
      /(olaparib|rucaparib|niraparib|platinum|parp)/i  // Common drug names
    ],
    endpoint: '/api/efficacy/predict',
    description: 'Predict drug efficacy for variant',
    confidence: 'high'
  },
  radonc_guidance: {
    patterns: [
      /radonc|radiation|radiosensitivity|radiotherapy/i
    ],
    endpoint: '/api/guidance/radonc',
    description: 'Radiation guidance (PrecisionRad)',
    confidence: 'high'
  },
  literature_retrieval: {
    patterns: [
      /find.*(papers|studies|research)/i,
      /what.*literature.*says/i,
      /search.*(pubmed|papers)/i,
      /any.*studies.*on/i,
      /what.*evidence.*exists/i,
      /recent.*research/i
    ],
    endpoint: '/api/evidence/literature',
    description: 'Search literature and clinical evidence',
    confidence: 'high'
  },
  clinvar_context: {
    patterns: [
      /clinvar/i,
      /what.*clinvar.*says/i,
      /variant.*database/i,
      /clinical.*significance/i,
      /pathogenicity/i,
      /classification.*variant/i
    ],
    endpoint: '/api/evidence/deep_analysis',
    description: 'Get ClinVar classification and context',
    confidence: 'high'
  },
  design_request: {
    patterns: [
      /design.*(grna|guide.*rna)/i,
      /create.*(therapy|treatment)/i,
      /optimize.*sequence/i,
      /generate.*(repair|template)/i,
      /crispr.*design/i
    ],
    endpoint: '/api/design/guide_rna',
    description: 'Design CRISPR guides or therapeutic sequences',
    confidence: 'medium'
  },
  explain_result: {
    patterns: [
      /why.*this.*result/i,
      /explain.*(result|score)/i,
      /what.*does.*this.*mean/i,
      /understand.*better/i,
      /break.*down.*result/i
    ],
    endpoint: '/api/evidence/explain',
    description: 'Explain analysis results',
    confidence: 'high'
  },
  // ⚔️ NEW INTENTS - Ayesha Complete Care Integration
  food_validator: {
    patterns: [
      /should.*take.*(food|supplement|vitamin|mineral)/i,
      /is.*(food|supplement|vitamin).*safe/i,
      /(food|supplement|vitamin).*help/i,
      /recommend.*(food|supplement|vitamin)/i,
      /(diet|nutrition).*advice/i,
      /what.*eat/i,
      /(curcumin|vitamin d|omega|nac|turmeric|green tea)/i
    ],
    endpoint: '/api/hypothesis/validate_food_dynamic',
    description: 'Validate food/supplement for patient context',
    confidence: 'high'
  },
  complete_care: {
    patterns: [
      /complete.*care.*plan/i,
      /holistic.*plan/i,
      /full.*treatment.*plan/i,
      /what.*should.*do/i,
      /comprehensive.*plan/i,
      /(drug|food).*and.*(food|drug)/i
    ],
    endpoint: '/api/ayesha/complete_care_plan',
    description: 'Generate unified drug + food care plan',
    confidence: 'high'
  },
  synthetic_lethality: {
    patterns: [
      /synthetic.*lethality/i,
      /(exploit|target).*weakness/i,
      /cancer.*weakness/i,
      /vulnerabilit/i,
      /a-b.*dependency/i,
      /(damage|deficiency).*dependency/i,
      /weakness.*cancer/i
    ],
    endpoint: '/api/guidance/synthetic_lethality',
    description: 'Identify synthetic lethality vulnerabilities',
    confidence: 'medium'
  },
  toxicity_risk: {
    patterns: [
      /(toxic|toxicity|safe)/i,
      /side.*effect/i,
      /adverse.*reaction/i,
      /(drug|treatment).*interaction/i,
      /pgx|pharmacogene/i,
      /(dpyd|tpmt|dpyd).*variant/i
    ],
    endpoint: '/api/safety/toxicity_risk',
    description: 'Assess toxicity risk with PGx',
    confidence: 'high'
  }
};

// Classify user question into intent
export const classifyIntent = (question) => {
  for (const [intentName, intentData] of Object.entries(Q2C_INTENTS)) {
    for (const pattern of intentData.patterns) {
      if (pattern.test(question)) {
        return { intent: intentName, ...intentData };
      }
    }
  }
  return null;
};

// Generate payload based on intent and context
export const generatePayload = (intent, context) => {
  // ⚔️ TREATMENT LINE INTEGRATION - Extract treatment history from context
  const { variant, disease, page, question, treatmentHistory } = context;

  const basePayload = {
    question: question,
    intent: intent.intent,
    page_context: page,
    timestamp: new Date().toISOString()
  };

  switch (intent.intent) {
    case 'variant_impact':
      return {
        ...basePayload,
        gene: variant?.gene,
        hgvs_p: variant?.hgvs_p,
        disease: disease,
        variant_info: variant?.variant_info
      };

    case 'ocr_analysis':
      return {
        ...basePayload,
        text: context.text || question, // Expect text to be in context if uploaded, or uses question if pasted
        context: page || 'onboarding'
      };

    case 'drug_efficacy':
      // ⚔️ TREATMENT LINE INTEGRATION - Include treatment history in efficacy payload
      return {
        ...basePayload,
        gene: variant?.gene,
        hgvs_p: variant?.hgvs_p,
        disease: disease,
        drug_mentions: extractDrugs(question),
        s_p_e_context: true,
        treatment_history: treatmentHistory,       // ⚔️ Treatment line support
        germline_status: context.germlineStatus,   // ⚔️ NEW: Sporadic cancer support
        tumor_context: context.tumorContext        // ⚔️ NEW: Sporadic cancer support
      };

    case 'radonc_guidance':
      return {
        disease,
        mutations: variant ? [{
          gene: variant.gene,
          hgvs_p: variant.hgvs_p,
          chrom: variant.chrom,
          pos: variant.pos,
          ref: variant.ref,
          alt: variant.alt,
          build: variant.build
        }] : [],
        options: { adaptive: true, ensemble: true }
      };

    case 'chemo_guidance':
      return {
        disease,
        drug_or_class: (extractDrugs(question) || [])[0],
        mutations: variant ? [{
          gene: variant.gene,
          hgvs_p: variant.hgvs_p,
          chrom: variant.chrom,
          pos: variant.pos,
          ref: variant.ref,
          alt: variant.alt,
          build: variant.build
        }] : [],
        options: { adaptive: true, ensemble: true }
      };

    case 'literature_retrieval':
      return {
        ...basePayload,
        gene: variant?.gene,
        hgvs_p: variant?.hgvs_p,
        disease: disease,
        max_results: 10,
        time_window: '5years'
      };

    case 'clinvar_context':
      return {
        ...basePayload,
        gene: variant?.gene,
        hgvs_p: variant?.hgvs_p,
        include_explanation: true
      };

    case 'design_request':
      return {
        ...basePayload,
        gene: variant?.gene,
        chrom: variant?.chrom,
        pos: variant?.pos,
        disease: disease
      };

    case 'explain_result':
      return {
        ...basePayload,
        analysis_results: context.analysisResults,
        gene: variant?.gene,
        hgvs_p: variant?.hgvs_p
      };

    // ⚔️ NEW PAYLOADS - Ayesha Complete Care Integration
    case 'food_validator':
      return {
        ...basePayload,
        compound: extractCompound(question),
        disease_context: {
          disease: disease?.toLowerCase()?.replace(/ /g, '_'),
          biomarkers: context.biomarkers || {},
          pathways_disrupted: context.pathways || []
        },
        treatment_history: treatmentHistory || {},
        patient_medications: context.medications || [],
        use_llm: true
      };

    case 'trials':
      return {
        ...basePayload,
        patient_summary: generatePatientSummary(context),
        disease: disease,
        biomarkers: context.biomarkers || {},
        location: context.location || null,
        germline_status: context.germlineStatus,  // ⚔️ NEW: Sporadic filtering
        tumor_context: context.tumorContext        // ⚔️ NEW: Biomarker boost
      };

    case 'complete_care':
      return {
        ...basePayload,
        patient_context: {
          disease: disease,
          mutations: variant ? [{
            gene: variant.gene,
            hgvs_p: variant.hgvs_p,
            chrom: variant.chrom,
            pos: variant.pos,
            ref: variant.ref,
            alt: variant.alt,
            build: variant.build
          }] : [],
          biomarkers: context.biomarkers || {},
          treatment_history: treatmentHistory || {},
          germline_status: context.germlineStatus,  // ⚔️ NEW: Sporadic cancer support
          tumor_context: context.tumorContext        // ⚔️ NEW: Sporadic cancer support
        }
      };

    case 'synthetic_lethality':
      return {
        ...basePayload,
        disease: disease,
        mutations: variant ? [{
          gene: variant.gene,
          hgvs_p: variant.hgvs_p,
          chrom: variant.chrom,
          pos: variant.pos,
          ref: variant.ref,
          alt: variant.alt,
          build: variant.build
        }] : [],
        api_base: 'http://127.0.0.1:8000'
      };

    case 'toxicity_risk':
      return {
        ...basePayload,
        patient: {
          germlineVariants: context.germlineVariants || []
        },
        candidate: {
          type: 'drug',
          name: (extractDrugs(question) || [])[0],
          moa: context.drugMoA || null
        }
      };

    default:
      return basePayload;
  }
};

// Extract drug names from question
export const extractDrugs = (question) => {
  const drugPatterns = [
    /dabrafenib/i, /trametinib/i, /vemurafenib/i, /cobimetinib/i,
    /erlotinib/i, /gefitinib/i, /osimertinib/i, /afatinib/i,
    /cetuximab/i, /panitumumab/i, /bevacizumab/i, /trastuzumab/i,
    /pembrolizumab/i, /nivolumab/i, /ipilimumab/i, /atezolizumab/i,
    /olaparib/i, /rucaparib/i, /niraparib/i, /talazoparib/i,
    /carboplatin/i, /cisplatin/i, /paclitaxel/i, /docetaxel/i
  ];

  return drugPatterns
    .map(pattern => {
      const match = question.match(pattern);
      return match ? match[0] : null;
    })
    .filter(Boolean);
};

// ⚔️ NEW HELPER - Extract compound names from food/supplement questions
export const extractCompound = (question) => {
  const compoundPatterns = [
    /vitamin\s+d/i, /vitamin d/i,
    /vitamin\s+c/i, /vitamin c/i,
    /omega[-\s]*3/i,
    /curcumin/i, /turmeric/i,
    /green\s+tea/i,
    /n-acetylcysteine/i, /nac/i,
    /resveratrol/i,
    /quercetin/i,
    /genistein/i
  ];

  for (const pattern of compoundPatterns) {
    const match = question.match(pattern);
    if (match) return match[0];
  }

  // Fallback: look for "take X" or "use X"
  const fallback = question.match(/(?:take|use)\s+([a-z]+)/i);
  return fallback ? fallback[1] : 'unknown_compound';
};

// ⚔️ NEW HELPER - Generate patient summary for trials agent
export const generatePatientSummary = (context) => {
  const { variant, disease, biomarkers, treatmentHistory } = context;

  let summary = [];

  // Add demographics if available
  if (context.age) summary.push(`${context.age}yo`);
  if (context.sex) summary.push(context.sex);

  // Add disease
  if (disease) summary.push(disease);

  // Add key variant
  if (variant?.gene && variant?.hgvs_p) {
    summary.push(`${variant.gene} ${variant.hgvs_p}`);
  }

  // Add biomarkers
  if (biomarkers?.HRD) summary.push(`HRD${biomarkers.HRD === 'POSITIVE' ? '+' : '-'}`);
  if (biomarkers?.TMB) summary.push(`TMB ${biomarkers.TMB}`);
  if (biomarkers?.TP53) summary.push(`TP53 ${biomarkers.TP53}`);

  // Add treatment history
  if (treatmentHistory?.current_line) {
    summary.push(`Line ${treatmentHistory.current_line}`);
  }
  if (treatmentHistory?.prior_therapies && treatmentHistory.prior_therapies.length > 0) {
    summary.push(`post-${treatmentHistory.prior_therapies.join(', ')}`);
  }

  return summary.join(', ') || 'Patient with unspecified condition';
};

// Get suggested actions based on intent - Phase 3 Implementation
export const getSuggestedActions = (intent, context) => {
  const actions = [];
  // ⚔️ TREATMENT LINE INTEGRATION - Extract treatment history from context
  const { variant, disease, page, treatmentHistory } = context;

  switch (intent.intent) {
    case 'variant_impact':
      actions.push({
        label: '🔍 Run Deep Analysis',
        endpoint: '/api/evidence/deep_analysis',
        payload: {
          gene: variant?.gene,
          hgvs_p: variant?.hgvs_p,
          disease: disease,
          analysis_type: 'comprehensive',
          include_clinvar: true,
          include_populations: true
        }
      });
      actions.push({
        label: '📊 Generate Variant Profile',
        endpoint: '/api/evo/score_variant_profile',
        payload: {
          gene: variant?.gene,
          hgvs_p: variant?.hgvs_p,
          disease: disease,
          profile_type: 'evolutionary'
        }
      });
      actions.push({
        label: '🧬 Check ClinVar Database',
        endpoint: '/api/evidence/deep_analysis',
        payload: {
          gene: variant?.gene,
          hgvs_p: variant?.hgvs_p,
          source: 'clinvar',
          include_classifications: true
        }
      });
      break;

    case 'drug_efficacy':
      actions.push({
        label: '📈 Run S/P/E Prediction',
        endpoint: '/api/efficacy/predict',
        payload: {
          gene: variant?.gene,
          hgvs_p: variant?.hgvs_p,
          disease: disease,
          prediction_type: 'comprehensive',
          include_resistance: true,
          treatment_history: treatmentHistory  // ⚔️ NEW: Include treatment history
        }
      });
      actions.push({
        label: '🔬 Find Clinical Trials',
        endpoint: '/api/evidence/literature',
        payload: {
          gene: variant?.gene,
          hgvs_p: variant?.hgvs_p,
          disease: disease,
          study_type: 'rct',
          max_results: 20,
          time_window: '5years'
        }
      });
      actions.push({
        label: '📋 Generate Evidence Bundle',
        endpoint: '/api/command/run_evidence_bundle',
        payload: {
          gene: variant?.gene,
          hgvs_p: variant?.hgvs_p,
          disease: disease,
          bundle_type: 'drug_efficacy'
        }
      });
      break;

    case 'radonc_guidance':
      actions.push({
        label: '☢️ Get Radiation Guidance',
        endpoint: '/api/guidance/radonc',
        payload: {
          disease,
          mutations: variant ? [{
            gene: variant?.gene,
            hgvs_p: variant?.hgvs_p,
            chrom: variant?.chrom,
            pos: variant?.pos,
            ref: variant?.ref,
            alt: variant?.alt,
            build: variant?.build
          }] : [],
          options: { adaptive: true, ensemble: true }
        }
      });
      break;

    case 'chemo_guidance':
      actions.push({
        label: '💊 Get Chemo Guidance',
        endpoint: '/api/guidance/chemo',
        payload: {
          disease,
          drug_or_class: (extractDrugs(context.question) || [])[0] || (disease?.toLowerCase() === 'multiple myeloma' ? 'proteasome inhibitor' : undefined),
          mutations: variant ? [{
            gene: variant?.gene,
            hgvs_p: variant?.hgvs_p,
            chrom: variant?.chrom,
            pos: variant?.pos,
            ref: variant?.ref,
            alt: variant?.alt,
            build: variant?.build
          }] : [],
          options: { adaptive: true, ensemble: true }
        }
      });
      break;

    case 'literature_retrieval':
      actions.push({
        label: '📖 Extract Full Papers',
        endpoint: '/api/evidence/extract',
        payload: {
          gene: variant?.gene,
          disease: disease,
          extraction_type: 'full_text',
          max_papers: 5
        }
      });
      actions.push({
        label: '🔍 Search Recent Publications',
        endpoint: '/api/evidence/literature',
        payload: {
          gene: variant?.gene,
          disease: disease,
          time_window: '2years',
          sort_by: 'relevance'
        }
      });
      actions.push({
        label: '📊 Analyze Citation Trends',
        endpoint: '/api/evidence/literature',
        payload: {
          gene: variant?.gene,
          disease: disease,
          analysis_type: 'trends',
          time_window: '10years'
        }
      });
      break;

    case 'clinvar_context':
      actions.push({
        label: '🏥 Get Full ClinVar Report',
        endpoint: '/api/evidence/deep_analysis',
        payload: {
          gene: variant?.gene,
          hgvs_p: variant?.hgvs_p,
          source: 'clinvar',
          include_all_classifications: true,
          include_submissions: true
        }
      });
      actions.push({
        label: '🌍 Check Population Databases',
        endpoint: '/api/evidence/deep_analysis',
        payload: {
          gene: variant?.gene,
          hgvs_p: variant?.hgvs_p,
          source: 'population_databases',
          include_gnomad: true,
          include_1000g: true
        }
      });
      break;

    case 'design_request':
      actions.push({
        label: '🎯 Design CRISPR Guide RNAs',
        endpoint: '/api/design/guide_rna',
        payload: {
          gene: variant?.gene,
          hgvs_p: variant?.hgvs_p,
          design_type: 'crispr',
          target_region: 'exon',
          pam_type: 'NGG'
        }
      });
      actions.push({
        label: '🧬 Generate Repair Template',
        endpoint: '/api/design/repair_template',
        payload: {
          gene: variant?.gene,
          hgvs_p: variant?.hgvs_p,
          repair_type: 'homology_directed',
          template_length: 200
        }
      });
      actions.push({
        label: '⚡ Run Design Bundle',
        endpoint: '/api/command/run_design_bundle',
        payload: {
          gene: variant?.gene,
          hgvs_p: variant?.hgvs_p,
          disease: disease,
          design_types: ['crispr', 'prime_editing', 'base_editing']
        }
      });
      break;

    case 'explain_result':
      actions.push({
        label: '📋 Generate Analysis Report',
        endpoint: '/api/evidence/explain',
        payload: {
          analysis_results: context.analysisResults,
          gene: variant?.gene,
          hgvs_p: variant?.hgvs_p,
          disease: disease,
          report_type: 'comprehensive'
        }
      });
      actions.push({
        label: '🔗 Get Related Evidence',
        endpoint: '/api/evidence/literature',
        payload: {
          gene: variant?.gene,
          disease: disease,
          search_type: 'related_to_results'
        }
      });
      break;
  }

  return actions;
};

// Main Q2C Router object
export const Q2C_ROUTER = {
  intents: Q2C_INTENTS,
  classifyIntent,
  generatePayload,
  extractDrugs,
  getSuggestedActions
};

