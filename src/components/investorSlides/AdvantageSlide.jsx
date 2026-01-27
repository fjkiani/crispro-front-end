import React from 'react';
import { Slide } from '../common/SlideComponents';

const AdvantageSlide = () => (
  <Slide>
    <div className="max-w-4xl w-full">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Our Competitive Advantage</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-2xl font-semibold text-blue-600 mb-4">What Sets Us Apart</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div>
                <div className="font-medium text-gray-900">Multi-Agent Architecture</div>
                <div className="text-gray-600 text-sm">Specialized AI agents working in concert vs. monolithic solutions</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div>
                <div className="font-medium text-gray-900">Cutting-Edge AI Integration</div>
                <div className="text-gray-600 text-sm">Direct integration with AlphaFold 3, Evo2, and next-gen models</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div>
                <div className="font-medium text-gray-900">End-to-End Workflow</div>
                <div className="text-gray-600 text-sm">From genomic analysis to patient care coordination</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div>
                <div className="font-medium text-gray-900">Clinician-Centric Design</div>
                <div className="text-gray-600 text-sm">Built by and for oncologists, not just technologists</div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-2xl font-semibold text-red-600 mb-4">Competitive Landscape</h3>
          <div className="space-y-3">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="font-medium text-gray-900">Traditional EHR Vendors</div>
              <div className="text-sm text-gray-600">Limited AI capabilities, siloed data</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="font-medium text-gray-900">Genomics Companies</div>
              <div className="text-sm text-gray-600">Narrow focus, no clinical workflow integration</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="font-medium text-gray-900">AI Healthcare Startups</div>
              <div className="text-sm text-gray-600">General purpose tools, not oncology-specific</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="font-medium text-gray-900">Big Tech Solutions</div>
              <div className="text-sm text-gray-600">Broad platforms lacking specialized oncology expertise</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Slide>
);

export default AdvantageSlide; 