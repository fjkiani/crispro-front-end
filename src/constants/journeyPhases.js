/**
 * journeyPhases.js — 6-Phase Patient Journey Configuration
 *
 * Single source of truth for the phase-based navigation spine.
 * Each phase answers one patient question, produces one artifact,
 * and ends with "what to do next + what test unlocks it."
 */

import {
    AssignmentInd as ProfileIcon,
    Science as TestsIcon,
    Medication as TreatmentIcon,
    Timeline as MonitoringIcon,
    Shield as ResistanceIcon,
    Description as BoardIcon,
} from '@mui/icons-material';

export const JOURNEY_PHASES = [
    {
        id: 1,
        key: 'profile',
        question: 'What do we know about you?',
        label: 'Patient Snapshot',
        shortLabel: 'Snapshot',
        route: '/ayesha/journey/profile',
        icon: ProfileIcon,
        color: '#10b981',
        output: 'Your care snapshot + missing data plan',
        nextPhase: 2,
        nextCTA: 'Go to Tests & Unlocks',
    },
    {
        id: 2,
        key: 'tests',
        question: 'What should we test next?',
        label: 'Tests & Unlocks',
        shortLabel: 'Tests',
        route: '/ayesha/journey/tests',
        icon: TestsIcon,
        color: '#3b82f6',
        output: 'Prioritized test plan + unlock progress',
        nextPhase: 3,
        nextCTA: 'See Treatment Options',
    },
    {
        id: 3,
        key: 'treatment',
        question: 'What treatments fit me today?',
        label: 'Treatment Fit',
        shortLabel: 'Treatment',
        route: '/ayesha/journey/treatment',
        icon: TreatmentIcon,
        color: '#8b5cf6',
        output: 'Treatment shortlist + questions for oncologist',
        nextPhase: 4,
        nextCTA: 'Set Up Monitoring',
    },
    {
        id: 4,
        key: 'monitoring',
        question: 'How will we know if it\'s working?',
        label: 'Monitoring',
        shortLabel: 'Monitor',
        route: '/ayesha/journey/monitoring',
        icon: MonitoringIcon,
        color: '#0ea5e9',
        output: 'Monitoring plan + alert thresholds (RUO)',
        nextPhase: 5,
        nextCTA: 'View Resistance Plan',
    },
    {
        id: 5,
        key: 'resistance',
        question: 'If it stops working, what\'s next?',
        label: 'Resistance & Contingency',
        shortLabel: 'Resistance',
        route: '/ayesha/journey/resistance',
        icon: ResistanceIcon,
        color: '#f59e0b',
        output: 'Contingency plan',
        nextPhase: 6,
        nextCTA: 'Build Tumor Board Packet',
    },
    {
        id: 6,
        key: 'board',
        question: 'Bring it to your doctor',
        label: 'Tumor Board Packet',
        shortLabel: 'Board',
        route: '/ayesha/journey/board',
        icon: BoardIcon,
        color: '#ec4899',
        output: 'Exportable care packet (PDF + share)',
        nextPhase: null,
        nextCTA: null,
    },
];

/**
 * Unlock cards — tests that gate specific capabilities.
 * Each test maps to which phase features it unlocks.
 */
export const UNLOCK_TESTS = [
    {
        id: 'hrd',
        name: 'HRD Score Assay',
        what: 'Homologous Recombination Deficiency testing',
        unlocks: ['PARP sensitivity prediction', 'Platinum response module', 'L2 scenarios'],
        unlocksPhases: [3, 5],
        why: 'Determines if your tumor has a DNA repair weakness that targeted treatments can exploit.',
        priority: 'HIGH',
        status: 'present',  // will be computed from patient data
    },
    {
        id: 'tmb',
        name: 'TMB (via CGP)',
        what: 'Tumor Mutational Burden from Comprehensive Genomic Profiling',
        unlocks: ['Immunotherapy eligibility analysis', 'IO selection module', 'IO Safety Gate activation'],
        unlocksPhases: [3],
        why: 'High mutation count may indicate response to immunotherapy. Activates the IO safety gate (TMB-H ≥20).',
        priority: 'HIGH',
        status: 'missing',
    },
    {
        id: 'rna',
        name: 'RNA Sequencing',
        what: 'Gene expression profiling of your tumor',
        unlocks: ['Pathway activation context', 'Mechanism of Action matching', 'L3 scenarios', 'IO response prediction (harm prevention gate)'],
        unlocksPhases: [3, 5],
        why: 'Shows which biological pathways are actually active, beyond just mutations. Enables the IO harm prevention predictor.',
        priority: 'MEDIUM',
        status: 'missing',
    },
    {
        id: 'ca125',
        name: 'CA-125 Baseline',
        what: 'Baseline cancer antigen 125 blood test',
        unlocks: ['Kinetic monitoring (kelim)', 'Treatment response tracking'],
        unlocksPhases: [4],
        why: 'Establishes a baseline so we can track how values change over time.',
        priority: 'HIGH',
        status: 'present',
    },
    {
        id: 'ctdna',
        name: 'ctDNA / MRD Panel',
        what: 'Circulating tumor DNA analysis for Minimal Residual Disease',
        unlocks: ['MRD monitoring', 'Escape detection', 'ctDNA signal tracking'],
        unlocksPhases: [4, 5],
        why: 'Detects tiny amounts of tumor DNA in blood — an early warning system.',
        priority: 'MEDIUM',
        status: 'missing',
    },
    {
        id: 'lpwgs',
        name: 'Low-Pass WGS (lpWGS)',
        what: 'Genome-wide copy-number profiling from plasma cfDNA or tissue',
        unlocks: ['CN7 structural instability score', 'Prognosis refinement', 'Resistance early warning'],
        unlocksPhases: [4, 5],
        why: 'Detects chromothripsis and structural chaos — the most prognostically important resistance signal (BriTROC).',
        priority: 'MEDIUM',
        status: 'missing',
    },
];

/**
 * Dynamically updates the UNLOCK_TESTS static array with live completeness data
 * from the therapy fit bundle API.
 */
export const mergeTestStatus = (tests, completeness) => {
    return tests.map(test => {
        // If it's present in API completeness
        if (completeness?.present?.includes(test.id) || test.status === 'present') {
            return { ...test, status: 'present' };
        }
        // If it's explicitly identified as missing by API
        if (completeness?.missing?.includes(test.id)) {
            return { ...test, status: 'missing' };
        }
        return test; // keep static default status (usually 'missing')
    });
};

/**
 * Get the current phase from a route path.
 */
export const getPhaseFromRoute = (pathname) => {
    return JOURNEY_PHASES.find(p => pathname.startsWith(p.route)) || null;
};

/**
 * Get next steps for a given phase based on data completeness.
 */
export const getNextSteps = (currentPhaseId, completeness = {}) => {
    const phase = JOURNEY_PHASES.find(p => p.id === currentPhaseId);
    if (!phase) return [];

    const steps = [];

    // Always suggest the next phase
    if (phase.nextPhase) {
        const next = JOURNEY_PHASES.find(p => p.id === phase.nextPhase);
        steps.push({
            type: 'navigate',
            label: phase.nextCTA,
            route: next.route,
            priority: 'primary',
        });
    }

    // Surface missing tests that unlock current phase capabilities
    const missing = completeness?.missing || [];
    const relevantTests = UNLOCK_TESTS.filter(
        t => t.status === 'missing' && t.unlocksPhases.includes(currentPhaseId)
    );
    relevantTests.slice(0, 2).forEach(test => {
        steps.push({
            type: 'test',
            label: `Add ${test.name}`,
            description: test.why,
            route: '/ayesha/journey/tests',
            priority: 'secondary',
        });
    });

    return steps.slice(0, 3); // Max 3 next steps
};
