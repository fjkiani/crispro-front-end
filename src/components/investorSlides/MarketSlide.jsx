import React from 'react';
import { Slide, StatCard } from '../common/SlideComponents';
import { Globe, TrendingUp, Users } from 'lucide-react';

const MarketSlide = () => (
  <Slide>
    <div className="max-w-4xl w-full">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Massive Market Opportunity</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          number="$458B" 
          label="Global Cancer Care Market" 
          icon={Globe}
          color="blue"
        />
        <StatCard 
          number="$28B" 
          label="AI in Healthcare Market" 
          icon={TrendingUp}
          color="green"
        />
        <StatCard 
          number="19.3M" 
          label="Annual Cancer Cases (US)" 
          icon={Users}
          color="purple"
        />
      </div>
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-blue-800 mb-3">Key Growth Drivers</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Rising cancer incidence and survival rates</li>
            <li>• Increasing adoption of precision medicine</li>
            <li>• Growing genomic testing and biomarker discovery</li>
            <li>• AI/ML integration in clinical workflows</li>
          </ul>
        </div>
      </div>
    </div>
  </Slide>
);

export default MarketSlide; 