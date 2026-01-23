import React from 'react';

const TechnologyPillarItem = ({ 
  icon: Icon, 
  title,
  description, 
  details = [], 
  iconColor = 'text-indigo-700', 
  bgColor = 'bg-white',
  borderColor = 'border-gray-300'
}) => (
  <div className={`flex flex-col p-6 ${bgColor} shadow-xl rounded-lg border ${borderColor} hover:shadow-2xl transition-all duration-300`}>
    <div className="flex items-center mb-4">
      {Icon && <Icon className={`w-12 h-12 ${iconColor} mr-4 flex-shrink-0`} strokeWidth={1.5} />}
      <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
    </div>
    <p className="text-gray-700 mb-4 leading-relaxed">{description}</p>
    {details.length > 0 && (
      <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside pl-2 border-t border-dashed pt-3 mt-auto">
        {details.map((point, index) => (
          <li key={index}>{point}</li>
        ))}
      </ul>
    )}
  </div>
);

export default TechnologyPillarItem; 