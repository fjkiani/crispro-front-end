import React from 'react';

/**
 * Overlap Analysis Component
 * Displays dataset overlap metrics and visualization
 */
export const OverlapAnalysis = ({ overlapData }) => {
  if (!overlapData) return null;

  const {
    jr2_total = 0,
    zo_total = 0,
    overlap_count = 0,
    match_rate_jr2 = 0,
    match_rate_zo = 0,
    jr2_only = 0,
    zo_only = 0,
  } = overlapData;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-200 mb-3">🤝 Dataset Overlap</h3>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="p-4 rounded-lg border border-gray-700 bg-gray-800">
          <div className="text-sm text-gray-400 mb-1">Jr2's Dataset</div>
          <div className="text-2xl font-bold text-blue-400">{jr2_total.toLocaleString()} patients</div>
          <div className="text-xs text-gray-500 mt-1">{match_rate_jr2.toFixed(1)}% matched</div>
        </div>
        
        <div className="p-4 rounded-lg border border-gray-700 bg-gray-800">
          <div className="text-sm text-gray-400 mb-1">Overlap</div>
          <div className="text-2xl font-bold text-yellow-400">{overlap_count.toLocaleString()} patients</div>
          <div className={`text-xs mt-1 ${overlap_count >= 40 ? 'text-green-400' : 'text-red-400'}`}>
            {overlap_count >= 40 ? '✅ Exceeds threshold' : `⚠️ ${40 - overlap_count} needed`}
          </div>
        </div>
        
        <div className="p-4 rounded-lg border border-gray-700 bg-gray-800">
          <div className="text-sm text-gray-400 mb-1">Zo's Dataset</div>
          <div className="text-2xl font-bold text-green-400">{zo_total.toLocaleString()} patients</div>
          <div className="text-xs text-gray-500 mt-1">{match_rate_zo.toFixed(1)}% matched</div>
        </div>
      </div>

      {/* Venn Diagram (Text-based for now) */}
      <div className="p-4 rounded-lg border border-gray-700 bg-gray-800">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">🔗 Dataset Overlap Visualization</h4>
        <div className="grid grid-cols-3 gap-4 text-sm text-gray-300">
          <div className="text-center p-3 rounded bg-blue-900/30 border border-blue-700">
            <div className="text-xs text-gray-400 mb-1">Jr2 Only</div>
            <div className="text-xl font-bold text-blue-400">{jr2_only.toLocaleString()}</div>
          </div>
          <div className="text-center p-3 rounded bg-yellow-900/30 border border-yellow-700">
            <div className="text-xs text-gray-400 mb-1">Overlap</div>
            <div className="text-xl font-bold text-yellow-400">{overlap_count.toLocaleString()}</div>
          </div>
          <div className="text-center p-3 rounded bg-green-900/30 border border-green-700">
            <div className="text-xs text-gray-400 mb-1">Zo Only</div>
            <div className="text-xl font-bold text-green-400">{zo_only.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Match Rate Breakdown */}
      <div className="mt-4 p-4 rounded-lg border border-gray-700 bg-gray-800">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">📊 Match Rate Analysis</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-300">
          <div className="p-2 rounded bg-gray-700/50">
            <strong>Jr2's Dataset Match Rate:</strong> {match_rate_jr2.toFixed(1)}% of {jr2_total.toLocaleString()} patients overlap with Zo's dataset.
          </div>
          <div className="p-2 rounded bg-gray-700/50">
            <strong>Zo's Dataset Match Rate:</strong> {match_rate_zo.toFixed(1)}% of {zo_total.toLocaleString()} patients overlap with Jr2's dataset.
          </div>
        </div>
      </div>
    </div>
  );
};


