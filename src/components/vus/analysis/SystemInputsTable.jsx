import React, { useState } from 'react';

const SystemInputsTable = ({ provenance, profile, inputs }) => {
    const [expanded, setExpanded] = useState(false);

    // Mock inputs if strictly not provided, but ideally passed from parent
    // The provenance object might contain some inputs.

    // For Ayesha mode, we want a clean table of "What we used"
    // Ideally this data comes from the `result.provenance.inputs_used` if available, 
    // or we construct it from the profile data.

    return (
        <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden mb-6">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none hover:bg-gray-100 transition-colors"
            >
                <div>
                    <h3 className="text-sm font-bold text-gray-700">System Inputs & Provenance</h3>
                    <div className="text-xs text-gray-500 mt-1">
                        Profile: <span className="font-medium text-gray-900">{profile || 'Baseline'}</span> •
                        Source: {provenance?.source || 'Internal'}
                    </div>
                </div>
                <svg className={`w-5 h-5 text-gray-400 transform transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {expanded && (
                <div className="border-t border-gray-200 px-6 py-4 bg-white">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-3 py-2 text-left">Input</th>
                                <th className="px-3 py-2 text-left">Status</th>
                                <th className="px-3 py-2 text-left">Value Used</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {/* Example Row - to be dynamic later */}
                            <tr>
                                <td className="px-3 py-3 text-gray-900 font-medium">Genomic Variant</td>
                                <td className="px-3 py-3 text-green-600 font-bold text-xs"><span className="bg-green-100 px-2 py-1 rounded">Present</span></td>
                                <td className="px-3 py-3 text-gray-600 font-mono text-xs">chr7:140xxx</td>
                            </tr>
                            {/* Add more rows based on props */}
                        </tbody>
                    </table>
                    <div className="mt-4 text-xs text-gray-400">
                        Analysis Run ID: <span className="font-mono">{provenance?.run_id || provenance?.analysis_id || 'N/A'}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SystemInputsTable;
