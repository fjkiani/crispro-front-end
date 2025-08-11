import React from 'react';
import { Slide } from '../common/SlideComponents';
import { CheckSquare, Edit, FlaskConical, Microscope, Settings2, FileQuestion, Users } from 'lucide-react'; // Example icons

const FeatureCardItem = ({ 
  icon: Icon, 
  title, 
  points = [], 
  iconColor = 'text-blue-600',
  bgColor = 'bg-white',
  borderColor = 'border-gray-200'
}) => (
  <div className={`flex flex-col p-6 ${bgColor} shadow-xl rounded-xl border ${borderColor} hover:scale-105 transition-transform duration-300 min-h-[280px]`}>
    <div className="flex items-center mb-4">
      {Icon && <Icon className={`w-10 h-10 ${iconColor} mr-4 flex-shrink-0`} strokeWidth={1.5} />}
      <h3 className="text-xl font-bold text-gray-800 leading-tight">{title}</h3>
    </div>
    <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside pl-2 flex-grow">
      {points.map((point, index) => (
        <li key={index}>{point}</li>
      ))}
    </ul>
  </div>
);

const PlatformFeaturesSlide = ({
  headline = "Platform Capabilities: Key Features",
  features = [
    {
      id: "interpretation",
      icon: Microscope,
      title: "1. Intelligent Variant Interpretation & Prioritization",
      points: [
        "Default: Simulated Evo2 assesses functional impact.",
        "Default: AI Agents rank variants by therapeutic potential."
      ],
      iconColor: 'text-sky-600'
    },
    {
      id: "strategy",
      icon: Edit,
      title: "2. AI-Guided Therapeutic Strategy Selection",
      points: [
        "Default: Agents propose optimal CRISPR approaches (Knockout, HDR, Base/Prime Editing, CRISPRa/i)."
      ],
      iconColor: 'text-green-600'
    },
    {
      id: "design",
      icon: FlaskConical,
      title: "3. End-to-End In Silico CRISPR System Design",
      points: [
        "Default: Guide RNA design & validation (simulated CHOPCHOP).",
        "Default: Protein/RNA structural modeling (simulated AlphaFold).",
        "Default: Repair template design for HDR."
      ],
      iconColor: 'text-purple-600'
    },
    {
      id: "scenario",
      icon: Settings2,
      title: "4. Advanced Scenario Modeling",
      points: [
        "Default: Dedicated workflows for VUS investigation.",
        "Default: Specialized design for somatic mutations & mosaicism.",
        "Default: Simulation of delivery system parameters."
      ],
      iconColor: 'text-amber-600'
    }
  ]
}) => {
  return (
    <Slide className="bg-gradient-to-br from-gray-100 to-blue-50">
      <div className="max-w-6xl w-full">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-12 text-center">
          {headline}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature) => (
            <FeatureCardItem 
              key={feature.id} 
              icon={feature.icon} 
              title={feature.title} 
              points={feature.points} 
              iconColor={feature.iconColor}
              bgColor={feature.bgColor} // Allow individual card styling if needed
              borderColor={feature.borderColor}
            />
          ))}
        </div>
      </div>
    </Slide>
  );
};

export default PlatformFeaturesSlide; 