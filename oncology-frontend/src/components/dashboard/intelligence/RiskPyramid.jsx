import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';

// Mock data will be replaced by props in Phase III
const mockRiskData = [
    { name: 'Critical', value: 150, fill: '#ef4444' },
    { name: 'High', value: 1200, fill: '#f97316' },
    { name: 'Medium', value: 4500, fill: '#facc15' },
    { name: 'Low', value: 4150, fill: '#4ade80' },
];

const RiskPyramid = ({ data = mockRiskData }) => {
    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg" style={{ height: '400px' }}>
            <h2 className="text-xl font-semibold mb-4">Population Risk Stratification</h2>
            <ResponsiveContainer width="100%" height="90%">
                <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                    <XAxis type="number" stroke="#a0aec0" />
                    <YAxis type="category" dataKey="name" stroke="#a0aec0" width={80} />
                    <Tooltip wrapperClassName="bg-gray-700 border-gray-600" cursor={{fill: 'rgba(128, 128, 128, 0.1)'}}/>
                    <Bar dataKey="value" isAnimationActive>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RiskPyramid; 