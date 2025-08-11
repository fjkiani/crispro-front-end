import React from 'react';
import ToolRunner from '../components/common/ToolRunner';
import { hypothesisValidatorConfig } from '../config/toolconfigs';

const HypothesisValidator = () => {
  return <ToolRunner toolConfig={hypothesisValidatorConfig} />;
};

export default HypothesisValidator;