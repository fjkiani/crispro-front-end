import React from 'react';
import { Slide } from '../common/SlideComponents';

const PlatformSlide = () => (
  <Slide>
    <div className="max-w-4xl w-full">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Platform Architecture: Intelligent Agent Ecosystem</h1>
      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-center text-blue-600">Core Agents</h3>
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="font-medium text-blue-800">Genomic Analyst</div>
                <div className="text-sm text-gray-600">Evo2 integration, variant analysis</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="font-medium text-blue-800">Data Analysis</div>
                <div className="text-sm text-gray-600">Deep summarization, insights</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="font-medium text-blue-800">CRISPR Specialist</div>
                <div className="text-sm text-gray-600">Gene editing recommendations</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-center text-green-600">Research Agents</h3>
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="font-medium text-green-800">Clinical Trials</div>
                <div className="text-sm text-gray-600">Real-time trial matching</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="font-medium text-green-800">Literature Review</div>
                <div className="text-sm text-gray-600">Latest research synthesis</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="font-medium text-green-800">Comparative Therapy</div>
                <div className="text-sm text-gray-600">Treatment option analysis</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-center text-purple-600">Patient Care</h3>
            <div className="space-y-3">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="font-medium text-purple-800">Integrative Medicine</div>
                <div className="text-sm text-gray-600">Holistic care recommendations</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="font-medium text-purple-800">Patient Matching</div>
                <div className="text-sm text-gray-600">Therapy & support connections</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="font-medium text-purple-800">Grant Discovery</div>
                <div className="text-sm text-gray-600">Funding opportunity matching</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4 inline-block">
            <div className="font-semibold text-gray-800">Unified Orchestration Layer</div>
            <div className="text-sm text-gray-600">Real-time agent coordination and workflow management</div>
          </div>
        </div>
      </div>
    </div>
  </Slide>
);

export default PlatformSlide; 