/**
 * Q2C Router - Question to Capability Router
 * Intent patterns and API mappings for clinical questions
 */

// Intent patterns and their API mappings
export const Q2C_INTENTS = {
  variant_impact: {
    patterns: [
      /what.*impact.*(variant|mutation|hgvs_p)/i,
      /how.*(variant|mutation).*affect/i,
      /functional.*impact.*(gene|variant)/i,
      /what.*does.*(variant|mutation).*do/i,
      /consequence.*(variant|mutation)/i
    ],
    endpoint: '/api/evidence/deep_analysis',
    description: 'Analyze functional impact of a genetic variant',
    confidence: 'high'
  },
  drug_efficacy: {
    patterns: [
      /will.*(drug|treatment).*work/i,
      /is.*(drug|treatment).*effective/i,
      /should.*use.*(drug|treatment)/i,
      /benefit.*from.*(drug|treatment)/i,
      /(drug|treatment).*response/i,
      /(drug|treatment).*efficacy/i
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
  chemo_guidance: {
    patterns: [
      /chemo|chemotherapy|drug class guidance|on-label guidance/i
    ],
    endpoint: '/api/guidance/chemo',
    description: 'Chemotherapy guidance with clinical gates',
    confidence: 'high'
  },
  literature_retrieval: {
    patterns: [
      /find.*(papers|studies|research)/i,
      /what.*literature.*says/i,
      /search.*(pubmed|papers)/i,
      /any.*studies.*on/i,
      /what.*evidence.*exists/i,
      /clinical.*trials/i,
      /recent.*research/i
    ],
    endpoint: '/api/evidence/literature',
    description: 'Search literature and clinical evidence',
    confidence: 'high'
  },
  clinvar_context: {
    patterns: [
      /clinvar.*(classification|pathogenic)/i,
      /what.*clinvar.*says/i,
      /variant.*database/i,
      /clinical.*significance/i,
      /pathogenicity/i
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
  const { variant, disease, page, question } = context;

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

    case 'drug_efficacy':
      return {
        ...basePayload,
        gene: variant?.gene,
        hgvs_p: variant?.hgvs_p,
        disease: disease,
        drug_mentions: extractDrugs(question),
        s_p_e_context: true
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
    /pembrolizumab/i, /nivolumab/i, /ipilimumab/i, /atezolizumab/i
  ];

  return drugPatterns
    .map(pattern => {
      const match = question.match(pattern);
      return match ? match[0] : null;
    })
    .filter(Boolean);
};

// Get suggested actions based on intent - Phase 3 Implementation
export const getSuggestedActions = (intent, context) => {
  const actions = [];
  const { variant, disease, page } = context;

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
          include_resistance: true
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

