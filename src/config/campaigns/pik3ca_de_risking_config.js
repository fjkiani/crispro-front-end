export const pik3caDeRiskingConfig = {
  id: 'pik3ca-de-risking',
  title: 'PIK3CA E542K De-Risking Campaign',
  thesis: 'Can predictive AI definitively prove a novel mutation\'s viability as a therapeutic target before pre-clinical investment?',
  stages: [
    {
      id: 'target-qualification',
      label: '1. Target Qualification',
      description: 'Is the VUS worth investigating?',
      duration: 15000,
      narrative: "The campaign begins with a single question: Is this target worth a billion-dollar bet? Let's qualify it.",
      component: 'TargetQualification',
      savings: 0,
      demoData: {
        gene: 'PIK3CA',
        variant: 'E542K',
        source: 'Internal R&D Pipeline',
      }
    },
    {
      id: 'multi-factor-validation',
      label: '2. Multi-Factor Validation',
      description: 'Go/No-Go verdict based on multi-modal AI analysis.',
      duration: 40000,
      narrative: "Now, we replace guesswork with a multi-faceted verdict from three independent AI systems, each providing a critical piece of evidence.",
      component: 'MultiFactorValidation',
      savings: 50000000, // $50M in failed target validation costs
      endpoints: [
        {
          id: 'predict_variant_impact',
          endpoint_name: '/predict_variant_impact',
          title: 'Functional Impact Analysis',
          headline: 'CATASTROPHIC',
          narrative: 'Evo2 oracle confirms a catastrophic disruption in the gene\'s function. The target is active and damaging.',
          demoData: {
            delta_likelihood_score: -187,
            pathogenicity_prediction: 'Pathogenic (96.8% confidence)',
            predicted_consequence: 'Gain-of-function, Hyperactivation of PI3K/AKT pathway',
          }
        },
        {
          id: 'predict_gene_essentiality',
          endpoint_name: '/predict_gene_essentiality',
          title: 'Contextual Essentiality',
          headline: 'CRITICAL',
          narrative: 'In a Breast Cancer context, our model predicts this gene is highly essential. We are attacking the enemy\'s command center.',
          demoData: {
            essentiality_score: 0.92,
            essentiality_category: 'Essential in Breast Cancer',
          }
        },
        {
          id: 'predict_chromatin_accessibility',
          endpoint_name: '/predict_chromatin_accessibility',
          title: 'Target Accessibility',
          headline: 'OPEN',
          narrative: 'The target DNA is in an "open" and accessible region. We have a clear line of sight for our therapeutic weapons.',
          demoData: {
            accessibility_score: 0.88,
            accessibility_state: 'Open_Chromatin',
          }
        }
      ]
    },
    {
      id: 'generative-therapeutic-design',
      label: '3. Generative Therapeutic Design',
      description: 'Designing a bespoke therapeutic arsenal with Generative AI.',
      duration: 45000,
      narrative: "With a validated target, we don't guess at solutions. Our generative AI now designs a complete arsenal of bespoke therapeutics.",
      component: 'GenerativeTherapeuticDesign',
      savings: 150000000, // +$100M in failed lead optimization
      endpoints: [
        {
          id: 'generate_optimized_guide_rna',
          endpoint_name: '/generate_optimized_guide_rna',
          title: 'Optimized Guide RNAs',
          headline: '3 HIGH-EFFICACY GUIDES',
          demoData: [
            { sequence: 'ACGACTAGCTAGCATGACGA', efficacy_score: 94.5 },
            { sequence: 'TGCATGCATGCATGCATGCA', efficacy_score: 92.1 },
            { sequence: 'GATTACAGATTACAGATTAC', efficacy_score: 89.8 },
          ]
        },
        {
          id: 'generate_repair_template',
          endpoint_name: '/generate_repair_template',
          title: 'HDR Repair Template',
          headline: 'OPTIMIZED FOR INTEGRATION',
          demoData: {
            homology_arm_length: '1000bp',
            optimized_codons: true,
          }
        },
        {
          id: 'generate_therapeutic_protein_coding_sequence',
          endpoint_name: '/generate_therapeutic_protein_coding_sequence',
          title: 'Novel Protein Inhibitor',
          headline: 'DESIGNED FOR HIGH AFFINITY',
          demoData: {
            protein_family: 'PI3K-binding domain',
            predicted_affinity: 'Sub-nanomolar range'
          }
        }
      ]
    },
    {
      id: 'in-silico-trials',
      label: '4. In Silico Trials',
      description: 'Predicting efficacy and safety before touching a single cell.',
      duration: 35000,
      narrative: "Before a single cell is touched, we run an entire in silico clinical trial to de-risk the entire pre-clinical pipeline.",
      component: 'InSilicoTrials',
      savings: 250000000, // +$100M in failed pre-clinical studies
      endpoints: [
        {
          id: 'predict_crispr_spacer_efficacy',
          endpoint_name: '/predict_crispr_spacer_efficacy',
          title: 'gRNA Efficacy Validation',
          headline: '94.5% EFFICACY PREDICTED',
          demoData: {
            input_sequence: 'ACGACTAGCTAGCATGACGA',
            efficacy_score: 94.5,
            likelihood_of_interaction_change: 0.91
          }
        },
        {
          id: 'predict_protein_functionality_change',
          endpoint_name: '/predict_protein_functionality_change',
          title: 'Repair Template Validation',
          headline: '+15% STABILITY INCREASE',
          demoData: {
            protein_functionality_score_change: 0.85,
            predicted_stability_change: '+15%',
            folding_impact_score: 0.12
          }
        },
        {
          id: 'predict_variant_impact_safety',
          endpoint_name: '/predict_variant_impact',
          title: 'Off-Target Safety Analysis',
          headline: 'BENIGN OFF-TARGETS',
          demoData: {
            'off_target_1/delta_likelihood_score': -0.02,
            'off_target_1/pathogenicity_prediction': 'Benign',
            'off_target_2/delta_likelihood_score': -0.01,
            'off_target_2/pathogenicity_prediction': 'Benign',
          }
        }
      ]
    },
    {
      id: 'deliverable',
      label: '5. The Deliverable',
      description: 'The final, tangible output of the campaign.',
      duration: 25000,
      narrative: "The campaign is complete. This is the end of the pre-clinical guessing game.",
      component: 'Deliverable',
      savings: 350000000, // +$100M in avoided Phase 1 clinical trial failure
      demoData: {
        title: 'Therapeutic Asset Dossier: PIK3CA E542K',
        lead_candidate: 'gRNA: ACGACTAGCTAGCATGACGA',
        predicted_clinical_success_probability: '87%',
        projected_r_and_d_savings: '$350M',
      }
    }
  ]
}; 