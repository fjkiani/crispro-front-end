import React from 'react';
import { Slide } from '../common/SlideComponents';

const SectionBlock = ({ icon: Icon, title, points, text, scenario, platformUse, highDepthNote, liquidBiopsyNote, iconColor, children }) => (
  <div className="mb-8 p-6 bg-white shadow-lg rounded-lg border border-gray-200">
    <div className="flex items-center mb-4">
      {Icon && <Icon className={`w-10 h-10 ${iconColor || 'text-indigo-600'} mr-4`} strokeWidth={1.5} />}
      <h2 className="text-2xl font-semibold text-gray-700">{title}</h2>
    </div>
    {text && <p className="text-gray-600 mb-3 leading-relaxed">{text}</p>}
    {scenario && <p className="text-gray-600 italic mb-3 leading-relaxed">{scenario}</p>}
    {points && points.length > 0 && (
      <ul className="list-disc list-inside text-gray-600 space-y-2 mb-3 leading-relaxed pl-4">
        {points.map((point, index) => (
          <li key={index}>{point}</li>
        ))}
      </ul>
    )}
    {platformUse && (
      <div className="ml-4 mt-2">
        <h4 className="text-lg font-medium text-gray-700 mb-1">{platformUse.title}</h4>
        <ul className="list-disc list-inside text-gray-600 space-y-1 leading-relaxed pl-4">
          {platformUse.points.map((point, index) => (
            <li key={index}>{point}</li>
          ))}
        </ul>
      </div>
    )}
    {children} {/* For platformStrength points and sub-points if needed */}
    {highDepthNote && <p className="text-sm text-gray-500 mt-3 leading-relaxed"><em>Note on High Read Depth:</em> {highDepthNote}</p>}
    {liquidBiopsyNote && <p className="text-sm text-gray-500 mt-2 leading-relaxed"><em>Liquid Biopsy (Future):</em> {liquidBiopsyNote}</p>}
  </div>
);

const DualRoleCancerSlide = ({
  headline = "Cancer Genetics: Dual Platform Roles",
  spectrumIntro = { title: "Cancer's Genetic Spectrum", icon: null, points: [], iconColor: 'text-gray-700' },
  roleA = { title: "Role A", icon: null, scenario: "", platformUse: { title: "Platform Use:", points: [] }, iconColor: 'text-purple-600' },
  roleB = { title: "Role B", icon: null, scenario: "", platformStrength: { title: "Platform Strength:", points: [] }, highDepthNote: "", liquidBiopsyNote: "", iconColor: 'text-red-600' }
}) => {
  return (
    <Slide className="bg-gray-50">
      <div className="max-w-6xl w-full text-left">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-10 text-center">
          {headline}
        </h1>
        
        <SectionBlock 
          icon={spectrumIntro.icon}
          title={spectrumIntro.title}
          points={spectrumIntro.points}
          iconColor={spectrumIntro.iconColor}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <SectionBlock 
            icon={roleA.icon}
            title={roleA.title}
            scenario={roleA.scenario}
            platformUse={roleA.platformUse}
            iconColor={roleA.iconColor}
          />
          <SectionBlock 
            icon={roleB.icon}
            title={roleB.title}
            scenario={roleB.scenario}
            highDepthNote={roleB.highDepthNote}
            liquidBiopsyNote={roleB.liquidBiopsyNote}
            iconColor={roleB.iconColor}
          >
            {roleB.platformStrength && (
              <div className="mt-2">
                <h4 className="text-lg font-medium text-gray-700 mb-1">{roleB.platformStrength.title}</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1 leading-relaxed pl-4">
                  {roleB.platformStrength.points.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            )}
          </SectionBlock>
        </div>

      </div>
    </Slide>
  );
};

export default DualRoleCancerSlide; 