import React, { useState } from 'react';

const AdvancedDrawers = ({
    children,
    metastasisData,
    interceptionData,
    cohortData,
    onCohortCheck,
    onInterceptionDesign
}) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="mb-4">
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded w-full flex items-center justify-between transition-colors"
                >
                    <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        Advanced Research Tools (Doctor Access)
                    </span>
                    <svg className={`w-5 h-5 transform transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                <p className="text-xs text-gray-400 mt-2 px-1">
                    Contains Metastasis Assessment, CRISPR Weapon Design, and Cohort Benchmarking.
                </p>
            </div>

            {expanded && (
                <div className="space-y-6 animate-fadeIn">
                    {/* This is a slot for all the heavy research components passed as children or rendered here */}
                    {/* For now, just render children which will be the passed Research-Mode components */}
                    {children}
                </div>
            )}
        </div>
    );
};

export default AdvancedDrawers;
