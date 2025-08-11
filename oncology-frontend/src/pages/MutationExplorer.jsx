import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useActivity, ACTIVITY_TYPES } from '../context/ActivityContext'; // <-- Import Activity Context
// import { DNALoader } from '../components/Loaders'; // Assuming a cool loader component
import Loader from '../components/Loader'; // Use existing Loader

const mockPatientIds = ["PAT12345", "PAT67890"]; // Removed PAT11223 which doesn't exist in the backend

// Workflow Steps Constants
const WORKFLOW_STEPS = {
  IDLE: 'idle',
  MUTATION_SELECTION: 'mutation_selection', // Step 1 active: Show mutations list & query input
  ANALYSIS_VIEW: 'analysis_view', // Step 2 active: Show query input & analysis results (or loader)
  CRISPR_VIEW: 'crispr_view' // Step 3 active: Show CRISPR recommendations
};

// Pre-defined query templates for suggested queries feature
const suggestedQueryTemplates = {
    effect: [
        { label: "Effect of [GENE] [VARIANT]", value: "Effect of {gene} {variant}", requiresGene: true, requiresVariant: true },
        { label: "Impact of [GENE] mutation", value: "Impact of {gene} mutation", requiresGene: true, requiresVariant: false },
    ],
    presence: [
        { label: "Activating [GENE] mutation", value: "Activating {gene} mutation", requiresGene: true, requiresVariant: false },
        { label: "Pathogenic [GENE] mutation", value: "Pathogenic {gene} mutation", requiresGene: true, requiresVariant: false },
        { label: "Presence of [GENE] [VARIANT]", value: "Presence of {gene} {variant}", requiresGene: true, requiresVariant: true },
        { label: "Any mutation in [GENE]", value: "Any mutation in {gene}", requiresGene: true, requiresVariant: false },
    ],
    absence: [
        { label: "[GENE] wild-type", value: "{gene} wild-type", requiresGene: true, requiresVariant: false },
        { label: "Absence of [GENE] [VARIANT]", value: "Absence of {gene} {variant}", requiresGene: true, requiresVariant: true },
        { label: "No pathogenic [GENE] mutation", value: "No pathogenic {gene} mutation", requiresGene: true, requiresVariant: false },
    ],
    resistance: [
        { label: "Resistance mutation in [GENE]", value: "Resistance mutation in {gene}", requiresGene: true, requiresVariant: false },
        { label: "No resistance mutation in [GENE]", value: "No resistance mutation in {gene}", requiresGene: true, requiresVariant: false },
    ]
};

const MutationExplorer = () => {
    const API_ROOT = import.meta.env.VITE_API_ROOT || '';
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
    const [analysisStatusForWorkflow, setAnalysisStatusForWorkflow] = useState('idle'); // idle, loading, complete, error, crispr_initiated

    const navigate = useNavigate();
    const { patientId } = useParams(); // Get patient ID from URL if present
    const { setCurrentPatientId, addActivity } = useActivity(); // <-- Get context functions

    // Refs for scrolling
    const knownMutationsRef = useRef(null);
    const genomicQueryRef = useRef(null);
    const analysisResultsRef = useRef(null);
    const crisprRecommendationsRef = useRef(null); // Ref for CRISPR section

    const scrollToSection = (ref) => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // Effect to set the selected patient ID when provided via URL parameter
    useEffect(() => {
        const currentId = patientId || null;
        setSelectedPatientId(currentId);
        setCurrentPatientId(currentId); // <-- Set context patient ID

        if (currentId) {
            // Reset state when patient changes
            setCurrentWorkflowStep(WORKFLOW_STEPS.MUTATION_SELECTION); 
            setActiveMutation(null);
            setAnalysisResult(null);
            setGenomicQuery(''); // Reset query too
            setError(null);
            setAnalysisStatusForWorkflow('idle');
        } else {
            // Reset state when no patient ID
            setPatientMutations([]);
            setAnalysisResult(null);
            setActiveMutation(null);
            setGenomicQuery('');
            setError(null);
            setCurrentWorkflowStep(WORKFLOW_STEPS.IDLE);
            setAnalysisStatusForWorkflow('idle');
        }
    }, [patientId, setCurrentPatientId]); // Added setCurrentPatientId dependency

    // Fetch patient mutations when selectedPatientId changes
    const fetchPatientMutations = useCallback(async () => {
        if (!selectedPatientId) {
            setPatientMutations([]);
            setAnalysisResult(null);
            setError(null);
            setActiveMutation(null);
            setCurrentWorkflowStep(WORKFLOW_STEPS.IDLE);
            setAnalysisStatusForWorkflow('idle');
            return;
        }
        setIsLoadingPatient(true);
        setError(null);
        setAnalysisResult(null); 
        setPatientMutations([]); 
        setActiveMutation(null);
        setAnalysisStatusForWorkflow('idle');

        try {
            const response = await fetch(`${API_ROOT}/api/patients/${selectedPatientId}`);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`Patient ID ${selectedPatientId} not found in the database.`);
                }
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.detail || `HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            if (result.success && result.data && result.data.mutations) {
                 setPatientMutations(result.data.mutations);
                 // <-- Add activity log on successful mutation load
                 addActivity(
                    ACTIVITY_TYPES.GENOMIC_ANALYSIS, // Or a more specific type like 'DATA_LOAD'
                    `Loaded mutations for ${selectedPatientId}`,
                    { count: result.data.mutations.length } 
                 );
            } else {
                console.warn("Mutations data not found in response for patient:", selectedPatientId, result);
                setPatientMutations([]);
            }
        } catch (err) {
            console.error("Error fetching patient data:", err);
            setError(err.message || "Failed to load patient data.");
            setPatientMutations([]);
        } finally {
            setIsLoadingPatient(false);
            if(selectedPatientId) setCurrentWorkflowStep(WORKFLOW_STEPS.MUTATION_SELECTION);
        }
    }, [selectedPatientId, addActivity, API_ROOT]);

    useEffect(() => {
        if(selectedPatientId) fetchPatientMutations();
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
        setCurrentWorkflowStep(WORKFLOW_STEPS.ANALYSIS_VIEW); // Switch to analysis view
        setAnalysisStatusForWorkflow('loading');

        addActivity(
            ACTIVITY_TYPES.GENOMIC_QUERY_SUBMITTED,
            `Genomic query submitted for ${selectedPatientId}`,
            { query: currentQuery, patient: selectedPatientId }
        );

        if (mutationDetails) {
            setActiveMutation(mutationDetails);
        } else if (currentQuery.toLowerCase().includes('effect of')) {
            const parts = currentQuery.split(' ');
            const ofIndex = parts.findIndex(p => p.toLowerCase() === 'of');
            if (ofIndex !== -1 && parts.length > ofIndex + 2) {
                setActiveMutation({ gene: parts[ofIndex + 1], variant: parts[ofIndex + 2] });
            }
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

            // Log analysis success
            const successDetails = {
                query: currentQuery,
                patient: selectedPatientId,
                status: data.status // Overall status from backend
            };
            if (activeMutation) {
                successDetails.focused_mutation_gene = activeMutation.gene;
                successDetails.focused_mutation_variant = activeMutation.variant;
                // Attempt to find the VEP details for the active mutation
                if (data.simulated_vep_details && Array.isArray(data.simulated_vep_details)) {
                    const vepDetail = data.simulated_vep_details.find(
                        detail => detail.gene_symbol === activeMutation.gene && 
                                  (detail.protein_change === activeMutation.variant || 
                                   detail.canonical_variant_id === activeMutation.variant || 
                                   detail.input_variant_query === activeMutation.variant ||
                                   detail.input_variant_query === `${activeMutation.gene} ${activeMutation.variant}`)
                    );
                    if (vepDetail) {
                        successDetails.vep_classification = vepDetail.simulated_classification;
                        successDetails.vep_prediction = vepDetail.evo2_prediction;
                        if (vepDetail.delta_likelihood_score !== null && vepDetail.delta_likelihood_score !== undefined) {
                            successDetails.vep_score = parseFloat(vepDetail.delta_likelihood_score).toFixed(6);
                        }
                    }
                }
            }
            addActivity(
                ACTIVITY_TYPES.GENOMIC_ANALYSIS_SUCCESS,
                `Genomic analysis complete for ${selectedPatientId}`,
                successDetails
            );

            setTimeout(() => scrollToSection(analysisResultsRef), 100); 
        } catch (err) {
            console.error("Genomic analysis error:", err);
            setError(err.message || "Failed genomic analysis.");
            setAnalysisResult(null);
            setAnalysisStatusForWorkflow('error'); 

            // Log analysis error
            addActivity(
                ACTIVITY_TYPES.GENOMIC_ANALYSIS_ERROR,
                `Genomic analysis failed for ${selectedPatientId}`,
                { query: currentQuery, patient: selectedPatientId, error: err.message || "Unknown error" }
            );

        } finally {
            setIsLoadingAnalysis(false);
        }
    };

    const handleCrisprDesign = (mutation) => {
        console.log("--- handleCrisprDesign called for:", mutation); // <-- Log entry
        if (mutation.genomic_coordinate_hg38) {
            // Set state FIRST
            setActiveMutation(mutation); // Set focus for CRISPR view
            setCurrentWorkflowStep(WORKFLOW_STEPS.CRISPR_VIEW); // Switch to CRISPR view on-page
            setAnalysisStatusForWorkflow('crispr_initiated');
            console.log("--- State set for CRISPR_VIEW, activeMutation:", mutation); // <-- Log state set

            // Log CRISPR design initiation
            addActivity(
                ACTIVITY_TYPES.CRISPR_DESIGN_INITIATED,
                `CRISPR design initiated for ${mutation.hugo_gene_symbol} ${mutation.protein_change}`,
                {
                    patient: selectedPatientId,
                    gene: mutation.hugo_gene_symbol,
                    variant: mutation.protein_change,
                    coordinates: mutation.genomic_coordinate_hg38
                }
            );

            // THEN open the new tab
            const targetUrl = `http://localhost:8501?gene=${mutation.hugo_gene_symbol}&variant=${mutation.protein_change}&genomic_coord=${mutation.genomic_coordinate_hg38}&assembly=hg38`;
            window.open(targetUrl, '_blank', 'noopener,noreferrer'); // Added noopener,noreferrer for security
            
            // Scroll after potential state update and opening tab
            // Use setTimeout to allow state update to potentially trigger render before scroll
            setTimeout(() => {
                console.log("--- Attempting to scroll to crisprRecommendationsRef"); // <-- Log scroll attempt
                scrollToSection(crisprRecommendationsRef)
            }, 100); 
        } else {
             console.warn("handleCrisprDesign: No genomic coordinates for mutation:", mutation);
        }
    };
    
    const getStatusColor = (status) => {
        if (!status) return 'text-gray-400'; 
        switch (status.toUpperCase()) {
            case 'MET': return 'text-green-400';
            case 'NOT_MET': return 'text-red-400';
            case 'UNCLEAR': return 'text-yellow-400';
            case 'ERROR': return 'text-red-500';
            default: return 'text-gray-400';
        }
    };

    const fillQueryTemplate = (template, gene = null, variant = null) => {
        let filledQuery = template;
        if (gene) filledQuery = filledQuery.replace('{gene}', gene);
        if (variant) filledQuery = filledQuery.replace('{variant}', variant);
        return filledQuery;
    };

    const getRandomMutation = (mutations) => {
        if (!mutations || mutations.length === 0) return null;
        return mutations[Math.floor(Math.random() * mutations.length)];
    };

    const applySuggestedQuery = (template) => {
        let query = "";
        let mutationForFocus = null;
        if (patientMutations.length > 0) {
            const randomMutation = getRandomMutation(patientMutations);
            if (randomMutation) {
                const gene = randomMutation.hugo_gene_symbol;
                const variant = randomMutation.protein_change;
                mutationForFocus = { gene, variant };
                if (template.requiresGene && template.requiresVariant && gene && variant) {
                    query = fillQueryTemplate(template.value, gene, variant);
                } else if (template.requiresGene && gene) {
                    query = fillQueryTemplate(template.value, gene);
                } else {
                    query = fillQueryTemplate(template.value, "BRAF", "V600E");
                    mutationForFocus = { gene: "BRAF", variant: "V600E" }; 
                }
                setGenomicQuery(query);
                setCurrentWorkflowStep(WORKFLOW_STEPS.ANALYSIS_VIEW); // Switch to analysis view before analyzing
                setTimeout(() => scrollToSection(genomicQueryRef), 0); 
                setTimeout(() => handleAnalyze(query, mutationForFocus), 100);
                return;
            }
        }
        const placeholderGene = "BRAF";
            const placeholderVariant = template.requiresVariant ? "V600E" : "";
        mutationForFocus = { gene: placeholderGene, variant: placeholderVariant }; 
            query = fillQueryTemplate(template.value, placeholderGene, placeholderVariant);
        
        setGenomicQuery(query);
        setCurrentWorkflowStep(WORKFLOW_STEPS.ANALYSIS_VIEW);
        setTimeout(() => scrollToSection(genomicQueryRef), 0); 
        setTimeout(() => handleAnalyze(query, mutationForFocus), 100);
    };

    // Placeholder for mutation tab categories - replace with actual logic later
    const mutationTabs = ['All', 'Somatic', 'Germline']; // Example tabs
    const filteredMutations = patientMutations; // Replace with actual filtering based on activeMutationTab

    // Helper to get styling for workflow steps
    const getWorkflowStepClasses = (stepKey, currentActiveStep) => {
        let baseClasses = "p-3 rounded-md border flex-1 text-center transition-all duration-300 ease-in-out cursor-pointer";
        let textClasses = "text-xs";
        let titleClasses = "block font-semibold mb-0.5 text-sm";

        // Determine active step for styling
        let isActive = false;
        if (stepKey === 'step1' && currentActiveStep === WORKFLOW_STEPS.MUTATION_SELECTION) isActive = true;
        if (stepKey === 'step2' && currentActiveStep === WORKFLOW_STEPS.ANALYSIS_VIEW) isActive = true;
        if (stepKey === 'step3' && currentActiveStep === WORKFLOW_STEPS.CRISPR_VIEW) isActive = true;
        // Make step 3 look active if crispr was initiated, even if we are not in crispr view
        if (stepKey === 'step3' && analysisStatusForWorkflow === 'crispr_initiated' && currentActiveStep !== WORKFLOW_STEPS.CRISPR_VIEW) isActive = true;

        if (isActive) {
            return `${baseClasses} bg-purple-700 border-purple-500 shadow-lg scale-105 ${textClasses} ${titleClasses}`;
        }

        // Determine completed step for styling
        let isCompleted = false;
        if (stepKey === 'step1' && (currentActiveStep === WORKFLOW_STEPS.ANALYSIS_VIEW || currentActiveStep === WORKFLOW_STEPS.CRISPR_VIEW || analysisStatusForWorkflow === 'crispr_initiated')) isCompleted = true;
        if (stepKey === 'step2' && analysisStatusForWorkflow === 'complete' && (currentActiveStep === WORKFLOW_STEPS.CRISPR_VIEW || analysisStatusForWorkflow === 'crispr_initiated')) isCompleted = true;
        if (stepKey === 'step2' && analysisStatusForWorkflow === 'crispr_initiated') isCompleted = true; // If CRISPR initiated, step 2 is complete implicitly
        
        if (isCompleted) {
            return `${baseClasses} bg-green-700 border-green-500 hover:bg-green-600 ${textClasses} ${titleClasses}`;
        }
        
        // Special case for loading state of step 2
        if (stepKey === 'step2' && currentActiveStep === WORKFLOW_STEPS.ANALYSIS_VIEW && analysisStatusForWorkflow === 'loading'){
            return `${baseClasses} bg-yellow-600 border-yellow-400 animate-pulse ${textClasses} ${titleClasses}`;
        }

        return `${baseClasses} bg-gray-800 border-gray-700 hover:bg-gray-750 ${textClasses} ${titleClasses}`;
    };

    const handleWorkflowStepClick = (stepToGo) => {
        setCurrentWorkflowStep(stepToGo);
        // Scroll to the top of the relevant section when a workflow step is clicked
        if (stepToGo === WORKFLOW_STEPS.MUTATION_SELECTION) {
            setTimeout(() => scrollToSection(knownMutationsRef), 0);
        }
        if (stepToGo === WORKFLOW_STEPS.ANALYSIS_VIEW) {
            // If analysis is complete, scroll to results, otherwise to query input
            if(analysisStatusForWorkflow === 'complete' && analysisResultsRef.current){
                setTimeout(() => scrollToSection(analysisResultsRef), 0);
            } else if (genomicQueryRef.current){
                setTimeout(() => scrollToSection(genomicQueryRef), 0);
            }
        }
        if (stepToGo === WORKFLOW_STEPS.CRISPR_VIEW && crisprRecommendationsRef.current) {
             setTimeout(() => scrollToSection(crisprRecommendationsRef), 0);
        }
    };

    const renderContent = () => {
        switch (currentWorkflowStep) {
            case WORKFLOW_STEPS.MUTATION_SELECTION:
                return (
                    <>
                        <div id="known-mutations-section" ref={knownMutationsRef} className="p-4 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
                            <h3 className="text-xl font-semibold mb-3 text-gray-200">Known Mutations for {selectedPatientId}</h3>
                            <div className="mb-3 flex space-x-1 border-b border-gray-700">
                                {mutationTabs.map(tab => (
                                    <button 
                                        key={tab}
                                        onClick={() => setActiveMutationTab(tab)}
                                        className={`py-2 px-3 text-sm font-medium rounded-t-md transition-colors
                                            ${activeMutationTab === tab 
                                                ? 'bg-purple-600 text-white border-purple-600'
                                                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-750'}
                                        `}
                                    >
                                        {tab}
                                    </button>
                                ))}
                                        </div>
                            {isLoadingPatient ? <Loader /> :
                                filteredMutations.length > 0 ? (
                                <div className="overflow-x-auto max-h-[40vh]">
                                    <table className="min-w-full divide-y divide-gray-700">
                                        <thead className="bg-gray-750 sticky top-0 z-10">
                                            <tr>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Gene</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Protein Change</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Coord (hg38)</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th> 
                                </tr>
                            </thead>
                            <tbody className="bg-gray-800 divide-y divide-gray-700">
                                            {filteredMutations.map((mutation, index) => (
                                                <tr key={`mutation-${index}`} className={`hover:bg-gray-750 ${activeMutation && activeMutation.gene === mutation.hugo_gene_symbol && activeMutation.variant === mutation.protein_change ? 'bg-purple-900 border-l-4 border-purple-500' : ''}`}>
                                                    <td className="px-3 py-2 text-sm">{mutation.hugo_gene_symbol}</td>
                                                    <td className="px-3 py-2 text-sm">{mutation.protein_change}</td>
                                                    <td className="px-3 py-2 text-sm">{mutation.variant_type}</td>
                                                    <td className="px-3 py-2 text-sm">{mutation.genomic_coordinate_hg38 || "N/A"}</td>
                                                    <td className="px-3 py-2">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => {
                                                        const query = `Effect of ${mutation.hugo_gene_symbol} ${mutation.protein_change}`;
                                                        setGenomicQuery(query);
                                                                    handleAnalyze(query, { gene: mutation.hugo_gene_symbol, variant: mutation.protein_change });
                                                    }}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded text-xs"
                                                                title="Analyze Effect"
                                                >
                                                    Analyze Effect
                                                </button>
                                                <div className="relative group">
                                                    <button
                                                                    onClick={() => handleCrisprDesign(mutation)}
                                                                    className={`text-white py-1 px-2 rounded text-xs flex items-center
                                                                        ${mutation.genomic_coordinate_hg38 ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 cursor-not-allowed"}`}
                                                        disabled={!mutation.genomic_coordinate_hg38}
                                                                    title="Design CRISPR Guides"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                                                                    Design Guides
                                                    </button>
                                                                <div className="absolute z-20 w-64 px-3 py-2 text-xs bg-black text-gray-300 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bottom-full left-1/2 transform -translate-x-1/2 mb-2">
                                                            <p className="font-medium text-green-400 mb-1">Precision CRISPR Targeting</p>
                                                                    <p>Transfers: Gene ({mutation.hugo_gene_symbol}), Variant ({mutation.protein_change}), Coordinates ({mutation.genomic_coordinate_hg38 || 'N/A'}).</p>
                                                                    {!mutation.genomic_coordinate_hg38 && <p className="text-yellow-400">Missing genomic coordinates.</p>}
                                                                    <div className="absolute w-3 h-3 bg-black transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
                                                        </div>
                                                    </div>
                                                <button 
                                                    onClick={() => {
                                                                    const searchTerms = [mutation.hugo_gene_symbol, selectedPatientId.replace('PAT', '')].filter(Boolean).join('+');
                                                                    const clinicalTrialsURL = `https://clinicaltrials.gov/search?cond=${searchTerms}&recrs=a&type=Intr`;
                                                        window.open(clinicalTrialsURL, '_blank');
                                                    }}
                                                                className="bg-orange-600 hover:bg-orange-700 text-white py-1 px-2 rounded text-xs"
                                                                title="Find Clinical Trials for this gene"
                                                >
                                                                Find Trials
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                            ) : (
                                <p className="text-gray-400 py-3">{(isLoadingPatient) ? 'Loading mutations...' : (error && error.includes("not found")) ? error : (error ? "Error loading mutations." : `No known mutations for ${selectedPatientId}.` )}</p>
            )}
                </div>
                        <div id="genomic-query-section" ref={genomicQueryRef} className="p-4 bg-gray-800 rounded-lg shadow-xl border border-gray-700 mt-6">
                             <label htmlFor="genomic-query" className="block text-lg font-semibold text-gray-200 mb-2">Genomic Query</label>
                             <div className="mb-4 p-3 bg-gray-700 rounded-md border border-gray-600">
                            <h4 className="text-sm font-medium text-gray-300 mb-2">Suggested Queries:</h4>
                                 <div className="space-y-1.5">
                                     {Object.entries(suggestedQueryTemplates).map(([category, templates]) => (
                                         <div key={category}>
                                             <span className={`text-xs text-${category === 'effect' ? 'indigo' : category === 'presence' ? 'green' : category === 'absence' ? 'yellow' : 'red'}-400 block mb-0.5`}>{category.charAt(0).toUpperCase() + category.slice(1)} Queries:</span>
                                             <div className="flex flex-wrap gap-1.5">
                                                 {templates.map((template, idx) => (
                                            <button 
                                                         key={`${category}-${idx}`}
                                                onClick={() => applySuggestedQuery(template)}
                                                         className={`bg-${category === 'effect' ? 'indigo' : category === 'presence' ? 'green' : category === 'absence' ? 'yellow' : 'red'}-900 hover:bg-${category === 'effect' ? 'indigo' : category === 'presence' ? 'green' : category === 'absence' ? 'yellow' : 'red'}-800 text-xs text-gray-200 py-1 px-2 rounded transition-colors`}
                                            >
                                                {template.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                        ))}
                                    </div>
                                 <p className="mt-2 text-xs text-gray-400 italic">Templates use patient data when available.</p>
                                </div>
                             <textarea 
                                 id="genomic-query"
                                 rows="3"
                                 value={genomicQuery}
                                 onChange={(e) => setGenomicQuery(e.target.value)}
                                 placeholder="e.g., Pathogenic KRAS mutation, Effect of TP53 P72R"
                                 className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600 focus:ring-purple-500 focus:border-purple-500 outline-none"
                             />
                                            <button 
                                 onClick={() => handleAnalyze()} 
                                 disabled={isLoadingAnalysis || !genomicQuery.trim() || isLoadingPatient}
                                 className="mt-3 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                             >
                                 {isLoadingAnalysis ? (
                                     <><Loader size="small" color="white" /><span className="ml-2">Analyzing...</span></>
                                 ) : "Analyze Genomic Query"}
                                            </button>
                                    </div>
                    </>
                );
            case WORKFLOW_STEPS.ANALYSIS_VIEW:
                return (
                    <>
                        {activeMutation && (
                            <div className="p-3 mb-6 bg-gray-700 rounded-lg shadow-md border border-gray-600">
                                <h4 className="text-md font-semibold text-purple-300">
                                    Current Focus: <span className="text-white">{activeMutation.gene} - {activeMutation.variant}</span>
                                </h4>
                                </div>
                        )}
                        <div id="genomic-query-section-readonly" ref={genomicQueryRef} className="p-4 bg-gray-800 rounded-lg shadow-xl border border-gray-700 mb-6">
                            <label htmlFor="genomic-query-current" className="block text-lg font-semibold text-gray-200 mb-2">Current/New Query</label>
                        <textarea 
                                 id="genomic-query-current"
                                 rows="2"
                            value={genomicQuery}
                            onChange={(e) => setGenomicQuery(e.target.value)}
                                 placeholder="Enter new query or review current one"
                                 className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600 focus:ring-purple-500 focus:border-purple-500 outline-none mb-2"
                                 disabled={isLoadingAnalysis}
                             />
                        <button 
                                 onClick={() => handleAnalyze()} 
                                 disabled={isLoadingAnalysis || !genomicQuery.trim() || isLoadingPatient}
                                 className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                        >
                            {isLoadingAnalysis ? (
                                     <><Loader size="small" color="white" /><span className="ml-2">Re-Analyzing...</span></>
                                 ) : "Run/Re-run Query"}
                        </button>
                    </div>

                        {isLoadingAnalysis || analysisStatusForWorkflow === 'loading' ? (
                            <div ref={analysisResultsRef} className="p-4 bg-gray-800 rounded-lg shadow-xl border border-gray-700 flex justify-center items-center">
                            <Loader /> 
                                <p className="ml-3 text-gray-300">Analyzing, please wait...</p>
                        </div>
                        ) : error && analysisStatusForWorkflow === 'error' ? (
                             <div ref={analysisResultsRef} className="p-3 bg-red-800 text-red-100 rounded-md shadow-md border border-red-700">
                                <p className="font-semibold">Analysis Error:</p>
                                <p>{error}</p>
                            </div>
                        ) : analysisResult && analysisStatusForWorkflow === 'complete' ? (
                            <div id="analysis-results-section" ref={analysisResultsRef} className="p-4 bg-gray-800 rounded-lg shadow-xl border border-gray-700 space-y-4">
                                <h2 className="text-2xl font-semibold text-purple-300">Analysis Results</h2>
                                <div className="p-3 bg-gray-700 rounded-md border border-gray-600">
                                <p className="text-lg font-medium">Overall Query Status: 
                                        <span className={`ml-1 font-bold ${getStatusColor(analysisResult.status)}`}>{analysisResult.status || 'N/A'}</span>
                                </p>
                                    {analysisResult.summary && <p className="mt-1 text-sm text-gray-300">{analysisResult.summary}</p>}
                                    <p className="mt-1 text-xs text-gray-500">VEP is based on a MOCK EVO2 SIMULATION.</p>
                            </div>
                            {analysisResult.clinical_significance_context && (
                                    <div className="p-3 bg-indigo-900 bg-opacity-60 border border-indigo-700 rounded">
                                     <h3 className="text-lg font-semibold mb-1 text-indigo-300">Clinical Context & Significance:</h3>
                                         <div className="prose prose-sm prose-invert max-w-none text-gray-300" dangerouslySetInnerHTML={{ __html: analysisResult.clinical_significance_context.replace(/\n/g, '<br />') }} />
                                </div>
                            )}
                            {analysisResult.gene_summary_statuses && Object.keys(analysisResult.gene_summary_statuses).length > 0 && (
                                <div className="mb-4">
                                    <h3 className="text-xl font-semibold mb-2 text-gray-300">Gene Summary Statuses:</h3>
                                    <ul className="list-disc list-inside pl-2 space-y-1 bg-gray-700 p-3 rounded">
                                        {Object.entries(analysisResult.gene_summary_statuses).map(([gene, status]) => (
                                            <li key={gene} className="text-gray-200">
                                                <span className="font-semibold">{gene}:</span> {typeof status === 'string' ? status : status.status}
                                                {typeof status !== 'string' && status.details && (
                                                    <span className="text-xs block ml-6 mt-1 text-gray-400">{status.details}</span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {analysisResult.simulated_vep_details && analysisResult.simulated_vep_details.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="text-xl font-semibold text-gray-200">Simulated VEP Details:</h3>
                                        <div className="overflow-x-auto rounded-md border border-gray-700">
                                            <table className="min-w-full divide-y divide-gray-700">
                                                <thead className="bg-gray-750">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">Gene</th>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">Variant</th>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">Classification</th>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">Consequence</th>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">Pred. Scores</th>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">Knowledge Bases</th>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">Evo2 Prediction</th>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">Delta Score</th>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">Evo2 Confidence</th>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">Reasoning</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-gray-800 divide-y divide-gray-700">
                                                {analysisResult.simulated_vep_details.map((detail, index) => (
                                                        <tr key={index} className="hover:bg-gray-750">
                                                            <td className="px-3 py-2 text-sm">{detail.gene_symbol || 'N/A'}</td>
                                                            <td className="px-3 py-2 text-sm">{detail.canonical_variant_id || detail.protein_change || detail.input_variant_query} {(detail.variant_type_from_input ? `(${detail.variant_type_from_input})` : '')}</td>
                                                            <td className="px-3 py-2 text-sm">{detail.simulated_classification}</td>
                                                            <td className="px-3 py-2 text-sm">{detail.predicted_consequence || 'N/A'}</td>
                                                            <td className="px-3 py-2 text-sm">
                                                                {detail.simulated_tools ? (<><div>SIFT: {detail.simulated_tools.sift || 'N/A'}</div><div>PolyPhen: {detail.simulated_tools.polyphen || 'N/A'}</div></>) : 'N/A'}
                                                        </td>
                                                            <td className="px-3 py-2 text-sm">
                                                                {detail.mock_knowledgebases ? (<><div>ClinVar: {detail.mock_knowledgebases.clinvar_significance || 'N/A'}</div><div>OncoKB: {detail.mock_knowledgebases.oncokb_level || 'N/A'}</div></>) : 'N/A'}
                                                        </td>
                                                            <td className={`px-3 py-2 text-sm font-medium ${
                                                                detail.evo2_prediction?.toLowerCase().includes('pathogenic') || detail.evo2_prediction?.toLowerCase().includes('activating') || detail.evo2_prediction?.toLowerCase().includes('oncogenic') ? 'text-red-400' :
                                                                detail.evo2_prediction?.toLowerCase().includes('benign') || detail.evo2_prediction?.toLowerCase().includes('neutral') ? 'text-green-400' :
                                                                detail.evo2_prediction?.toLowerCase().includes('uncertain') || detail.evo2_prediction?.toLowerCase().includes('vus') ? 'text-yellow-400' :
                                                                'text-gray-300'
                                                            }`}>{detail.evo2_prediction || 'N/A'}</td>
                                                            <td className="px-3 py-2 text-sm">{detail.delta_likelihood_score !== null && detail.delta_likelihood_score !== undefined ? detail.delta_likelihood_score.toFixed(6) : 'N/A'}</td>
                                                            <td className="px-3 py-2 text-sm">{detail.evo2_confidence !== null && detail.evo2_confidence !== undefined ? `${(detail.evo2_confidence * 100).toFixed(0)}%` : 'N/A'}</td>
                                                            <td className="px-3 py-2 text-sm max-w-xs whitespace-pre-wrap">{detail.classification_reasoning}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                                {analysisResult.crispr_recommendations && analysisResult.crispr_recommendations.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="text-xl font-semibold text-green-300 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zM9 11a1 1 0 11-2 0 1 1 0 012 0zm2-2a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" /></svg>
                                            CRISPR Therapeutic Recommendations (Conceptual)
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {analysisResult.crispr_recommendations.map((rec, index) => (
                                                <div key={index} className="p-3 rounded-md border border-gray-700 bg-gray-750 hover:border-green-600 transition-colors">
                                                    <strong className="text-green-400 block mb-1">Target: {rec.target_gene} ({rec.target_variant || 'N/A'})</strong>
                                                    <span className="text-xs text-gray-400 block mb-0.5">Approach: {rec.recommended_approach || 'N/A'}</span>
                                                    <p className="text-sm text-gray-300 mb-1">Rationale: {rec.rationale || 'N/A'}</p>
                                                    <p className="text-xs text-gray-400">Confidence: 
                                                        <span className={`font-medium ml-1 ${rec.confidence_score >= 0.8 ? 'text-green-400' : rec.confidence_score >= 0.6 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                            {rec.confidence_score !== null && rec.confidence_score !== undefined ? `${(rec.confidence_score * 100).toFixed(0)}%` : 'N/A'}
                                                        </span>
                                                    </p>
                                                    {rec.source && <p className="text-xs text-gray-500 mt-1 italic">Source: {rec.source}</p>}
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500 italic mt-2">Note: These recommendations are simulated. Clinical decisions require expert consultation.</p>
                                    </div>
                                )}
                            {analysisResult.evidence && (
                                    <details className="bg-gray-700 rounded-md border border-gray-600">
                                        <summary className="p-2 cursor-pointer text-sm text-gray-400 hover:text-gray-200">
                                            View Full Evidence String
                                        </summary>
                                        <pre className="p-3 text-xs text-gray-300 whitespace-pre-wrap bg-gray-750 rounded-b-md">
                                        {analysisResult.evidence}
                                    </pre>
                                    </details>
                                )}
                            </div>
                        ) : (
                            <div ref={analysisResultsRef} className="p-4 bg-gray-800 rounded-lg shadow-xl border border-gray-700 text-center py-10">
                                <p className="text-gray-500">Perform an analysis to see results here.</p>
                                </div>
                            )}
                    </>
                );
            case WORKFLOW_STEPS.CRISPR_VIEW:
                console.log("--- Entering CRISPR View Render --- "); // <-- RE-ADD LOG HERE
                let activeMutationVEP = null;
                let specificCrisprRecForActiveMutation = null;

                if (activeMutation && analysisResult && analysisResult.simulated_vep_details) {
                    activeMutationVEP = analysisResult.simulated_vep_details.find(
                        detail => detail.gene_symbol === activeMutation.hugo_gene_symbol && 
                                  (detail.protein_change === activeMutation.protein_change || 
                                   detail.canonical_variant_id === activeMutation.protein_change || 
                                   detail.input_variant_query === activeMutation.protein_change || // Match input query as well
                                   detail.input_variant_query === `${activeMutation.hugo_gene_symbol} ${activeMutation.protein_change}`) // Match combined gene variant query
                    );
                }
                if (activeMutation && analysisResult && analysisResult.crispr_recommendations) {
                    specificCrisprRecForActiveMutation = analysisResult.crispr_recommendations.find(
                        rec => rec.target_gene === activeMutation.hugo_gene_symbol && 
                               ( 
                                 (rec.target_variant && rec.target_variant.startsWith(activeMutation.protein_change)) || // Check if variant starts with protein change
                                 !rec.target_variant // Or if it's a general recommendation for the gene
                               )
                    );
                }

                const hasGeneralCrisprRecommendations = analysisResult && analysisResult.crispr_recommendations && analysisResult.crispr_recommendations.length > 0;

                // Add the detailed log here as well
                console.log("CRISPR View Data Check:", { // <-- ADD DETAILED LOG HERE TOO
                    currentStep: currentWorkflowStep, 
                    activeMutation,
                    activeMutationVEP,
                    analysisResultCrisprRecs: analysisResult?.crispr_recommendations,
                    specificCrisprRecForActiveMutation,
                    hasGeneralCrisprRecommendations
                });
                                            
                                            return (
                    <div id="crispr-recommendations-section" ref={crisprRecommendationsRef} className="p-4 bg-gray-800 rounded-lg shadow-xl border border-gray-700 space-y-4">
                        {activeMutation && (
                            <div className="p-3 mb-4 bg-gray-700 rounded-lg shadow-md border border-gray-600">
                                <h4 className="text-md font-semibold text-purple-300">
                                    CRISPR Target Focus: <span className="text-white">{activeMutation.hugo_gene_symbol} - {activeMutation.protein_change}</span>
                                                    </h4>
                            </div>
                        )}
                        <h2 className="text-2xl font-semibold text-green-300 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zM9 11a1 1 0 11-2 0 1 1 0 012 0zm2-2a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" /></svg>
                            CRISPR Therapeutic Recommendations (Conceptual)
                        </h2>
                        <p className="text-md text-gray-400 mb-4">Based on the Evo2 variant analysis, the following CRISPR therapeutic approaches could be considered:</p>

                        {activeMutation && activeMutationVEP ? (
                            // Case 1: Active mutation focus with VEP details found
                            <div className="p-3 bg-gray-750 rounded-md border border-gray-600 space-y-3">
                                <div>
                                    <h5 className="text-lg font-semibold text-gray-100">{activeMutation.hugo_gene_symbol} {activeMutation.protein_change}</h5>
                                    <p className="text-sm text-gray-300">
                                        Classification: <span className={`font-medium ${activeMutationVEP.simulated_classification?.toLowerCase().includes('pathogenic') ? 'text-red-400' : activeMutationVEP.simulated_classification?.toLowerCase().includes('benign') ? 'text-green-400' : 'text-gray-300'}`}>
                                            {activeMutationVEP.simulated_classification || 'N/A (VEP classification not found for focus)'}
                                        </span>
                                                        </p>
                                                    </div>
                                <div className="pt-1">
                                    <h6 className="text-sm font-semibold text-gray-200 mb-1">Recommended Approach:</h6>
                                    {specificCrisprRecForActiveMutation ? (
                                        <div className="text-sm text-gray-300 space-y-2">
                                            {specificCrisprRecForActiveMutation.editing_type && (
                                                <p><span className="font-semibold text-gray-100">Editing Type:</span> {specificCrisprRecForActiveMutation.editing_type}</p>
                                            )}
                                            {specificCrisprRecForActiveMutation.recommended_approach && (
                                                <p><span className="font-semibold text-gray-100">Approach Details:</span> {specificCrisprRecForActiveMutation.recommended_approach}</p>
                                            )}
                                            {specificCrisprRecForActiveMutation.rationale && (
                                                 <p><span className="font-semibold text-gray-100">Rationale:</span> {specificCrisprRecForActiveMutation.rationale}</p>
                                            )}
                                            {specificCrisprRecForActiveMutation.potential_tools && specificCrisprRecForActiveMutation.potential_tools.length > 0 && (
                                                <div>
                                                    <span className="font-semibold text-gray-100">Potential Tools:</span>
                                                    <ul className="list-disc list-inside ml-4 text-gray-400">
                                                        {specificCrisprRecForActiveMutation.potential_tools.map((tool, index) => (
                                                            <li key={index}>{tool}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {specificCrisprRecForActiveMutation.confidence_score !== null && specificCrisprRecForActiveMutation.confidence_score !== undefined && (
                                                <p><span className="font-semibold text-gray-100">Confidence:</span> <span className={`font-medium ${specificCrisprRecForActiveMutation.confidence_score >= 0.8 ? 'text-green-400' : specificCrisprRecForActiveMutation.confidence_score >= 0.6 ? 'text-yellow-400' : 'text-red-400'}`}>{ (specificCrisprRecForActiveMutation.confidence_score * 100).toFixed(0) }%</span></p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">
                                            No specific CRISPR recommendation directly available for {activeMutation.hugo_gene_symbol} {activeMutation.protein_change} in the current analysis. General strategies may apply.
                                        </p>
                                    )}
                                </div>
                                {activeMutation.genomic_coordinate_hg38 ? (
                                    <button
                                        onClick={() => handleCrisprDesign(activeMutation)}
                                        className="mt-3 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm flex items-center"
                                        title="Design CRISPR Guides (Opens External Tool)"
                                    >
                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                                        Design CRISPR Guides
                                    </button>
                                ) : (
                                    <p className="text-xs text-yellow-500 mt-2">Genomic coordinates not available for direct CRISPR design link for this mutation.</p>
                                )}
                                {/* If no specific rec for active mutation, but general ones exist, show them below the focused section */}
                                {!specificCrisprRecForActiveMutation && hasGeneralCrisprRecommendations && (
                                    <div className="mt-4 pt-4 border-t border-gray-700">
                                        <h6 className="text-sm font-semibold text-gray-300 mb-2">General CRISPR Recommendations from Analysis:</h6>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {analysisResult.crispr_recommendations.map((rec, index) => (
                                                <div key={index} className="p-3 rounded-md border border-gray-700 bg-gray-800 hover:border-green-600 transition-colors">
                                                    <strong className="text-green-400 block mb-1">Target: {rec.target_gene} ({rec.target_variant || 'N/A'})</strong>
                                                    <span className="text-xs text-gray-400 block mb-0.5">Approach: {rec.recommended_approach || 'N/A'}</span>
                                                    <p className="text-sm text-gray-300 mb-1">Rationale: {rec.rationale || 'N/A'}</p>
                                                    <p className="text-xs text-gray-400">Confidence: 
                                                        <span className={`font-medium ml-1 ${rec.confidence_score >= 0.8 ? 'text-green-400' : rec.confidence_score >= 0.6 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                            {rec.confidence_score !== null && rec.confidence_score !== undefined ? `${(rec.confidence_score * 100).toFixed(0)}%` : 'N/A'}
                                                        </span>
                                                    </p>
                                                    {rec.source && <p className="text-xs text-gray-500 mt-1 italic">Source: {rec.source}</p>}
                                                            </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : hasGeneralCrisprRecommendations ? (
                            // Case 2: No active mutation focus OR VEP details for focus not found, BUT general CRISPR recommendations exist
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {analysisResult.crispr_recommendations.map((rec, index) => (
                                    <div key={index} className="p-3 rounded-md border border-gray-700 bg-gray-750 hover:border-green-600 transition-colors">
                                        <strong className="text-green-400 block mb-1">Target: {rec.target_gene} ({rec.target_variant || 'N/A'})</strong>
                                        <span className="text-xs text-gray-400 block mb-0.5">Approach: {rec.recommended_approach || 'N/A'}</span>
                                        <p className="text-sm text-gray-300 mb-1">Rationale: {rec.rationale || 'N/A'}</p>
                                        <p className="text-xs text-gray-400">Confidence: 
                                            <span className={`font-medium ml-1 ${rec.confidence_score >= 0.8 ? 'text-green-400' : rec.confidence_score >= 0.6 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                {rec.confidence_score !== null && rec.confidence_score !== undefined ? `${(rec.confidence_score * 100).toFixed(0)}%` : 'N/A'}
                                                            </span>
                                        </p>
                                        {rec.source && <p className="text-xs text-gray-500 mt-1 italic">Source: {rec.source}</p>}
                                                        </div>
                                ))}
                                                    </div>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-gray-400">CRISPR recommendations require a completed genomic analysis with relevant findings.</p>
                                <p className="text-sm text-gray-500 mt-2">Please run an analysis first. If analysis is done, ensure it produced CRISPR-related suggestions.</p>
                                <button 
                                    onClick={() => setCurrentWorkflowStep(WORKFLOW_STEPS.ANALYSIS_VIEW)}
                                    className="mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded"
                                >
                                    Go to Analysis View
                                </button>
                            </div>
                        )}
                         <p className="text-xs text-gray-500 italic mt-2">Note: These recommendations are simulated. Clinical decisions require expert consultation.</p>
                                                </div>
                                            );
            default:
                return (
                    <div className="p-4 bg-gray-800 rounded-lg shadow-xl border border-gray-700 text-center py-10">
                         <p className="text-xl text-gray-500">Please select a patient to begin.</p>
                                        </div>
                );
        }
    };

    return (
        <div className="p-6 min-h-screen bg-gray-1050 text-gray-300 px-4 sm:px-6 lg:px-8">
            {/* Header Navigation and Title */}
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => navigate(-1)} className="bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded transition-colors">
                    &larr; Back
                </button>
                <h1 className="text-3xl font-bold text-center text-purple-400 flex-grow">Mutation Explorer</h1>
                <div> {/* Placeholder for right-aligned buttons if any, or to balance the flex layout */}
                    {patientId && (
                        <button onClick={() => navigate(`/medical-records/${patientId}`)} className="ml-2 bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded transition-colors">
                            Patient Record
                        </button>
                    )}
                    {/* Add other buttons like 'Go to Research Portal' if needed here */}
                </div>
                                </div>
                                
            {/* Dynamic Genomic Intelligence Platform - Workflow Visualizer */}
            {selectedPatientId && (
                <div className="mb-6 p-4 bg-gray-900 rounded-lg shadow-xl border border-purple-700">
                    <h3 className="text-xl font-semibold mb-3 text-purple-300 text-center">Genomic Intelligence Workflow</h3>
                    <div className="flex flex-col md:flex-row gap-3 justify-around items-stretch">
                        {/* Step 1: Select Mutation */}
                        <div className={getWorkflowStepClasses('step1', currentWorkflowStep)} onClick={() => handleWorkflowStepClick(WORKFLOW_STEPS.MUTATION_SELECTION)}>
                            <span className={getWorkflowStepClasses('step1', currentWorkflowStep).includes('text-sm') ? '' : 'text-sm font-semibold block mb-0.5'}>1. Select/View Mutations</span>
                            <p className={getWorkflowStepClasses('step1', currentWorkflowStep).includes('text-xs') ? '' : 'text-xs'}>Review patient's genomic variants.</p>
                                </div>
                        {/* Step 2: Analyze Impact */}
                        <div className={getWorkflowStepClasses('step2', currentWorkflowStep)} onClick={() => handleWorkflowStepClick(WORKFLOW_STEPS.ANALYSIS_VIEW)}>
                             <span className={getWorkflowStepClasses('step2', currentWorkflowStep).includes('text-sm') ? '' : 'text-sm font-semibold block mb-0.5'}>
                                {analysisStatusForWorkflow === 'loading' ? "2. Analyzing Impact..." : "2. Analyze Impact (Evo2)"}
                            </span>
                            <p className={getWorkflowStepClasses('step2', currentWorkflowStep).includes('text-xs') ? '' : 'text-xs'}>Predict functional effects & query genome.</p>
                        </div>
                        {/* Step 3: Design Targeting */}
                        <div className={getWorkflowStepClasses('step3', currentWorkflowStep)} 
                             onClick={() => handleWorkflowStepClick(WORKFLOW_STEPS.CRISPR_VIEW)}
                        >
                            <span className={getWorkflowStepClasses('step3', currentWorkflowStep).includes('text-sm') ? '' : 'text-sm font-semibold block mb-0.5'}>3. Design Targeting (CRISPR)</span>
                            <p className={getWorkflowStepClasses('step3', currentWorkflowStep).includes('text-xs') ? '' : 'text-xs'}>View conceptual recommendations.</p>
                        </div>
                            </div>
                        </div>
                    )}

            {/* Main content area that renders based on currentWorkflowStep */}
            <div className="lg:grid lg:grid-cols-12 lg:gap-6">
                <div className="lg:col-span-12">
                    {selectedPatientId ? renderContent() :
                        <div className="p-4 bg-gray-800 rounded-lg shadow-xl border border-gray-700 text-center py-10">
                            <p className="text-xl text-gray-500">Please select a patient to begin.</p>
                        </div>
                    }
                </div>
            </div>
        </div>
    );
};

export default MutationExplorer; 