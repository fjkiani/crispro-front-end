export const hypothesisValidatorConfig = {
  toolId: 'hypothesis-validator',
  title: '🔬 Scientific Hypothesis Validator',
  subtitle: 'AI-Powered Literature Review & Experimental Design Platform',
  progressSteps: [
    { id: 'hypothesis', label: 'Formulate Hypothesis' },
    { id: 'data', label: 'Gather Intelligence' },
    { id: 'synthesis', label: 'Synthesize & Analyze' },
    { id: 'design', label: 'Design Experiment' }
  ],
  // The Hypothesis Validator is unique in that it has one primary input
  // that triggers a complex, chained workflow.
  inputSections: [
    {
      id: 'main_query',
      title: 'Research Question Formation',
      fields: [
        { 
          id: 'query', 
          label: 'Enter your research question or hypothesis', 
          type: 'textarea', 
          defaultValue: 'What is the mechanism of action for Neovastat (AE-941)?' 
        }
      ],
      action: {
        buttonText: 'Execute Analysis',
        // This workflow is special and will be handled by a custom function
        // within the ToolRunner, rather than a simple API call.
        workflow: 'hypothesisValidationWorkflow' 
      }
    }
  ],
  // It also uses a unique combination of results components
  resultsComponent: 'HypothesisValidatorResults'
};

export const threatAssessorConfig = {
  id: 'threatAssessor',
  title: 'Unified Threat & Metastasis Assessor',
  description: 'Assess a variant\'s threat and model its metastatic potential (Seed & Soil).',
  progressSteps: [
    { id: 'input', label: 'Define Variant' },
    { id: 'analysis', label: 'Threat Assessment' },
    { id: 'results', label: 'View Analysis' }
  ],
  inputSections: [
    {
      id: 'threat_analysis',
      title: 'Variant Threat Analysis',
      fields: [
        { id: 'gene', label: 'Gene Symbol', type: 'text', defaultValue: 'BRAF' },
        { id: 'variant', label: 'Protein Change', type: 'text', defaultValue: 'V600E' },
        { id: 'disease_context', label: 'Disease Context', type: 'text', defaultValue: 'Melanoma' },
        { id: 'primary_tissue', label: 'Primary Tissue', type: 'text', defaultValue: 'Skin' },
        { id: 'metastatic_site', label: 'Metastatic Site to Model', type: 'text', defaultValue: 'Lung' },
      ],
      action: {
        buttonText: 'Assess Threat & Metastasis',
        apiCall: {
          endpoint: '/workflow/run_seed_soil_analysis',
          method: 'POST',
        }
      }
    }
  ],
  resultsComponent: 'SeedSoilAnalysisDisplay',
};

export const radOncConfig = {
  toolId: 'radonc-assessment',
  title: '☢️ Live Assessment: Analyze a New Variant',
  subtitle: 'This demonstrates the co-pilot\'s ability to act as a live decision support tool. Enter a TP53 variant to get a real-time pathogenicity assessment from our platform.',
  // This tool doesn't need complex progress steps, it's a direct action
  progressSteps: [
    { id: 'input', label: 'Define Variant' },
    { id: 'assessment', label: 'Run Assessment' },
  ],
  inputSections: [
    { 
      id: 'live_assessment_inputs', 
      title: 'Variant Parameters', // Title for the card section
      fields: [
        { "id": "gene_symbol", "label": "Gene Symbol", "type": "text", "defaultValue": "TP53" },
        { "id": "protein_change", "label": "Protein Change", "type": "text", "defaultValue": "p.R248Q" }
      ],
      action: {
        buttonText: '⚡ Assess Variant in Real-Time',
        apiCall: {
          endpoint: '/workflow/assess_threat',
          payload: {
            "gene_symbol": "{gene_symbol}",
            "protein_change": "{protein_change}"
          }
        }
      }
    }
  ],
  resultsComponent: 'ThreatAssessmentDisplay',
};

export const myelomaTwinConfig = {
  toolId: 'myeloma-digital-twin',
  title: '🔬 Myeloma Digital Twin',
  subtitle: 'AI-Powered Drug Response Prediction for Multiple Myeloma',
  progressSteps: [
    { id: 'input', label: 'Define Mutations' },
    { id: 'analysis', label: 'Analyze Drug Response' },
    { id: 'results', label: 'View Prediction' }
  ],
  inputSections: [
    {
      id: 'settings',
      title: 'Scoring Settings',
      fields: [
        { id: 'model_id', label: 'Evo2 Model', type: 'select', options: ['evo2_1b','evo2_7b','evo2_40b'], defaultValue: 'evo2_7b' },
      ],
      // no action here; action lives in mutations section
    },
    {
      id: 'mutations',
      title: 'Patient Mutation Input',
      description: 'Use the list above to add multiple mutations. Click Analyze to run them all at once.',
      type: 'repeatable',
      fields: [
        // Inputs handled by VariantInputList component
      ],
      initialItems: [],
      action: {
        buttonText: '🚀 Analyze Drug Response',
        apiCall: {
          endpoint: '/api/predict/myeloma_drug_response',
          payload: {
            gene: '{gene}',
            hgvs_p: '{hgvs_p}',
            variant_info: '{variant_info}',
            build: '{build}',
            model_id: '{model_id}'
          }
        }
      }
    }
  ],
  resultsComponent: 'MyelomaResponseDisplay', // We will create this component next
};

// 🧬 CRISPR Designer Configuration (DEMO MODE)
export const crisprDesignerConfig = {
  title: "🧬 CRISPR Weapon Designer",
  subtitle: "Generate precision guide RNAs with AI-powered sequence design",
  description: "Our Evo2 AI designs custom CRISPR guide RNAs optimized for your target mutation with minimal off-target effects.",
  
  progressSteps: [
    { id: 'input', label: 'Define Target' },
    { id: 'design', label: 'AI Design' },
    { id: 'results', label: 'Review Arsenal' }
  ],
  
  inputSections: [
    {
      id: 'crispr_design_parameters',
      title: 'CRISPR Design Parameters',
      fields: [
        {
          id: 'target_gene',
          label: 'Target Gene',
          type: 'text',
          defaultValue: 'RUNX1',
          helpText: 'Gene symbol containing the target mutation'
        },
        {
          id: 'mutation_details',
          label: 'Mutation Details',
          type: 'text',
          defaultValue: 'R139G',
          helpText: 'Specific protein change to target'
        },
        {
          id: 'strategy',
          label: 'CRISPR Strategy',
          type: 'select',
          options: [
            { value: 'knockout', label: 'Gene Knockout (Cas9)' },
            { value: 'base_editing', label: 'Base Editing (CBE/ABE)' },
            { value: 'prime_editing', label: 'Prime Editing (Precise Repair)' },
            { value: 'epigenome', label: 'Epigenome Editing (dCas9)' }
          ],
          defaultValue: 'prime_editing',
          helpText: 'Choose the CRISPR approach for your therapeutic goal'
        },
        {
          id: 'cell_type',
          label: 'Target Cell Type',
          type: 'text',
          defaultValue: 'CD34+ HSCs',
          helpText: 'Cell type for delivery optimization (optional)'
        }
      ],
      action: {
        buttonText: "🔬 Design CRISPR Arsenal",
        workflow: "crisprDesignWorkflow"
      }
    }
  ],

  resultsComponent: 'CrisprDesignDisplay'
};

// 🧬 Transcription Lab Configuration (RUNX1 DEMO)
export const transcriptionLabConfig = {
  title: "🧬 Transcription Laboratory",
  subtitle: "DNA → RNA: Simulate gene expression and mRNA production",
  description: "Transform DNA sequences into functional mRNA with splice variants, UTRs, and regulatory elements. Powered by Evo2's transcriptional modeling.",
  
  progressSteps: [
    { id: 'input', label: 'Define Sequence' },
    { id: 'transcription', label: 'Simulate Transcription' },
    { id: 'results', label: 'Analyze mRNA' }
  ],
  
  inputSections: [
    {
      id: 'transcription_parameters',
      title: 'Transcription Parameters',
      fields: [
    {
      id: 'gene_symbol',
      label: 'Target Gene',
      type: 'text',
      placeholder: 'e.g., RUNX1, BRAF, TP53',
      defaultValue: 'RUNX1',
      required: true,
      helpText: 'Gene for transcription analysis'
    },
    {
      id: 'dna_sequence',
      label: 'DNA Sequence',
      type: 'textarea',
      placeholder: 'Paste genomic DNA sequence or leave blank for RUNX1 demo...',
      required: false,
      helpText: 'Input DNA sequence (will use RUNX1 demo if empty)'
    },
    {
      id: 'transcript_variant',
      label: 'Transcript Variant',
      type: 'select',
      options: [
        { value: 'canonical', label: 'Canonical (longest isoform)' },
        { value: 'all_variants', label: 'All known variants' },
        { value: 'disease_relevant', label: 'Disease-relevant isoforms' }
      ],
      defaultValue: 'canonical',
      helpText: 'Which transcript variants to simulate'
    },
    {
      id: 'include_utrs',
      label: 'Include UTRs',
      type: 'select',
      options: [
        { value: 'both', label: 'Both 5\' and 3\' UTRs' },
        { value: 'five_prime', label: '5\' UTR only' },
        { value: 'three_prime', label: '3\' UTR only' },
        { value: 'none', label: 'Coding sequence only' }
        ],
        defaultValue: 'both',
        helpText: 'Include untranslated regions in mRNA'
      }
      ],
      action: {
        buttonText: "🔬 Simulate Transcription",
        workflow: "transcriptionWorkflow"
      }
    }
  ],

  resultsComponent: 'TranscriptionResults'
};

// 🔬 Protein Synthesis Configuration (RUNX1 DEMO)
export const proteinSynthesisConfig = {
  title: "🔬 Protein Synthesis Laboratory",
  subtitle: "RNA → Protein: Simulate translation and post-translational modifications",
  description: "Convert mRNA sequences into functional proteins with codon optimization, folding prediction, and modification analysis. Powered by Evo2's protein modeling.",
  
  progressSteps: [
    { id: 'input', label: 'Define mRNA' },
    { id: 'translation', label: 'Simulate Translation' },
    { id: 'results', label: 'Analyze Protein' }
  ],
  
  inputSections: [
    {
      id: 'protein_synthesis_parameters',
      title: 'Protein Synthesis Parameters',
      fields: [
    {
      id: 'gene_symbol',
      label: 'Target Gene',
      type: 'text',
      placeholder: 'e.g., RUNX1, BRAF, TP53',
      defaultValue: 'RUNX1',
      required: true,
      helpText: 'Gene for protein synthesis simulation'
    },
    {
      id: 'mrna_sequence',
      label: 'mRNA Sequence',
      type: 'textarea',
      placeholder: 'Paste mRNA sequence or leave blank for RUNX1 demo...',
      required: false,
      helpText: 'Input mRNA sequence (will use RUNX1 transcription output if empty)'
    },
    {
      id: 'translation_start',
      label: 'Translation Start Site',
      type: 'select',
      options: [
        { value: 'canonical', label: 'Canonical AUG start codon' },
        { value: 'alternative', label: 'Alternative start sites' },
        { value: 'ires', label: 'IRES-mediated translation' }
      ],
      defaultValue: 'canonical',
      helpText: 'How translation initiation occurs'
    },
    {
      id: 'codon_optimization',
      label: 'Codon Usage Optimization',
      type: 'select',
      options: [
        { value: 'human', label: 'Human codon preferences' },
        { value: 'ecoli', label: 'E. coli expression system' },
        { value: 'yeast', label: 'Yeast expression system' },
        { value: 'native', label: 'Native sequence (no optimization)' }
      ],
      defaultValue: 'human',
      helpText: 'Optimize for specific expression system'
    },
    {
      id: 'include_modifications',
      label: 'Post-translational Modifications',
      type: 'select',
      options: [
        { value: 'all', label: 'Predict all modifications' },
        { value: 'phosphorylation', label: 'Phosphorylation only' },
        { value: 'glycosylation', label: 'Glycosylation only' },
        { value: 'none', label: 'No modifications' }
        ],
        defaultValue: 'all',
        helpText: 'Include post-translational modification analysis'
      }
      ],
      action: {
        buttonText: "🧬 Synthesize Protein",
        workflow: "proteinSynthesisWorkflow"
      }
    }
  ],

  resultsComponent: 'ProteinSynthesisResults'
};

// 🏗️ Structure Predictor Configuration (AlphaFold 3 DEMO)
export const structurePredictorConfig = {
  title: "🏗️ AlphaFold 3 Structure Predictor",
  subtitle: "Protein → 3D Structure: Predict molecular architecture and binding sites",
  description: "Generate high-confidence 3D protein structures using AlphaFold 3, with binding site analysis and structural quality assessment.",
  
  progressSteps: [
    { id: 'input', label: 'Define Protein' },
    { id: 'prediction', label: 'Structure Prediction' },
    { id: 'results', label: 'Analyze Structure' }
  ],
  
  inputSections: [
    {
      id: 'structure_prediction_parameters',
      title: 'Structure Prediction Parameters',
      fields: [
    {
      id: 'gene_symbol',
      label: 'Target Gene',
      type: 'text',
      placeholder: 'e.g., RUNX1, BRAF, TP53',
      defaultValue: 'RUNX1',
      required: true,
      helpText: 'Gene for structure prediction'
    },
    {
      id: 'protein_sequence',
      label: 'Protein Sequence',
      type: 'textarea',
      placeholder: 'Paste amino acid sequence or leave blank for RUNX1 demo...',
      required: false,
      helpText: 'Input protein sequence (will use RUNX1 from protein synthesis if empty)'
    },
    {
      id: 'prediction_mode',
      label: 'Prediction Mode',
      type: 'select',
      options: [
        { value: 'full_protein', label: 'Full protein structure' },
        { value: 'domain_specific', label: 'Individual domains' },
        { value: 'complex_prediction', label: 'Protein complexes' },
        { value: 'ligand_binding', label: 'Protein-ligand interactions' }
      ],
      defaultValue: 'full_protein',
      helpText: 'Type of structural prediction to perform'
    },
    {
      id: 'confidence_threshold',
      label: 'Confidence Threshold',
      type: 'select',
      options: [
        { value: 'very_high', label: 'Very High (pLDDT > 90)' },
        { value: 'high', label: 'High (pLDDT > 70)' },
        { value: 'medium', label: 'Medium (pLDDT > 50)' },
        { value: 'all', label: 'Show all predictions' }
      ],
      defaultValue: 'high',
      helpText: 'Minimum confidence level for displaying results'
    },
    {
      id: 'include_binding_sites',
      label: 'Binding Site Analysis',
      type: 'select',
      options: [
        { value: 'all', label: 'DNA, RNA, and protein binding sites' },
        { value: 'dna_only', label: 'DNA binding sites only' },
        { value: 'protein_only', label: 'Protein interaction sites' },
        { value: 'none', label: 'No binding site analysis' }
        ],
        defaultValue: 'all',
        helpText: 'Include binding site prediction and analysis'
      }
      ],
      action: {
        buttonText: "🔮 Predict 3D Structure",
        workflow: "structurePredictionWorkflow"
      }
    }
  ],

  resultsComponent: 'StructurePredictionResults'
};

// 🤖 Demo Summarizer Configuration (AI NARRATOR)
export const demoSummarizerConfig = {
  title: "🤖 AI Demo Narrator",
  subtitle: "Complete Pipeline Analysis: AI-powered summary of molecular design journey",
  description: "Generate comprehensive analysis of the entire RUNX1 conquest pipeline, from variant assessment to therapeutic arsenal, with strategic insights and technical validation.",
  
  progressSteps: [
    { id: 'input', label: 'Define Analysis Parameters' },
    { id: 'processing', label: 'AI Analysis in Progress' },
    { id: 'results', label: 'Review Strategic Insights' }
  ],
  
  inputSections: [
    {
      id: 'ai_analysis_parameters',
      title: 'AI Analysis Configuration',
      fields: [
        {
          id: 'analysis_scope',
          label: 'Analysis Scope',
          type: 'select',
          options: [
            { value: 'complete_pipeline', label: 'Complete RUNX1 Pipeline (9 stages)' },
            { value: 'threat_assessment', label: 'Threat Assessment Focus' },
            { value: 'molecular_design', label: 'Molecular Design Focus' },
            { value: 'structural_validation', label: 'Structural Validation Focus' },
            { value: 'therapeutic_arsenal', label: 'Therapeutic Arsenal Focus' }
          ],
          defaultValue: 'complete_pipeline',
          helpText: 'Choose the focus of AI analysis'
        },
        {
          id: 'target_audience',
          label: 'Target Audience',
          type: 'select',
          options: [
            { value: 'investors', label: 'YC Investors & VCs' },
            { value: 'scientists', label: 'Scientific Community' },
            { value: 'clinicians', label: 'Clinical Researchers' },
            { value: 'executives', label: 'Pharma Executives' },
            { value: 'technical', label: 'Technical Team' }
          ],
          defaultValue: 'investors',
          helpText: 'Tailor analysis language and focus for specific audience'
        },
        {
          id: 'key_metrics',
          label: 'Highlight Key Metrics',
          type: 'select',
          options: [
            { value: 'all_metrics', label: 'All performance metrics' },
            { value: 'confidence_scores', label: 'Confidence scores only' },
            { value: 'speed_efficiency', label: 'Speed & efficiency gains' },
            { value: 'cost_reduction', label: 'Cost reduction potential' },
            { value: 'therapeutic_value', label: 'Therapeutic value proposition' }
          ],
          defaultValue: 'all_metrics',
          helpText: 'Which metrics to emphasize in the analysis'
        },
        {
          id: 'competitive_context',
          label: 'Competitive Analysis',
          type: 'select',
          options: [
            { value: 'full_comparison', label: 'vs Traditional drug discovery' },
            { value: 'ai_competitors', label: 'vs Other AI platforms' },
            { value: 'academic_tools', label: 'vs Academic tools' },
            { value: 'no_comparison', label: 'Focus on our capabilities' }
          ],
          defaultValue: 'full_comparison',
          helpText: 'Include competitive positioning in analysis'
        },
        {
          id: 'output_format',
          label: 'Output Format',
          type: 'select',
          options: [
            { value: 'executive_summary', label: 'Executive Summary' },
            { value: 'technical_report', label: 'Technical Deep Dive' },
            { value: 'pitch_narrative', label: 'YC Pitch Narrative' },
            { value: 'investor_memo', label: 'Investor Memo' },
            { value: 'scientific_abstract', label: 'Scientific Abstract' }
          ],
          defaultValue: 'pitch_narrative',
          helpText: 'Format and style of the AI-generated analysis'
        }
      ],
      action: {
        buttonText: "🧠 Generate AI Analysis",
        workflow: "aiNarratorWorkflow"
      }
    }
  ],

  resultsComponent: 'DemoAnalysisResults'
};

// We will add more configurations here as we migrate other tools.
// export const threatAssessorConfig = { ... };

export const targetDossierConfig = {
  toolId: 'targetDossier', // A more concise ID
  title: '🎯 Target Dossier: PIK3CA E542K',
  subtitle: 'AI-Powered R&D Analysis Co-Pilot',
  progressSteps: [
    // Oracle Phase (3 steps)
    { id: 'oracle-step-0', label: 'Damage Assessment', phase: 'oracle' },
    { id: 'oracle-step-1', label: 'Essentiality Check', phase: 'oracle' },
    { id: 'oracle-step-2', label: 'Accessibility Scan', phase: 'oracle' },
    // Forge Phase (2 steps)
    { id: 'forge-step-0', label: 'gRNA Design', phase: 'forge' },
    { id: 'forge-step-1', label: 'Inhibitor Design', phase: 'forge' },
    // Gauntlet Phase (2 steps)
    { id: 'gauntlet-step-0', label: 'Structure Validation', phase: 'gauntlet' },
    { id: 'gauntlet-step-1', label: 'Efficacy Simulation', phase: 'gauntlet' },
    // Completion
    { id: 'dossier', label: 'Dossier Complete', phase: 'dossier' }
  ],
  // Input sections are removed to streamline the demo. The co-pilot view is now the entry point.
  inputSections: [],
  resultsComponent: 'TargetDossierDisplay',
  // The initial workflow is now triggered automatically by the ToolRunner for this specific toolId.
};