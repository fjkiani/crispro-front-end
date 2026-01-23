/**
 * PIK3CA E542K Demo Data
 * 
 * This file contains all demo-specific data for the PIK3CA E542K target validation demo.
 * Extracted from RunxConquest.jsx for modularization.
 * 
 * Structure matches MultiStepWorkflow expectations:
 * - initialMutation: Mutation object for Zustand store
 * - header: Header configuration object
 * - initialNarratorText: Initial narrator text
 * - startNarratorText: Text when demo starts
 * - killChain: Array of stage objects
 */

export const PIK3CA_DEMO_DATA = {
  // Initial mutation (for Zustand store initialization)
  initialMutation: {
    gene: 'PIK3CA',
    variant: 'E542K',
    patient_id: 'TARGET-PIK3CA-E542K',
    genomic_coordinate: 'chr3:178936091G>A',
    timestamp: Date.now(),
    mutation_type: 'Missense',
    protein_change: 'p.Glu542Lys',
    clinical_significance: 'VUS - Requires Validation'
  },
  
  // Header configuration
  header: {
    h3: '🧬 CrisPRO.ai: R&D De-Risking Platform',
    h6: 'Live Demo: PIK3CA E542K Target Validation & Lead Generation',
    body1: 'From Uncertain Target → Validated $800M+ Therapeutic Asset in 5 minutes',
    body2: 'Eliminate $350M in clinical trial failures • 75% timeline compression • 87% success probability'
  },
  
  // Narrator text
  initialNarratorText: 'Ready to validate PIK3CA E542K as a therapeutic target...',
  startNarratorText: '🚀 Good morning. The reason 98% of clinical trials fail is because the war is lost before the first battle. We will replace that multi-million dollar gamble with mathematical certainty. Let\'s validate PIK3CA E542K...',
  
  // Stage definitions (killChain)
  killChain: [
    {
      id: 'target_acquisition',
      label: '1. Target Acquisition',
      description: 'The Billion-Dollar Question: Is This Target Worth the Risk?',
      component: 'TargetAcquisitionCard',
      duration: 20000, // 20 seconds
      biotechNarrative: "MISSION BRIEFING: Novel PIK3CA mutation flagged by your R&D team. High-risk, high-reward oncogene target. Before you commit $200M and 5 years to this target, we answer the billion-dollar question in 5 minutes.",
      savings: 0,
      demoData: {
        gene: 'PIK3CA',
        variant: 'E542K',
        target_class: 'Kinase - PI3K Pathway',
        therapeutic_area: 'Solid Tumors (Breast, Colorectal)',
        current_pipeline_status: 'Uncharacterized - Requires Validation',
        mutation_type: 'Missense - Helical Domain',
        clinical_significance: 'Unknown - VUS'
      }
    },
    {
      id: 'intelligence_gathering',
      label: '2. Target Validation',
      description: 'Go/No-Go Verdict: Zeta Oracle Eliminates Guesswork',
      component: 'IntelligenceGatheringCard',
      duration: 30000, // 30 seconds
      biotechNarrative: "🎯 ZETA ORACLE DEPLOYED. Executing triumvirate threat assessment... VERDICT: PATHOGENIC. Kinase activity increased 340%. Oncogenic transformation confirmed. This is not a maybe - this is mathematical certainty. TARGET VALIDATED. Mission is GO.",
      savings: 50000000, // $50M in target validation
      demoData: {
        zeta_score: -18750.4,
        confidence: 96.8,
        functional_impact: 'Hyperactivation of PI3K/AKT pathway',
        target_validation: 'CONFIRMED HIGH-VALUE ONCOGENE',
        mechanism: 'Gain-of-function via helical domain disruption',
        kinase_activity: '+340% vs wild-type',
        oncogenic_potential: 'HIGH'
      }
    },
    {
      id: 'vulnerability_assessment',
      label: '3. Vulnerability Mapping',
      description: 'Identifying Therapeutic Attack Vectors',
      component: 'VulnerabilityAssessmentCard',
      duration: 25000, // 25 seconds
      biotechNarrative: "🔍 VULNERABILITY SCAN COMPLETE. Target lock achieved. Critical attack vectors identified: ATP binding pocket, allosteric sites, protein degradation pathways. Multiple therapeutic modalities confirmed viable.",
      savings: 75000000, // Additional $25M in lead identification
      demoData: {
        therapeutic_modalities: ['Small Molecule Inhibitor', 'PROTAC Degrader', 'siRNA', 'Allosteric Modulator'],
        druggable_pockets: 4,
        intervention_confidence: 91.7,
        resistance_probability: 'Low (8%)',
        clinical_feasibility: 'High - Multiple FDA precedents',
        competitor_landscape: 'BYL719 (Alpelisib) - market validated'
      }
    },
    {
      id: 'weapon_forging',
      label: '4. Weapon Forging',
      description: 'In Silico Therapeutic Factory - Designing the Arsenal',
      component: 'WeaponForgingCard',
      duration: 60000, // 60 seconds
      biotechNarrative: "⚔️ ZETA FORGE UNLEASHED. Designing therapeutic arsenal... Small molecule inhibitors optimized. PROTAC degrader engineered. siRNA sequences validated. Novel allosteric modulators designed. Complete modality coverage achieved.",
      savings: 150000000, // Additional $75M in lead optimization
      demoData: {
        small_molecule_leads: 5,
        protac_candidates: 2,
        sirna_sequences: 3,
        allosteric_modulators: 2,
        selectivity_ratio: '>100x vs PI3Kβ/γ/δ',
        ip_landscape: 'Freedom to operate confirmed',
        total_candidates: 12
      }
    },
    {
      id: 'structural_validation',
      label: '5. Structural Validation',
      description: 'The Gauntlet - Ensuring Therapeutic Viability',
      component: 'StructuralValidationCard',
      duration: 45000, // 45 seconds
      biotechNarrative: "🧬 STRUCTURAL GAUNTLET INITIATED. AlphaFold 3 predictions... Binding modes validated. ADMET properties predicted. Safety windows mapped. Lead candidates survive the gauntlet with flying colors.",
      savings: 200000000, // Additional $50M in preclinical validation
      demoData: {
        binding_affinity: 'IC50: 15 nM (wild-type: >10,000 nM)',
        selectivity_window: 'Excellent (>100x)',
        admet_score: 8.4,
        blood_brain_barrier: 'Permeable',
        metabolic_stability: 'High (T1/2 > 6h)',
        toxicity_prediction: 'Low risk'
      }
    },
    {
      id: 'lethality_assessment',
      label: '6. Efficacy Prediction',
      description: 'Clinical Success Probability Calculation',
      component: 'LethalityAssessmentCard',
      duration: 30000, // 30 seconds
      biotechNarrative: "🎯 ASSASSIN SCORE CALCULATION. Fusing all intelligence: Target validation + Structural integrity + ADMET profile + Safety data... COMPOSITE LETHALITY: 92.7%. Clinical success probability: 87%. This beats industry average by 5X.",
      savings: 300000000, // Additional $100M in clinical failure avoidance
      demoData: {
        assassin_score: 92.7,
        clinical_success_probability: 87,
        efficacy_prediction: 'High (tumor regression >70%)',
        safety_prediction: 'Excellent (therapeutic window >50x)',
        market_potential: '$3.2B peak sales (breast cancer alone)',
        development_timeline: '3.8 years vs 12 years traditional'
      }
    },
    {
      id: 'battle_plan_delivery',
      label: '7. De-Risked Asset Delivery',
      description: 'Therapeutic Blueprint - Mission Complete',
      component: 'BattlePlanDeliveryCard',
      duration: 30000, // 30 seconds
      biotechNarrative: "✅ MISSION COMPLETE. Delivering validated therapeutic blueprint... 12 candidates ranked by clinical potential. Development roadmap generated. Regulatory pathway optimized. You now possess what no biotech has ever had: a completely de-risked, validated therapeutic program.",
      savings: 350000000, // Total clinical trial failure avoidance
      demoData: {
        total_candidates: 12,
        top_candidate: 'Selective PI3Kα Inhibitor (CRP-PIK-001)',
        development_cost: '$65M vs $2.6B traditional',
        timeline_compression: '75% reduction',
        regulatory_strategy: 'Fast Track + Breakthrough Therapy',
        next_steps: 'IND-enabling studies ready',
        asset_value: 'Validated $800M+ program'
      },
      victoryMessage: {
        h3: '🎯 VALIDATION CAMPAIGN COMPLETE! 🎯',
        h5: 'Total R&D Savings: $350M | Success Probability: 87% | Timeline: 75% Reduced',
        body1: 'DE-RISKED THERAPEUTIC ASSET DELIVERED: Validated $800M+ PIK3CA program ready for IND',
        body2: 'PIK3CA E542K: From uncertain VUS to validated therapeutic target with 12 lead candidates in 5 minutes.'
      }
    }
  ]
};
