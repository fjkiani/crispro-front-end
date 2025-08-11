import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const VerdictPanel = ({ result }) => {
    if (!result) return null;

    const isBullshit = result.verdict === 'MINIMAL';
    const verdictText = isBullshit ? `VERDICT: FUCKING BULLSHIT (SCORE: ${result.inhibition_score})` : `VERDICT: ${result.verdict} (SCORE: ${result.inhibition_score})`;
    const color = isBullshit ? 'error.main' : 'success.main';

    return (
        <Paper sx={{ mt: 3, p: 2, backgroundColor: '#fff0f0', border: `2px solid ${color}` }}>
            <Typography variant="h5" sx={{ color: color, fontWeight: 'bold', textAlign: 'center' }}>
                {verdictText}
            </Typography>
        </Paper>
    );
};

export default VerdictPanel; 
 
 
 
 
 
 
 
import { Box, Typography, Paper } from '@mui/material';

const VerdictPanel = ({ result }) => {
    if (!result) return null;

    const isBullshit = result.verdict === 'MINIMAL';
    const verdictText = isBullshit ? `VERDICT: FUCKING BULLSHIT (SCORE: ${result.inhibition_score})` : `VERDICT: ${result.verdict} (SCORE: ${result.inhibition_score})`;
    const color = isBullshit ? 'error.main' : 'success.main';

    return (
        <Paper sx={{ mt: 3, p: 2, backgroundColor: '#fff0f0', border: `2px solid ${color}` }}>
            <Typography variant="h5" sx={{ color: color, fontWeight: 'bold', textAlign: 'center' }}>
                {verdictText}
            </Typography>
        </Paper>
    );
};

export default VerdictPanel; 
 
 
 
 
 
 
 
import { Box, Typography, Paper } from '@mui/material';

const VerdictPanel = ({ result }) => {
    if (!result) return null;

    const isBullshit = result.verdict === 'MINIMAL';
    const verdictText = isBullshit ? `VERDICT: FUCKING BULLSHIT (SCORE: ${result.inhibition_score})` : `VERDICT: ${result.verdict} (SCORE: ${result.inhibition_score})`;
    const color = isBullshit ? 'error.main' : 'success.main';

    return (
        <Paper sx={{ mt: 3, p: 2, backgroundColor: '#fff0f0', border: `2px solid ${color}` }}>
            <Typography variant="h5" sx={{ color: color, fontWeight: 'bold', textAlign: 'center' }}>
                {verdictText}
            </Typography>
        </Paper>
    );
};

export default VerdictPanel; 
 
 
 
 
 
 
 
import { Box, Typography, Paper } from '@mui/material';

const VerdictPanel = ({ result }) => {
    if (!result) return null;

    const isBullshit = result.verdict === 'MINIMAL';
    const verdictText = isBullshit ? `VERDICT: FUCKING BULLSHIT (SCORE: ${result.inhibition_score})` : `VERDICT: ${result.verdict} (SCORE: ${result.inhibition_score})`;
    const color = isBullshit ? 'error.main' : 'success.main';

    return (
        <Paper sx={{ mt: 3, p: 2, backgroundColor: '#fff0f0', border: `2px solid ${color}` }}>
            <Typography variant="h5" sx={{ color: color, fontWeight: 'bold', textAlign: 'center' }}>
                {verdictText}
            </Typography>
        </Paper>
    );
};

export default VerdictPanel; 
 
 
 
 
 
 
 