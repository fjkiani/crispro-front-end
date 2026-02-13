import React, { useState } from 'react';
import VariantTriagePanel from './analysis/VariantTriagePanel';
import BiologicalContextPanel from './analysis/BiologicalContextPanel';
import TherapyImplicationsPanel from './analysis/TherapyImplicationsPanel';
import SystemInputsTable from './analysis/SystemInputsTable';
import EvidenceDrawer from './analysis/EvidenceDrawer';
import AdvancedDrawers from './analysis/AdvancedDrawers';
import EfficacyModal from './EfficacyModal';
import CohortTrialsPanel from './CohortTrialsPanel';
import BaselineVsFusionMiniCompare from './BaselineVsFusionMiniCompare';
import RUOLabel from '../common/RUOLabel';

const AyeshaAnalysisWrapper = ({
    result,
    status,
    error,
    isLoading,
    activeMutation,
    patientMutations,
    // Callbacks & Data needed for children
    runEfficacy,
    effBusy,
    effData,
    effProv,
    effOpen,
    setEffOpen,
    setProfile, // For standard mode if needed, but Ayesha uses Scenario Selector
    // Advanced data for drawers
    metastasisData,
    interceptionData,
    cohortData,
    // Context
    children // Any advanced children passed from parent
}) => {

    // Scenario Selector State (Local UI state impacting visual "Badge" or param mostly, backend drives logic)
    const [scenario, setScenario] = useState('Today (Baseline)'); // Today, Best Case, Worst Case

    const handleScenarioChange = (s) => {
        setScenario(s);
        // Logic to switch profile param passed to Efficacy API if we want to live-update
        // For now, visual only as per strict fetch boundaries plan (WIWFM runs on click)
        const profileMap = {
            'Today (Baseline)': 'baseline',
            'Best Case': 'richer', // Assuming 'richer' means more data/optimistic
            'Worst Case': 'baseline' // Or specific 'conservative' profile
        };
        setProfile(profileMap[s]);
    };

    return (
        <div className="bg-white min-h-screen text-gray-900 font-sans">

            {/* Header / Scenario Selector */}
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Care Cockpit <span className="text-indigo-600 font-normal">| {activeMutation?.gene || 'Target'}</span></h1>
                    <p className="text-sm text-gray-500">Patient: Ayesha K. • Record: 11-17-25</p>
                </div>

                <div className="flex items-center gap-3 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                    {['Today (Baseline)', 'Best Case', 'Worst Case'].map(s => (
                        <button
                            key={s}
                            onClick={() => handleScenarioChange(s)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${scenario === s
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-6 space-y-8">

                {/* 1. Triage (Top) - Auto-runs via Parent, we just display */}
                <VariantTriagePanel
                    vusIdentify={result?.vusIdentify}
                    isLoading={result?.vusBusy}
                    error={result?.vusError}
                />

                {/* 2. Biology (Middle) */}
                <BiologicalContextPanel
                    insights={result?.insights}
                    geneSymbol={activeMutation?.gene || activeMutation?.hugo_gene_symbol}
                    variantInfo={activeMutation}
                />

                {/* 3. Therapy (Bottom) */}
                <TherapyImplicationsPanel
                    activeMutation={activeMutation}
                    effData={effData}
                    effProv={effProv}
                    effBusy={effBusy}
                    onRunEfficacy={runEfficacy}
                    effOpen={effOpen}
                />

                {/* 4. Trust Layer */}
                <SystemInputsTable
                    provenance={result?.provenance}
                    profile={scenario}
                />

                {/* 5. Deep Dives (Hidden) */}
                <EvidenceDrawer
                    evidence={result?.evidence}
                    summary={result?.summary}
                    clinicalContext={result?.clinical_significance_context}
                />

                <AdvancedDrawers>
                    {/* Render advanced children passed from parent (Metastasis, etc) */}
                    {children}
                </AdvancedDrawers>
            </div>

            {/* Modals & Popups */}
            <EfficacyModal
                open={effOpen}
                onClose={() => setEffOpen(false)}
                data={effData}
                provenance={effProv}
            />

            {/* RUO Warning Footer */}
            <div className="bg-gray-50 border-t border-gray-200 p-4 text-center">
                <RUOLabel position="inline" variant="compact" />
            </div>
        </div>
    );
};

export default AyeshaAnalysisWrapper;
