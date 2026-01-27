import React from 'react';
import PopulationFunnel from '../intelligence/PopulationFunnel';
import RiskPyramid from '../intelligence/RiskPyramid';
import PopulationThreatMatrix from '../intelligence/PopulationThreatMatrix';

const TrendsColumn = ({ flowData, riskData, mutationData }) => {
  return (
    <div className="space-y-6">
      <PopulationFunnel data={flowData} />
      <RiskPyramid data={riskData} />
      <PopulationThreatMatrix data={mutationData} />
    </div>
  );
};

export default TrendsColumn; 