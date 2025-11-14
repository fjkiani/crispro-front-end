import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Loader from '../Loader';
import { STATUS_COLORS, MESSAGES, DEFAULT_CLASSES } from './constants.jsx';
import InsightChips from './InsightChips.jsx';
import CoverageChips from './CoverageChips.jsx';
import ProvenanceBar from './ProvenanceBar.jsx';
import WIWFMButton from './WIWFMButton.jsx';
import EfficacyModal from './EfficacyModal.jsx';
import BaselineVsFusionMiniCompare from './BaselineVsFusionMiniCompare.jsx';
import ToxicityChip from './ToxicityChip.jsx';
import CohortTrialsPanel from './CohortTrialsPanel.jsx';
import { fetchJsonCached, buildVariantQuery } from './utils/api.js';
import { useActivity, ACTIVITY_TYPES } from '../../context/ActivityContext';
import ProfileToggles from './ProfileToggles.jsx';
import RUOLabel from '../common/RUOLabel.jsx';
// KB Integration
import { useKbGene, useKbVariant, useKbCohortCoverage } from '../../hooks/useKb.js';
import KbCoverageChip from './KbCoverageChip.jsx';
import KbProvenancePanel from './KbProvenancePanel.jsx';

// S/P/E Insights & Evidence Integration
import { useInsightsBundle } from '../../hooks/useInsights.js';
import { useClinVar, useFusionCoverage } from '../../hooks/useEvidence.js';
// Metastasis Assessment Integration
import MetastasisReport from '../metastasis/MetastasisReport.jsx';
import { useMetastasisAssess } from '../../hooks/useMetastasis.js';
// Metastasis Interception Integration
import MetastasisInterceptionPanel from '../metastasis/MetastasisInterceptionPanel.jsx';
import { useMetastasisInterception } from '../../hooks/useMetastasisInterception.js';

const API_ROOT = import.meta.env.VITE_API_ROOT || '';

const AnalysisResults = ({ 
    result,
    status,
    error,
    isLoading = false,
    activeMutation,
    className = "p-4 bg-gray-800 rounded-lg shadow-xl border border-gray-700 space-y-4"
}) => {
    const { addActivity } = useActivity ? useActivity() : { addActivity: () => {} };
    const navigate = useNavigate();
    const [effOpen, setEffOpen] = useState(false);
    const [effData, setEffData] = useState(null);
    const [effProv, setEffProv] = useState(null);
    const [effBusy, setEffBusy] = useState(false);

    const [prior, setPrior] = useState(null);
    const [amCovered, setAmCovered] = useState(undefined);
    const [profile, setProfile] = useState('baseline');
    const [fusionData, setFusionData] = useState(null);
    const [fusionBusy, setFusionBusy] = useState(false);
    const [insightsLocal, setInsightsLocal] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [coverageTick, setCoverageTick] = useState(0);
    const [insightsTick, setInsightsTick] = useState(0);
    const [studyId, setStudyId] = useState('ov_tcga');
    const [coverageStats, setCoverageStats] = useState(null);
    const [coverageBusy, setCoverageBusy] = useState(false);

    // KB Integration - Extract gene and variant info for KB lookups
    const geneSymbol = activeMutation?.gene || activeMutation?.hugo_gene_symbol;
    const hgvsP = activeMutation?.variant || activeMutation?.hgvs_p || activeMutation?.protein_change;
    const chrom = activeMutation?.chrom;
    const pos = activeMutation?.pos;
    const ref = activeMutation?.ref;
    const alt = activeMutation?.alt;

    // KB Hooks
    const kbGene = useKbGene(geneSymbol);
    const kbVariant = useKbVariant(geneSymbol, hgvsP, chrom, pos);
    const kbCohortCoverage = useKbCohortCoverage(geneSymbol);

    // Use hooks for insights and evidence
    const insights = useInsightsBundle({
        gene: geneSymbol,
        hgvs_p: hgvsP,
        coords: chrom && pos && ref && alt ? { chrom, pos, ref, alt } : null,
        variants: chrom && pos && ref && alt ? [{ gene: geneSymbol, chrom, pos, ref, alt, consequence: 'missense_variant' }] : null,
    });

    const clinvarData = useClinVar({ chrom, pos, ref, alt });
    const fusionCoverage = useFusionCoverage({ chrom, pos, ref, alt });

    // Metastasis assessment
    const metastasisData = useMetastasisAssess({
        mutations: geneSymbol && [{
            gene: geneSymbol,
            hgvs_p: hgvsP,
            chrom,
            pos,
            ref,
            alt
        }],
        disease: activeMutation?.disease,
        options: {
            enable_cohort_priors: false,
            profile
        }
    });

    // Metastasis interception (weapon design)
    const [selectedMissionStep, setSelectedMissionStep] = useState(null);
    const interceptionData = useMetastasisInterception({
        missionStep: selectedMissionStep,
        mutations: geneSymbol && chrom && pos && ref && alt ? [{
            gene: geneSymbol,
            hgvs_p: hgvsP,
            chrom,
            pos,
            ref,
            alt
        }] : [],
        patientId: activeMutation?.patientId,
        disease: activeMutation?.disease,
        options: {
            profile,
            enable_cohort_priors: false
        }
    }, !!selectedMissionStep); // Only fetch when mission step is selected

    const pushAlert = (message, level = 'warning') => {
        const id = `${Date.now()}-${Math.random()}`;
        setAlerts(prev => [...prev, { id, message, level }]);
        setTimeout(() => {
            setAlerts(prev => prev.filter(a => a.id !== id));
        }, 4000);
    };

    const getStatusColor = (status) => {
        if (!status) return STATUS_COLORS.DEFAULT; 
        return STATUS_COLORS[status.toUpperCase()] || STATUS_COLORS.DEFAULT;
    };

    // Evidence logging (hooks)
    useEffect(() => {
        if (!clinvarData.loading && clinvarData.data) {
            addActivity && addActivity(
                ACTIVITY_TYPES.GENOMIC_ANALYSIS_SUCCESS,
                'ClinVar prior fetched',
                { chrom, pos, ref, alt, classification: clinvarData.data.classification }
            );
        }
    }, [clinvarData.loading, clinvarData.data, chrom, pos, ref, alt]);

    useEffect(() => {
        if (!fusionCoverage.loading && fusionCoverage.data) {
            addActivity && addActivity(
                ACTIVITY_TYPES.GENOMIC_ANALYSIS_SUCCESS,
                'AM coverage checked',
                { chrom, pos, ref, alt, am_covered: fusionCoverage.data.eligible }
            );
        }
    }, [fusionCoverage.loading, fusionCoverage.data, chrom, pos, ref, alt]);

    const runEfficacyFor = async (profileKey = 'baseline', { openModal = true } = {}) => {
        if (!activeMutation) return;
        setEffBusy(true);
        try {
            if (addActivity && openModal) {
                addActivity(
                    ACTIVITY_TYPES.DEEP_DIVE_REQUESTED,
                    'WIWFM requested',
                    { gene: activeMutation?.gene || activeMutation?.hugo_gene_symbol, variant: activeMutation?.variant || activeMutation?.hgvs_p || activeMutation?.protein_change, profile: profileKey }
                );
            }
            const payload = {
                mutations: [
                    {
                        gene: activeMutation?.gene || activeMutation?.hugo_gene_symbol,
                        hgvs_p: activeMutation?.variant || activeMutation?.hgvs_p || activeMutation?.protein_change,
                        chrom: activeMutation?.chrom,
                        pos: activeMutation?.pos,
                        ref: activeMutation?.ref,
                        alt: activeMutation?.alt,
                    },
                ],
                options: {
                    adaptive: profileKey !== 'baseline',
                    ensemble: profileKey === 'richer',
                    use_fusion: profileKey === 'fusion' && amCovered === true,
                },
                api_base: API_ROOT || undefined,
            };
            const res = await fetch(`${API_ROOT}/api/efficacy/predict`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(json?.detail || `HTTP ${res.status}`);
            setEffData(json);
            setEffProv({ ...(json?.provenance || {}), profile: profileKey });
            if (openModal) setEffOpen(true);
            if (addActivity) {
                addActivity(
                    ACTIVITY_TYPES.DEEP_DIVE_SUCCESS,
                    'WIWFM result received',
                    { run_id: json?.provenance?.efficacy_run || json?.provenance?.run_id, drugs: (json?.drugs || []).length, profile: profileKey }
                );
            }
        } catch (e) {
            console.error('WIWFM error', e);
            setEffData({ drugs: [] });
            setEffProv({ mode: 'Demo', profile: profileKey });
            if (openModal) setEffOpen(true);
            try { toast.error(`Efficacy prediction failed: ${e?.message || e}`); } catch (_) {}
            if (addActivity) {
                addActivity(
                    ACTIVITY_TYPES.DEEP_DIVE_ERROR,
                    'WIWFM failed (showing Demo placeholder)',
                    { error: String(e?.message || e), profile: profileKey }
                );
            }
        } finally {
            setEffBusy(false);
        }
    };

    const runEfficacy = async () => runEfficacyFor(profile, { openModal: true });

    // Auto-run Fusion profile when AM coverage exists and we have a baseline result
    useEffect(() => {
        const canRunFusion = amCovered === true && activeMutation && !fusionBusy;
        if (!canRunFusion) return;
        // Avoid reruns if fusion data already exists for current variant
        const key = `${activeMutation?.gene || activeMutation?.hugo_gene_symbol}|${activeMutation?.chrom}:${activeMutation?.pos}:${activeMutation?.ref}>${activeMutation?.alt}`;
        if (fusionData && fusionData.__key === key) return;
        (async () => {
            try {
                setFusionBusy(true);
                const payload = {
                    mutations: [
                        {
                            gene: activeMutation?.gene || activeMutation?.hugo_gene_symbol,
                            hgvs_p: activeMutation?.variant || activeMutation?.hgvs_p || activeMutation?.protein_change,
                            chrom: activeMutation?.chrom,
                            pos: activeMutation?.pos,
                            ref: activeMutation?.ref,
                            alt: activeMutation?.alt,
                        },
                    ],
                    options: { adaptive: true, ensemble: true, use_fusion: true },
                    api_base: API_ROOT || undefined,
                };
                const res = await fetch(`${API_ROOT}/api/efficacy/predict`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                const json = await res.json().catch(() => ({}));
                if (res.ok) {
                    setFusionData({ ...json, __key: key });
                }
            } catch (_) {
                // Silent; keep UI stable
            } finally {
                setFusionBusy(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [amCovered, activeMutation?.gene, activeMutation?.hugo_gene_symbol, activeMutation?.chrom, activeMutation?.pos, activeMutation?.ref, activeMutation?.alt]);

    // Auto-run baseline on mutation change (for compare & quick view)
    useEffect(() => {
        if (!activeMutation) return;
        runEfficacyFor('baseline', { openModal: false });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeMutation?.gene, activeMutation?.hugo_gene_symbol, activeMutation?.variant, activeMutation?.hgvs_p, activeMutation?.protein_change, activeMutation?.chrom, activeMutation?.pos, activeMutation?.ref, activeMutation?.alt]);

    // Log insights completion
    useEffect(() => {
        if (!insights.loading && (insights.functionality || insights.chromatin || insights.essentiality || insights.regulatory)) {
            addActivity && addActivity(
                ACTIVITY_TYPES.GENOMIC_ANALYSIS_SUCCESS,
                'Insights bundle loaded',
                {
                    gene: geneSymbol,
                    functionality: insights.functionality?.score,
                    chromatin: insights.chromatin?.score,
                    essentiality: insights.essentiality?.score,
                    regulatory: insights.regulatory?.score
                }
            );
        }
    }, [insights.loading, insights.functionality, insights.chromatin, insights.essentiality, insights.regulatory, geneSymbol]);

    if (isLoading || status === 'loading') {
        return (
            <div className={className}>
                <div className="flex justify-center items-center">
                    <Loader /> 
                    <p className="ml-3 text-gray-300">{MESSAGES.loading.analysis}</p>
                </div>
            </div>
        );
    }

    if (error && status === 'error') {
        return (
            <div className="p-3 bg-red-800 text-red-100 rounded-md shadow-md border border-red-700">
                <p className="font-semibold">Analysis Error:</p>
                <p>{error}</p>
            </div>
        );
    }

    if (!result || status !== 'complete') {
        return (
            <div className={className}>
                <div className="text-center py-10">
                    <p className="text-gray-500">Perform an analysis to see results here.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={className}>
            <h2 className="text-2xl font-semibold text-purple-300">Analysis Results</h2>
            <div className="flex items-center justify-between">
                <div className="text-xs text-gray-400">Profile</div>
                <ProfileToggles value={profile} onChange={setProfile} />
            </div>
            
            {/* Active Mutation Focus */}
            {activeMutation && (
                <div className="p-3 mb-2 bg-gray-700 rounded-lg shadow-md border border-gray-600 flex items-center justify-between">
                    <h4 className="text-md font-semibold text-purple-300">
                        Current Focus: <span className="text-white">{activeMutation.gene || activeMutation.hugo_gene_symbol} - {activeMutation.variant || activeMutation.hgvs_p || activeMutation.protein_change}</span>
                    </h4>
                    <WIWFMButton onClick={runEfficacy} disabled={effBusy} />
                </div>
            )}

            {/* Insight chips (Function/Reg/Ess/Chrom) + Toxicity */}
            <div className="space-y-2">
                <InsightChips 
                    insights={{ ...(result?.insights || {}), ...(insightsLocal || {}) }} 
                    geneSymbol={geneSymbol}
                    variantInfo={{ gene: geneSymbol, hgvsP }}
                />
                {/* Toxicity hint (germline-aware; RUO) */}
                {chrom && pos && ref && alt && (
                    <ToxicityChip 
                        patient={{
                            germlineVariants: activeMutation?.germlineVariants || []
                        }}
                        candidate={{
                            type: 'drug',
                            moa: activeMutation?.moa || 'Unknown'
                        }}
                        context={{
                            disease: activeMutation?.disease || 'Unknown',
                            tissue: activeMutation?.tissue
                        }}
                        options={{ evidence: true, profile }}
                    />
                )}
                <CoverageChips clinvar={prior || result?.clinvar} amCovered={amCovered ?? result?.am_covered} />
                
                {/* KB Coverage Chips */}
                <div className="flex flex-wrap gap-2">
                    <KbCoverageChip 
                        type="clinvar" 
                        status={kbVariant.data?.clinvar_prior || 'unknown'} 
                        provenance={kbVariant.provenance}
                    />
                    <KbCoverageChip 
                        type="alphamissense" 
                        status={kbVariant.data?.am_covered} 
                        provenance={kbVariant.provenance}
                    />
                    <KbCoverageChip 
                        type="cohort" 
                        status={!!kbCohortCoverage.data} 
                        provenance={kbCohortCoverage.provenance}
                    />
                </div>
                {/* Fusion banner when AM coverage exists */}
                {amCovered === true && (
                    <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md border border-purple-600 bg-purple-900/30 text-purple-200 text-xs">
                        <span className="font-semibold">Fusion active</span>
                        <span className="opacity-80">AM coverage detected; Fusion profile available</span>
                    </div>
                )}
                {/* Cohort context helper */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-400">Study coverage</span>
                    <button
                        className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-200 border border-gray-600 hover:bg-gray-600"
                        onClick={() => {
                            const genes = [
                                (activeMutation?.gene || activeMutation?.hugo_gene_symbol || '').toString()
                            ].filter(Boolean);
                            addActivity && addActivity(
                                ACTIVITY_TYPES.GENOMIC_ANALYSIS,
                                'Add Cohort Context clicked',
                                { genes }
                            );
                            navigate('/research', { state: { dataLabPrefill: { genes } } });
                        }}
                        title="Open cBio Data Lab with prefilled genes"
                    >
                        Add Cohort Context
                    </button>
                    <button
                        className="text-xs px-2 py-1 rounded bg-indigo-700 text-white border border-indigo-600 hover:bg-indigo-600"
                        onClick={() => {
                            const prefill = {
                                gene: activeMutation?.gene || activeMutation?.hugo_gene_symbol,
                                variant: activeMutation?.variant || activeMutation?.hgvs_p || activeMutation?.protein_change,
                                chrom: activeMutation?.chrom,
                                pos: activeMutation?.pos,
                                ref: activeMutation?.ref,
                                alt: activeMutation?.alt,
                                insights: { ...(result?.insights || {}), ...(insightsLocal || {}) },
                                provenance: result?.provenance || effProv || {},
                            };
                            try { toast.info('Opening Dossier with current variant.'); } catch (_) {}
                            navigate('/target-dossier', { state: { dossierPrefill: prefill } });
                        }}
                        title="Send current variant to Target Dossier"
                    >
                        Send to Dossier
                    </button>
                    {/* Quick coverage check (demo) */}
                    <div className="flex items-center gap-1">
                        <input
                            value={studyId}
                            onChange={(e) => setStudyId(e.target.value)}
                            className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-100 border border-gray-600"
                            title="Study ID (e.g., ov_tcga)"
                            style={{ width: 110 }}
                        />
                        <button
                            disabled={coverageBusy || !activeMutation?.gene && !activeMutation?.hugo_gene_symbol}
                            onClick={async () => {
                                const gene = activeMutation?.gene || activeMutation?.hugo_gene_symbol;
                                if (!gene) return;
                                setCoverageBusy(true);
                                setCoverageStats(null);
                                try {
                                    const body = { mode: 'both', study_id: studyId, genes: [gene], limit: 200, profile: 'baseline' };
                                    const r = await fetch(`${API_ROOT}/api/datasets/extract_and_benchmark`, {
                                        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
                                    });
                                    const j = await r.json().catch(() => ({}));
                                    if (!r.ok) throw new Error(j?.detail || `HTTP ${r.status}`);
                                    const g = (j?.metrics?.by_gene || []).find((x) => (x?.gene || '').toUpperCase() === gene.toUpperCase());
                                    setCoverageStats({ n: g?.n ?? 0, prevalence: g?.prevalence ?? 0, study: studyId });
                                } catch (e) {
                                    pushAlert(`Coverage check failed: ${e?.message || e}`, 'warning');
                                    setCoverageStats(null);
                                } finally {
                                    setCoverageBusy(false);
                                }
                            }}
                            className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-200 border border-gray-600 hover:bg-gray-600 disabled:opacity-50"
                            title="Check quick coverage"
                        >
                            {coverageBusy ? 'Checking…' : 'Check'}
                        </button>
                        {coverageStats && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md border bg-blue-900/30 text-blue-200 border-blue-700 text-[11px]">
                                {coverageStats.study}: n={coverageStats.n}, prev={(coverageStats.prevalence ?? 0).toFixed(3)}
                            </span>
                        )}
                    </div>
                </div>
                {alerts.length > 0 && (
                    <div className="space-y-1">
                        {alerts.map(a => (
                            <div key={a.id} className={`text-xs px-2 py-1 rounded border ${a.level === 'warning' ? 'bg-yellow-900/40 text-yellow-200 border-yellow-700' : 'bg-red-900/40 text-red-200 border-red-700'}`}>
                                {a.message}
                            </div>
                        ))}
                        <div className="flex gap-2">
                            <button className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-200 border border-gray-600" onClick={() => setCoverageTick(t => t + 1)}>Retry coverage</button>
                            <button className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-200 border border-gray-600" onClick={() => setInsightsTick(t => t + 1)}>Retry insights</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Overall Status */}
            <div className="p-3 bg-gray-700 rounded-md border border-gray-600">
                <p className="text-lg font-medium">
                    Overall Query Status: 
                    <span className={`ml-1 font-bold ${getStatusColor(result.status)}`}>
                        {result.status || 'N/A'}
                    </span>
                </p>
                {result.summary && <p className="mt-1 text-sm text-gray-300">{result.summary}</p>}
                <p className="mt-1 text-xs text-gray-500">{MESSAGES.disclaimers.vepSimulation}</p>
            </div>

            {/* Clinical Significance Context */}
            {result.clinical_significance_context && (
                <div className="p-3 bg-indigo-900 bg-opacity-60 border border-indigo-700 rounded">
                    <h3 className="text-lg font-semibold mb-1 text-indigo-300">Clinical Context & Significance:</h3>
                    <div 
                        className="prose prose-sm prose-invert max-w-none text-gray-300" 
                        dangerouslySetInnerHTML={{ 
                            __html: result.clinical_significance_context.replace(/\n/g, '<br />') 
                        }} 
                    />
                </div>
            )}

            {/* Gene Summary Statuses */}
            {result.gene_summary_statuses && Object.keys(result.gene_summary_statuses).length > 0 && (
                <div className="mb-4">
                    <h3 className="text-xl font-semibold mb-2 text-gray-300">Gene Summary Statuses:</h3>
                    <ul className="list-disc list-inside pl-2 space-y-1 bg-gray-700 p-3 rounded">
                        {Object.entries(result.gene_summary_statuses).map(([gene, status]) => (
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

            {/* Evidence */}
            {result.evidence && (
                <details className="bg-gray-700 rounded-md border border-gray-600">
                    <summary className="p-2 cursor-pointer text-sm text-gray-400 hover:text-gray-200">
                        View Full Evidence String
                    </summary>
                    <pre className="p-3 text-xs text-gray-300 whitespace-pre-wrap bg-gray-750 rounded-b-md">
                        {result.evidence}
                    </pre>
                </details>
            )}

            {/* Provenance */}
            <ProvenanceBar provenance={result?.provenance} profile={profile} mode={result?.mode} />
            
            {/* KB Provenance Panel */}
            {(kbGene.provenance || kbVariant.provenance || kbCohortCoverage.provenance) && (
                <KbProvenancePanel 
                    provenance={{
                        gene: kbGene.provenance,
                        variant: kbVariant.provenance,
                        cohort: kbCohortCoverage.provenance
                    }}
                    title="Knowledge Base Data Provenance"
                />
            )}

            {/* Metastatic Potential Assessment */}
            {geneSymbol && (
                <div className="mt-4">
                    <MetastasisReport
                        data={metastasisData.data}
                        loading={metastasisData.loading}
                        error={metastasisData.error}
                    />
                </div>
            )}

            {/* Metastatic Interception (Weapon Design) */}
            {geneSymbol && chrom && pos && ref && alt && (
                <div className="mt-4 space-y-4">
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                        <h3 className="text-lg font-bold text-cyan-300 mb-3">Design CRISPR Interception</h3>
                        <p className="text-slate-400 text-sm mb-4">
                            Select a metastatic cascade step to design targeted CRISPR weapons.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {['angiogenesis', 'EMT', 'invasion', 'intravasation', 'homing_extravasation', 'dormancy', 'reactivation'].map(step => (
                                <button
                                    key={step}
                                    onClick={() => setSelectedMissionStep(step === selectedMissionStep ? null : step)}
                                    className={`px-4 py-2 rounded transition-colors ${
                                        selectedMissionStep === step
                                            ? 'bg-cyan-600 text-white'
                                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                    }`}
                                >
                                    {step.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                </button>
                            ))}
                        </div>
                    </div>

                    {selectedMissionStep && (
                        <MetastasisInterceptionPanel
                            data={interceptionData.data}
                            loading={interceptionData.loading}
                            error={interceptionData.error}
                        />
                    )}
                </div>
            )}

            {/* Baseline vs Fusion (visible when AM coverage exists) */}
            {amCovered === true && (
                <div className="mt-2">
                    <BaselineVsFusionMiniCompare baseline={effData /* placeholder: reuse last */} fusion={fusionData} />
                </div>
            )}

            <EfficacyModal open={effOpen} onClose={() => setEffOpen(false)} data={effData} provenance={effProv} />
            {/* Cohort + Trials context from efficacy */}
            {effData && <CohortTrialsPanel efficacy={effData} />}

            {/* RUO Label - inline */}
            <div className="mt-4">
                <RUOLabel position="inline" variant="compact" />
            </div>
        </div>
    );
};

export default AnalysisResults;
