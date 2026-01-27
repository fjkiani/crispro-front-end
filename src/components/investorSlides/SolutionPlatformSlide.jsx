import React from 'react';
import { Slide } from '../common/SlideComponents';
import { Lightbulb, Target as TargetIcon, Database, BrainCircuit, CheckSquare, BookOpen } from 'lucide-react'; // Example icons

const CorePrincipleItem = ({ icon: Icon, title, details, iconColor = 'text-indigo-600' }) => (
  <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
    <div className="flex items-center mb-3">
      {Icon && <Icon className={`w-8 h-8 ${iconColor} mr-3`} strokeWidth={1.5}/>}
      <h4 className="text-xl font-semibold text-gray-800">{title}</h4>
    </div>
    {details && <p className="text-gray-600 text-sm leading-relaxed">{details}</p>}
  </div>
);

const SolutionPlatformSlide = ({
  headline = "CrisPRO Therapeutic Design Assistant",
  introduction = "Default: An intelligent, AI-powered assistant to navigate complexities from genetic findings to therapeutic concepts.",
  vision = {
    icon: TargetIcon,
    text: "Default: To dramatically accelerate the design and in silico validation of CRISPR-based therapies.",
    iconColor: "text-green-600"
  },
  corePrinciple = {
    title: "Core Principle: Seamless Integration of:",
    items: [
      {
        icon: BrainCircuit,
        title: "Default: Advanced Biological Simulations",
        details: "(mimicking Evo2 for variant impact & AlphaFold for structural biology)",
        iconColor: 'text-blue-600'
      },
      {
        icon: Lightbulb,
        title: "Default: Intelligent AI Agents",
        details: "Workflow guidance and optimization.",
        iconColor: 'text-yellow-500'
      },
      {
        icon: BookOpen,
        title: "Default: Comprehensive Knowledge Base",
        details: "Evolving and up-to-date.",
        iconColor: 'text-purple-600'
      }
    ]
  },
  technicalNote = "Default: Core simulation logic resides in ai_research_assistant.py"
}) => {
  return (
    <Slide className="bg-gray-50">
      <div className="max-w-5xl w-full text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
          {headline}
        </h1>
        <p className="text-lg text-gray-700 mb-8 leading-relaxed">
          {introduction}
        </p>

        {vision && (
          <div className="mb-10 p-6 bg-green-50 border border-green-200 rounded-lg inline-flex items-center gap-3 shadow-md">
            {vision.icon && <vision.icon className={`w-10 h-10 ${vision.iconColor || 'text-green-600'} flex-shrink-0`} strokeWidth={1.5}/>}
            <p className="text-xl font-semibold text-green-700 text-left">{vision.text}</p>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">{corePrinciple.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {corePrinciple.items.map((item, index) => (
              <CorePrincipleItem 
                key={index} 
                icon={item.icon} 
                title={item.title} 
                details={item.details} 
                iconColor={item.iconColor}
              />
            ))}
          </div>
        </div>
        
        {technicalNote && (
          <p className="text-sm text-gray-500 mt-10 italic">
            {technicalNote}
          </p>
        )}
      </div>
    </Slide>
  );
};

export default SolutionPlatformSlide; 