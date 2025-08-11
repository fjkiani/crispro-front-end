import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { IconX, IconSparkles, IconRocket, IconUsers, IconBrain } from '@tabler/icons-react';

const WelcomeModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Don't show the generic welcome modal on the dossier page (it has its own)
    if (location.pathname === '/dossier') {
      return;
    }

    // Check if user has seen the welcome message before
    const hasSeenWelcome = localStorage.getItem('crispro_welcome_seen');
    if (!hasSeenWelcome) {
      // Show welcome modal after a brief delay to let the app load
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const handleClose = () => {
    setIsVisible(false);
    if (dontShowAgain) {
      localStorage.setItem('crispro_welcome_seen', 'true');
    }
  };

  const handleGetStarted = () => {
    setIsVisible(false);
    localStorage.setItem('crispro_welcome_seen', 'true');
    // Optionally trigger the tutorial here
    // You could dispatch an event or call a callback prop
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <IconSparkles size={32} className="mr-3" />
              <div>
                <h1 className="text-2xl font-bold">Welcome to CrisPRO</h1>
                <p className="text-blue-100 mt-1">AI-Powered Oncology Co-Pilot Demo</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <IconX size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Experience the Future of Oncology Practice
            </h2>
            <p className="text-gray-600 leading-relaxed">
              This interactive demo showcases how AI can transform cancer care by providing 
              intelligent insights, automating research, and enhancing clinical decision-making. 
              Explore our comprehensive platform designed specifically for oncology professionals.
            </p>
          </div>

          {/* Key Features */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <IconBrain className="mx-auto text-blue-600 mb-2" size={32} />
              <h3 className="font-semibold text-gray-800 mb-1">AI Insights</h3>
              <p className="text-sm text-gray-600">
                Real-time analysis of patient data with actionable recommendations
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <IconUsers className="mx-auto text-purple-600 mb-2" size={32} />
              <h3 className="font-semibold text-gray-800 mb-1">Patient Management</h3>
              <p className="text-sm text-gray-600">
                Comprehensive patient records with integrated workflow tools
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <IconRocket className="mx-auto text-green-600 mb-2" size={32} />
              <h3 className="font-semibold text-gray-800 mb-1">Research Portal</h3>
              <p className="text-sm text-gray-600">
                Automated clinical trial matching and literature analysis
              </p>
            </div>
          </div>

          {/* Demo Instructions */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">What to Explore:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Dashboard:</strong> Overview of patients, tasks, and AI agent activity</li>
              <li>• <strong>Patient Records:</strong> Detailed medical records with AI-enhanced insights</li>
              <li>• <strong>Research Portal:</strong> Clinical trial matching and research tools</li>
              <li>• <strong>Mutation Explorer:</strong> Genomic analysis with therapeutic recommendations</li>
              <li>• <strong>Agent Studio:</strong> Configure and monitor your AI assistants</li>
            </ul>
          </div>

          {/* Sample Data Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This demo uses synthetic patient data for demonstration purposes. 
              All patient information is fictional and created solely for showcasing platform capabilities.
            </p>
          </div>

          {/* Don't show again checkbox */}
          <div className="flex items-center mb-6">
            <input
              type="checkbox"
              id="dontShowAgain"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="dontShowAgain" className="text-sm text-gray-600">
              Don't show this welcome message again
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleGetStarted}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              <IconRocket size={20} className="mr-2" />
              Get Started
            </button>
            <button
              onClick={handleClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal; 