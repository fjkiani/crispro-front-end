import React, { useState, useEffect, useCallback } from 'react';
import { IconX, IconChevronLeft, IconChevronRight, IconTarget, IconHelp } from '@tabler/icons-react';

const TutorialStep = ({ 
  step, 
  isActive, 
  onNext, 
  onPrev, 
  onSkip, 
  isLastStep, 
  isFirstStep,
  totalSteps 
}) => {
  if (!isActive || !step) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
      {/* Highlight target element */}
      {step.targetPosition && (
        <div 
          className="absolute rounded-lg shadow-xl border-4 border-blue-500 z-40"
          style={{
            top: step.targetPosition.top,
            left: step.targetPosition.left,
            width: step.targetPosition.width,
            height: step.targetPosition.height,
          }}
        />
      )}
      
      {/* Tutorial Content */}
      <div 
        className="absolute bg-white rounded-lg shadow-2xl p-6 max-w-sm w-full z-50"
        style={{
          top: step.contentPosition?.top && step.contentPosition.top > 0 && step.contentPosition.top < window.innerHeight - 300 
            ? step.contentPosition.top 
            : '50%',
          left: step.contentPosition?.left && step.contentPosition.left > 0 && step.contentPosition.left < window.innerWidth - 400 
            ? step.contentPosition.left 
            : '50%',
          transform: (!step.contentPosition?.top || step.contentPosition.top <= 0 || step.contentPosition.top >= window.innerHeight - 300 ||
                     !step.contentPosition?.left || step.contentPosition.left <= 0 || step.contentPosition.left >= window.innerWidth - 400) 
            ? 'translate(-50%, -50%)' 
            : 'none'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <IconTarget className="text-blue-600 mr-2" size={20} />
            <h3 className="text-lg font-semibold text-gray-800">
              Step {step.id} of {totalSteps}
            </h3>
          </div>
          <button
            onClick={onSkip}
            className="text-gray-400 hover:text-gray-600"
          >
            <IconX size={20} />
          </button>
        </div>
        
        <h4 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h4>
        <p className="text-gray-600 mb-4 leading-relaxed">{step.description}</p>
        
        {step.actionItems && (
          <div className="bg-blue-50 p-3 rounded-md mb-4">
            <h5 className="font-medium text-blue-900 mb-2">Try this:</h5>
            <ul className="text-sm text-blue-800 space-y-1">
              {step.actionItems.map((item, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <button
            onClick={onPrev}
            disabled={isFirstStep}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IconChevronLeft size={16} className="mr-1" />
            Previous
          </button>
          
          <div className="flex space-x-1">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i + 1 === step.id ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={isLastStep ? onSkip : onNext}
            className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
          >
            {isLastStep ? 'Finish' : 'Next'}
            {!isLastStep && <IconChevronRight size={16} className="ml-1" />}
          </button>
        </div>
      </div>
    </div>
  );
};

const tutorialSteps = {
  dashboard: [
    {
      id: 1,
      title: "Welcome to CrisPRO Oncology Co-Pilot",
      description: "Let's take a quick tour of your AI-powered oncology platform. This dashboard gives you an overview of your patients, tasks, and AI agent activities.",
      actionItems: ["Notice the three main columns showing different aspects of your workflow"],
      targetSelector: ".min-h-screen.bg-gray-100"
    },
    {
      id: 2,
      title: "Patient Overview",
      description: "The left column shows your recent patients and key metrics. These cards give you quick access to patient records and current workload.",
      actionItems: ["Click on any patient name to view their complete medical record"],
      targetSelector: ".lg\\:col-span-1:first-child"
    },
    {
      id: 3,
      title: "Workload Management",
      description: "The middle column displays your active tasks and follow-up items. This is your command center for patient care coordination.",
      actionItems: ["Click 'View Full Kanban' to see all your tasks in detail"],
      targetSelector: ".lg\\:col-span-1:nth-child(2)"
    },
    {
      id: 4,
      title: "AI Agent Activity",
      description: "The right column shows your active AI agents. These agents continuously analyze patient data and provide insights.",
      actionItems: ["Click 'View Agent Dashboard' to configure and monitor your AI assistants"],
      targetSelector: ".lg\\:col-span-1:nth-child(3)"
    },
    {
      id: 5,
      title: "Navigation Sidebar",
      description: "Use the left sidebar to navigate between different modules: Patient Records, Research, Mutation Explorer, and AI Agents.",
      actionItems: ["Hover over each icon to see its function"],
      targetSelector: ".sticky.top-5"
    },
    {
      id: 6,
      title: "Global Activity Feed",
      description: "The right sidebar shows real-time activity for the current patient, including AI analysis results and system updates.",
      actionItems: ["This feed updates automatically as you work with patient data"],
      targetSelector: ".fixed.right-0"
    }
  ],
  patientRecord: [
    {
      id: 1,
      title: "Patient Record Overview",
      description: "This is a comprehensive view of a patient's medical record with AI-enhanced insights and analysis tools.",
      targetSelector: ".container.mx-auto"
    },
    {
      id: 2,
      title: "AI Insights Widget",
      description: "This widget shows AI-generated insights specific to this patient, including clinical trial matches and medication analysis.",
      actionItems: ["Click 'View Full Dashboard' to see detailed AI analysis"],
      targetSelector: "[class*='AgentInsightWidget']"
    },
    {
      id: 3,
      title: "Patient Demographics",
      description: "Key patient information including age, diagnosis, and current treatment status.",
      targetSelector: ".bg-white.p-6.rounded-lg.shadow:first-child"
    },
    {
      id: 4,
      title: "Action Buttons",
      description: "Description: Quick access to research tools, mutation analysis, and follow-up task management.",
      actionItems: ["Try clicking 'Research Portal' to find relevant clinical trials"],
      targetSelector: ".flex.gap-3.mb-6"
    }
  ]
};

const TutorialOverlay = ({ isVisible, onComplete, tutorialType = 'dashboard' }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [targetPositions, setTargetPositions] = useState({});

  const steps = tutorialSteps[tutorialType] || tutorialSteps.dashboard;

  const updateTargetPositions = useCallback(() => {
    const newPositions = {};
    steps.forEach(step => {
      if (step.targetSelector) {
        const element = document.querySelector(step.targetSelector);
        if (element) {
          const rect = element.getBoundingClientRect();
          newPositions[step.id] = {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
          };
        }
      }
    });
    setTargetPositions(newPositions);
  }, [steps]);

  useEffect(() => {
    if (isVisible) {
      updateTargetPositions();
      window.addEventListener('resize', updateTargetPositions);
      return () => window.removeEventListener('resize', updateTargetPositions);
    }
  }, [isVisible, updateTargetPositions]);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
    // Save tutorial completion status
    localStorage.setItem(`tutorial_${tutorialType}_completed`, 'true');
  };

  if (!isVisible) return null;

  const baseStep = steps[currentStep - 1];
  
  // Create a new object for the current step with position data to avoid mutation
  const currentStepData = baseStep ? {
      ...baseStep,
      targetPosition: targetPositions[baseStep.id],
      contentPosition: targetPositions[baseStep.id] ? {
        top: targetPositions[baseStep.id].top + targetPositions[baseStep.id].height + 20,
        left: Math.min(targetPositions[baseStep.id].left, window.innerWidth - 400),
      } : {
        top: window.innerHeight / 2,
        left: window.innerWidth / 2
      },
  } : null;

  return (
    <TutorialStep
      step={currentStepData}
      isActive={true}
      onNext={handleNext}
      onPrev={handlePrev}
      onSkip={handleSkip}
      isLastStep={currentStep === steps.length}
      isFirstStep={currentStep === 1}
      totalSteps={steps.length}
    />
  );
};

export default TutorialOverlay; 