import React from 'react';
import { Slide } from '../common/SlideComponents';
import TechnologyPillarItem from './TechnologyPillarItem'; // Import the new sub-component
import { Atom, Brain, Cpu, Layers, Shuffle } from 'lucide-react'; // Example icons

const PowerTrioSlide = ({
  headline = "The Power Trio: Simulated Evo2, AlphaFold & AI Agents",
  pillars = [
    {
      icon: Atom, // Represents sequence/function focus of Evo2
      title: "Simulated Evo2",
      description: "Interpreting variant effects on function, generating novel therapeutic components, and proposing strategies based on genetic defects.",
      details: [
        "Interpreting variant effects on function.",
        "Generating novel therapeutic components (e.g., optimized Cas variants).",
        "Proposing therapeutic strategies based on genetic defects."
      ],
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      icon: Layers, // Represents structure/interaction focus of AlphaFold
      title: "Simulated AlphaFold",
      description: "Assessing structural impact of variants, validating CRISPR component structures, and predicting molecular interactions.",
      details: [
        "Assessing structural impact of genetic variants on proteins.",
        "Validating 3D structural integrity of ALL designed CRISPR components and complexes.",
        "Predicting how engineered therapeutic molecules will interact."
      ],
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      icon: Cpu, // Represents orchestration/intelligence of AI Agents
      title: "AI Agents",
      description: "Driving data interpretation, workflow guidance, component optimization, and risk/feasibility assessment.",
      details: [
        "Data Interpretation: Understanding complex genetic findings.",
        "Workflow Guidance: Steering users from variant to in silico validated design.",
        "Component Optimization: Iteratively refining designs.",
        "Risk/Feasibility Assessment: Synthesizing data into actionable insights."
      ],
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ],
  synergy = {
    icon: Shuffle, // Represents components working in concert
    text: "Default: These components work in concert, driven by core logic (e.g., ai_research_assistant.py), to provide comprehensive design and analysis.",
    iconColor: 'text-indigo-600'
  }
}) => {
  return (
    <Slide className="bg-gray-100">
      <div className="max-w-6xl w-full">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-10 text-center">
          {headline}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {pillars.map((pillar, index) => (
            <TechnologyPillarItem 
              key={index} 
              icon={pillar.icon} 
              title={pillar.title} 
              description={pillar.description}
              details={pillar.details} 
              iconColor={pillar.iconColor}
              bgColor={pillar.bgColor}
              borderColor={pillar.borderColor}
            />
          ))}
        </div>

        {synergy && (
          <div className="mt-10 p-6 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center gap-4 shadow-lg">
            {synergy.icon && <synergy.icon className={`w-12 h-12 ${synergy.iconColor || 'text-indigo-600'} flex-shrink-0`} strokeWidth={1.5}/>}
            <p className="text-lg text-indigo-700 leading-relaxed">{synergy.text}</p>
          </div>
        )}

      </div>
    </Slide>
  );
};

export default PowerTrioSlide; 