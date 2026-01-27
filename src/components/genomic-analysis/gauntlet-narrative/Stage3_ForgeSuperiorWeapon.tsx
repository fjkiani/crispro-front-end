import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, CircularProgress, TextField, Paper, Chip, List, ListItem, ListItemText } from '@mui/material';
import { Science } from '@mui/icons-material';
import { GeneData } from '../../../../types/common';
import ReactMarkdown from 'react-markdown';

// --- Service URLs ---
const FORGE_URL = "https://crispro--zeta-forge-v1-api.modal.run";
const COMMAND_CENTER_URL = "https://crispro--crispr-assistant-command-center-v3-commandcente-70576f.modal.run";

interface ThreatMatrix {
    keywords: string[];
    cdd_identifiers: Record<string, string>;
}

interface ForgedWeaponBlueprint {
    status: string;
    message: string;
    best_candidate_dna_sequence?: string;
    forged_protein_sequence?: string;
    best_zeta_score?: number;
    history?: any[];
}

interface Stage3ForgeSuperiorWeaponProps {
    geneData: GeneData | null;
    onComplete: (result: any) => void;
}

const Stage3_ForgeSuperiorWeapon = ({ geneData, onComplete }: Stage3ForgeSuperiorWeaponProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<string>('');
    const [coordinates, setCoordinates] = useState({ start: '', end: '' });
    const [threatMatrix, setThreatMatrix] = useState<ThreatMatrix | null>(null);
    const [isReconLoading, setIsReconLoading] = useState(false);
    
    // State to hold all data from the hunter-analyst
    const [reconData, setReconData] = useState<{
        briefing: string | null;
        full_dna_sequence: string | null;
    }>({ briefing: null, full_dna_sequence: null });

    const [forgedWeapon, setForgedWeapon] = useState<ForgedWeaponBlueprint | null>(null);

    useEffect(() => {
        const fetchThreatMatrix = async () => {
            try {
                const response = await fetch(`${COMMAND_CENTER_URL}/recon/threat_matrix`);
                if (!response.ok) throw new Error("Failed to fetch Threat Matrix.");
                const data = await response.json();
                setThreatMatrix(data);
            } catch (error) {
                console.error("Error fetching threat matrix:", error);
            }
        };
        fetchThreatMatrix();
    }, []);

    const handleGenerateBriefing = async () => {
        if (!geneData?.gene_info?.symbol) {
            setError("Gene symbol not available for reconnaissance.");
            return;
        }
        setIsReconLoading(true);
        setError(null);
        setReconData({ briefing: null, full_dna_sequence: null });
        setCoordinates({ start: '', end: '' });
        setForgedWeapon(null);

        try {
            const response = await fetch(`${COMMAND_CENTER_URL}/workflow/run_hunter_analyst`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gene_symbol: geneData.gene_info.symbol }),
            });
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Hunter-Analyst Campaign Failed: ${errText}`);
            }
            const data = await response.json();
            
            setReconData({
                briefing: data.briefing,
                full_dna_sequence: data.full_dna_sequence
            });

            if (data.primary_target) {
                // Automatically set coordinates for the forge
                const startCoord = (data.primary_target.start - 1) * 3;
                const endCoord = data.primary_target.end * 3;
                setCoordinates({ start: startCoord.toString(), end: endCoord.toString() });
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsReconLoading(false);
        }
    };


    const handleForgeWeapon = async () => {
        if (!reconData.full_dna_sequence) {
            setError("Full DNA sequence not available. Cannot forge weapon.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setForgedWeapon(null);
        setStatusMessage("Initiating contact with Zeta Forge...");

        const start = parseInt(coordinates.start, 10);
        const end = parseInt(coordinates.end, 10);
        if (isNaN(start) || isNaN(end) || start < 0 || end > reconData.full_dna_sequence.length || start >= end) {
            setError("Invalid or missing coordinates. Please generate a strategic briefing first.");
            setIsLoading(false);
            return;
        }
        const targetSubsequence = reconData.full_dna_sequence.slice(start, end);

        try {
            // 1. Submit the job to the forge
            const submitResponse = await fetch(`${FORGE_URL}/generate_inhibitor`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    target_gene_sequence: targetSubsequence,
                    design_goal: `Forge a high-affinity inhibitor for the vulnerable subdomain of ${geneData?.gene_info?.symbol}`,
                    optimization_loops: 5
                }),
            });
            if (!submitResponse.ok) throw new Error("Failed to submit job to the forge.");
            const submitData = await submitResponse.json();
            const jobId = submitData.job_id;

            // 2. Poll for the result
            let jobComplete = false;
            while (!jobComplete) {
                await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
                const statusResponse = await fetch(`${FORGE_URL}/status/${jobId}`);
                const statusData = await statusResponse.json();

                setStatusMessage(statusData.message || `Status: ${statusData.status}`);

                if (statusData.status === 'complete') {
                    jobComplete = true;
                    setForgedWeapon(statusData);
                } else if (statusData.status === 'failed') {
                    throw new Error(statusData.error || "Forge job failed without a specific error.");
                }
            }
        } catch (err: any) {
            setError(err.message);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: '4px', mt: 2 }}>
            <Typography variant="h6" gutterBottom>Act III: Unleash the Forge</Typography>
            
            <Paper elevation={2} sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
                <Typography variant="subtitle1" gutterBottom>Live Intelligence: Threat Matrix</Typography>
                {threatMatrix ? (
                    <>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Our analyst identifies high-value targets by cross-referencing findings against the following live intelligence:
                        </Typography>
                        <Typography variant="subtitle2" sx={{ mt: 1 }}>High-Value Keywords:</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                            {threatMatrix.keywords.map(kw => <Chip key={kw} label={kw} size="small" />)}
                        </Box>
                        <Typography variant="subtitle2">High-Value Identifiers:</Typography>
                        <List dense>
                            {Object.entries(threatMatrix.cdd_identifiers).map(([id, desc]) => (
                                <ListItem key={id} disableGutters>
                                    <ListItemText primary={id} secondary={desc as string} />
                                </ListItem>
                            ))}
                        </List>
                    </>
                ) : <CircularProgress size={24} />}
            </Paper>

            <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: '4px', mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Automated Reconnaissance & Analysis</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Deploy the Hunter-Analyst to perform reconnaissance and generate an immediate strategic briefing.
                </Typography>
                <Button 
                    startIcon={<Science />}
                    onClick={handleGenerateBriefing} 
                    disabled={isReconLoading}
                    variant="contained"
                >
                    {isReconLoading ? <CircularProgress size={24} color="inherit"/> : "Generate Strategic Briefing"}
                </Button>
                
                {reconData.briefing && (
                    <Paper elevation={3} sx={{p: 2, mt: 2, whiteSpace: 'pre-wrap', backgroundColor: '#e3f2fd'}}>
                        <Typography variant="h6" gutterBottom>Commander's Strategic Briefing</Typography>
                        <ReactMarkdown>{reconData.briefing}</ReactMarkdown>
                    </Paper>
                )}
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                The coordinates of the highest-priority target will be automatically populated below.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField 
                    label="Start Coordinate" 
                    variant="outlined" 
                    size="small"
                    value={coordinates.start}
                    disabled // This is now auto-populated
                />
                <TextField 
                    label="End Coordinate" 
                    variant="outlined" 
                    size="small"
                    value={coordinates.end}
                    disabled // This is now auto-populated
                />
            </Box>

            <Button variant="contained" color="secondary" onClick={handleForgeWeapon} disabled={isLoading || !coordinates.start || !reconData.full_dna_sequence}>
                {isLoading ? <CircularProgress size={24} /> : "Forge Hyper-Targeted Weapon"}
            </Button>
            {isLoading && <Typography sx={{ mt: 2 }}>{statusMessage}</Typography>}
            {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}

            {forgedWeapon && (
                <Paper elevation={3} sx={{p: 2, mt: 2, backgroundColor: '#dcedc8'}}>
                    <Typography variant="h6" gutterBottom>💥 Forged Weapon Blueprint 💥</Typography>
                    <Typography variant="body1"><strong>Status:</strong> {forgedWeapon.message}</Typography>
                    <Typography variant="body1"><strong>Zeta Score (Impact):</strong> {forgedWeapon.best_zeta_score?.toFixed(4)}</Typography>
                    <Typography variant="body1"><strong>DNA Aptamer:</strong> {forgedWeapon.best_candidate_dna_sequence}</Typography>
                    <Typography variant="body1"><strong>Forged Protein:</strong> {forgedWeapon.forged_protein_sequence}</Typography>
                </Paper>
            )}
        </Box>
    );
};

export default Stage3_ForgeSuperiorWeapon; 