import React, { useMemo } from 'react';

// Try to import recharts, fallback to simple visualization if not available
let rechartsAvailable = false;
let PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer;
try {
  const recharts = require('recharts');
  PieChart = recharts.PieChart;
  Pie = recharts.Pie;
  Cell = recharts.Cell;
  BarChart = recharts.BarChart;
  Bar = recharts.Bar;
  XAxis = recharts.XAxis;
  YAxis = recharts.YAxis;
  CartesianGrid = recharts.CartesianGrid;
  Tooltip = recharts.Tooltip;
  Legend = recharts.Legend;
  ResponsiveContainer = recharts.ResponsiveContainer;
  rechartsAvailable = true;
} catch (e) {
  // recharts not available, will use simple HTML/CSS visualization
}

const RESPONSE_COLORS = {
  sensitive: '#28a745',
  resistant: '#dc3545',
  refractory: '#ffc107',
  unknown: '#6c757d',
};

const RESPONSE_LABELS = {
  sensitive: 'Sensitive',
  resistant: 'Resistant',
  refractory: 'Refractory',
  unknown: 'Unknown',
};

/**
 * Response Distribution Charts Component
 * Visualizes platinum response distribution using pie and bar charts
 */
export const ResponseCharts = ({ stats, jr2Data }) => {
  const responseData = useMemo(() => {
    const dist = stats?.jr2_response_distribution || {};
    return Object.entries(dist).map(([key, value]) => ({
      response: key,
      label: RESPONSE_LABELS[key] || key,
      count: value,
      color: RESPONSE_COLORS[key] || RESPONSE_COLORS.unknown,
    }));
  }, [stats]);

  if (!responseData.length) {
    return (
      <div className="p-4 rounded-lg border border-gray-700 bg-gray-800">
        <p className="text-sm text-gray-400">No platinum response data available.</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-200 mb-3">📈 Platinum Response Distribution (Jr2 Dataset)</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Pie Chart */}
        <div className="p-4 rounded-lg border border-gray-700 bg-gray-800">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Overall Distribution</h4>
          {rechartsAvailable ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={responseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ label, percent }) => `${label}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {responseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-sm text-gray-400 p-4">
              <p className="mb-2">Install recharts for interactive charts:</p>
              <code className="block p-2 bg-gray-700 rounded">npm install recharts</code>
              <div className="mt-4 space-y-2">
                {responseData.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: entry.color }} />
                    <span className="text-gray-300">{entry.label}: {entry.count} ({(entry.count / responseData.reduce((sum, e) => sum + e.count, 0) * 100).toFixed(1)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bar Chart */}
        <div className="p-4 rounded-lg border border-gray-700 bg-gray-800">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Response Counts</h4>
          {rechartsAvailable ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={responseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="label" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: '#f3f4f6' }} />
                <Bar dataKey="count" fill="#8884d8">
                  {responseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="space-y-2">
              {responseData.map((entry, idx) => {
                const maxCount = Math.max(...responseData.map(e => e.count));
                const widthPercent = (entry.count / maxCount) * 100;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-sm text-gray-300">
                      <span>{entry.label}</span>
                      <span>{entry.count}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-4">
                      <div
                        className="h-4 rounded-full transition-all"
                        style={{ width: `${widthPercent}%`, backgroundColor: entry.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Raw Data Table */}
      <div className="p-4 rounded-lg border border-gray-700 bg-gray-800">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">Raw Response Counts</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-300">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-2">Response Type</th>
                <th className="text-right p-2">Count</th>
              </tr>
            </thead>
            <tbody>
              {responseData.map((row, idx) => (
                <tr key={idx} className="border-b border-gray-700">
                  <td className="p-2">{row.label}</td>
                  <td className="text-right p-2">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

