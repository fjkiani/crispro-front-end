import React from 'react';
import PopulationTriageList from '../priorities/PopulationTriageList';

const PrioritiesColumn = ({ triageData }) => {
  return (
    <div className="space-y-6">
       <PopulationTriageList data={triageData} />
    </div>
  );
};

export default PrioritiesColumn; 