import React from 'react';
import { Slide } from '../common/SlideComponents';

const MechanismBlock = ({ icon: Icon, title, concept, platformImplication, iconColor }) => (
  <div className="mb- p-6 bg-white shadow-lg rounded-lg border border-gray-200">
    <div className="flex items-center mb-4">
      {Icon && <Icon className={`w-10 h-10 ${iconColor || 'text-indigo-600'} mr-4`} strokeWidth={1.5} />}
      <h3 className="text-2xl font-semibold text-gray-800">{title}</h3>
    </div>
    <div className="space-y-3 text-gray-600 leading-relaxed">
      {/* <p><strong>Concept:</strong> {concept}</p> */}
      <p><strong>Platform Implication:</strong> {platformImplication}</p>
    </div>
  </div>
);

const GeneticMechanismsSlide = ({
  headline = "Understanding Deeper Genetic Mechanisms",
  mechanismA = { title: "Mechanism A", icon: null, concept: "", platformImplication: "", iconColor: 'text-cyan-600' },
  mechanismB = { title: "Mechanism B", icon: null, concept: "", platformImplication: "", iconColor: 'text-lime-600' }
}) => {
  return (
    <Slide className="bg-gray-50">
      <div className="max-w-5xl w-full text-left">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-12 text-center">
          {headline}
        </h1>
        <div className="space-y-8">
          <MechanismBlock {...mechanismA} />
          <MechanismBlock {...mechanismB} />
        </div>
      </div>
    </Slide>
  );
};

export default GeneticMechanismsSlide; 