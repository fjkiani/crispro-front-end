import React from 'react';
import { Slide } from '../common/SlideComponents';
import RoleSectionItem from './RoleSectionItem'; // Import the new sub-component
import { Info, MessageSquare, Users, FileWarning, GraduationCap } from 'lucide-react'; // Example icons

const DTCTestingLandscapeSlide = ({
  headline = "Use Case: Navigating DTC vs. Clinical Testing Landscape",
  context = {
    icon: Info,
    text: "Default: Users may encounter genetic information from various sources, from non-medical DTC tests to comprehensive clinical WGS.",
    reference: "Ref: User Transcript 00:35:11, 00:35:48",
    iconColor: 'text-sky-600'
  },
  platformRole = {
    title: "Platform's Role (Educational & Preparatory)",
    educationalAgent: {
      icon: GraduationCap, // Icon for education
      title: "'Educational Agent'",
      points: [
        "Explains scope, intent, and limitations of different test types (DTC tests are not for medical diagnosis).",
        "Emphasizes advanced therapeutic design features are for clinically validated variants."
      ],
      iconColor: 'text-green-600'
    },
    clinicalDialogue: {
      icon: MessageSquare,
      title: "Facilitating Clinical Dialogue",
      points: [
        "Helps users/clinicians formulate informed questions if transitioning from DTC findings to clinical investigation and potential therapeutic exploration."
      ],
      iconColor: 'text-purple-600'
    }
  }
}) => {
  return (
    <Slide className="bg-gray-50">
      <div className="max-w-5xl w-full">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-8 text-center">
          {headline}
        </h1>

        {/* Context Section */}
        <div className="mb-10 p-6 bg-sky-50 border border-sky-200 rounded-lg flex items-start gap-4 shadow-md">
          {context.icon && <context.icon className={`w-10 h-10 ${context.iconColor || 'text-sky-600'} flex-shrink-0 mt-1`} strokeWidth={1.5}/>}
          <div>
            <p className="text-lg text-sky-700 leading-relaxed">{context.text}</p>
            {context.reference && <p className="text-xs text-sky-500 mt-2">{context.reference}</p>}
          </div>
        </div>

        {/* Platform's Role Section */}
        <div>
          <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">{platformRole.title}</h2>
          <div className="space-y-8">
            <RoleSectionItem 
              icon={platformRole.educationalAgent.icon} 
              title={platformRole.educationalAgent.title} 
              points={platformRole.educationalAgent.points} 
              iconColor={platformRole.educationalAgent.iconColor}
            />
            <RoleSectionItem 
              icon={platformRole.clinicalDialogue.icon} 
              title={platformRole.clinicalDialogue.title} 
              points={platformRole.clinicalDialogue.points} 
              iconColor={platformRole.clinicalDialogue.iconColor}
            />
          </div>
        </div>

      </div>
    </Slide>
  );
};

export default DTCTestingLandscapeSlide; 