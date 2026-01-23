import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data will be replaced by props in Phase III
const mockMutationData = [
    { name: 'TP53', value: 2870 },
    { name: 'AR', value: 2134 },
    { name: 'BRCA1', value: 1890 },
    { name: 'PIK3CA', value: 1560 },
    { name: 'KRAS', value: 1240 },
];

const PopulationThreatMatrix = ({ data = mockMutationData }) => {
    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg" style={{ height: '400px' }}>
            <h2 className="text-xl font-semibold mb-4">Population-Wide Threat Matrix</h2>
            <ResponsiveContainer width="100%" height="90%">
                <BarChart data={data} layout="horizontal" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                    <XAxis type="category" dataKey="name" stroke="#a0aec0" />
                    <YAxis type="number" stroke="#a0aec0" />
                    <Tooltip wrapperClassName="bg-gray-700 border-gray-600" cursor={{fill: 'rgba(128, 128, 128, 0.1)'}}/>
                    <Bar dataKey="value" fill="#be185d" isAnimationActive />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PopulationThreatMatrix; 