import React from 'react';

const SpokeNode = ({ title, icon: Icon, description, iconColor = 'text-indigo-600', bgColor = 'bg-white', borderColor = 'border-gray-200' }) => (
  <div className={`flex flex-col items-center text-center p-4 ${bgColor} shadow-lg rounded-xl border ${borderColor} hover:shadow-xl transition-shadow duration-300 w-48 min-h-[150px]`}>
    {Icon && <Icon className={`w-10 h-10 mb-3 ${iconColor}`} strokeWidth={1.5} />}
    <h4 className="text-md font-semibold text-gray-800 mb-1">{title}</h4>
    {description && <p className="text-xs text-gray-600 leading-snug">{description}</p>}
  </div>
);

export default SpokeNode; 