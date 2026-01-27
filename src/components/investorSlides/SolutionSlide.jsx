import React from 'react';
import { Slide } from '../common/SlideComponents';
import HubNode from './HubNode';
import SpokeNode from './SpokeNode';
import { Zap, ClipboardList, Cpu, Users, FlaskConical, Workflow as WorkflowIcon, CheckCircle2 } from 'lucide-react';

const SolutionSlide = ({
  headline = "CrisPRO: The Intelligent Co-Pilot",
  subHeadline = "A unified platform for smarter, faster, and more compassionate care.",
  hub = {
    iconJsx: <div className="text-5xl">🧬</div>,
    title: "CrisPRO Oncology Co-Pilot",
    description: "AI-Powered Platform"
  },
  spokes = [],
  coreValues = [
    { text: "Default: Actionable Intelligence", icon: CheckCircle2, color: "text-blue-600" },
    { text: "Default: Streamlined Workflows", icon: CheckCircle2, color: "text-green-600" },
    { text: "Default: Empowered Patients", icon: CheckCircle2, color: "text-purple-600" }
  ]
}) => (
  <Slide className="bg-gradient-to-br from-gray-50 to-slate-100">
    <div className="w-full max-w-5xl flex flex-col items-center">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 text-center">
        {headline}
      </h1>
      <p className="text-xl text-gray-600 mb-10 text-center">
        {subHeadline}
      </p>

      <div className="relative flex items-center justify-center w-full mb-6" style={{ minHeight: '360px' }}>
        {/* Hub Node - Centered */}
        {hub && (
          <div className="absolute z-6">
            <HubNode 
              // iconJsx={hub.iconJsx} 
              title={hub.title} 
              description={hub.description} 
              icon={hub.icon}
            />
          </div>
        )}

        {/* Spoke Nodes - Positioned around the hub */}
        {/* This is a simplified positioning. For perfect circular or dynamic positioning, SVG or a canvas-based approach would be better. */}
        {spokes.length > 0 && (
          <>
            {/* Spoke 1 (Top-Left) */}
            {spokes[0] && 
              <div className="absolute left-[10%] top-[5%]">
                <SpokeNode {...spokes[0]} />
              </div>
            }
            {/* Spoke 2 (Top-Right) */}
            {spokes[1] &&
              <div className="absolute right-[10%] top-[5%]">
                <SpokeNode {...spokes[1]} />
              </div>
            }
            {/* Spoke 3 (Bottom-Left) */}
            {spokes[2] &&
              <div className="absolute left-[5%] bottom-[5%]">
                <SpokeNode {...spokes[2]} />
              </div>
            }
            {/* Spoke 4 (Bottom-Right) */}
            {spokes[3] &&
              <div className="absolute right-[5%] bottom-[5%]">
                <SpokeNode {...spokes[3]} />
              </div>
            }
            {/* Spoke 5 (Directly Below) */}
            {spokes[4] && 
                <div className="absolute bottom-[-60px] left-1/2 transform -translate-x-1/2">
                    <SpokeNode {...spokes[4]} />
                </div>
            }
          </>
        )}
      </div>

      {/* Core Value Propositions */}
      {coreValues.length > 0 && (
        <div className="w-full mt-12 md:mt-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">Core Value Proposition</h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            {coreValues.map((prop, index) => (
              <div key={index} className="flex items-start p-4 bg-white shadow-md rounded-lg border border-gray-200">
                {prop.icon && <prop.icon className={`w-6 h-6 ${prop.color || 'text-gray-600'} mr-3 mt-1 flex-shrink-0`} />}
                <p className="text-gray-700 leading-relaxed">{prop.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </Slide>
);

export default SolutionSlide; 