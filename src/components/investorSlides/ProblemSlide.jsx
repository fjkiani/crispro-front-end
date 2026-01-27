import React from 'react';
import { Slide } from '../common/SlideComponents';
import ChallengeItem from './ChallengeItem';
import { AlertTriangle } from 'lucide-react';

const ProblemSlide = ({ 
  headline = "The Critical Challenge", 
  subHeadline = "Identifying the core issues we address.", 
  problems = [], 
  gapSummary = {
    icon: AlertTriangle,
    title: "The Overwhelming Gap",
    description: "Addressing these gaps is crucial for advancing patient care.",
    iconColor: "text-red-500"
  }
}) => (
  <Slide className="bg-gray-50">
    <div className="max-w-6xl w-full text-center">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
        {headline}
      </h1>
      <p className="text-xl text-gray-600 mb-4">
        {subHeadline}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {problems.map((item, index) => (
          <ChallengeItem 
            key={index} 
            icon={item.icon}
            title={item.title} 
            description={item.description} 
            gap={item.gap} 
            iconColor={item.iconColor}
          />
        ))}
      </div>

      {gapSummary && (
        <div className="mt-12 p-6 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center gap-4">
          {gapSummary.icon && <gapSummary.icon className={`w-10 h-10 ${gapSummary.iconColor || 'text-red-500'}`} />}
          <div className="text-left">
              <h3 className={`text-2xl font-semibold ${gapSummary.iconColor ? gapSummary.iconColor.replace('text-', 'text-').replace('-500', '-700') : 'text-red-700'}`}>{gapSummary.title}</h3>
              <p className={`text-lg ${gapSummary.iconColor ? gapSummary.iconColor.replace('-500', '-600') : 'text-red-600'}`}>{gapSummary.description}</p>
          </div>
        </div>
      )}
    </div>
  </Slide>
);

export default ProblemSlide; 