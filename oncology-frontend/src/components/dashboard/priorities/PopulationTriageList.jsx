import React from 'react';
import TriageListItem from './TriageListItem';

// Mock data will be replaced by props in Phase III
const mockTriageData = [
    { patientId: 'PAT78901', summary: 'Potential treatment resistance detected (AR-V7).', risk: 'Critical' },
    { patientId: 'PAT23456', summary: 'Rapid PSA velocity post-radiation.', risk: 'High' },
    { patientId: 'PAT34567', summary: 'Newly detected TP53 mutation.', risk: 'High' },
    { patientId: 'PAT45678', summary: 'Overdue for follow-up scan.', risk: 'Medium' },
];

const PopulationTriageList = ({ data = mockTriageData }) => {
    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Strategic Priorities</h2>
            <div className="space-y-4">
                {data.map(item => (
                    <TriageListItem key={item.patientId} item={item} />
                ))}
            </div>
        </div>
    );
};

export default PopulationTriageList; 