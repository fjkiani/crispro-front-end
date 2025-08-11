import React from 'react';
import { Slide } from '../common/SlideComponents';

const SectionContent = ({ icon: Icon, title, points, iconColor }) => (
  <div className="mb-8 p-6 bg-white shadow-lg rounded-lg border border-gray-200">
    <div className="flex items-center mb-4">
      {Icon && <Icon className={`w-10 h-10 ${iconColor || 'text-indigo-600'} mr-4`} strokeWidth={1.5} />}
      <h2 className="text-2xl font-semibold text-gray-700">{title}</h2>
    </div>
    <ul className="list-disc list-inside text-gray-600 space-y-2 pl-4">
      {points.map((point, index) => (
        <li key={index}>{point}</li>
      ))}
    </ul>
  </div>
);

const ScientificFoundationSlide = ({
  headline = "Scientific Foundation: The Genomic Revolution",
  hgpSection = {
    title: "The Human Genome Project: A Paradigm Shift",
    icon: null, // Placeholder for icon component
    points: [],
    iconColor: 'text-blue-600'
  },
  platformSection = {
    title: "CrisPRO: Built on Proven Science",
    icon: null, // Placeholder for icon component
    points: [],
    iconColor: 'text-green-600'
  }
}) => {
  return (
    <Slide className="bg-gray-100">
      <div className="max-w-5xl w-full text-left">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-12 text-center">
          {headline}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <SectionContent 
            icon={hgpSection.icon} 
            title={hgpSection.title} 
            points={hgpSection.points} 
            iconColor={hgpSection.iconColor}
          />
          <SectionContent 
            icon={platformSection.icon} 
            title={platformSection.title} 
            points={platformSection.points} 
            iconColor={platformSection.iconColor}
          />
        </div>
      </div>
    </Slide>
  );
};

export default ScientificFoundationSlide; 