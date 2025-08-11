

import ToolRunner from '../components/common/ToolRunner';
import { structurePredictorConfig } from '../config/toolconfigs';

const StructurePredictor = () => {
  return <ToolRunner toolConfig={structurePredictorConfig} />;
};

export default StructurePredictor; 