import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';

const ScoreCard = ({ title, score, color }) => (
    <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="subtitle1" color="text.secondary">{title}</Typography>
        <Typography variant="h4" sx={{ color: color, fontWeight: 'bold' }}>
            {score ? score.toFixed(4) : 'N/A'}
        </Typography>
    </Paper>
);

const FinalDossier = ({ dossierData }) => {
    const { enemyScoreResult, maxImpactScoreResult, forgedWeaponResult } = dossierData;

    return (
        <Box sx={{ p: 2, mt: 2, backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>The Receipt: Final Verdict</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <ScoreCard title="Enemy Weapon Score" score={enemyScoreResult?.zeta_score} color="error.main" />
                </Grid>
                <Grid item xs={12} md={4}>
                    <ScoreCard title="Our Forged Weapon" score={forgedWeaponResult?.best_zeta_score} color="success.main" />
                </Grid>
                <Grid item xs={12} md={4}>
                    <ScoreCard title="Max Possible Impact" score={maxImpactScoreResult?.zeta_score} color="info.main" />
                </Grid>
            </Grid>
            <Box sx={{ mt: 3, p: 2, backgroundColor: 'white', borderRadius: '4px' }}>
                 <Typography variant="h6">Forged Weapon Details:</Typography>
                 <Typography variant="body1" sx={{ fontFamily: 'monospace', wordBreak: 'break-all', mt: 1 }}>
                     DNA: {forgedWeaponResult?.best_candidate_dna_sequence}
                 </Typography>
                 <Typography variant="body1" sx={{ fontFamily: 'monospace', wordBreak: 'break-all', mt: 1 }}>
                     Protein: {forgedWeaponResult?.forged_protein_sequence}
                 </Typography>
            </Box>
        </Box>
    );
};

export default FinalDossier; 
import { Box, Typography, Paper, Grid } from '@mui/material';

const ScoreCard = ({ title, score, color }) => (
    <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="subtitle1" color="text.secondary">{title}</Typography>
        <Typography variant="h4" sx={{ color: color, fontWeight: 'bold' }}>
            {score ? score.toFixed(4) : 'N/A'}
        </Typography>
    </Paper>
);

const FinalDossier = ({ dossierData }) => {
    const { enemyScoreResult, maxImpactScoreResult, forgedWeaponResult } = dossierData;

    return (
        <Box sx={{ p: 2, mt: 2, backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>The Receipt: Final Verdict</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <ScoreCard title="Enemy Weapon Score" score={enemyScoreResult?.zeta_score} color="error.main" />
                </Grid>
                <Grid item xs={12} md={4}>
                    <ScoreCard title="Our Forged Weapon" score={forgedWeaponResult?.best_zeta_score} color="success.main" />
                </Grid>
                <Grid item xs={12} md={4}>
                    <ScoreCard title="Max Possible Impact" score={maxImpactScoreResult?.zeta_score} color="info.main" />
                </Grid>
            </Grid>
            <Box sx={{ mt: 3, p: 2, backgroundColor: 'white', borderRadius: '4px' }}>
                 <Typography variant="h6">Forged Weapon Details:</Typography>
                 <Typography variant="body1" sx={{ fontFamily: 'monospace', wordBreak: 'break-all', mt: 1 }}>
                     DNA: {forgedWeaponResult?.best_candidate_dna_sequence}
                 </Typography>
                 <Typography variant="body1" sx={{ fontFamily: 'monospace', wordBreak: 'break-all', mt: 1 }}>
                     Protein: {forgedWeaponResult?.forged_protein_sequence}
                 </Typography>
            </Box>
        </Box>
    );
};

export default FinalDossier; 
import { Box, Typography, Paper, Grid } from '@mui/material';

const ScoreCard = ({ title, score, color }) => (
    <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="subtitle1" color="text.secondary">{title}</Typography>
        <Typography variant="h4" sx={{ color: color, fontWeight: 'bold' }}>
            {score ? score.toFixed(4) : 'N/A'}
        </Typography>
    </Paper>
);

const FinalDossier = ({ dossierData }) => {
    const { enemyScoreResult, maxImpactScoreResult, forgedWeaponResult } = dossierData;

    return (
        <Box sx={{ p: 2, mt: 2, backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>The Receipt: Final Verdict</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <ScoreCard title="Enemy Weapon Score" score={enemyScoreResult?.zeta_score} color="error.main" />
                </Grid>
                <Grid item xs={12} md={4}>
                    <ScoreCard title="Our Forged Weapon" score={forgedWeaponResult?.best_zeta_score} color="success.main" />
                </Grid>
                <Grid item xs={12} md={4}>
                    <ScoreCard title="Max Possible Impact" score={maxImpactScoreResult?.zeta_score} color="info.main" />
                </Grid>
            </Grid>
            <Box sx={{ mt: 3, p: 2, backgroundColor: 'white', borderRadius: '4px' }}>
                 <Typography variant="h6">Forged Weapon Details:</Typography>
                 <Typography variant="body1" sx={{ fontFamily: 'monospace', wordBreak: 'break-all', mt: 1 }}>
                     DNA: {forgedWeaponResult?.best_candidate_dna_sequence}
                 </Typography>
                 <Typography variant="body1" sx={{ fontFamily: 'monospace', wordBreak: 'break-all', mt: 1 }}>
                     Protein: {forgedWeaponResult?.forged_protein_sequence}
                 </Typography>
            </Box>
        </Box>
    );
};

export default FinalDossier; 
import { Box, Typography, Paper, Grid } from '@mui/material';

const ScoreCard = ({ title, score, color }) => (
    <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="subtitle1" color="text.secondary">{title}</Typography>
        <Typography variant="h4" sx={{ color: color, fontWeight: 'bold' }}>
            {score ? score.toFixed(4) : 'N/A'}
        </Typography>
    </Paper>
);

const FinalDossier = ({ dossierData }) => {
    const { enemyScoreResult, maxImpactScoreResult, forgedWeaponResult } = dossierData;

    return (
        <Box sx={{ p: 2, mt: 2, backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>The Receipt: Final Verdict</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <ScoreCard title="Enemy Weapon Score" score={enemyScoreResult?.zeta_score} color="error.main" />
                </Grid>
                <Grid item xs={12} md={4}>
                    <ScoreCard title="Our Forged Weapon" score={forgedWeaponResult?.best_zeta_score} color="success.main" />
                </Grid>
                <Grid item xs={12} md={4}>
                    <ScoreCard title="Max Possible Impact" score={maxImpactScoreResult?.zeta_score} color="info.main" />
                </Grid>
            </Grid>
            <Box sx={{ mt: 3, p: 2, backgroundColor: 'white', borderRadius: '4px' }}>
                 <Typography variant="h6">Forged Weapon Details:</Typography>
                 <Typography variant="body1" sx={{ fontFamily: 'monospace', wordBreak: 'break-all', mt: 1 }}>
                     DNA: {forgedWeaponResult?.best_candidate_dna_sequence}
                 </Typography>
                 <Typography variant="body1" sx={{ fontFamily: 'monospace', wordBreak: 'break-all', mt: 1 }}>
                     Protein: {forgedWeaponResult?.forged_protein_sequence}
                 </Typography>
            </Box>
        </Box>
    );
};

export default FinalDossier; 