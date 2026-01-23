import React from 'react';
import { Slide } from '../common/SlideComponents';

const TeamAndVisionSlide = () => (
  <Slide>
    <div className="max-w-4xl w-full">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">The Vision: Transforming Cancer Care</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-2xl font-semibold text-blue-600 mb-4">Our Mission</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <p className="text-lg text-gray-800 leading-relaxed">
              "To democratize access to cutting-edge cancer genomics and AI-powered precision medicine, 
              enabling every oncologist to provide world-class, personalized care regardless of institutional resources."
            </p>
          </div>
        </div>
        
        <div>
          <h3 className="text-2xl font-semibold text-green-600 mb-4">Impact Goals</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">1M</span>
              </div>
              <span className="text-gray-700">Patients with improved treatment outcomes</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">10K</span>
              </div>
              <span className="text-gray-700">Oncologists empowered with AI tools</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">50%</span>
              </div>
              <span className="text-gray-700">Reduction in time to optimal treatment</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">Ready to Transform Cancer Care Together?</h3>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <div className="text-lg text-gray-700 mb-4">
            Join us in building the future of AI-powered oncology
          </div>
          <div className="text-2xl font-bold text-blue-600">
            Let's save lives through intelligent technology
          </div>
        </div>
      </div>
    </div>
  </Slide>
);

export default TeamAndVisionSlide; 