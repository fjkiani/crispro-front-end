import React from 'react';
import { Slide } from '../common/SlideComponents';
import { Target, Zap, Shield, Users } from 'lucide-react';

const FeaturesSlide = () => (
  <Slide>
    <div className="max-w-4xl w-full">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Key Platform Features</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center mb-3">
              <Target className="w-6 h-6 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold text-blue-800">Mutation Explorer</h3>
            </div>
            <p className="text-gray-700 mb-3">Interactive genomic variant analysis with AlphaFold 3 and Evo2 integration</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Real-time pathogenicity scoring</li>
              <li>• 3D protein structure modeling</li>
              <li>• CRISPR therapeutic recommendations</li>
            </ul>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
            <div className="flex items-center mb-3">
              <Zap className="w-6 h-6 text-green-600 mr-3" />
              <h3 className="text-xl font-semibold text-green-800">Agent Studio</h3>
            </div>
            <p className="text-gray-700 mb-3">Customizable AI agent creation and management</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Drag-and-drop agent builder</li>
              <li>• Custom prompt engineering</li>
              <li>• Workflow automation</li>
            </ul>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center mb-3">
              <Shield className="w-6 h-6 text-purple-600 mr-3" />
              <h3 className="text-xl font-semibold text-purple-800">EHR Integration</h3>
            </div>
            <p className="text-gray-700 mb-3">Seamless integration with existing clinical workflows</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• FHIR-compliant data exchange</li>
              <li>• Real-time patient insights</li>
              <li>• Automated documentation</li>
            </ul>
          </div>
          
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6">
            <div className="flex items-center mb-3">
              <Users className="w-6 h-6 text-orange-600 mr-3" />
              <h3 className="text-xl font-semibold text-orange-800">Patient Dashboard</h3>
            </div>
            <p className="text-gray-700 mb-3">Comprehensive patient portal with care coordination</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Therapist matching and scheduling</li>
              <li>• Treatment timeline tracking</li>
              <li>• Educational resource access</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </Slide>
);

export default FeaturesSlide; 