import React from 'react';

const ChallengeItem = ({ icon: Icon, title, description, gap, iconColor = 'text-red-500' }) => (
  <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center text-center border border-gray-200 hover:shadow-xl transition-shadow duration-300">
    {Icon && <Icon className={`w-12 h-12 mb-4 ${iconColor}`} strokeWidth={1.5} />}
    <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm mb-3 leading-relaxed">{description}</p>
    {gap && (
      <div className="mt-auto pt-3 border-t border-dashed border-gray-300 w-full">
        <p className="text-sm text-indigo-600 font-medium">
          <span className="font-semibold text-gray-500">The Gap:</span> {gap}
        </p>
      </div>
    )}
  </div>
);

export default ChallengeItem; 