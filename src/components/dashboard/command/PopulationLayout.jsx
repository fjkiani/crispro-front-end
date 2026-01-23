import React from 'react';
import OverviewColumn from './OverviewColumn';
import TrendsColumn from './TrendsColumn';
import PrioritiesColumn from './PrioritiesColumn';

const PopulationLayout = ({ flowData, riskData, mutationData, triageData }) => {
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-3">
        <OverviewColumn />
      </div>
      <div className="col-span-12 lg:col-span-6">
        <TrendsColumn flowData={flowData} riskData={riskData} mutationData={mutationData} />
      </div>
      <div className="col-span-12 lg:col-span-3">
        <PrioritiesColumn triageData={triageData} />
      </div>
    </div>
  );
};

export default PopulationLayout; 