import React from 'react';

// Helper function to format dates
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return dateString;
        }
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (error) {
        console.warn("Error formatting date:", dateString, error);
        return dateString;
    }
};

const RenderIncludedInfo = ({ relatedInfo }) => {
    if (!relatedInfo || Object.keys(relatedInfo).length === 0) {
        return <p className="text-xs italic text-gray-500 mt-2">No specific data sections were included by the initiator.</p>;
    }

    return (
        <div className="space-y-3 mt-2">
            {Object.entries(relatedInfo).map(([key, data]) => {
                if (!data || (Array.isArray(data) && data.length === 0)) {
                    return (
                        <div key={key} className="mb-2 pb-2 border-b last:border-b-0">
                            <h4 className="text-sm font-semibold text-gray-700 mb-1">{key}</h4>
                            <p className="text-xs text-gray-500 italic pl-2">None included or available.</p>
                        </div>
                    );
                }

                return (
                    <div key={key} className="mb-2 pb-2 border-b last:border-b-0">
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">{key}</h4>
                        <div className="pl-2 text-xs space-y-1">
                            {key === 'Recent Labs' && Array.isArray(data) && data.map((panel, pIndex) => (
                                <div key={`panel-${pIndex}`} className="mb-1">
                                    <p className="font-medium text-gray-600">{panel.panelName || 'Lab Panel'} ({formatDate(panel.resultDate)})</p>
                                    <ul className="list-disc list-inside ml-2">
                                        {panel.components?.map((comp, cIndex) => (
                                            <li key={`comp-${cIndex}`}>
                                                {comp.test}: {comp.value} {comp.unit} {comp.flag && comp.flag !== 'Normal' ? <span className='text-red-600 font-semibold'>({comp.flag})</span> : ''}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}

                            {key === 'Current Treatments/Medications' && Array.isArray(data) && data.map((med, mIndex) => (
                                <p key={`med-${mIndex}`}>{med.name} {med.dosage} - {med.frequency}</p>
                            ))}

                            {key === 'Medical History' && Array.isArray(data) && data.map((item, hIndex) => (
                                <p key={`hist-${hIndex}`}>
                                    {typeof item === 'string' ? item :
                                        (item.condition ? `${item.condition} (Diagnosed: ${formatDate(item.diagnosisDate)})` : JSON.stringify(item))}
                                </p>
                            ))}

                            {key === 'Recent Notes' && Array.isArray(data) && data.map((note, nIndex) => (
                                <div key={`note-${nIndex}`} className="border-t first:border-t-0 pt-1 mt-1">
                                    <p className="font-medium text-gray-600">{formatDate(note.date)} - {note.author || note.author}</p>
                                    <p className="italic text-gray-700 whitespace-pre-wrap">"{note.content || note.text || 'No content.'}"</p>
                                </div>
                            ))}

                            {key === 'Diagnosis' && typeof data === 'object' && data !== null && (
                                <div>
                                    <p><strong>Primary:</strong> {data.primary || data.condition || 'N/A'}</p>
                                    <p><strong>Date:</strong> {formatDate(data.diagnosedDate || data.diagnosisDate)}</p>
                                    <p><strong>Status:</strong> {data.status || 'N/A'}</p>
                                </div>
                            )}

                            {!['Recent Labs', 'Current Treatments/Medications', 'Medical History', 'Recent Notes', 'Diagnosis'].includes(key) && (
                                <pre className="text-xs whitespace-pre-wrap bg-gray-100 p-1 rounded">{JSON.stringify(data, null, 1)}</pre>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default RenderIncludedInfo;
export { formatDate };
