import React from 'react';
import ToolRunner from '../components/common/ToolRunner';
import { myelomaTwinConfig } from '../config/toolconfigs';

const MyelomaDigitalTwin = () => {
  return <ToolRunner toolConfig={myelomaTwinConfig} />;
};

export default MyelomaDigitalTwin; 