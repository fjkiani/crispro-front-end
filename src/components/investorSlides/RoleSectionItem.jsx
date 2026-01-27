import React from 'react';

const RoleSectionItem = ({ icon: Icon, title, points = [], iconColor = 'text-blue-600' }) => (
  <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
    <div className="flex items-center mb-4">
      {Icon && <Icon className={`w-10 h-10 ${iconColor} mr-4 flex-shrink-0`} strokeWidth={1.5} />}
      <h4 className="text-2xl font-semibold text-gray-800">{title}</h4>
    </div>
    <ul className="space-y-2 text-gray-700 list-disc list-inside pl-6">
      {points.map((point, index) => (
        <li key={index} className="text-sm leading-relaxed">{point}</li>
      ))}
    </ul>
  </div>
);

export default RoleSectionItem; 