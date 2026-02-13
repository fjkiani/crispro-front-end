import React from 'react';
import { MESSAGES } from './constants.jsx';

const PatientSelection = ({
    patientIds = [],
    onSelect,
    userEmail,
    isLoading = false
}) => {
    return (
        <div className="p-4 bg-gray-800 rounded-lg shadow-xl border border-gray-700 text-center py-10 max-w-2xl mx-auto mt-10">
            <h2 className="text-2xl font-bold text-gray-200 mb-4">Mutation Explorer</h2>
            <p className="text-xl text-gray-400 mb-8">
                Please select a patient to begin your research session.
            </p>

            <div className="max-w-xs mx-auto">
                <label htmlFor="patient-select" className="block text-sm font-medium text-gray-400 mb-2 text-left">
                    Select Patient ID
                </label>
                <div className="relative">
                    <select
                        id="patient-select"
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none appearance-none transition-all"
                        onChange={(e) => onSelect(e.target.value)}
                        defaultValue=""
                        disabled={isLoading}
                    >
                        <option value="" disabled>-- Choose Patient --</option>
                        <option value="AK" className="font-semibold text-purple-300">
                            Ayesha K. (AK) - Active Session
                        </option>
                        {patientIds.map(pid => (
                            <option key={pid} value={pid}>{pid}</option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                    </div>
                </div>
            </div>

            {(userEmail === 'ak@ak.com' || userEmail === 'ak@aol.com') && (
                <p className="mt-6 text-sm text-green-400/80">
                    * Recognized user <strong>{userEmail}</strong>. <br />
                    Session data for <strong>Ayesha K.</strong> is available.
                </p>
            )}

            <div className="mt-10 p-4 bg-gray-900/50 rounded border border-gray-700/50 text-left">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Research Mode Capabilities:</h4>
                <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
                    <li>Variant functional impact analysis (Evo2)</li>
                    <li>Regulatory & chromatin accessibility insights</li>
                    <li>CRISPR therapeutic guide design (Conceptual)</li>
                    <li>Clinical trial matching & efficacy predictions</li>
                </ul>
            </div>
        </div>
    );
};

export default PatientSelection;
