import React from 'react';

/**
 * Research Use Only (RUO) Label
 * Displays prominent disclaimer for research-mode capabilities
 */
export default function RUOLabel({ className = '' }) {
  return (
    <div className={`bg-amber-900/30 border border-amber-600 rounded-lg p-4 ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-400 mb-1">
            RESEARCH USE ONLY (RUO)
          </p>
          <p className="text-xs text-amber-300/90">
            This platform is for research purposes only. Outputs are not validated for clinical use and should not inform patient care decisions.
          </p>
        </div>
      </div>
    </div>
  );
}


