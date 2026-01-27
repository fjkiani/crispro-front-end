import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { Verified, GppMaybe } from '@mui/icons-material';
import BaseCard from '../common/BaseCard';
import ThreatMatrixVisualization from './ThreatMatrixVisualization';
import ClinicalAnalysisReport from './ClinicalAnalysisReport';
import KillChainHandoff from './KillChainHandoff';

const ResultsInterpreter = ({ dossier, onForgeWeapon, onSimulateNext }) => {
    if (!dossier) return null;

    const { triumvirate_assessment, threat_matrix_baselines, clinical_analysis } = dossier;
    const { verdict, zeta_score, confidence } = triumvirate_assessment;
    const isPathogenic = verdict === 'PATHOGENIC';

    return (
        <BaseCard
            title="Intelligence Dossier"
            subtitle="Comprehensive AI-Generated Threat Analysis"
            statusColor={isPathogenic ? '#e8f5e9' : '#fff3e0'}
            expandable={true}
        >
            {/* High-Level Verdict */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                {isPathogenic ? <Verified color="success" sx={{ fontSize: 40 }}/> : <GppMaybe color="warning" sx={{ fontSize: 40 }}/>}
                <Box>
                    <Typography variant="h5" color={isPathogenic ? 'success.main' : 'warning.main'}>
                        VERDICT: {verdict}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Zeta Score: {zeta_score.toFixed(4)} | Model Confidence: {(confidence * 100).toFixed(1)}%
                    </Typography>
                </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Threat Matrix Visualization */}
            <ThreatMatrixVisualization 
                patientScore={zeta_score}
                pathogenicScores={threat_matrix_baselines.pathogenic_scores}
                benignScores={threat_matrix_baselines.benign_scores}
            />

            {/* Clinical Analyst Report */}
            <ClinicalAnalysisReport analysis={clinical_analysis} />

            {/* Kill-Chain Handoff */}
            <KillChainHandoff 
                verdict={verdict}
                onForgeWeapon={onForgeWeapon}
                onSimulateNext={onSimulateNext}
            />

        </BaseCard>
    );
};

export default ResultsInterpreter; 