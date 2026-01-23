import React from 'react';

/**
 * Hero Metrics Component
 * Displays key statistics as hero metric cards
 */
export const HeroMetrics = ({ stats }) => {
  if (!stats) return null;

  const metrics = [
    { label: "Jr2 Patients (Platinum Response)", value: stats.jr2_total_patients || 0, color: "text-blue-400" },
    { label: "Zo Patients (Mutations)", value: stats.zo_total_patients || 0, color: "text-green-400" },
    { label: "Overlapping Patients", value: stats.overlap_patients || 0, color: "text-yellow-400" },
    { label: "Zo Patients with Mutations", value: stats.zo_patients_with_mutations || 0, color: "text-purple-400" },
  ];

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-200 mb-3">📊 Key Metrics</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <div key={idx} className="p-4 rounded-lg border border-gray-700 bg-gray-800">
            <div className="text-sm text-gray-400 mb-1">{metric.label}</div>
            <div className={`text-2xl font-bold ${metric.color}`}>
              {metric.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


