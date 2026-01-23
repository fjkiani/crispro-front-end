import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from "react-router-dom";
import GeneViewer from "../components/genomic-analysis/gene-viewer";
import { Box, Typography, Paper, CircularProgress, Button } from '@mui/material';
import { fetchGeneData, ClinvarVariant, GeneData, GeneInfo } from '../components/genomic-analysis/utils/genome-api';
import ConnectedBriefing from '../components/genomic-analysis/ConnectedBriefing';
import ProgressFlow from '../components/common/ProgressFlow';
import ExperimentDesign from '../components/genomic-analysis/ExperimentDesign';
import ResultsInterpreter from '../components/genomic-analysis/ResultsInterpreter';
import GauntletControl from '../components/genomic-analysis/GauntletControl'; // Import new component
import VerdictPanel from '../components/genomic-analysis/VerdictPanel'; // Import new component
import GauntletNarrativeContainer from '../components/genomic-analysis/gauntlet-narrative/GauntletNarrativeContainer';

// --- Service URLs (Corrected Coordinates) ---
const ORACLE_URL = "https://crispro--zeta-oracle-v2-zetaoracle-api.modal.run";
const FORGE_URL = "https://crispro--zeta-forge-v1-zetaforge-api.modal.run";
const COMMAND_CENTER_URL = "https://crispro--crispr-assistant-command-center-v3-commandcenter-api.modal.run";

interface InteractionResponse {
    inhibition_score: number;
    verdict: string;
}

interface ForgeResult {
    new_protein_name: string;
    new_protein_sequence: string;
}

const GenomicAnalysis = () => {
    const { patientId: urlGeneId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // --- Intel from Mission Briefing ---
    const targetName = location.state?.targetName || urlGeneId;
    const initialIntel = location.state?.initialIntel || "No specific intelligence provided.";
    const sourceQuery = location.state?.sourceQuery || null;

    const [geneData, setGeneData] = useState<GeneData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Gauntlet state
    const [gauntletResult, setGauntletResult] = useState<any | null>(null); // Keep original type
    const [isGauntletLoading, setIsGauntletLoading] = useState(false);
    
    // Forge state
    const [forgeResult, setForgeResult] = useState<any | null>(null); // Keep original type
    const [isForging, setIsForging] = useState(false);
    const [baselineData, setBaselineData] = useState<{essential_genes: any, non_essential_genes: any} | null>(null); // Keep original type
    const [gauntletCommentary, setGauntletCommentary] = useState<string>("");
    const [dossier, setDossier] = useState(null); // New state for the full dossier
    const [gauntletEnvironment, setGauntletEnvironment] = useState('glioblastoma_high_angiogenesis'); // New state for Gauntlet
    const [simulationResult, setSimulationResult] = useState<InteractionResponse | null>(null); // New state for simulation
    const [isSimulating, setIsSimulating] = useState(false); // New state for simulation loading
    const [forgedWeapon, setForgedWeapon] = useState<ForgeResult | null>(null); // New state for the superior weapon
    const [headToHeadResult, setHeadToHeadResult] = useState<InteractionResponse | null>(null); // New state for the second simulation

    // --- DOCTRINE: SUBDOMAIN HUNTER ---
    // State to manage the reconnaissance mission.
    const [reconData, setReconData] = useState(null);
    const [isReconLoading, setIsReconLoading] = useState(false);

    const geneSymbol = urlGeneId || "Unknown";

    useEffect(() => {
        const loadData = async () => {
            if (!geneSymbol) {
                setIsLoading(false);
                setError("No gene symbol provided in URL.");
                return;
            }

            setIsLoading(true);
            setError(null);
            setGeneData(null);
            try {
                const data = await fetchGeneData(geneSymbol);
                setGeneData(data);
            } catch (err) {
                setError(`Failed to load genomic intelligence for ${geneSymbol}.`);
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        const loadBaselines = async () => {
            // This endpoint does not exist. Neutralizing the call as per Commander's directive.
            // try {
            //     const response = await fetch(`${ORACLE_URL}/baselines`);
            //     if (!response.ok) {
            //         throw new Error('Failed to fetch baseline data');
            //     }
            //     const data = await response.json();
            //     setBaselineData(data);
            // } catch (error) {
            //     console.error("Could not load baseline data:", error);
            // }
        };

        loadData();
        // loadBaselines(); // Call neutralized.
    }, [urlGeneId]);

    // handleRunGauntlet and handleForgeInhibitor functions remain the same...
    const handleRunGauntlet = async () => {
        if (!geneData) return;
        setIsGauntletLoading(true);
        setDossier(null); // Reset dossier state

        try {
            // The sequences are now part of the dossier request
        const baseline_sequence = geneData.sequence;
            if (!baseline_sequence) {
                throw new Error("Baseline sequence is not available.");
            }
            // Simple knockout simulation for the perturbed sequence
            const perturbed_sequence = baseline_sequence.substring(1) + "A"; 

            const requestBody = {
                // The API endpoint we are calling is in the CommandCenter, which uses a different base URL
                // The frontend now calls the CommandCenter's dossier workflow
                gene: geneData.gene_info.symbol,
                hgvs_p: "p.Gly12Cys", // This should be dynamic from variant data later
                baseline_sequence: baseline_sequence,
                perturbed_sequence: perturbed_sequence
            };
            
            // NOTE: The endpoint URL points to the CommandCenter, which might be different from the Oracle's
            const response = await fetch(`${COMMAND_CENTER_URL}/workflow/generate_intelligence_dossier`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Intelligence Dossier generation failed');
            }
            const data = await response.json();
            setDossier(data);

        } catch (error) {
            console.error("Gauntlet run failed", error);
            // Set an error state to display to the user
        } finally {
            setIsGauntletLoading(false);
        }
    };

    const handleRunSimulation = async () => {
        if (!geneData) return;
        setIsSimulating(true);
        setSimulationResult(null);
        try {
            const response = await fetch(`${ORACLE_URL}/invoke`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: "score",
                    params: {
                        reference_sequence: geneData.sequence,
                        alternate_sequence: geneData.sequence.substring(1) + "A" // Simulate a single mutation
                    }
                }),
            });
            if (!response.ok) {
                throw new Error("Interaction simulation failed");
            }
            const data = await response.json();
            // Adapt the response to the expected format
            setSimulationResult({
                inhibition_score: data.zeta_score,
                verdict: data.interpretation
            });
        } catch (error) {
            console.error("Simulation run failed", error);
        } finally {
            setIsSimulating(false);
        }
    };

    const handleForgeAndCompare = async () => {
        if (!geneData) return;
        
        // 1. Unleash the Zeta Forge
        const forgeResponse = await fetch(`${FORGE_URL}/generate_inhibitor`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                target_gene_sequence: geneData.sequence,
                design_goal: `Forge a superior inhibitor for ${geneData.gene_info.symbol}`,
                optimization_loops: 1
            }),
        });
        const forgedData = await forgeResponse.json();
        setForgedWeapon(forgedData);

        // 2. Run the Head-to-Head Simulation
        const compareResponse = await fetch(`${ORACLE_URL}/invoke`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                target_protein: geneData.gene_info.symbol,
                effector_protein: forgedData.new_protein_name,
            }),
        });
        const compareData = await compareResponse.json();
        setHeadToHeadResult(compareData);
    };

    // Placeholder handlers for the Kill-Chain Handoff
    const handleForgeWeapon = () => {
        console.log("COMMAND: Forge Interception Weapon!");
        // Navigate to the design studio page in the future
    };

    const handleSimulateNext = () => {
        console.log("COMMAND: Simulate Next Threat!");
        // Trigger the second-hit simulation workflow in the future
    };

    const handleForgeInhibitor = async () => {
        if (!geneData || !gauntletResult) return;
        setIsForging(true);
        setForgeResult(null);

        try {
            const response = await fetch(`${FORGE_URL}/generate_inhibitor`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    target_gene_sequence: geneData.sequence,
                    design_goal: `Generate a highly effective inhibitor for ${geneData.gene_info.symbol}.`
                 }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Zeta Forge API request failed');
            }
            const data = await response.json();
            console.log("[DEBUG] Forge Result Received:", data); // Add logging
            setForgeResult(data);

        } catch (error) {
            console.error("Forge run failed", error);
        } finally {
            setIsForging(false);
        }
    };

    const handleRunRecon = async (geneSymbol: string) => {
        setIsReconLoading(true);
        setError(null);
        try {
            const response = await fetch(`${COMMAND_CENTER_URL}/recon/find_subdomains`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gene_symbol: geneSymbol }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Reconnaissance failed: ${errorText}`);
            }
            const data = await response.json();
            setReconData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsReconLoading(false);
        }
    };

    const handleGauntletComplete = (result) => {
        setGauntletResult(result);
    };


    if (isLoading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }
    
    const getCurrentStep = () => {
        if (headToHeadResult) return 'action';
        if (simulationResult) return 'results';
        if (geneData) return 'experiment';
        return 'design';
    };

    return (
        <div className="min-h-screen bg-[#e9eeea]">
            <main className="container mx-auto px-6 py-6">
                
                {/* Progress Flow */}
                <ProgressFlow 
                    currentStep={getCurrentStep()} 
                    completedSteps={[]}
                />
                
                {/* Connected Mission Briefing */}
                <ConnectedBriefing 
                    targetName={targetName}
                    initialIntel={initialIntel}
                    sourceQuery={sourceQuery}
                />

                {/* --- The Dossier (Temporarily Disabled by Commander's Order) --- */}
                {/* {geneData && (
                    <Paper sx={{ p: 3, mb: 4 }}>
                        <Typography variant="h5" gutterBottom>Target Dossier</Typography>
                         <GeneViewer
                            geneData={geneData}
                            genomeId="hg38"
                            onClose={() => navigate('/validate')}
                        />
                    </Paper>
                )} */}
                
                {/* --- The Gauntlet (Mission Control) --- */}
                <Paper sx={{ p: 3, mb: 4 }}>
                    <Typography variant="h5" gutterBottom>Mission Control: The Gauntlet</Typography>
                    
                    {/* --- NEW NARRATIVE CONTAINER --- */}
                    <GauntletNarrativeContainer 
                        geneData={geneData} 
                        onComplete={handleGauntletComplete}
                        reconData={reconData}
                        onRunRecon={handleRunRecon}
                        isReconLoading={isReconLoading}
                    />

                    {/* --- OLD GAUNTLET CONTROLS (DISABLED) --- */}
                    {/* 
                    <GauntletControl 
                        selectedEnvironment={gauntletEnvironment}
                        onEnvironmentChange={(e) => setGauntletEnvironment(e.target.value)}
                    />

                    <Button variant="contained" onClick={handleRunSimulation} sx={{ mt: 2 }} disabled={isSimulating || !geneData}>
                        {isSimulating ? <CircularProgress size={24} /> : "Run Simulation"}
                    </Button>

                    {simulationResult && (
                        <>
                            <VerdictPanel result={simulationResult} />
                            {simulationResult.verdict === 'MINIMAL' && (
                                <Button variant="contained" color="secondary" onClick={handleForgeAndCompare} sx={{ mt: 2 }}>
                                    Forge Superior Inhibitor
                                </Button>
                            )}
                </>
            )}

                    {forgedWeapon && headToHeadResult && (
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="h6">Zeta Forge Result:</Typography>
                            <Typography>New Weapon: {forgedWeapon.new_protein_name}</Typography>
                            <VerdictPanel result={headToHeadResult} />
                        </Box>
                    )}

                    <ExperimentDesign targetName={targetName} />

                    <Button variant="contained" onClick={handleRunGauntlet} sx={{ mt: 2 }} disabled={isGauntletLoading || !geneData}>
                        {isGauntletLoading ? <CircularProgress size={24} /> : "Run Gauntlet"}
                    </Button>

                    {dossier && (
                        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #ddd' }}>
                            <ResultsInterpreter 
                                dossier={dossier}
                                onForgeWeapon={handleForgeWeapon}
                                onSimulateNext={handleSimulateNext}
                            />
                        </Box>
                    )}
                    */}
                </Paper>

                {/* --- The Forge (Counter-Offensive) --- */}
                {forgeResult && gauntletResult && (
                     <Paper sx={{ p: 3, mb: 4, border: '2px solid', borderColor: 'secondary.main' }}>
                        <Typography variant="h5" gutterBottom>Intelligence Dossier: Counter-Hypothesis</Typography>
                        <Typography variant="body1">
                            The original hypothesis is invalid (Zeta Score: {gauntletResult.zeta_score.toFixed(6)}). 
                            Our AI-forged nanobody, <strong>{forgeResult.new_protein_name}</strong>, is predicted to be orders of magnitude more effective.
                        </Typography>
                        <Typography variant="h4" color="success.main" sx={{ mt: 2 }}>
                            New Zeta Score: {forgeResult.new_zeta_score.toFixed(6)}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">{forgeResult.commentary}</Typography>
                     </Paper>
                )}
            </main>
        </div>
    );
};

export default GenomicAnalysis; 