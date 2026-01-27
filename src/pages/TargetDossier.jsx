
import ToolRunner from '../components/common/ToolRunner';
import { targetDossierConfig } from '../config/toolconfigs';

const TargetDossier = () => {
  return <ToolRunner toolConfig={targetDossierConfig} />;
};

export default TargetDossier; 