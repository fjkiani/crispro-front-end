import React, { useState } from 'react';
import { Box, Typography, Paper, Collapse, Button, Divider } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import MechanismChips from '../MechanismChips';
import AyeshaSAEFeaturesCard from '../AyeshaSAEFeaturesCard';
import HintTilesPanel from '../HintTilesPanel';

const AdvancedDrawers = ({
    mechanismMap,
    saeFeatures,
    hintTiles,
}) => {
    const [expanded, setExpanded] = useState(false);

    // If no data to show, don't render anything
    if (!mechanismMap && !saeFeatures && (!hintTiles || hintTiles.length === 0)) {
        return null;
    }

    return (
        <Box mt={4} mb={4}>
            <Divider sx={{ mb: 2 }}>
                <Button
                    onClick={() => setExpanded(!expanded)}
                    endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    sx={{
                        textTransform: 'none',
                        color: 'text.secondary',
                        fontSize: '0.875rem'
                    }}
                >
                    {expanded ? 'Hide Advanced Intelligence' : 'Show Advanced Intelligence (Research Use)'}
                </Button>
            </Divider>

            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                    {/* Hint Tiles (Secondary Clues) */}
                    {hintTiles && hintTiles.length > 0 && (
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Clinical Hints & Signals
                            </Typography>
                            <HintTilesPanel tiles={hintTiles} />
                        </Box>
                    )}

                    {/* Mechanism Map (Complex Network) */}
                    {mechanismMap && (
                        <Paper sx={{ p: 2, bgcolor: 'background.paper' }} variant="outlined">
                            <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', fontWeight: 600 }}>
                                🧬 Pathway Mechanism Map (Detailed)
                            </Typography>
                            <MechanismChips mechanism_map={mechanismMap} />
                        </Paper>
                    )}

                    {/* Raw SAE Features (Data Table) */}
                    {saeFeatures && saeFeatures.status !== 'awaiting_ngs' && (
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Raw Feature Analysis
                            </Typography>
                            <AyeshaSAEFeaturesCard sae_features={saeFeatures} />
                        </Box>
                    )}

                </Box>
            </Collapse>
        </Box>
    );
};

export default AdvancedDrawers;
