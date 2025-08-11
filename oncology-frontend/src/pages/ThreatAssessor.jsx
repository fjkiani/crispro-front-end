import React from 'react';
import ToolRunner from '../components/common/ToolRunner';
import { threatAssessorConfig } from '../config/threatAssessorConfig';

const ThreatAssessor = () => {
  return <ToolRunner toolConfig={threatAssessorConfig} />;
};

export default ThreatAssessor; 