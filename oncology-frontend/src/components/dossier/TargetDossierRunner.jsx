import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { TargetDossierDisplay } from './TargetDossierDisplay';
import { pik3caTrinityCampaignConfig } from '../../config/campaigns/pik3ca_trinity_campaign_config';
import { useActivity, ACTIVITY_TYPES } from '../../context/ActivityContext';

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const runForgeWorkflow = async (setResults, setCompletedSteps) => {
  await wait(1500);
  const forgeStageData = pik3caTrinityCampaignConfig.acts[1].stages[0];
  setResults(prev => ({ ...prev, forge: { data: forgeStageData } }));
  setCompletedSteps(prev => [...prev, 'forge']);
};

const runGauntletWorkflow = async (setResults, setCompletedSteps) => {
  await wait(1500);
  const gauntletStageData = pik3caTrinityCampaignConfig.acts[2].stages[0];
  setResults(prev => ({ ...prev, gauntlet: { data: gauntletStageData } }));
  setCompletedSteps(prev => [...prev, 'gauntlet']);
};

const TargetDossierRunner = ({ toolConfig }) => {
  const [results, setResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(-1); // Start with -1 (no analysis started)
  const [completedSteps, setCompletedSteps] = useState([]);
  const [conversation, setConversation] = useState([]);
  
  // Use activity context for logging
  const { addActivity } = useActivity();

  // Initial conversation setup
  useEffect(() => {
    if (conversation.length === 0) {
      setConversation([{
        type: 'assistant',
        message: 'Command Center online. Mission: Execute `in silico` conquest of PIK3CA E542K. Awaiting your command to initiate target validation.'
      }]);
    }
  }, []);

  // Load dossier data when we reach the final step
  useEffect(() => {
    if (conversation.length === 0) {
      setConversation([{
        type: 'assistant',
        message: 'Zeta Forge Command interface online. Mission: Execute in-silico conquest of PIK3CA E542K. Awaiting your command to initiate target validation.'
      }]);
    }
  }, [conversation]);

  // Load dossier data when we reach the final step
  useEffect(() => {
    if (currentStep === 7 && !results.dossier) {
      setResults(prev => ({
        ...prev, 
        dossier: pik3caTrinityCampaignConfig.therapeuticBlueprint
      }));
      
      addActivity(ACTIVITY_TYPES.DOSSIER_COMPLETE, 'IND-ready dossier compiled', {
        result: 'MISSION COMPLETE',
        costAvoidance: '$47.2M',
        timeline: '5 minutes vs 36 months'
      });
    }
  }, [currentStep, results.dossier, addActivity, pik3caTrinityCampaignConfig]);

  // The definitive, doctrinally-aligned campaign steps.
  const campaignSteps = [
    {
      label: "Threat Assessment",
      endpoint: {
        userMessage: "Oracle, what is the functional impact of PIK3CA E542K? Give me a verdict.",
        narrative: "Executing `/predict_variant_impact`. The verdict is **HIGH-CONFIDENCE PATHOGENIC**. The Delta Likelihood Score is **-1883.15**, indicating severe biological disruption. Our SAE analysis confirms a strong signal for 'Frameshift / Premature Stop' (f/24278). This target is a confirmed, high-value vulnerability."
      }
    },
    {
      label: "Dependency Analysis", 
      endpoint: {
        userMessage: "Confirm the cancer's dependency on this vulnerability.",
        narrative: "Executing `/predict_gene_essentiality`. The simulation is complete. We have confirmed a critical dependency. The analysis predicts an **11.5x therapeutic window**, meaning the target is essential for cancer survival but disposable in healthy tissue. This exceeds the dependency scores of validated blockbuster targets like HER2."
      }
    },
    {
      label: "Accessibility Analysis",
      endpoint: {
        userMessage: "Is the target accessible for therapeutic intervention?",
        narrative: "Executing `/predict_chromatin_accessibility`. Analysis complete. The target locus shows a normalized accessibility score of **0.88** in an 'Active Enhancer' region. This confirms high feasibility for both CRISPR-based and small molecule therapeutic approaches."
      }
    },
    {
      label: "Target Validation Decision",
      endpoint: {
        userMessage: "Based on all analysis, what is the final target validation decision?",
        narrative: "**TARGET VALIDATION COMPLETE**. All metrics exceed thresholds: Functional damage confirmed, critical dependency established (**11.5x window**), and target accessibility validated (**0.88 score**). **The target is validated. We have a definitive 'GO' on this mission.**"
      }
    },
    {
      label: "Forge CRISPR Warhead",
      endpoint: {
        userMessage: "Target validation is complete. Forge a CRISPR-based weapon.",
        narrative: "Executing `/generate_optimized_guide_rna`. The Zeta Forge has engineered a portfolio of genetic warheads. The lead candidate has a predicted knockout efficacy of **94.5%**, with zero high-risk off-target sites identified. Its predicted efficacy exceeds that of FDA-approved CRISPR therapies like CTX001."
      }
    },
    {
      label: "Forge Novel Inhibitor",
      endpoint: {
        userMessage: "We need a multi-modal assault. Forge a novel small molecule inhibitor.",
        narrative: "Executing `/generate_protein_inhibitor`. The Forge has generated a novel molecular structure. In-silico analysis predicts a binding affinity of **-12.3 kcal/mol**, significantly stronger than the FDA-approved drug Alpelisib (-8.9 kcal/mol). This is a patent-worthy, best-in-class composition of matter."
      }
    },
    {
      label: "Execute In-Silico Trial",
      endpoint: {
        userMessage: "The weapons are forged. Simulate the clinical impact.",
        narrative: "Executing `/predict_protein_functionality_change` in a simulated trial. The simulation predicts our inhibitor will achieve an **85% target knockdown effect**, leading to a **76% loss in cancer cell viability**. The predicted selectivity of **56x** versus normal cells indicates a high probability of a successful clinical outcome with a superior safety profile."
      }
    },
    {
      label: "Compile Dossier",
      endpoint: {
        userMessage: "Mission successful. Compile the final IND-ready dossier.",
        narrative: "Dossier compiled. We have moved from an unvalidated target to a portfolio of de-risked, computationally validated therapeutic assets. The in-silico conquest is complete. This asset is ready for the next stage of development."
      }
    }
  ];

  const handleAction = async () => {
    console.log('handleAction called - currentStep:', currentStep, 'campaignSteps.length:', campaignSteps.length);
    // Allow progression until we reach the final step (6), but not beyond
    if (currentStep >= campaignSteps.length - 1) {
      console.log('Already at final step, analysis complete');
      return;
    }

    setIsLoading(true);
    setError(null);

    // First click - start the analysis with user's request
    if (currentStep === -1) {
      // Log analysis start
      addActivity(ACTIVITY_TYPES.TARGET_ANALYSIS_STARTED, 'Target analysis initiated', {
        target: 'PIK3CA E542K',
        mission: 'In Silico Conquest'
      });

      setConversation(prev => [...prev, { 
        type: 'user', 
        message: 'I need to validate PIK3CA E542K as a therapeutic target. Can you assess its functional impact first?' 
      }]);
      
      await wait(800);
      
      setConversation(prev => [...prev, { 
        type: 'assistant', 
        message: 'Absolutely! Let me analyze the functional damage this mutation causes. Running variant impact prediction...' 
      }]);

      await wait(1500); // Simulate API call

      // Load Oracle data and show first analysis - Create data structure that matches our new conversation flow
      const oracleData = {
        id: 'target-validation-campaign',
        label: 'Target Validation Campaign',
        description: 'Complete target validation through functional, dependency, and accessibility analysis',
        endpoints: [
          {
            id: 'predict_variant_impact',
            endpoint_name: '/predict_variant_impact',
            title: 'Functional Damage Assessment',
            headline: 'CATASTROPHIC IMPACT CONFIRMED',
            narrative: campaignSteps[0].endpoint.narrative,
            demoData: { 
              delta_likelihood_score: -1883.15, 
              pathogenicity_prediction: 'HIGH-CONFIDENCE PATHOGENIC',
              predicted_consequence: 'Severe biological disruption',
              sae_signal: 'Frameshift / Premature Stop (f/24278)'
            }
          },
          {
            id: 'predict_gene_essentiality',
            endpoint_name: '/predict_gene_essentiality',
            title: 'Cancer Dependency Analysis',
            headline: 'CRITICAL DEPENDENCY IDENTIFIED',
            narrative: campaignSteps[1].endpoint.narrative,
            demoData: { 
              essentiality_score: 0.92, 
              therapeutic_window: '11.5x',
              essentiality_category: 'Essential for cancer survival',
              comparison: 'Exceeds HER2 dependency scores'
            }
          },
          {
            id: 'predict_chromatin_accessibility',
            endpoint_name: '/predict_chromatin_accessibility',
            title: 'Target Accessibility Analysis',
            headline: 'TARGET IS ACCESSIBLE',
            narrative: campaignSteps[2].endpoint.narrative,
            demoData: { 
              accessibility_score: 0.88, 
              accessibility_state: 'Active Enhancer',
              druggability: 'High feasibility for CRISPR and small molecules'
            }
          },
          {
            id: 'target_validation_decision',
            endpoint_name: '/target_validation_decision',
            title: 'Target Validation Decision',
            headline: 'MISSION GO - TARGET VALIDATED',
            narrative: campaignSteps[3].endpoint.narrative,
            demoData: { 
              validation_status: 'GO',
              functional_damage: 'CONFIRMED',
              dependency_window: '11.5x',
              accessibility_score: 0.88,
              decision: 'TARGET VALIDATED FOR THERAPEUTIC INTERVENTION'
            }
          }
        ]
      };
      
      setResults({ oracle: { data: oracleData }});
      
      // Add the first analysis result
      setConversation(prev => [...prev, { 
        type: 'assistant', 
        message: campaignSteps[0].endpoint.narrative 
      }]);

      // Log target validation completion
      addActivity(ACTIVITY_TYPES.TARGET_VALIDATION, 'Functional damage confirmed', {
        result: 'CATASTROPHIC IMPACT',
        score: '18,750% disruption',
        confidence: '96.8%'
      });

      setCurrentStep(0);
      setCompletedSteps([0]);
      setIsLoading(false);
      return;
    }

    // Subsequent steps
    const nextStep = currentStep + 1;
    
    // --- Add user message if it exists for the next step ---
    const nextEndpointConfig = campaignSteps[nextStep].endpoint;
    if (nextEndpointConfig && nextEndpointConfig.userMessage) {
        setConversation(prev => [...prev, { 
          type: 'user', 
          message: nextEndpointConfig.userMessage 
        }]);
        
        // Small delay before AI response
        await wait(800);
    }

    await wait(1500); // Simulate API call

    // --- Add AI response ---
    if (nextEndpointConfig && nextEndpointConfig.narrative) {
        setConversation(prev => [...prev, { 
          type: 'assistant', 
          message: nextEndpointConfig.narrative 
        }]);
    }
    
    // --- Update results based on which phase we're entering ---
    if (nextStep <= 3) { // Oracle Phase (steps 0, 1, 2, 3)
        // Oracle data already loaded
    } else if (nextStep >= 4 && nextStep <= 5) { // Forge Phase (steps 4, 5)
        if (!results.forge) setResults(prev => ({ ...prev, forge: { data: pik3caTrinityCampaignConfig.acts[1].stages[0] } }));
    } else if (nextStep === 6) { // Gauntlet Phase (step 6)
        if (!results.gauntlet) setResults(prev => ({ ...prev, gauntlet: { data: pik3caTrinityCampaignConfig.acts[2].stages[0] } }));
    }
    // Dossier data will be loaded by useEffect when currentStep reaches 7

    // --- Log activity for each step ---
    switch(nextStep) {
      case 1:
        addActivity(ACTIVITY_TYPES.DEPENDENCY_ANALYSIS, 'Cancer dependency confirmed', {
          result: 'CRITICAL DEPENDENCY',
          score: '92% essential',
          context: 'Breast cancer cell lines'
        });
        break;
      case 2:
        addActivity(ACTIVITY_TYPES.DRUGGABILITY_ASSESSMENT, 'Target accessibility validated', {
          result: 'DRUGGABLE TARGET',
          score: '88% accessible',
          context: 'Open chromatin state'
        });
        // Check if mission should be GO/NO-GO
        const shouldBeGO = true; // Based on our demo data
        addActivity(
          shouldBeGO ? ACTIVITY_TYPES.MISSION_GO_DECISION : ACTIVITY_TYPES.MISSION_NO_GO_DECISION,
          shouldBeGO ? 'MISSION GO - Target validated' : 'MISSION NO-GO - Target rejected',
          {
            decision: shouldBeGO ? 'GO' : 'NO-GO',
            targetDamage: '18,750%',
            dependency: '92%',
            druggability: '88%'
          }
        );
        break;
      case 3:
        addActivity(ACTIVITY_TYPES.CRISPR_FORGE, 'CRISPR guides generated', {
          result: 'PRECISION ARSENAL',
          efficacy: '94.5% on-target',
          offTargets: 'Zero high-priority'
        });
        break;
      case 4:
        addActivity(ACTIVITY_TYPES.INHIBITOR_FORGE, 'Chemical weapons forged', {
          result: 'NOVEL INHIBITOR',
          candidates: '847 generated',
          leadAffinity: '-12.3 kcal/mol'
        });
        break;
      case 5:
        addActivity(ACTIVITY_TYPES.IN_SILICO_TRIAL, 'Clinical trial simulated', {
          result: 'EFFICACY VALIDATED',
          responseRate: '76% ORR',
          population: 'PIK3CA E542K+'
        });
        break;
      // Case 6 (dossier completion) is now handled by useEffect
    }

    // --- Mark step as complete and advance to the next one ---
    setCompletedSteps(prev => [...prev, nextStep]);
    setCurrentStep(nextStep);
    
    setIsLoading(false);
  };

  const currentAction = {
    buttonText: currentStep >= campaignSteps.length - 1
      ? 'Analysis Complete' 
      : currentStep === -1 
        ? 'Start Analysis' 
        : currentStep === 0
          ? 'Check Cancer Dependency'
          : currentStep === 1
            ? 'Assess Target Accessibility'
            : currentStep === 2
              ? 'Make GO/NO-GO Decision'
              : currentStep === 3
                ? 'Design CRISPR Guides'
                : currentStep === 4
                  ? 'Generate Inhibitors'
                  : currentStep === 5
                    ? 'Run In Silico Trial'
                    : currentStep === 6
                      ? 'Generate Dossier'
                      : 'Analysis Complete'
  };

  return (
    <Box sx={{ 
      height: '100%',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f1419 0%, #1a2332 50%, #2d3748 100%)',
      color: 'white',
      width: '100vw',
      position: 'fixed',
      top: 0,
      left: 0,
      overflow: 'auto'
    }}>
      <TargetDossierDisplay 
        results={results} 
        onAction={handleAction}
        currentStep={currentStep}
        completedSteps={completedSteps}
        progressSteps={campaignSteps}
        setCurrentStep={setCurrentStep}
        setCompletedSteps={setCompletedSteps}
        isLoading={isLoading}
        currentAction={currentAction}
        conversation={conversation}
      />
    </Box>
  );
};

export default TargetDossierRunner; 