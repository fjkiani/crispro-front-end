import React from 'react';
import { Slide } from '../common/SlideComponents';

const BusinessModelSlide = () => (
  <Slide>
    <div className="max-w-4xl w-full">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Revenue Model & Go-to-Market</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-2xl font-semibold text-blue-600 mb-4">Revenue Streams</h3>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="font-semibold text-blue-800">SaaS Subscriptions</div>
              <div className="text-sm text-gray-700 mt-1">Tiered pricing per clinician/month</div>
              <div className="text-lg font-medium text-blue-600 mt-2">$500-2000/user/month</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="font-semibold text-green-800">Enterprise Licensing</div>
              <div className="text-sm text-gray-700 mt-1">Hospital system-wide implementations</div>
              <div className="text-lg font-medium text-green-600 mt-2">$100K-1M+ annually</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="font-semibold text-purple-800">API & Integration</div>
              <div className="text-sm text-gray-700 mt-1">Third-party platform integrations</div>
              <div className="text-lg font-medium text-purple-600 mt-2">Usage-based pricing</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="font-semibold text-orange-800">Premium AI Models</div>
              <div className="text-sm text-gray-700 mt-1">Advanced agent capabilities</div>
              <div className="text-lg font-medium text-orange-600 mt-2">$50-200/analysis</div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-2xl font-semibold text-green-600 mb-4">Go-to-Market Strategy</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <div className="font-semibold text-gray-900">Phase 1: Academic Medical Centers</div>
              <div className="text-sm text-gray-600">Research hospitals with advanced genomics programs</div>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <div className="font-semibold text-gray-900">Phase 2: Cancer Centers</div>
              <div className="text-sm text-gray-600">Specialized oncology practices and networks</div>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <div className="font-semibold text-gray-900">Phase 3: Health Systems</div>
              <div className="text-sm text-gray-600">Large hospital networks and integrated care</div>
            </div>
            <div className="border-l-4 border-orange-500 pl-4">
              <div className="font-semibold text-gray-900">Phase 4: Global Expansion</div>
              <div className="text-sm text-gray-600">International markets and regulatory compliance</div>
            </div>
          </div>
          
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Key Partnerships</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• EHR vendors (Epic, Cerner, Allscripts)</li>
              <li>• Genomics companies (Illumina, Thermo Fisher)</li>
              <li>• Cloud providers (AWS, Azure, GCP)</li>
              <li>• Medical societies and conferences</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </Slide>
);

export default BusinessModelSlide; 