import React from 'react';
import { Link } from 'react-router-dom';

const TriageListItem = ({ item }) => {
    const { patientId, summary, risk } = item;

    const riskColor = {
        'Critical': 'bg-red-500',
        'High': 'bg-orange-500',
        'Medium': 'bg-yellow-500',
    };

    return (
        <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex justify-between items-center">
                <span className="font-bold text-lg">{patientId}</span>
                <span className={`px-2 py-1 text-xs font-bold rounded-full ${riskColor[risk] || 'bg-gray-500'}`}>
                    {risk}
                </span>
            </div>
            <p className="text-sm text-gray-300 mt-2">{summary}</p>
            <Link to={`/medical-records/${patientId}`} className="text-sm text-blue-400 hover:underline mt-3 block text-right">
                View Record &rarr;
            </Link>
        </div>
    );
};

export default TriageListItem; 