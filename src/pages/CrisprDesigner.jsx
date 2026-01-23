import React from 'react';
import ToolRunner from '../components/common/ToolRunner';
import { crisprDesignerConfig } from '../config/toolconfigs';

const CrisprDesigner = () => {
  return <ToolRunner toolConfig={crisprDesignerConfig} />;
};

export default CrisprDesigner;

