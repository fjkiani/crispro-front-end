import React, { useState, useMemo } from 'react';

const RESPONSE_LABELS = {
  sensitive: 'Sensitive',
  resistant: 'Resistant',
  refractory: 'Refractory',
  unknown: 'Unknown',
};

const RESPONSE_COLORS = {
  sensitive: 'text-green-400',
  resistant: 'text-red-400',
  refractory: 'text-yellow-400',
  unknown: 'text-gray-400',
};

/**
 * Patient Table Component
 * Displays searchable, filterable patient data table
 */
export const PatientTable = ({ mergedData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResponse, setSelectedResponse] = useState('All');
  const [minMutations, setMinMutations] = useState(0);

  const filteredData = useMemo(() => {
    if (!mergedData || !Array.isArray(mergedData)) return [];

    return mergedData.filter(patient => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const sampleId = (patient.tcga_sample_id || patient.sample_id || '').toLowerCase();
        const patientId = (patient.patient_id || '').toLowerCase();
        if (!sampleId.includes(searchLower) && !patientId.includes(searchLower)) {
          return false;
        }
      }

      // Response filter
      if (selectedResponse !== 'All') {
        const patientResponse = RESPONSE_LABELS[patient.platinum_response] || patient.platinum_response;
        if (patientResponse !== selectedResponse) {
          return false;
        }
      }

      // Mutation count filter
      const mutationCount = Array.isArray(patient.mutations) ? patient.mutations.length : 0;
      if (mutationCount < minMutations) {
        return false;
      }

      return true;
    });
  }, [mergedData, searchTerm, selectedResponse, minMutations]);

  if (!mergedData || !Array.isArray(mergedData) || mergedData.length === 0) {
    return (
      <div className="p-4 rounded-lg border border-gray-700 bg-gray-800">
        <p className="text-sm text-gray-400">No patient data to display.</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-200 mb-3">📋 Patient Data Table</h3>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Search by ID</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="TCGA sample ID or patient ID..."
            className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600 text-sm"
          />
        </div>
        
        <div>
          <label className="block text-xs text-gray-400 mb-1">Filter by Platinum Response</label>
          <select
            value={selectedResponse}
            onChange={(e) => setSelectedResponse(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600 text-sm"
          >
            <option value="All">All</option>
            {Object.values(RESPONSE_LABELS).map(label => (
              <option key={label} value={label}>{label}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-xs text-gray-400 mb-1">Min. Mutation Count</label>
          <input
            type="number"
            value={minMutations}
            onChange={(e) => setMinMutations(Number(e.target.value) || 0)}
            min="0"
            className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600 text-sm"
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-400 mb-2">
        Showing {filteredData.length} of {mergedData.length} patients
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-800">
        <table className="w-full text-sm text-gray-300">
          <thead className="bg-gray-700">
            <tr>
              <th className="text-left p-3 border-b border-gray-600">TCGA Sample ID</th>
              <th className="text-left p-3 border-b border-gray-600">Patient ID</th>
              <th className="text-left p-3 border-b border-gray-600">Platinum Response</th>
              <th className="text-left p-3 border-b border-gray-600">Response Value</th>
              <th className="text-left p-3 border-b border-gray-600">Cancer Type</th>
              <th className="text-right p-3 border-b border-gray-600">Mutation Count</th>
              <th className="text-right p-3 border-b border-gray-600">OS (Months)</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((patient, idx) => {
              const response = patient.platinum_response || 'unknown';
              const responseLabel = RESPONSE_LABELS[response] || response;
              const responseColor = RESPONSE_COLORS[response] || RESPONSE_COLORS.unknown;
              const mutationCount = Array.isArray(patient.mutations) ? patient.mutations.length : 0;
              
              return (
                <tr key={idx} className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="p-3">{patient.tcga_sample_id || patient.sample_id || '-'}</td>
                  <td className="p-3">{patient.patient_id || '-'}</td>
                  <td className={`p-3 ${responseColor} font-semibold`}>{responseLabel}</td>
                  <td className="p-3 text-gray-400">{patient.response_value || '-'}</td>
                  <td className="p-3">{patient.cancer_type || '-'}</td>
                  <td className="p-3 text-right">{mutationCount}</td>
                  <td className="p-3 text-right">{patient.overall_survival_months || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};


