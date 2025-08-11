import React, { useState, useEffect } from 'react';
import { IconHelp, IconBulb } from '@tabler/icons-react';
import TutorialOverlay from './TutorialOverlay';

const TutorialTrigger = ({ 
  tutorialType = 'dashboard', 
  className = '',
  showOnFirstVisit = true,
  position = 'bottom-right' 
}) => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    if (showOnFirstVisit) {
      const hasSeenTutorial = localStorage.getItem(`tutorial_${tutorialType}_completed`);
      const hasVisitedPage = localStorage.getItem(`page_${tutorialType}_visited`);
      
      if (!hasSeenTutorial && !hasVisitedPage) {
        setIsFirstVisit(true);
        // Show tutorial after a brief delay to let the page load
        const timer = setTimeout(() => {
          setShowTutorial(true);
        }, 1500);
        
        localStorage.setItem(`page_${tutorialType}_visited`, 'true');
        return () => clearTimeout(timer);
      }
    }
  }, [tutorialType, showOnFirstVisit]);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    localStorage.setItem(`tutorial_${tutorialType}_completed`, 'true');
  };

  const positionClasses = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'top-right': 'fixed top-20 right-6',
    'top-left': 'fixed top-20 left-6',
    'inline': 'relative'
  };

  return (
    <>
      {/* Tutorial Trigger Button */}
      <div className={`${positionClasses[position]} z-40 ${className}`}>
        {isFirstVisit && !localStorage.getItem(`tutorial_${tutorialType}_completed`) && (
          <div className="bg-blue-600 text-white p-3 rounded-lg shadow-lg mb-2 max-w-xs animate-pulse">
            <div className="flex items-center text-sm">
              <IconBulb size={16} className="mr-2 flex-shrink-0" />
              <span>New to CrisPRO? Take a quick tour!</span>
            </div>
          </div>
        )}
        
        <button
          onClick={() => setShowTutorial(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all hover:scale-105 group"
          title="Start Tutorial"
        >
          <IconHelp size={24} className="group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      {/* Tutorial Overlay */}
      <TutorialOverlay
        isVisible={showTutorial}
        onComplete={handleTutorialComplete}
        tutorialType={tutorialType}
      />
    </>
  );
};

export default TutorialTrigger; 