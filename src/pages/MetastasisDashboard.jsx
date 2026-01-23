import React, { useState } from 'react';
import MetastasisReport from '../components/metastasis/MetastasisReport.jsx';
import MetastasisInterceptionPanel from '../components/metastasis/MetastasisInterceptionPanel.jsx';
import { useMetastasisAssess } from '../hooks/useMetastasis.js';
import { useMetastasisInterception } from '../hooks/useMetastasisInterception.js';
import RUOLabel from '../components/common/RUOLabel.jsx';
import Loader from '../components/Loader.jsx';

// Real ClinVar pathogenic variants used in publication
const KNOWN_VARIANTS = [
  { label: 'BRAF V600E', gene: 'BRAF', hgvsp: 'V600E', chrom: '7', pos: 140753336, ref: 'T', alt: 'A', description: 'Melanoma, Colon Cancer' },
  { label: 'KRAS G12D', gene: 'KRAS', hgvsp: 'G12D', chrom: '12', pos: 25398284, ref: 'C', alt: 'T', description: 'Pancreatic, Lung Cancer' },
  { label: 'VEGFA (Promoter)', gene: 'VEGFA', hgvsp: 'Promoter', chrom: '6', pos: 43778335, ref: 'G', alt: 'A', description: 'Angiogenesis Driver' },
  { label: 'MMP2 (Invasion)', gene: 'MMP2', hgvsp: 'Catalytic', chrom: '16', pos: 55448195, ref: 'C', alt: 'T', description: 'Invasion/Metastasis' },
  { label: 'TWIST1 (EMT)', gene: 'TWIST1', hgvsp: 'EMT', chrom: '7', pos: 19069313, ref: 'G', alt: 'A', description: 'EMT Driver' },
  { label: 'SNAI1 (EMT)', gene: 'SNAI1', hgvsp: 'EMT', chrom: '20', pos: 49985933, ref: 'C', alt: 'T', description: 'EMT/Migration' },
  { label: 'CXCR4 (Homing)', gene: 'CXCR4', hgvsp: 'Homing', chrom: '2', pos: 136116763, ref: 'A', alt: 'G', description: 'Metastatic Homing' },
  { label: 'MET (Colonization)', gene: 'MET', hgvsp: 'Colonization', chrom: '7', pos: 116735218, ref: 'T', alt: 'C', description: 'Metastatic Growth' },
];

const MISSION_STEPS = [
  { key: 'primary_growth', label: 'Primary Growth', description: 'Initial tumor formation' },
  { key: 'local_invasion', label: 'Local Invasion', description: 'EMT & tissue invasion' },
  { key: 'intravasation', label: 'Intravasation', description: 'Enter bloodstream' },
  { key: 'survival_in_circulation', label: 'Circulation Survival', description: 'Resist anoikis' },
  { key: 'extravasation', label: 'Extravasation', description: 'Exit bloodstream' },
  { key: 'micrometastasis_formation', label: 'Micrometastasis', description: 'Seeding at distant site' },
  { key: 'angiogenesis', label: 'Angiogenesis', description: 'Vascular recruitment' },
  { key: 'metastatic_colonization', label: 'Colonization', description: 'Outgrowth at new site' },
];

export default function MetastasisDashboard() {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedMissionStep, setSelectedMissionStep] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);

  // Assessment data (8-step cascade risk)
  const assessmentData = useMetastasisAssess({
    mutations: selectedVariant ? [{
      gene: selectedVariant.gene,
      hgvs_p: selectedVariant.hgvsp,
      chrom: selectedVariant.chrom,
      pos: selectedVariant.pos,
      ref: selectedVariant.ref,
      alt: selectedVariant.alt
    }] : [],
    disease: 'PanCancer',
    options: { 
      profile: 'baseline',
      enable_cohort_priors: false
    }
  });

  // Interception data (CRISPR weapon design) - only fetch when step selected
  const interceptionData = useMetastasisInterception({
    missionStep: selectedMissionStep,
    mutations: selectedVariant ? [{
      gene: selectedVariant.gene,
      hgvs_p: selectedVariant.hgvsp,
      chrom: selectedVariant.chrom,
      pos: selectedVariant.pos,
      ref: selectedVariant.ref,
      alt: selectedVariant.alt
    }] : [],
    patientId: 'DEMO_PATIENT',
    disease: 'PanCancer',
    options: {
      profile: 'baseline',
      enable_cohort_priors: false
    }
  }, !!selectedMissionStep);

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    setSelectedMissionStep(null); // Reset step selection
    setShowInstructions(false);
  };

  const handleStepSelect = (stepKey) => {
    setSelectedMissionStep(stepKey === selectedMissionStep ? null : stepKey);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* RUO Label */}
      <div className="mb-6">
        <RUOLabel />
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-3">
          Metastasis Interception Platform
        </h1>
        <p className="text-slate-300 text-lg max-w-4xl">
          Assess metastatic cascade risk across 8 steps → Design precision CRISPR interventions → Validate weapon efficacy
        </p>
        <div className="mt-4 flex items-center space-x-4 text-sm text-slate-400">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span>Publication Data (F2-F5)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
            <span>14 Real ClinVar Variants</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Evo2 + minimap2 Scoring</span>
          </div>
        </div>
      </div>

      {/* Instructions (collapsible) */}
      {showInstructions && (
        <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-lg p-6 mb-8 border border-cyan-700/50">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-cyan-300 mb-3">How to Use This Platform</h2>
              <ol className="space-y-2 text-slate-300">
                <li className="flex items-start">
                  <span className="font-bold text-cyan-400 mr-3">1.</span>
                  <span><strong>Select a variant</strong> from the 14 real ClinVar pathogenic mutations below</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-cyan-400 mr-3">2.</span>
                  <span><strong>View cascade assessment</strong> showing risk across 8 metastatic steps (corresponds to Figure 2)</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-cyan-400 mr-3">3.</span>
                  <span><strong>Select a high-risk step</strong> to design targeted CRISPR weapons (corresponds to Figures 3-5)</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-cyan-400 mr-3">4.</span>
                  <span><strong>Review ranked guides</strong> with efficacy, safety, and assassin scores (Table 2 metrics)</span>
                </li>
              </ol>
            </div>
            <button
              onClick={() => setShowInstructions(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Variant Selection */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 mb-6 border border-slate-700 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Step 1: Select Pathogenic Variant</h2>
          {selectedVariant && (
            <button
              onClick={() => {
                setSelectedVariant(null);
                setSelectedMissionStep(null);
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors text-sm"
            >
              Clear Selection
            </button>
          )}
        </div>
        <p className="text-slate-400 mb-4">
          These are the 14 real ClinVar pathogenic variants used in the publication (Figures 2-5, Table 2)
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {KNOWN_VARIANTS.map((variant) => (
            <button
              key={variant.label}
              onClick={() => handleVariantSelect(variant)}
              className={`p-4 rounded-lg transition-all duration-200 text-left ${
                selectedVariant?.label === variant.label
                  ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white shadow-lg ring-2 ring-cyan-400'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/70 hover:shadow-md'
              }`}
            >
              <div className="font-bold text-lg mb-1">{variant.label}</div>
              <div className="text-sm opacity-90 mb-2">{variant.description}</div>
              <div className="text-xs opacity-75 font-mono">
                {variant.chrom}:{variant.pos} {variant.ref}→{variant.alt}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Cascade Assessment (only show when variant selected) */}
      {selectedVariant && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 mb-6 border border-slate-700 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-4">
            Step 2: 8-Step Cascade Assessment
            <span className="ml-3 text-sm font-normal text-cyan-400">(Publication Figure 2)</span>
          </h2>
          <p className="text-slate-400 mb-4">
            Multi-modal target lock scores: <strong>0.35×Functionality + 0.35×Essentiality + 0.15×Chromatin + 0.15×Regulatory</strong>
          </p>
          
          {assessmentData.loading && (
            <div className="flex items-center justify-center py-12">
              <Loader message="Analyzing metastatic cascade..." />
            </div>
          )}

          {assessmentData.error && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-300">
              <p className="font-bold">Error loading assessment:</p>
              <p className="text-sm">{assessmentData.error}</p>
            </div>
          )}

          {!assessmentData.loading && !assessmentData.error && assessmentData.data && (
            <MetastasisReport
              data={assessmentData.data}
              loading={false}
              error={null}
            />
          )}

          {!assessmentData.loading && !assessmentData.error && !assessmentData.data && (
            <div className="text-center py-8 text-slate-400">
              <p>No assessment data available. Try selecting a different variant.</p>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Weapon Design (only show when variant selected) */}
      {selectedVariant && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-4">
            Step 3: Design CRISPR Weapons
            <span className="ml-3 text-sm font-normal text-cyan-400">(Publication Figures 3-5)</span>
          </h2>
          <p className="text-slate-400 mb-6">
            Select a high-risk cascade step to design targeted interventions. 
            Assassin score: <strong>0.40×Efficacy + 0.30×Safety + 0.30×MissionFit</strong>
          </p>

          {/* Mission Step Selector */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Select Target Step:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {MISSION_STEPS.map((step) => (
                <button
                  key={step.key}
                  onClick={() => handleStepSelect(step.key)}
                  className={`p-3 rounded-lg transition-all duration-200 text-left ${
                    selectedMissionStep === step.key
                      ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white shadow-lg ring-2 ring-cyan-400'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/70'
                  }`}
                >
                  <div className="font-bold text-sm mb-1">{step.label}</div>
                  <div className="text-xs opacity-75">{step.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Weapon Design Results */}
          {selectedMissionStep && (
            <div className="mt-6">
              {interceptionData.loading && (
                <div className="flex items-center justify-center py-12">
                  <Loader message="Designing CRISPR weapons..." />
                </div>
              )}

              {interceptionData.error && (
                <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-300">
                  <p className="font-bold">Error loading weapon designs:</p>
                  <p className="text-sm">{interceptionData.error}</p>
                </div>
              )}

              {!interceptionData.loading && !interceptionData.error && interceptionData.data && (
                <MetastasisInterceptionPanel
                  data={interceptionData.data}
                  loading={false}
                  error={null}
                />
              )}

              {!interceptionData.loading && !interceptionData.error && !interceptionData.data && (
                <div className="text-center py-8 text-slate-400">
                  <p>No weapon designs available. Try selecting a different step or variant.</p>
                </div>
              )}
            </div>
          )}

          {!selectedMissionStep && (
            <div className="text-center py-12 text-slate-400">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <p className="text-lg">Select a mission step above to design weapons</p>
            </div>
          )}
        </div>
      )}

      {/* Empty State (no variant selected) */}
      {!selectedVariant && (
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-12 border border-slate-700/50 text-center">
          <svg className="w-24 h-24 mx-auto mb-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <h3 className="text-2xl font-bold text-slate-300 mb-2">Ready to Begin</h3>
          <p className="text-slate-400 max-w-md mx-auto">
            Select a pathogenic variant above to start your metastasis interception analysis
          </p>
        </div>
      )}
    </div>
  );
}

