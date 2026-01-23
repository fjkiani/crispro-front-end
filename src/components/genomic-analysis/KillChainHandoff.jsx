import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { ArrowRight, Zap, RefreshCw } from 'lucide-react';

const KillChainHandoff = ({ verdict, onForgeWeapon, onSimulateNext }) => {
    const isPathogenic = verdict === 'PATHOGENIC';

    const handoffConfig = {
        pathogenic: {
            title: "Verdict Confirmed: Target is Hostile",
            description: "The Intelligence Dossier confirms this variant is a critical threat. The next logical step is to design a precision weapon to neutralize it.",
            buttonText: "Forge Interception Weapon",
            buttonIcon: <Zap size={16} />,
            buttonColor: "secondary",
            action: onForgeWeapon,
        },
        benign: {
            title: "Verdict: Target is Non-Critical",
            description: "This variant is not the primary driver of the threat. We must simulate the next potential threat to identify the true enemy.",
            buttonText: "Simulate Next Threat",
            buttonIcon: <RefreshCw size={16} />,
            buttonColor: "primary",
            action: onSimulateNext,
        },
    };

    const config = isPathogenic ? handoffConfig.pathogenic : handoffConfig.benign;

    return (
        <Box sx={{ 
            mt: 4, 
            p: 3, 
            border: '1px solid',
            borderColor: isPathogenic ? 'secondary.main' : 'primary.main',
            borderRadius: 2, 
            bgcolor: 'background.paper' 
        }}>
            <Typography variant="h6" gutterBottom>{config.title}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {config.description}
            </Typography>
            <Button
                variant="contained"
                color={config.buttonColor}
                endIcon={config.buttonIcon}
                onClick={config.action}
                fullWidth
            >
                {config.buttonText}
            </Button>
        </Box>
    );
};

export default KillChainHandoff; 