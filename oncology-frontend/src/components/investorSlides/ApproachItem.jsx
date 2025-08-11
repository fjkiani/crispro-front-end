import React from 'react';

const ApproachItem = ({ icon: Icon, title, description, iconColor = 'text-blue-600' }) => (
  <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
    <div className="flex items-start mb-3">
      {Icon && <Icon className={`w-8 h-8 ${iconColor} mr-4 mt-1 flex-shrink-0`} strokeWidth={1.5} />}
      <div>
        <h4 className="text-xl font-semibold text-gray-800">{title}</h4>
      </div>
    </div>
    <p className="text-gray-600 text-sm leading-relaxed ml-12">{description}</p>
  </div>
);

export default ApproachItem; 