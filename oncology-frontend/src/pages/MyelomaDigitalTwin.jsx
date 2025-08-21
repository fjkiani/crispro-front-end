import React, { useState } from 'react';
import ToolRunner from '../components/common/ToolRunner';
import { myelomaTwinConfig } from '../config/toolconfigs';
import LiveJobBanner from '../components/myeloma/LiveJobBanner';
import VariantInputList from '../components/myeloma/VariantInputList';
import { Box } from '@mui/material';

const MyelomaDigitalTwin = () => {
  const [mutations, setMutations] = useState([]);
  return (
    <Box sx={{ p: 2 }}>
      <LiveJobBanner />
      <VariantInputList value={mutations} onChange={setMutations} />
      <ToolRunner toolConfig={myelomaTwinConfig} />
    </Box>
  );
};

export default MyelomaDigitalTwin; 