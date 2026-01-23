import React from 'react';
import { Slide } from '../common/SlideComponents';

const FinancialsSlide = () => (
  <Slide>
    <div className="max-w-4xl w-full">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Financial Projections & Funding</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-2xl font-semibold text-blue-600 mb-4">5-Year Revenue Projection</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded">
              <span className="font-medium">Year 1</span>
              <span className="text-lg font-bold text-blue-600">$500K</span>
            </div>
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded">
              <span className="font-medium">Year 2</span>
              <span className="text-lg font-bold text-blue-600">$5M</span>
            </div>
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded">
              <span className="font-medium">Year 3</span>
              <span className="text-lg font-bold text-blue-600">$25M</span>
            </div>
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded">
              <span className="font-medium">Year 4</span>
              <span className="text-lg font-bold text-blue-600">$75M</span>
            </div>
            <div className="flex justify-between items-center bg-blue-100 p-3 rounded border-2 border-blue-300">
              <span className="font-medium">Year 5</span>
              <span className="text-xl font-bold text-blue-700">$150M</span>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-2xl font-semibold text-green-600 mb-4">Funding Requirements</h3>
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="font-semibold text-green-800">Series A: $5M</div>
              <div className="text-sm text-gray-700 mt-1">Product development, initial team expansion</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="font-semibold text-blue-800">Series B: $15M</div>
              <div className="text-sm text-gray-700 mt-1">Market expansion, sales team, partnerships</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="font-semibold text-purple-800">Series C: $40M</div>
              <div className="text-sm text-gray-700 mt-1">Global expansion, advanced AI development</div>
            </div>
          </div>
          
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Use of Funds</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 40% Engineering & AI Development</li>
              <li>• 25% Sales & Marketing</li>
              <li>• 20% Clinical Partnerships</li>
              <li>• 10% Regulatory & Compliance</li>
              <li>• 5% Operations & Infrastructure</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </Slide>
);

export default FinancialsSlide; 