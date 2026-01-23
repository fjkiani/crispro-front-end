import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Button, Alert, Grid, Fade, CircularProgress, Avatar, Paper } from '@mui/material';
import { PlayArrow, CheckCircle, ArrowForward, SmartToy, Assessment, Build, Security } from '@mui/icons-material';
import DynamicEndpointDisplay from '../components/common/DynamicEndpointDisplay';

const AICoPilotMessage = ({ message, timestamp }) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
        <Avatar sx={{ bgcolor: '#90caf9', color: '#0d47a1', mt: 1 }}><SmartToy /></Avatar>
        <Paper variant="outlined" sx={{
            p: 2,
            backgroundColor: 'rgba(25, 118, 210, 0.1)',
            borderColor: 'rgba(25, 118, 210, 0.5)',
            color: 'white',
            flexGrow: 1,
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" sx={{ color: '#90caf9' }}>Dr. ARIA</Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>{timestamp}</Typography>
            </Box>
            <Typography variant="body1">{message}</Typography>
        </Paper>
    </Box>
);

const TimelineStep = ({ stage, isActive, isCompleted, onExecute, onProceed }) => {
    const getStatusColor = () => isCompleted ? '#66bb6a' : isActive ? '#42a5f5' : '#616161';
    const getIcon = () => isCompleted ? <CheckCircle /> : <stage.icon />;

    return (
        <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{
                    width: 50, height: 50, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: getStatusColor(), color: 'white', boxShadow: isActive ? `0 0 15px ${getStatusColor()}` : 'none',
                }}>
                    {getIcon()}
                </Box>
                <Box sx={{ width: 2, flexGrow: 1, background: `linear-gradient(to bottom, ${getStatusColor()}, #303030)` }} />
            </Box>
            <Box sx={{ flexGrow: 1, opacity: isActive || isCompleted ? 1 : 0.5 }}>
                <Typography variant="h5" sx={{ color: 'white' }}>{stage.label}</Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>{stage.businessRationale}</Typography>
                
                {isActive && !isCompleted && (
                    <Button variant="contained" size="large" startIcon={<PlayArrow />} onClick={onExecute} sx={{ boxShadow: '0 0 10px #42a5f5' }}>
                        {stage.executeLabel}
                    </Button>
                )}

                {isCompleted && (
                    <Fade in={true}>
                        <Paper variant="outlined" sx={{ p: 2, mt: 2, backgroundColor: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.2)' }}>
                            <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>Raw AI Outputs:</Typography>
                            <Grid container spacing={2}>
                                {stage.endpoints.map(endpoint => (
                                    <Grid item xs={12} md={6} key={endpoint.id}>
                                        <DynamicEndpointDisplay endpointResult={endpoint} />
                                    </Grid>
                                ))}
                            </Grid>
                            <Alert severity="success" sx={{ mt: 2, backgroundColor: 'rgba(46, 125, 50, 0.3)', color: '#a5d6a7', border: '1px solid #2e7d32' }}>
                                <strong>Conclusion:</strong> {stage.completionSummary}
                            </Alert>
                            <Box sx={{ textAlign: 'center', mt: 2 }}>
                                <Button variant="contained" color="success" startIcon={<ArrowForward />} onClick={onProceed}>
                                    {stage.proceedLabel}
                                </Button>
                            </Box>
                        </Paper>
                    </Fade>
                )}
            </Box>
        </Box>
    );
};

const ResearchSummary = ({ stages, completedStages, config }) => (
    <Paper variant="outlined" sx={{ position: 'sticky', top: 100, p: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', color: 'white' }}>
        <Typography variant="h6" gutterBottom>📋 Research Summary</Typography>
        <Paper sx={{ p: 2, mb: 2, backgroundColor: 'rgba(0,0,0,0.2)' }}>
            <Typography variant="body2" gutterBottom><strong>Target:</strong> {config.biotechContext.targetExample}</Typography>
            <Typography variant="body2"><strong>Progress:</strong> {completedStages.length}/{stages.length} steps</Typography>
        </Paper>
        <Typography variant="subtitle2" gutterBottom>Key Findings:</Typography>
        {completedStages.map(index => (
            <Alert key={index} severity="success" icon={<CheckCircle fontSize="inherit" />} sx={{ mb: 1, backgroundColor: 'transparent', border: '1px solid #2e7d32', color: '#a5d6a7' }}>
                {stages[index].label} Complete
            </Alert>
        ))}
    </Paper>
);

const Hud = ({ config, onReset }) => (
    <Paper variant="outlined" sx={{ mb: 3, p: 2, position: 'sticky', top: 10, zIndex: 1000, backgroundColor: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ color: '#f44336' }}>
            🎯 LIVE MISSION: Validate {config.biotechContext.targetExample}
        </Typography>
        <Button variant="outlined" onClick={onReset} sx={{ color: 'white', borderColor: 'white' }}>
            Reset Research
        </Button>
    </Paper>
);

const CampaignRunner = ({ config }) => {
    const [currentStageIndex, setCurrentStageIndex] = useState(0);
    const [completedStages, setCompletedStages] = useState([]);
    const [messages, setMessages] = useState([
        { message: `Hello! I'm Dr. ARIA. We need to validate ${config.biotechContext.targetExample}. Let's begin.` }
    ]);

    const allStages = config.acts.flatMap((act, actIndex) => 
        act.stages.map(stage => ({
            ...stage,
            icon: act.id === 'act-i-oracle' ? Assessment : act.id === 'act-ii-forge' ? Build : Security,
            executeLabel: `Execute ${act.title}`,
            proceedLabel: `Proceed to ${config.acts[actIndex + 1] ? config.acts[actIndex + 1].title : 'Final Summary'}`
        }))
    );

    const addMessage = (msg) => setMessages(prev => [...prev, { message: msg, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);

    const executeStage = (index) => {
        addMessage(`Analyzing ${allStages[index].label}...`);
        setTimeout(() => {
            setCompletedStages(prev => [...prev, index]);
            addMessage(`${allStages[index].label} complete. Review the outputs.`);
        }, 1500);
    };

    const proceedToNext = () => {
        if (currentStageIndex < allStages.length - 1) {
            const nextIndex = currentStageIndex + 1;
            setCurrentStageIndex(nextIndex);
            addMessage(`Proceeding to ${allStages[nextIndex].label}.`);
        } else {
            addMessage(`All validation stages complete. Target is validated.`);
        }
    };

    const resetDemo = () => {
        setCurrentStageIndex(0);
        setCompletedStages([]);
        setMessages([{ message: `Research timeline reset. Let's re-validate ${config.biotechContext.targetExample}.` }]);
    };

    return (
        <Box sx={{ p: 3, minHeight: '100vh', background: 'linear-gradient(to bottom right, #000428, #004e92)', color: 'white' }}>
            <Hud config={config} onReset={resetDemo} />
            <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                    {messages.map((msg, index) => (
                        <AICoPilotMessage key={index} message={msg.message} timestamp={msg.timestamp} />
                    ))}

                    {allStages.map((stage, index) => (
                        (index <= currentStageIndex) && (
                            <TimelineStep
                                key={index}
                                stage={stage}
                                isActive={index === currentStageIndex && !completedStages.includes(index)}
                                isCompleted={completedStages.includes(index)}
                                onExecute={() => executeStage(index)}
                                onProceed={proceedToNext}
                            />
                        )
                    ))}
                </Grid>
                <Grid item xs={12} md={4}>
                    <ResearchSummary stages={allStages} completedStages={completedStages} config={config} />
                </Grid>
            </Grid>
        </Box>
    );
};

export default CampaignRunner; 