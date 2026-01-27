import React from 'react';
import { Slide } from '../common/SlideComponents';

const DifferentiatorsSlide = ({
  headline = "Default Differentiators Headline",
  differentiators = [],
}) => (
  <Slide className="bg-slate-50">
    <div className="container mx-auto px-6 py-12 text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-12">{headline}</h1>
      <div className="grid md:grid-cols-2 gap-8 items-stretch">
        {differentiators.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-lg shadow-xl border border-gray-200 flex flex-col">
              <div className="flex items-center mb-4">
                {IconComponent && <IconComponent className={`w-10 h-10 ${item.iconColor || 'text-indigo-600'} mr-4`} />}
                <h3 className="text-2xl font-semibold text-gray-700 text-left">{item.title}</h3>
              </div>
              <p className="text-gray-600 text-left mb-3 text-sm">{item.description}</p>
              <div className="mt-auto">
                <p className="text-gray-500 text-left mb-1 text-xs italic"><span className="font-semibold">Impact:</span> {item.impact}</p>
                <p className="text-green-700 text-left text-xs font-semibold"><span className="font-bold">Investor Value:</span> {item.investorValue}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </Slide>
);

export default DifferentiatorsSlide; 