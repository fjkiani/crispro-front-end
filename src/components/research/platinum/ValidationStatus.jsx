import React from 'react';

const MIN_REQUIRED = 40;

/**
 * Validation Status Component
 * Displays validation readiness status with statistical power analysis
 */
export const ValidationStatus = ({ stats, overlapData }) => {
  if (!overlapData) return null;

  const overlap_count = overlapData.overlap_count || 0;
  const is_ready = overlap_count >= MIN_REQUIRED;

  // Calculate progress percentage
  const progress = Math.min((overlap_count / MIN_REQUIRED) * 100, 100);

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-200 mb-3">✅ Validation Readiness Status</h3>
      
      {/* Status Card */}
      <div className={`p-4 rounded-lg border-2 ${is_ready ? 'border-green-600 bg-green-900/20' : 'border-red-600 bg-red-900/20'} mb-4`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{is_ready ? '✅' : '❌'}</span>
          <span className={`text-xl font-bold ${is_ready ? 'text-green-400' : 'text-red-400'}`}>
            {is_ready ? 'READY FOR VALIDATION' : 'INSUFFICIENT SAMPLE SIZE'}
          </span>
        </div>
        <p className="text-sm text-gray-300">
          <strong>Current Overlap:</strong> {overlap_count} patients. <strong>Minimum Required:</strong> {MIN_REQUIRED} patients for robust statistical testing.
        </p>
      </div>

      {/* Progress Gauge */}
      <div className="p-4 rounded-lg border border-gray-700 bg-gray-800 mb-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">📊 Sample Size Analysis</h4>
        <div className="relative w-full h-8 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`absolute top-0 left-0 h-full transition-all duration-500 ${
              is_ready ? 'bg-green-600' : 'bg-red-600'
            }`}
            style={{ width: `${progress}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-100">
            {overlap_count} / {MIN_REQUIRED} ({progress.toFixed(1)}%)
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-400">
          Threshold: {MIN_REQUIRED} patients (minimum for Chi-square validation)
        </div>
      </div>

      {/* Manager's Criteria Review */}
      <div className="p-4 rounded-lg border border-gray-700 bg-gray-800">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">📝 Manager's Criteria Review</h4>
        <div className="text-sm text-gray-300 space-y-2">
          <p>
            <strong>Manager's Requirement:</strong> ≥{MIN_REQUIRED} patients for Chi-square validation.
          </p>
          <p>
            <strong>Current Status:</strong> We have <strong>{overlap_count}</strong> overlapping patients.
          </p>
          <p>
            <strong>Conclusion:</strong> This <strong>{is_ready ? 'exceeds' : 'does not meet'}</strong> the manager's criteria.
          </p>
          {is_ready ? (
            <div className="mt-3 p-3 rounded bg-green-900/30 border border-green-700">
              <p className="text-green-300">🎉 The sample size is sufficient for robust statistical validation. Proceed with Phase 2: Statistical Testing.</p>
            </div>
          ) : (
            <div className="mt-3 p-3 rounded bg-red-900/30 border border-red-700">
              <p className="text-red-300">🚧 The sample size is currently insufficient. Consider further data extraction or alternative validation strategies.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


