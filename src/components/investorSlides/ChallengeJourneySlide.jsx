import React from 'react';
import { Slide } from '../common/SlideComponents';
import ChallengeItem from './ChallengeItem'; // Reusable for bottlenecks
import { Zap, PackageOpen, AlertOctagon, Settings, Users, TestTube2, BrainCircuit, Dna } from 'lucide-react'; // Example icons

const ChallengeJourneySlide = ({
  headline = "The Challenge: Journey from Test to Therapy",
  geneticDeluge = {
    title: "The Genetic Data Deluge",
    icon: PackageOpen,
    points: [
      "Default: Rise of WGS, clinical panels, DTC tests.",
      "Default: Massive data, slow translation."
    ]
  },
  bottlenecks = {
    title: "Key Bottlenecks",
    items: [
      {
        icon: AlertOctagon,
        title: "Default: Variant Interpretation",
        description: "Difficulty in assessing clinical significance (VUS).",
        gap: "Actionable VUS insights", // Example, can be tailored or removed if not using ChallengeItem's gap
        iconColor: 'text-red-600'
      },
      // Add more default bottlenecks if needed
    ]
  },
  biologicalComplexities = {
    title: "Biological Complexities",
    icon: Settings,
    points: [
      "Default: Somatic mutations, genetic mosaicism (cancer).",
      "Default: Heterogeneous diseases."
    ]
  }
}) => {
  return (
    <Slide className="bg-gray-50">
      <div className="max-w-6xl w-full">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 text-center">
          {headline}
        </h1>

        {/* Genetic Data Deluge Section */}
        <div className="mb-4 p-6 bg-white shadow-lg rounded-lg border border-gray-200">
          <div className="flex items-center mb-4">
            {geneticDeluge.icon && <geneticDeluge.icon className="w-10 h-10 text-blue-600 mr-4" />}
            <h2 className="text-3xl font-semibold text-blue-700">{geneticDeluge.title}</h2>
          </div>
          <ul className="list-disc list-inside text-gray-700 space-y-2 pl-4">
            {geneticDeluge.points.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>

        {/* Key Bottlenecks Section */}
        <div className="mb-8 p-6 bg-white shadow-lg rounded-lg border border-gray-200">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">{bottlenecks.title}</h2>
          <div className={`grid grid-cols-1 md:grid-cols-${bottlenecks.items.length > 1 ? '2' : '1'} lg:grid-cols-${bottlenecks.items.length > 2 ? '3' : bottlenecks.items.length} gap-6`}>
            {bottlenecks.items.map((item, index) => (
              <ChallengeItem
                key={index}
                icon={item.icon}
                title={item.title}
                description={item.description}
                gap={item.gap} // ChallengeItem expects a gap prop
                iconColor={item.iconColor || 'text-orange-500'}
              />
            ))}
          </div>
        </div>

        {/* Biological Complexities Section */}
        <div className="p-6 bg-white shadow-lg rounded-lg border border-gray-200">
          <div className="flex items-center mb-4">
            {biologicalComplexities.icon && <biologicalComplexities.icon className="w-10 h-10 text-purple-600 mr-4" />}
            <h2 className="text-3xl font-semibold text-purple-700">{biologicalComplexities.title}</h2>
          </div>
          <ul className="list-disc list-inside text-gray-700 space-y-2 pl-4">
            {biologicalComplexities.points.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>

      </div>
    </Slide>
  );
};

export default ChallengeJourneySlide;