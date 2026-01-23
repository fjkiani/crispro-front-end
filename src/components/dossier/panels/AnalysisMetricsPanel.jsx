import React, { useState } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, Tabs, Tab
} from '@mui/material';
import { 
  BarChart, DynamicFeed
} from '@mui/icons-material';
import { useSpring, animated } from 'react-spring';
import OracleValidationDisplay from '../canisters/OracleValidationDisplay';
import ForgeTherapeuticsDisplay from '../canisters/ForgeTherapeuticsDisplay';
import ScoreGauge from '../canisters/ScoreGauge';
import GauntletTrialsDisplay from '../canisters/GauntletTrialsDisplay';
import TherapeuticBlueprint from '../canisters/TherapeuticBlueprint';
import { pik3caTrinityCampaignConfig } from '../../../config/campaigns/pik3ca_trinity_campaign_config';

const AnimatedGrid = animated(Grid);

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>{children}</Box>}
    </div>
  );
}

export const AnalysisMetricsPanel = ({ results, oracle, forge, gauntlet, dossier, localStep, currentStep }) => {
  const campaignConfig = pik3caTrinityCampaignConfig;
  
  const oracleStage = campaignConfig.acts[0].stages[0];
  const forgeStage = campaignConfig.acts[1].stages[0];
  const gauntletStage = campaignConfig.acts[2].stages[0];

  const getCurrentPhase = () => {
    if (dossier) return 'dossier';
    if (gauntlet) return 'gauntlet';
    if (forge) return 'forge';
    if (oracle) return 'oracle';
    return 'initial';
  };

  const currentPhase = getCurrentPhase();
  
  const getMetrics = () => {
      // This is now less relevant as we drive everything by the campaign steps
      return [
          { title: "Target Validation", status: "PENDING" },
          { title: "Therapeutic Design", status: "PENDING" },
          { title: "In-Silico Trials", status: "PENDING" },
      ];
  }

  // Determine current endpoint index based on localStep and phase
  const getCurrentEndpointIndex = () => {
    if (currentPhase === 'oracle') return localStep;
    if (currentPhase === 'forge') return localStep - oracleStage.endpoints.length;
    // We skipped an endpoint in the UI for forge, so adjust index
    if (currentPhase === 'gauntlet') return localStep - oracleStage.endpoints.length - 2;
    return null;
  };

  const currentEndpointIndex = getCurrentEndpointIndex();

  return (
    <Box sx={{ height: '100%', overflowY: 'auto', p: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600, fontSize: '1.1rem' }}>
        📊 {currentPhase === 'oracle' ? 'Target Validation Metrics' :
             currentPhase === 'forge' ? 'Therapeutic Design Results' :
             currentPhase === 'gauntlet' ? 'Validation Trial Results' :
             currentPhase === 'dossier' ? 'Final Therapeutic Blueprint' :
             'Live Analysis Metrics'}
      </Typography>

      <Box sx={{ mb: 2 }}>
        {currentPhase === 'dossier' ? (
          <TherapeuticBlueprint blueprintData={results.dossier} />
        ) : currentPhase === 'gauntlet' ? (
          <GauntletTrialsDisplay gauntletData={results.gauntlet} currentEndpointIndex={currentEndpointIndex} />
        ) : currentPhase === 'forge' ? (
          <ForgeTherapeuticsDisplay forgeData={results.forge} currentEndpointIndex={currentEndpointIndex} />
        ) : currentPhase === 'oracle' ? (
          <OracleValidationDisplay oracleData={results.oracle} currentEndpointIndex={currentEndpointIndex} />
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4, fontStyle: 'italic' }}>
            Awaiting analysis...
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default AnalysisMetricsPanel;