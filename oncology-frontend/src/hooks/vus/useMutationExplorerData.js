import { useState, useCallback, useEffect } from 'react';
import { useActivity, ACTIVITY_TYPES } from '../../context/ActivityContext';
import { useAyeshaProfile } from '../../hooks/ayesha/useAyeshaProfile';
import { MESSAGES, WORKFLOW_STEPS, EXTERNAL_URLS } from '../../components/vus/constants.jsx';

export const useMutationExplorerData = (API_ROOT) => {
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [patientMutations, setPatientMutations] = useState([]);
    const [genomicQuery, setGenomicQuery] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isLoadingPatient, setIsLoadingPatient] = useState(false);
    const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
    const [error, setError] = useState(null);
    const [activeMutationTab, setActiveMutationTab] = useState('All');
    const [currentWorkflowStep, setCurrentWorkflowStep] = useState(WORKFLOW_STEPS.IDLE);
    const [activeMutation, setActiveMutation] = useState(null);
    const [analysisStatusForWorkflow, setAnalysisStatusForWorkflow] = useState('idle');

    const { addActivity } = useActivity();
    const ayeshaProfileData = useAyeshaProfile();

    // Reset state when patient changes
    useEffect(() => {
        if (selectedPatientId) {
            setCurrentWorkflowStep(WORKFLOW_STEPS.MUTATION_SELECTION);
            setActiveMutation(null);
            setAnalysisResult(null);
            setGenomicQuery('');
            setError(null);
            setAnalysisStatusForWorkflow('idle');
        } else {
            setPatientMutations([]);
            setAnalysisResult(null);
            setActiveMutation(null);
            setGenomicQuery('');
            setError(null);
            setCurrentWorkflowStep(WORKFLOW_STEPS.IDLE);
            setAnalysisStatusForWorkflow('idle');
        }
    }, [selectedPatientId]);

    const fetchPatientMutations = useCallback(async () => {
        if (!selectedPatientId) return;

        setIsLoadingPatient(true);
        setError(null);
        setAnalysisResult(null);
        setPatientMutations([]);

        // INTERCEPT: If Patient is AK (Ayesha), use local profile data
        if (selectedPatientId === 'AK' || selectedPatientId === 'ayesha_11_17_25') {
            console.log("Using local Ayesha profile for Mutation Explorer");
            try {
                const { germline, tumorContext } = ayeshaProfileData;
                const mappedMutations = [];

                if (germline?.mutations) {
                    germline.mutations.forEach(m => {
                        mappedMutations.push({
                            hugo_gene_symbol: m.gene,
                            protein_change: m.protein_change || m.variant,
                            variant_type: 'Germline',
                            genomic_coordinate_hg38: null, // Not in profile
                            classification: m.classification
                        });
                    });
                }

                if (tumorContext?.somatic_mutations) {
                    tumorContext.somatic_mutations.forEach(m => {
                        mappedMutations.push({
                            hugo_gene_symbol: m.gene,
                            protein_change: m.variant || "IHC+",
                            variant_type: 'Somatic',
                            genomic_coordinate_hg38: null,
                            evidence: m.evidence
                        });
                    });
                }

                setPatientMutations(mappedMutations);
                addActivity(
                    ACTIVITY_TYPES.GENOMIC_ANALYSIS,
                    `Loaded local profile for ${selectedPatientId}`,
                    { count: mappedMutations.length, source: 'Local Profile' }
                );

            } catch (err) {
                console.error("Error mapping local profile:", err);
                setError("Failed to load local profile data.");
            } finally {
                setIsLoadingPatient(false);
            }
            return;
        }

        // Standard Fetch
        try {
            const response = await fetch(`${API_ROOT}/api/patients/${selectedPatientId}`);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(MESSAGES.errors.patientNotFound(selectedPatientId));
                }
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.detail || `HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            if (result.success && result.data && result.data.mutations) {
                setPatientMutations(result.data.mutations);
                addActivity(
                    ACTIVITY_TYPES.GENOMIC_ANALYSIS,
                    `Loaded mutations for ${selectedPatientId}`,
                    { count: result.data.mutations.length }
                );
            } else {
                setPatientMutations([]);
            }
        } catch (err) {
            if (!err.message?.includes('not found') && !err.message?.includes('404')) {
                console.error("Error fetching patient data:", err);
            }
            setError(err.message || MESSAGES.errors.loadFailed);
            setPatientMutations([]);
        } finally {
            setIsLoadingPatient(false);
        }
    }, [selectedPatientId, addActivity, API_ROOT, ayeshaProfileData]);

    // Auto-fetch when selectedPatientId changes
    useEffect(() => {
        if (selectedPatientId) fetchPatientMutations();
    }, [selectedPatientId, fetchPatientMutations]);

    const handleAnalyze = async (queryFromButton, mutationDetails = null) => {
        const currentQuery = queryFromButton || genomicQuery;
        if (!selectedPatientId || !currentQuery) {
            setError("Please select a patient and enter/select a query.");
            return;
        }

        setIsLoadingAnalysis(true);
        setError(null);
        setAnalysisResult(null);
        setCurrentWorkflowStep(WORKFLOW_STEPS.ANALYSIS_VIEW);
        setAnalysisStatusForWorkflow('loading');

        if (mutationDetails) {
            setActiveMutation(mutationDetails);
        }

        try {
            const response = await fetch(`${API_ROOT}/api/research/mutation-analysis`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patient_id: selectedPatientId,
                    prompt: currentQuery,
                    intent: "analyze_genomic_criterion"
                }),
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setAnalysisResult(data);
            setAnalysisStatusForWorkflow('complete');

            addActivity(
                ACTIVITY_TYPES.GENOMIC_ANALYSIS_SUCCESS,
                `Genomic analysis complete for ${selectedPatientId}`,
                { query: currentQuery, status: data.status }
            );

        } catch (err) {
            console.error("Genomic analysis error:", err);
            setError(err.message || MESSAGES.errors.analysisFailed);
            setAnalysisStatusForWorkflow('error');
        } finally {
            setIsLoadingAnalysis(false);
        }
    };

    const handleCrisprDesign = (mutation) => {
        if (mutation.genomic_coordinate_hg38) {
            setActiveMutation(mutation);
            setCurrentWorkflowStep(WORKFLOW_STEPS.CRISPR_VIEW);
            setAnalysisStatusForWorkflow('crispr_initiated');

            addActivity(
                ACTIVITY_TYPES.CRISPR_DESIGN_INITIATED,
                `CRISPR design initiated for ${mutation.hugo_gene_symbol}`,
                { gene: mutation.hugo_gene_symbol }
            );

            const targetUrl = `${EXTERNAL_URLS.CRISPR_DESIGNER}?gene=${mutation.hugo_gene_symbol}&variant=${mutation.protein_change}&genomic_coord=${mutation.genomic_coordinate_hg38}&assembly=hg38`;
            window.open(targetUrl, '_blank', 'noopener,noreferrer');
        }
    };

    return {
        selectedPatientId,
        setSelectedPatientId,
        patientMutations,
        genomicQuery,
        setGenomicQuery,
        analysisResult,
        isLoadingPatient,
        isLoadingAnalysis,
        error,
        activeMutationTab,
        setActiveMutationTab,
        currentWorkflowStep,
        setCurrentWorkflowStep,
        activeMutation,
        setActiveMutation,
        analysisStatusForWorkflow,
        handleAnalyze,
        handleCrisprDesign,
        fetchPatientMutations
    };
};
