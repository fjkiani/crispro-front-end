import React from 'react';
import ToolRunner from '../components/common/ToolRunner';
import { proteinSynthesisConfig } from '../config/toolconfigs';

const ProteinSynthesis = () => {
  return <ToolRunner toolConfig={proteinSynthesisConfig} />;
};

export default ProteinSynthesis;