// VUS Explorer Constants - Fully Dynamic Configuration

export const WORKFLOW_STEPS = {
  IDLE: 'idle',
  MUTATION_SELECTION: 'mutation_selection',
  ANALYSIS_VIEW: 'analysis_view',
  CRISPR_VIEW: 'crispr_view'
};

export const WORKFLOW_STEPS_CONFIG = [
    {
        key: 'step1',
        title: '1. Select/View Mutations',
        description: 'Review patient\'s genomic variants.',
        workflowStep: 'mutation_selection'
    },
    {
        key: 'step2', 
        title: '2. Analyze Impact (Evo2)',
        description: 'Predict functional effects & query genome.',
        workflowStep: 'analysis_view'
    },
    {
        key: 'step3',
        title: '3. Design Targeting (CRISPR)',
        description: 'View conceptual recommendations.',
        workflowStep: 'crispr_view'
    }
];

export const MUTATION_TABS = ['All', 'Somatic', 'Germline'];

export const SUGGESTED_QUERY_TEMPLATES = {
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
        { label: "Absence of [GENE] [VARIANT]", value: "Absence of {gene} {variant}", requiresGene: true, requiresVariant: false },
        { label: "No pathogenic [GENE] mutation", value: "No pathogenic {gene} mutation", requiresGene: true, requiresVariant: false },
    ],
    resistance: [
        { label: "Resistance mutation in [GENE]", value: "Resistance mutation in {gene}", requiresGene: true, requiresVariant: false },
        { label: "No resistance mutation in [GENE]", value: "No resistance mutation in {gene}", requiresGene: true, requiresVariant: false },
    ]
};

export const CATEGORY_COLORS = {
    effect: 'indigo',
    presence: 'green', 
    absence: 'yellow',
    resistance: 'red'
};

export const STATUS_COLORS = {
    MET: 'text-green-400',
    NOT_MET: 'text-red-400',
    UNCLEAR: 'text-yellow-400',
    ERROR: 'text-red-500',
    DEFAULT: 'text-gray-400'
};

export const PREDICTION_COLORS = {
    pathogenic: 'text-red-400',
    activating: 'text-red-400',
    oncogenic: 'text-red-400',
    benign: 'text-green-400',
    neutral: 'text-green-400',
    uncertain: 'text-yellow-400',
    vus: 'text-yellow-400',
    default: 'text-gray-300'
};

export const CONFIDENCE_COLORS = {
    high: 'text-green-400',    // >= 0.8
    medium: 'text-yellow-400', // >= 0.6
    low: 'text-red-400'        // < 0.6
};

export const DEFAULT_PLACEHOLDER_GENE = "BRAF";
export const DEFAULT_PLACEHOLDER_VARIANT = "V600E";

export const EXTERNAL_URLS = {
    CRISPR_DESIGNER: 'http://localhost:8501',
    CLINICAL_TRIALS: 'https://clinicaltrials.gov/search'
};

export const DEFAULT_CLASSES = {
    container: "p-4 bg-gray-800 rounded-lg shadow-xl border border-gray-700",
    banner: "mb-4 p-4 bg-gray-900 rounded-lg border border-gray-700",
    header: "flex justify-between items-center mb-4",
    button: "bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded transition-colors",
    input: "w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600 focus:ring-purple-500 focus:border-purple-500 outline-none",
    table: "min-w-full divide-y divide-gray-700",
    tableHeader: "bg-gray-750 sticky top-0 z-10",
    tableRow: "hover:bg-gray-750",
    card: "p-3 rounded-md border border-gray-700 bg-gray-750 hover:border-green-600 transition-colors"
};

export const ACTION_BUTTONS = {
    analyze: {
        label: "Analyze Effect",
        className: "bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded text-xs",
        title: "Analyze Effect"
    },
    design: {
        label: "Design Guides",
        title: "Design CRISPR Guides",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
        ),
        tooltip: {
            title: "Precision CRISPR Targeting",
            warning: "Missing genomic coordinates."
        }
    },
    trials: {
        label: "Find Trials",
        className: "bg-orange-600 hover:bg-orange-700 text-white py-1 px-2 rounded text-xs",
        title: "Find Clinical Trials for this gene"
    }
};

export const MESSAGES = {
    loading: {
        mutations: 'Loading mutations...',
        analysis: 'Analyzing, please wait...',
        reanalyzing: 'Re-Analyzing...'
    },
    errors: {
        patientNotFound: (id) => `Patient ID ${id} not found in the database.`,
        loadFailed: "Failed to load patient data.",
        analysisFailed: "Failed genomic analysis.",
        noMutations: (id) => `No known mutations for ${id}.`,
        noCoordinates: "Genomic coordinates not available for direct CRISPR design link for this mutation."
    },
    placeholders: {
        query: "e.g., Pathogenic KRAS mutation, Effect of TP53 P72R",
        newQuery: "Enter new query or review current one"
    },
    disclaimers: {
        vepSimulation: "VEP is based on a MOCK EVO2 SIMULATION.",
        clinicalDecisions: "Note: These recommendations are simulated. Clinical decisions require expert consultation.",
        researchMode: "Results are research‑mode and cohort‑dependent."
    }
};

export const RESEARCH_MODE_CONFIG = {
    focus: "resolve unknown variants with transparent signals and clear next actions",
    features: [
        "Run insights to see Functionality / Regulatory / Essentiality / Chromatin chips",
        "Check prior coverage (ClinVar, AM) and provenance (run ID, profile)",
        "Actions: Send to Dossier · Run WIWFM · Open CRISPR Designer (when coords exist)"
    ],
    disclaimer: "Results are research‑mode and cohort‑dependent."
};
