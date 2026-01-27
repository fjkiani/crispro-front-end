import React from 'react';
import { Slide } from '../common/SlideComponents';

const ComplexityItem = ({ icon: Icon, title, description, iconColor }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 flex flex-col h-full">
    <div className="flex items-center mb-3">
      {Icon && <Icon className={`w-10 h-10 ${iconColor || 'text-indigo-600'} mr-3`} strokeWidth={1.5} />}
      <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
    </div>
    <p className="text-gray-600 text-sm leading-relaxed flex-grow">{description}</p>
  </div>
);

const GenomicComplexitySlide = ({
  headline = "Navigating the Nuances of the Genome",
  complexities = [], // Expects an array of { icon, title, description, iconColor }
}) => {
  return (
    <Slide className="bg-gray-50">
      <div className="max-w-5xl w-full text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-12">
          {headline}
        </h1>
        {complexities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {complexities.map((item, index) => (
              <ComplexityItem 
                key={index} 
                icon={item.icon} 
                title={item.title}
                description={item.description}
                iconColor={item.iconColor}
              />
            ))}
          </div>
        ) : (
          <p className="text-xl text-gray-500">No complexity items provided.</p>
        )}
      </div>
    </Slide>
  );
};

export default GenomicComplexitySlide; 