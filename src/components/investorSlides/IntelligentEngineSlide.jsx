import React from 'react';
import { Slide } from '../common/SlideComponents';

const IntelligentEngineSlide = ({
  headline = "Default Headline",
  subHeadline = "Default SubHeadline",
  input = { title: "Input", icon: null, items: [] },
  coreEngine = { title: "Core Engine", icon: null, components: [] },
  output = { title: "Output", icon: null, items: [] },
}) => {
  const InputIcon = input.icon;
  const CoreEngineIcon = coreEngine.icon;
  const OutputIcon = output.icon;

  return (
    <Slide className="bg-gray-100">
      <div className="container mx-auto px-6 py-12 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">{headline}</h1>
        <p className="text-xl text-gray-600 mb-12">{subHeadline}</p>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {/* Input Section */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            {InputIcon && <InputIcon className="w-12 h-12 mx-auto text-blue-500 mb-4" />}
            <h3 className="text-2xl font-semibold text-gray-700 mb-3">{input.title}</h3>
            <ul className="list-disc list-inside text-left text-gray-600 space-y-1">
              {input.items.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
          </div>

          {/* Core Engine Section */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            {CoreEngineIcon && <CoreEngineIcon className="w-12 h-12 mx-auto text-green-500 mb-4" />}
            <h3 className="text-2xl font-semibold text-gray-700 mb-3">{coreEngine.title}</h3>
            <div className="space-y-3 text-left">
              {coreEngine.components.map((component, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded">
                  <h4 className="font-semibold text-gray-700">{component.name}</h4>
                  <p className="text-sm text-gray-600">{component.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Output Section */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            {OutputIcon && <OutputIcon className="w-12 h-12 mx-auto text-purple-500 mb-4" />}
            <h3 className="text-2xl font-semibold text-gray-700 mb-3">{output.title}</h3>
            <ul className="list-disc list-inside text-left text-gray-600 space-y-1">
              {output.items.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </Slide>
  );
};

export default IntelligentEngineSlide; 