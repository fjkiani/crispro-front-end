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
    if (currentStep === 6 && !results.dossier) {
      console.log('Loading dossier data for final step:', pik3caTrinityCampaignConfig.therapeuticBlueprint);
      setResults(prev => ({
        ...prev, 
        dossier: pik3caTrinityCampaignConfig.therapeuticBlueprint
      }));
      
      // Log completion activity
      addActivity(ACTIVITY_TYPES.DOSSIER_COMPLETE, 'IND-ready dossier compiled', {
        result: 'MISSION COMPLETE',
        costAvoidance: '$47.2M',
        timeline: '5 minutes vs 36 months'
      });
    }
  }, [currentStep, results.dossier, addActivity]);

  // Define the conversation steps for our R&D workflow with enhanced AI analysis
  // Define the campaign steps according to our superior doctrine.
  const campaignSteps = [
    {
      label: "Functional Impact",
      endpoint: {
        // The user's command is direct and to the point.
        userMessage: "First, I need a definitive verdict on the functional impact of PIK3CA E542K.",
        // The narrative uses our proprietary metrics and weapon systems. No marketing bullshit.
        narrative: "Executing Triumvirate Threat Assessment... The Zeta Oracle has analyzed the variant from first principles. The verdict is definitive: **Pathogenic**. The **Zeta Score of -18,245.7** indicates a catastrophic disruption of the protein's kinase domain, confirming it as a high-value therapeutic target."
      }
    },
    {
      label: "Dependency Analysis", 
      endpoint: {
        userMessage: "A vulnerable target isn't enough. Prove it's a critical dependency for the cancer's survival.",
        // We don't "cross-reference a database." We run a dynamic simulation.
        narrative: "Deploying our `predict_gene_essentiality` workflow. The `in silico` simulation confirms that cancer cells harboring the E542K mutation are catastrophically dependent on the PI3K pathway for survival. This is a true Achilles' heel."
      }
    },
    {
      label: "Druggability Assessment",
      endpoint: {
        userMessage: "Target is vulnerable and essential. Confirm it's druggable.",
        narrative: "Executing druggability analysis. The target site is located in a region of high chromatin accessibility. Our structural analysis confirms multiple accessible binding pockets, creating ideal conditions for both CRISPR-based interception and small molecule assault. **The target is validated. We have a 'GO' on the mission.**"
      }
    },
    {
      label: "Forge CRISPR Payload",
      endpoint: {
        userMessage: "Target validation is complete. Forge a CRISPR-based weapon.",
        // We don't use "optimization algorithms." We forge blueprints.
        narrative: "Unleashing the **Zeta Forge**. We have forged a portfolio of high-precision gRNAs. The lead candidate has a predicted on-target efficacy score derived from the Zeta Oracle and zero high-priority off-targets identified by our genome-wide BLAST analysis. This is a complete **Precision Interception Blueprint**."
      }
    },
    {
      label: "Forge Novel Inhibitor",
      endpoint: {
        userMessage: "We need a multi-modal assault. Forge a novel inhibitor.",
        // We use our proprietary "Forge-and-Fire" protocol.
        narrative: "Executing the **'Forge-and-Fire'** protocol. The **Zeta Forge** has generated 847 novel molecular structures. Our **Zeta Boltz** engine then ran `in silico` binding affinity simulations for each. The lead compound shows a predicted binding affinity of **-12.3 kcal/mol** for the E542K mutant, with high selectivity. This is a patent-worthy asset."
      }
    },
    {
      label: "Run `In Silico` Trial",
      endpoint: {
        userMessage: "The weapons are forged. What is the predicted clinical impact?",
        // We don't just "validate efficacy." We run a full `in silico` clinical trial.
        narrative: "Executing `in silico` clinical trial. Our Digital Twin platform simulates the therapeutic effect of our lead inhibitor across a virtual patient cohort. The models predict an **85% Target Inhibition Rate** with **94.5% CRISPR cutting efficiency** - translating to a projected **82% Objective Response Rate** in PIK3CA E542K-positive tumors, significantly higher than the standard of care. We have high confidence this weapon will succeed on the clinical battlefield."
      }
    },
    {
      label: "Assemble Dossier",
      endpoint: {
        userMessage: "Assemble the final dossier for our IND filing.",
        // The final output is a de-risked asset with a clear ROI.
        narrative: "Mission complete. The full **IND-Ready Dossier** has been compiled. We have moved from an unvalidated target to a portfolio of de-risked therapeutic assets with a **$47.2M cost avoidance** over traditional R&D. The `in silico` conquest is finished. Ready for the wet-lab."
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

      // Load Oracle data and show first analysis
      setResults({ oracle: { data: pik3caTrinityCampaignConfig.acts[0].stages[0] }});
      
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
    if (nextStep <= 2) { // Oracle Phase (steps 0, 1, 2)
        // Oracle data already loaded
    } else if (nextStep >= 3 && nextStep <= 4) { // Forge Phase (steps 3, 4)
        if (!results.forge) setResults(prev => ({ ...prev, forge: { data: pik3caTrinityCampaignConfig.acts[1].stages[0] } }));
    } else if (nextStep === 5) { // Gauntlet Phase (step 5)
        if (!results.gauntlet) setResults(prev => ({ ...prev, gauntlet: { data: pik3caTrinityCampaignConfig.acts[2].stages[0] } }));
    }
    // Dossier data will be loaded by useEffect when currentStep reaches 6

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
              ? 'Design CRISPR Guides'
              : currentStep === 3
                ? 'Generate Inhibitors'
                : currentStep === 4
                  ? 'Run In Silico Trial'
                  : currentStep === 5
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