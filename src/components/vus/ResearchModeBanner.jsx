import React from 'react';
import { RESEARCH_MODE_CONFIG, DEFAULT_CLASSES } from './constants.jsx';

const ResearchModeBanner = ({ 
    focus = RESEARCH_MODE_CONFIG.focus,
    features = RESEARCH_MODE_CONFIG.features,
    disclaimer = RESEARCH_MODE_CONFIG.disclaimer,
    className = DEFAULT_CLASSES.banner
}) => {
    return (
        <div className={className}>
            <p className="text-sm text-gray-300">
                Focus: {focus}
            </p>
            <ul className="mt-2 text-xs text-gray-400 list-disc list-inside space-y-1">
                {features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                ))}
            </ul>
            <p className="mt-2 text-[11px] text-gray-500 italic">
                {disclaimer}
            </p>
        </div>
    );
};

export default ResearchModeBanner;
