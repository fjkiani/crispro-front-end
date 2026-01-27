import React from 'react';
import PopulationLayout from '../components/dashboard/command/PopulationLayout';
import usePopulationData from '../hooks/usePopulationData';

const DoctorDashboard = () => {
  const { flow, risk, mutations, triage, loading, error } = usePopulationData();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-full mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold">Population Command Center</h1>
          <p className="text-gray-400">A 10,000-foot view of your entire patient cohort.</p>
        </header>

        {loading && <p>Loading Population Data...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {!loading && !error && (
            <PopulationLayout
                flowData={flow}
                riskData={risk}
                mutationData={mutations}
                triageData={triage}
            />
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard; 