export const pik3caTrinityCampaignConfig = {
  id: 'pik3ca-trinity-campaign',
  title: 'PIK3CA E542K: Clinical Trial Assassination Protocol',
  thesis: "The biotech industry wastes $2.6 billion annually on clinical trial failures. Can we use AI to definitively prove a target's viability, generate a bespoke therapeutic, and validate its efficacy before spending a single dollar in the lab?",
  
  // Biotech Context & Problem Statement
  biotechContext: {
    problem: "Over 90% of clinical trials fail, wasting $2.6 billion annually",
    currentApproach: "Multi-year, multi-million dollar gambles based on incomplete data",
    ourSolution: "In silico validation and therapeutic design before any wet lab work",
    targetExample: "PIK3CA E542K - a high-risk, high-reward oncology target"
  },

  // Business Impact Metrics
  businessMetrics: {
    timelineCompression: "36 months → 5 minutes",
    riskReduction: "90% failure rate → <10% failure rate",
    costSavings: "$550M+ in avoided R&D costs",
    deliverable: "Validated Therapeutic Blueprint ready for development"
  },

  acts: [
    {
      id: 'act-i-oracle',
      title: 'ACT I: THE ORACLE (Find the Weakness)',
      narrative: "Before any biotech spends $50M+ on a target, they need one critical answer: 'Is this worth the bet?' Our Oracle doesn't guess - it delivers mathematical certainty.",
      biotechImpact: "Replaces 6-18 months of target validation studies",
      riskMitigation: "Eliminates 60% of early-stage failures",
      stages: [
        {
          id: 'multi-factor-validation',
          label: 'Multi-Factor Target Validation',
          description: 'Executing the definitive Go/No-Go analysis that replaces months of expensive validation studies.',
          duration: 30000,
          component: 'MultiFactorValidation',
          savings: 50000000,
          businessNarrative: "Traditional biotech approach: 6-18 months, $50M+ in target validation. Our approach: 30 seconds, mathematical certainty.",
          businessRationale: "Before investing $50M+ in a target, we need mathematical proof it's functionally compromised, essential to cancer survival, and druggable. This replaces 6-18 months of expensive validation studies.",
          completionSummary: "PIK3CA E542K confirmed as CATASTROPHIC functional damage, CRITICAL cancer dependency, and ACCESSIBLE target. Mathematical certainty achieved: worth the investment.",
          handoffData: {
            targetConfidence: 96.8,
            functionalImpact: "CATASTROPHIC",
            essentiality: "CRITICAL",
            accessibility: "DRUGGABLE"
          },
          endpoints: [
            {
              id: 'predict_variant_impact',
              endpoint_name: '/predict_variant_impact',
              title: 'Functional Damage Assessment',
              headline: 'CATASTROPHIC IMPACT CONFIRMED',
              narrative: "Quantifying the exact functional damage this mutation causes to the protein.",
              biotechRelevance: "Proves the target is functionally compromised and worth therapeutic intervention",
              demoData: { 
                delta_likelihood_score: -18750.4, 
                pathogenicity_prediction: 'Pathogenic (96.8% confidence)',
                predicted_consequence: 'Loss of kinase activity',
                feature_disruption_scores: { ATP_binding: -0.92, substrate_binding: -0.88 }
              }
            },
            {
              id: 'predict_gene_essentiality',
              endpoint_name: '/predict_gene_essentiality',
              title: 'Cancer Dependency Analysis',
              headline: 'CRITICAL DEPENDENCY IDENTIFIED',
              narrative: "Proving this gene is essential for cancer survival - making it a high-value target.",
              biotechRelevance: "Confirms therapeutic intervention will be lethal to cancer cells",
              demoData: { 
                essentiality_score: 0.92, 
                essentiality_category: 'Essential in Breast Cancer',
                cell_line_dependencies: { MCF7: 0.94, T47D: 0.89, MDA_MB_231: 0.91 }
              }
            },
            {
              id: 'predict_chromatin_accessibility',
              endpoint_name: '/predict_chromatin_accessibility',
              title: 'Druggability Assessment',
              headline: 'TARGET IS ACCESSIBLE',
              narrative: "Confirming our therapeutic weapons can physically reach and engage the target.",
              biotechRelevance: "Ensures drug delivery is feasible - critical for therapeutic success",
              demoData: { 
                accessibility_score: 0.88, 
                accessibility_state: 'Open_Chromatin',
                tissue_accessibility: { breast_cancer: 0.88, normal_breast: 0.12 }
              }
            }
          ]
        }
      ]
    },
    {
      id: 'act-ii-forge',
      title: 'ACT II: THE FORGE (Create the Weapon)',
      narrative: "Target validated. Now we forge the weapon. Instead of screening thousands of compounds for years, our AI designs the optimal therapeutic from first principles in minutes.",
      biotechImpact: "Replaces 2-4 years of lead compound discovery and optimization",
      riskMitigation: "Eliminates 25% of development failures",
      stages: [
        {
          id: 'generative-therapeutic-design',
          label: 'AI-Powered Therapeutic Generation',
          description: 'Our Forge is now designing multiple therapeutic modalities optimized specifically for PIK3CA E542K.',
          duration: 40000,
          component: 'GenerativeTherapeuticDesign',
          savings: 150000000,
          businessNarrative: "Traditional approach: 2-4 years, $150M+ in lead discovery. Our approach: 40 seconds, bespoke therapeutic candidates.",
          businessRationale: "Instead of screening thousands of existing compounds for years, we design optimal therapeutics from first principles using AI, tailored specifically for the validated PIK3CA E542K target.",
          completionSummary: "Generated 3 high-efficacy CRISPR guides (94%+ predicted success) plus 1 novel protein inhibitor with sub-nanomolar affinity. Ready-to-test therapeutic arsenal created.",
          handoffData: {
            primaryWeapon: "Optimized CRISPR guide RNAs",
            alternativeWeapon: "Novel protein inhibitor",
            designedFor: "PIK3CA E542K (chr3:178936091)",
            efficacyPrediction: "94.5%+"
          },
          endpoints: [
            {
              id: 'generate_optimized_guide_rna',
              endpoint_name: '/generate_optimized_guide_rna',
              title: 'CRISPR Guide RNA Arsenal',
              headline: '3 HIGH-EFFICACY GUIDES FORGED',
              narrative: 'Generating optimized CRISPR guides with maximum cutting efficiency and minimal off-targets.',
              biotechRelevance: "Ready-to-test guide RNAs with predicted 94%+ efficacy - replaces months of guide screening",
              demoData: { 
                candidate_1: { sequence: 'ACGACTAGCTAGCATGACGA', predicted_efficacy: 94.5, off_target_score: 0.02 },
                candidate_2: { sequence: 'TGCATGCATGCATGCATGCA', predicted_efficacy: 92.8, off_target_score: 0.01 },
                candidate_3: { sequence: 'GGCTACGTACGTACGTACGT', predicted_efficacy: 91.2, off_target_score: 0.03 },
                design_parameters: { target_specificity: 'PIK3CA exon 9', optimization: 'breast_cancer_context' }
              }
            },
            {
              id: 'generate_therapeutic_protein_coding_sequence',
              endpoint_name: '/generate_therapeutic_protein_coding_sequence',
              title: 'Novel Protein Inhibitor Design',
              headline: 'BESPOKE INHIBITOR SEQUENCE GENERATED',
              narrative: 'Creating a novel protein-based therapeutic specifically designed to inhibit the mutant PIK3CA.',
              biotechRelevance: "Alternative therapeutic modality - novel IP with sub-nanomolar predicted affinity",
              demoData: { 
                protein_sequence: 'MKTLFGRRASMSDKDLALQNQFSKLNELQGAKEEAAQLSAIPFAEWAHGKGPYH...',
                protein_family: 'PI3K-specific binding domain',
                predicted_affinity: 'Sub-nanomolar (0.8 nM)',
                mechanism: 'Competitive ATP-site inhibition',
                selectivity_profile: { PIK3CA_mutant: 0.8, PIK3CA_WT: 45.2, other_kinases: '>1000' }
              }
            }
          ]
        }
      ]
    },
    {
      id: 'act-iii-gauntlet',
      title: 'ACT III: THE GAUNTLET (Prove the Weapon is Real)',
      narrative: "Any AI can generate sequences. Ours delivers battle-tested weapons. Every candidate undergoes brutal in silico trials to prove efficacy and safety before a single cell is touched.",
      biotechImpact: "Replaces 3-5 years of preclinical safety and efficacy studies",
      riskMitigation: "Eliminates 75% of late-stage failures",
      stages: [
         {
          id: 'in-silico-trials',
          label: 'In Silico Preclinical Trials',
          description: 'Running comprehensive safety and efficacy predictions to de-risk our therapeutic candidates.',
          duration: 35000,
          component: 'InSilicoTrials',
          savings: 350000000,
          businessNarrative: "Traditional approach: 3-5 years, $350M+ in preclinical studies. Our approach: 35 seconds, validated safety and efficacy profiles.",
          businessRationale: "Before synthesizing any candidate, we predict 3D structure, validate cutting efficiency, and confirm therapeutic function to eliminate 'wet noodle' failures and late-stage surprises.",
          completionSummary: "All therapeutic candidates passed structural validation (92.4% confidence), demonstrated 94.5% predicted efficacy, and confirmed inhibitory function. Ready for development with <10% failure risk.",
          handoffData: {
            structuralViability: "CONFIRMED",
            functionalEfficacy: "94.5%",
            safetyProfile: "LOW RISK",
            readyForDevelopment: "APPROVED"
          },
          endpoints: [
            {
              id: 'alphafold_3_structure',
              endpoint_name: 'AlphaFold 3 Prediction',
              title: 'Structural Viability Validation',
              headline: 'STABLE PROTEIN FOLD CONFIRMED',
              narrative: 'Predicting 3D structure to ensure our designed protein will fold correctly and remain stable.',
              biotechRelevance: "Eliminates 'wet noodle' failures - confirms structural viability before synthesis",
              demoData: { 
                plddt_score: 92.4, 
                structural_class: 'Kinase Inhibitor Fold',
                confidence_regions: { active_site: 95.2, binding_interface: 94.8, overall: 92.4 },
                predicted_stability: 'Highly stable (ΔG = -45.2 kcal/mol)'
              }
            },
            {
              id: 'predict_crispr_spacer_efficacy',
              endpoint_name: '/predict_crispr_spacer_efficacy',
              title: 'CRISPR Efficacy Validation',
              headline: '94.5% CUTTING EFFICIENCY PREDICTED',
              narrative: 'Validating our guide RNAs will achieve high cutting efficiency at the target site.',
              biotechRelevance: "Predicts success rate of CRISPR intervention - eliminates guide RNA failures",
              demoData: { 
                efficacy_score: 94.5, 
                likelihood_of_interaction_change: 0.91,
                cutting_prediction: { on_target: 94.5, major_off_targets: 0.02 },
                mechanism_confidence: 'High (PAM accessibility: 98%, guide_target_binding: 92%)'
              }
            },
            {
              id: 'predict_protein_functionality_change',
              endpoint_name: '/predict_protein_functionality_change',
              title: 'Therapeutic Function Validation',
              headline: 'INHIBITORY FUNCTION CONFIRMED',
              narrative: 'Confirming our designed protein will achieve the desired therapeutic effect.',
              biotechRelevance: "Validates mechanism of action - proves therapeutic will work as designed",
              demoData: { 
                protein_functionality_score_change: -0.85, 
                predicted_stability_change: '+15%',
                therapeutic_effect: { target_inhibition: '85% knockdown', selectivity: '56x vs WT' },
                mechanism_validation: 'Competitive inhibition confirmed'
              }
            }
          ]
        }
      ]
    }
  ],

  // Final Deliverable Details
  therapeuticBlueprint: {
    title: "Validated Therapeutic Asset Portfolio",
    readiness: "Development-Ready",
    components: [
      "3 validated CRISPR guide RNAs (94%+ predicted efficacy)",
      "1 novel protein inhibitor (sub-nanomolar affinity)",
      "Complete safety and efficacy profiles",
      "Structural validation and stability confirmation"
    ],
    nextSteps: [
      "Synthesize lead candidates",
      "In vitro validation (3-6 months vs 3-5 years)",
      "IND-enabling studies",
      "Phase I clinical trial design"
    ],
    riskProfile: "De-risked: <10% probability of failure vs industry 90%",
    timeToClinic: "18 months vs 5-8 years industry standard",
    totalSavings: "$550M+ in avoided R&D costs"
  }
}; 