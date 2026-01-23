import React from 'react';
import { FunnelChart, Funnel, Tooltip, LabelList, Cell, ResponsiveContainer } from 'recharts';

// Mock data will be replaced by props in Phase III
const mockPopulationData = [
  { name: 'Screening', value: 10000, fill: '#8884d8' },
  { name: 'Diagnosis', value: 8234, fill: '#83a6ed' },
  { name: 'Active Treatment', value: 6512, fill: '#8dd1e1' },
  { name: 'Monitoring', value: 4321, fill: '#82ca9d' },
  { name: 'Remission', value: 2123, fill: '#a4de6c' },
];

const PopulationFunnel = ({ data = mockPopulationData }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg" style={{ height: '400px' }}>
      <h2 className="text-xl font-semibold mb-4">Patient Population Funnel</h2>
      <ResponsiveContainer width="100%" height="90%">
        <FunnelChart>
          <Tooltip wrapperClassName="bg-gray-700 border-gray-600" />
          <Funnel dataKey="value" data={data} isAnimationActive>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
            <LabelList position="right" fill="#fff" stroke="none" dataKey="name" />
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PopulationFunnel; 