/**
 * TumorSettingsPanel
 *
 * Left panel: Simulation inputs + gene toggles + ScenarioExplainer.
 * Extracted from ResistanceLab.jsx for independent scaling.
 *
 * Props:
 *   params — current simulation params
 *   setParams — setter
 *   onGeneToggle(gene, isMutated)
 */
import React from 'react';
import { Box } from '@mui/material';
import { Science as ScienceIcon } from '@mui/icons-material';
import SimulationControls from './SimulationControls';
import GeneToggle from '../GeneToggle';
import ScenarioExplainer from './ScenarioExplainer';
import { PanelWrapper, PanelHeader, PanelContent } from './LabStyles';
import { Typography } from '@mui/material';

const TumorSettingsPanel = ({ params, setParams, onGeneToggle }) => {
    return (
        <PanelWrapper>
            <PanelHeader>
                <ScienceIcon />
                <Typography>Your Tumor Settings</Typography>
            </PanelHeader>
            <PanelContent>
                <SimulationControls params={params} setParams={setParams} />
                <Box sx={{ mt: 3 }}>
                    <GeneToggle
                        genes={{
                            'NF1': params.gene_toggles?.['NF1'] || false,
                            'BRCA1': params.gene_toggles?.['BRCA1'] || false,
                            'TP53': params.gene_toggles?.['TP53'] || false,
                            'PTEN': params.gene_toggles?.['PTEN'] || false,
                        }}
                        onToggle={onGeneToggle}
                    />
                </Box>
                <ScenarioExplainer />
            </PanelContent>
        </PanelWrapper>
    );
};

export default TumorSettingsPanel;
