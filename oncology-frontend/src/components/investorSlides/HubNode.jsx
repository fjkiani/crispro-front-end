import React from 'react';

const HubNode = ({ title, icon: Icon, description, iconJsx }) => (
  <div className="flex flex-col items-center text-center p-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-2xl w-64 h-64 justify-center border-4 border-white">
    {Icon && <Icon className="w-16 h-16 text-white mb-3" strokeWidth={1.5} />}
    {iconJsx && <div className="mb-3 text-white">{iconJsx}</div>}
    <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
    {description && <p className="text-sm text-blue-100 leading-tight">{description}</p>}
  </div>
);

export default HubNode; 