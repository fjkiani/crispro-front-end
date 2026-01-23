import React from 'react';

export const Slide = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`w-full h-full flex flex-col items-center justify-center p-4 md:p-6 lg:p-8 relative overflow-hidden ${className}`}
  >
    {children}
  </div>
);

export const StatCard = ({ number, label, icon: Icon, color = "blue" }) => (
  <div className={`bg-${color}-50 border border-${color}-200 rounded-lg p-6 text-center`}>
    <Icon className={`w-8 h-8 text-${color}-600 mx-auto mb-3`} />
    <div className={`text-3xl font-bold text-${color}-600 mb-2`}>{number}</div>
    <div className="text-gray-700">{label}</div>
  </div>
); 