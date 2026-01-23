import React from 'react';
import { Slide } from '../common/SlideComponents';

const ContentSection = ({ icon: Icon, title, text, points, iconColor, alignment = 'text-left' }) => (
  <div className={`bg-white p-6 rounded-lg shadow-lg border border-gray-200 flex flex-col h-full ${alignment}`}>
    <div className={`flex items-center mb-4 ${alignment === 'text-center' ? 'justify-center' : ''}`}>
      {Icon && <Icon className={`w-10 h-10 ${iconColor || 'text-indigo-600'} mr-3`} strokeWidth={1.5} />}
      <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
    </div>
    {text && <p className="text-gray-600 leading-relaxed mb-4">{text}</p>}
    {points && points.length > 0 && (
      <ul className="list-disc list-inside text-gray-600 space-y-2 leading-relaxed">
        {points.map((point, index) => (
          <li key={index}>{point}</li>
        ))}
      </ul>
    )}
  </div>
);

const GenotypePhenotypeSlide = ({
  headline = "Bridging the Genotype-Phenotype Gap",
  challengeSection = {
    title: "The Challenge",
    icon: null,
    text: "Challenge description here.",
    iconColor: 'text-red-600'
  },
  solutionSection = {
    title: "CrisPRO's Approach",
    icon: null,
    points: [],
    iconColor: 'text-green-600'
  }
}) => {
  return (
    <Slide className="bg-gray-100">
      <div className="max-w-6xl w-full">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-16 text-center">
          {headline}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <ContentSection 
            icon={challengeSection.icon} 
            title={challengeSection.title} 
            text={challengeSection.text} 
            iconColor={challengeSection.iconColor}
          />
          <ContentSection 
            icon={solutionSection.icon} 
            title={solutionSection.title} 
            points={solutionSection.points} 
            iconColor={solutionSection.iconColor}
          />
        </div>
      </div>
    </Slide>
  );
};

export default GenotypePhenotypeSlide; 