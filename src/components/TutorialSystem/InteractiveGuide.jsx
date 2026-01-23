import React, { useState, useEffect, useRef } from 'react';
import { IconInfoCircle, IconArrowRight, IconSparkles } from '@tabler/icons-react';

const InteractiveHint = ({ 
  text, 
  position = 'bottom', 
  trigger = 'hover', 
  persistent = false,
  className = '',
  children 
}) => {
  const [isVisible, setIsVisible] = useState(persistent);
  const [actualPosition, setActualPosition] = useState(position);
  const hintRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isVisible && hintRef.current && containerRef.current) {
      const hintRect = hintRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      
      // Adjust position if hint would go off-screen
      if (position === 'bottom' && hintRect.bottom > window.innerHeight) {
        setActualPosition('top');
      } else if (position === 'top' && hintRect.top < 0) {
        setActualPosition('bottom');
      } else if (position === 'right' && hintRect.right > window.innerWidth) {
        setActualPosition('left');
      } else if (position === 'left' && hintRect.left < 0) {
        setActualPosition('right');
      }
    }
  }, [isVisible, position]);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-800',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-800',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-800',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-800'
  };

  const handleTrigger = () => {
    if (trigger === 'click') {
      setIsVisible(!isVisible);
    } else if (trigger === 'hover') {
      setIsVisible(true);
    }
  };

  const handleLeave = () => {
    if (trigger === 'hover' && !persistent) {
      setIsVisible(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={handleTrigger}
      onMouseLeave={handleLeave}
      onClick={trigger === 'click' ? handleTrigger : undefined}
    >
      {children}
      
      {isVisible && (
        <div 
          ref={hintRef}
          className={`absolute z-50 bg-gray-800 text-white text-sm rounded-lg px-3 py-2 max-w-xs shadow-lg ${positionClasses[actualPosition]}`}
        >
          <div className={`absolute w-0 h-0 border-4 ${arrowClasses[actualPosition]}`} />
          {text}
          {persistent && (
            <button
              onClick={() => setIsVisible(false)}
              className="ml-2 text-gray-300 hover:text-white"
            >
              ×
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const ProgressBadge = ({ current, total, label }) => (
  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
    <IconSparkles size={14} className="inline mr-1" />
    {label}: {current}/{total}
  </div>
);

const FlowGuide = ({ steps, currentStep, onStepComplete, title }) => {
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const handleStepClick = (stepIndex) => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(stepIndex);
    setCompletedSteps(newCompleted);
    if (onStepComplete) {
      onStepComplete(stepIndex);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
      <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
        <IconInfoCircle size={18} className="mr-2 text-blue-600" />
        {title}
      </h3>
      
      <div className="space-y-2">
        {steps.map((step, index) => (
          <div 
            key={index}
            className={`flex items-center p-2 rounded-md transition-colors ${
              index === currentStep 
                ? 'bg-blue-50 border border-blue-200' 
                : completedSteps.has(index)
                ? 'bg-green-50'
                : 'hover:bg-gray-50'
            }`}
          >
            <div 
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${
                completedSteps.has(index)
                  ? 'bg-green-500 text-white'
                  : index === currentStep
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              {completedSteps.has(index) ? '✓' : index + 1}
            </div>
            
            <div className="flex-1">
              <p className={`text-sm ${index === currentStep ? 'font-medium text-blue-900' : 'text-gray-700'}`}>
                {step.title}
              </p>
              {step.description && (
                <p className="text-xs text-gray-500 mt-1">{step.description}</p>
              )}
            </div>
            
            {index === currentStep && (
              <button
                onClick={() => handleStepClick(index)}
                className="ml-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
              >
                Done
              </button>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-200">
        <ProgressBadge 
          current={completedSteps.size} 
          total={steps.length} 
          label="Progress" 
        />
      </div>
    </div>
  );
};

const InteractiveGuide = {
  Hint: InteractiveHint,
  Progress: ProgressBadge,
  Flow: FlowGuide
};

export default InteractiveGuide; 