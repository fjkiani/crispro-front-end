import React from 'react';

const BenefitItem = ({ icon: Icon, title, description, iconColor = 'text-green-600' }) => (
  <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center">
    {Icon && <Icon className={`w-12 h-12 ${iconColor} mb-4`} strokeWidth={1.5} />}
    <h4 className="text-lg font-semibold text-gray-800 mb-2">{title}</h4>
    {description && <p className="text-sm text-gray-600 leading-relaxed">{description}</p>}
  </div>
);

export default BenefitItem; 