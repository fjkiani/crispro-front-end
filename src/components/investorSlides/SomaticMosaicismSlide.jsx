import React from 'react';
import { Slide } from '../common/SlideComponents';
import ApproachItem from './ApproachItem'; // Import the new sub-component
import { AlertTriangle, CheckCircle, Dna, GitMerge, Zap } from 'lucide-react'; // Example icons

const SomaticMosaicismSlide = ({
  headline = "Use Case: Designing for Somatic Mutations & Mosaicism",
  challenge = {
    icon: AlertTriangle,
    text: "Default: Cancer is often driven by somatic mutations; tumors are frequently mosaic (heterogeneous).",
    reference: "Ref: User Transcript 00:45:28, 00:44:32",
    iconColor: 'text-red-600'
  },
  platformApproach = {
    title: "Platform's Approach",
    items: [
      {
        icon: Dna,
        title: "Tumor-Specific Design",
        description: "Focus on CRISPR systems that target somatic mutations unique to cancer cells, maximizing precision.",
        iconColor: 'text-blue-600'
      },
      {
        icon: GitMerge, // Icon representing branching/heterogeneity
        title: "Modeling Mosaicism",
        description: "If variant allele frequency is known, model required editing efficiency and assess resistance risks.",
        iconColor: 'text-green-600'
      },
      {
        icon: Zap, // Or a delivery-related icon
        title: "Delivery Simulation",
        description: "simulate_delivery_system_optimization agent explores strategies for effective delivery to heterogeneous tumor tissues.",
        iconColor: 'text-purple-600'
      }
    ]
  }
}) => {
  return (
    <Slide className="bg-gray-50">
      <div className="max-w-5xl w-full">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-8 text-center">
          {headline}
        </h1>

        {/* Challenge Section */}
        <div className="mb-10 p-6 bg-red-50 border border-red-200 rounded-lg flex items-start gap-4 shadow-md">
          {challenge.icon && <challenge.icon className={`w-10 h-10 ${challenge.iconColor || 'text-red-600'} flex-shrink-0 mt-1`} strokeWidth={1.5}/>}
          <div>
            <p className="text-lg text-red-700 leading-relaxed">{challenge.text}</p>
            {challenge.reference && <p className="text-xs text-red-500 mt-2">{challenge.reference}</p>}
          </div>
        </div>

        {/* Platform's Approach Section */}
        <div>
          <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">{platformApproach.title}</h2>
          <div className="space-y-6">
            {platformApproach.items.map((item, index) => (
              <ApproachItem 
                key={index} 
                icon={item.icon} 
                title={item.title} 
                description={item.description} 
                iconColor={item.iconColor}
              />
            ))}
          </div>
        </div>

      </div>
    </Slide>
  );
};

export default SomaticMosaicismSlide; 