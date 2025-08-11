import React from 'react';
import { Slide } from '../common/SlideComponents';
import BenefitItem from './BenefitItem'; // Import the new sub-component
import { Rocket, DollarSign, Zap, Users, Lightbulb, Target as TargetIcon } from 'lucide-react'; // Example icons

const BenefitsSlide = ({
  headline = "Benefits of the CRISPR Therapeutic Design Assistant",
  benefits = [
    {
      icon: Rocket,
      title: "Accelerated Discovery",
      description: "Rapidly translate genetic findings into concrete therapeutic concepts.",
      iconColor: 'text-blue-600'
    },
    {
      icon: DollarSign,
      title: "Reduced R&D Costs & Time",
      description: "Early in silico validation de-risks projects, minimizing costly wet-lab failures.",
      iconColor: 'text-green-600'
    },
    {
      icon: Zap, // Or a more precision-related icon like 'Focus' or 'Crosshair' if available
      title: "Enhanced Design Precision",
      description: "Create potentially more effective and safer CRISPR systems via multi-parameter optimization.",
      iconColor: 'text-purple-600'
    },
    {
      icon: Users,
      title: "Democratized Access",
      description: "Make advanced in silico therapeutic design capabilities more accessible to researchers.",
      iconColor: 'text-teal-600'
    },
    {
      icon: Lightbulb,
      title: "Powerful Hypothesis Generation",
      description: "Particularly for VUS, complex disorders, and novel therapeutic approaches.",
      iconColor: 'text-orange-500'
    },
    {
      icon: TargetIcon,
      title: "Improved Target Selection",
      description: "Data-driven prioritization of genetic targets for therapeutic intervention.",
      iconColor: 'text-red-500'
    }
  ]
}) => {
  return (
    <Slide className="bg-gradient-to-br from-green-50 to-teal-50">
      <div className="max-w-6xl w-full">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-12 text-center">
          {headline}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <BenefitItem 
              key={index} 
              icon={benefit.icon} 
              title={benefit.title} 
              description={benefit.description} 
              iconColor={benefit.iconColor}
            />
          ))}
        </div>
      </div>
    </Slide>
  );
};

export default BenefitsSlide; 