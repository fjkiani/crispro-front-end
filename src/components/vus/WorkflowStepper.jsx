import React from 'react';
import { WORKFLOW_STEPS_CONFIG, DEFAULT_CLASSES } from './constants.jsx';

const WorkflowStepper = ({ 
    steps = WORKFLOW_STEPS_CONFIG,
    currentStep,
    analysisStatus,
    onStepChange,
    className = "mb-6 p-4 bg-gray-900 rounded-lg shadow-xl border border-purple-700"
}) => {
    const getWorkflowStepClasses = (stepKey, currentActiveStep) => {
        let baseClasses = "p-3 rounded-md border flex-1 text-center transition-all duration-300 ease-in-out cursor-pointer";
        let textClasses = "text-xs";
        let titleClasses = "block font-semibold mb-0.5 text-sm";

        // Determine active step for styling
        let isActive = false;
        if (stepKey === 'step1' && currentActiveStep === 'mutation_selection') isActive = true;
        if (stepKey === 'step2' && currentActiveStep === 'analysis_view') isActive = true;
        if (stepKey === 'step3' && currentActiveStep === 'crispr_view') isActive = true;
        // Make step 3 look active if crispr was initiated, even if we are not in crispr view
        if (stepKey === 'step3' && analysisStatus === 'crispr_initiated' && currentActiveStep !== 'crispr_view') isActive = true;

        if (isActive) {
            return `${baseClasses} bg-purple-700 border-purple-500 shadow-lg scale-105 ${textClasses} ${titleClasses}`;
        }

        // Determine completed step for styling
        let isCompleted = false;
        if (stepKey === 'step1' && (currentActiveStep === 'analysis_view' || currentActiveStep === 'crispr_view' || analysisStatus === 'crispr_initiated')) isCompleted = true;
        if (stepKey === 'step2' && analysisStatus === 'complete' && (currentActiveStep === 'crispr_view' || analysisStatus === 'crispr_initiated')) isCompleted = true;
        if (stepKey === 'step2' && analysisStatus === 'crispr_initiated') isCompleted = true; // If CRISPR initiated, step 2 is complete implicitly
        
        if (isCompleted) {
            return `${baseClasses} bg-green-700 border-green-500 hover:bg-green-600 ${textClasses} ${titleClasses}`;
        }
        
        // Special case for loading state of step 2
        if (stepKey === 'step2' && currentActiveStep === 'analysis_view' && analysisStatus === 'loading'){
            return `${baseClasses} bg-yellow-600 border-yellow-400 animate-pulse ${textClasses} ${titleClasses}`;
        }

        return `${baseClasses} bg-gray-800 border-gray-700 hover:bg-gray-750 ${textClasses} ${titleClasses}`;
    };

    const getStepTitle = (step, analysisStatus) => {
        if (step.key === 'step2' && analysisStatus === 'loading') {
            return "2. Analyzing Impact...";
        }
        return step.title;
    };

    return (
        <div className={className}>
            <h3 className="text-xl font-semibold mb-3 text-purple-300 text-center">
                Genomic Intelligence Workflow
            </h3>
            <div className="flex flex-col md:flex-row gap-3 justify-around items-stretch">
                {steps.map((step) => (
                    <div 
                        key={step.key}
                        className={getWorkflowStepClasses(step.key, currentStep)} 
                        onClick={() => onStepChange(step.workflowStep)}
                    >
                        <span className={getWorkflowStepClasses(step.key, currentStep).includes('text-sm') ? '' : 'text-sm font-semibold block mb-0.5'}>
                            {getStepTitle(step, analysisStatus)}
                        </span>
                        <p className={getWorkflowStepClasses(step.key, currentStep).includes('text-xs') ? '' : 'text-xs'}>
                            {step.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WorkflowStepper;
