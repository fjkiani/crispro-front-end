import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AyeshaAnalysisWrapper from './AyeshaAnalysisWrapper.jsx';
import { useActivity } from '../../context/ActivityContext';
import { useKbGene, useKbVariant, useKbCohortCoverage } from '../../hooks/useKb.js';
import InsightChips from './InsightChips.jsx';
import ToxicityChip from './ToxicityChip.jsx';
import CoverageChips from './CoverageChips.jsx';
import KbCoverageChip from './KbCoverageChip.jsx';
import ProvenanceBar from './ProvenanceBar.jsx';
import KbProvenancePanel from './KbProvenancePanel.jsx';
import MetastasisReport from '../metastasis/MetastasisReport.jsx';
import MetastasisInterceptionPanel from '../metastasis/MetastasisInterceptionPanel.jsx';
import CohortTrialsPanel from './CohortTrialsPanel.jsx';
import ProfileToggles from './ProfileToggles.jsx';
import WIWFMButton from './WIWFMButton.jsx';
import BaselineVsFusionMiniCompare from './BaselineVsFusionMiniCompare.jsx';
import EfficacyModal from './EfficacyModal.jsx';
import RUOLabel from '../common/RUOLabel.jsx';
import { ACTIVITY_TYPES } from '../../context/ActivityContext';
import { MESSAGES } from './constants.jsx';
import { API_ROOT } from '../../lib/apiConfig';


const AnalysisResults = ({
    result,
    status,
    error,
    isLoading = false,
    activeMutation,
    patientMutations = [],
    patientId,
    className = "p-4 bg-gray-800 rounded-lg shadow-xl border border-gray-700 space-y-4"
}) => {
    // --- Restored State Logic ---
    const [vusIdentify, setVusIdentify] = useState(null);
    const [vusBusy, setVusBusy] = useState(false);
    const [vusError, setVusError] = useState(null);

    // Efficacy / Interaction State
    const [effOpen, setEffOpen] = useState(false);
    const [effData, setEffData] = useState(null); // Or use result.efficacy if props driven
    const [effBusy, setEffBusy] = useState(false);
    const [effProv, setEffProv] = useState(null);
    const [profile, setProfile] = useState('baseline');

    // UI State
    const [selectedMissionStep, setSelectedMissionStep] = useState(null);
    const [studyId, setStudyId] = useState('ov_tcga');
    const [coverageBusy, setCoverageBusy] = useState(false);
    const [coverageStats, setCoverageStats] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [insightsLocal, setInsightsLocal] = useState(null); // Local storage for retries
    const [coverageTick, setCoverageTick] = useState(0);
    const [insightsTick, setInsightsTick] = useState(0);

    const navigate = useNavigate();
    const { addActivity } = useActivity ? useActivity() : { addActivity: () => { } };

    // --- Derived Data ---
    const geneSymbol = activeMutation?.gene || activeMutation?.hugo_gene_symbol;
    const hgvsP = activeMutation?.variant || activeMutation?.hgvs_p || activeMutation?.protein_change;
    const chrom = activeMutation?.chrom;
    const pos = activeMutation?.pos;
    const ref = activeMutation?.ref;
    const alt = activeMutation?.alt;

    // --- Hooks ---
    const kbGene = useKbGene(geneSymbol);
    const kbVariant = useKbVariant(geneSymbol, hgvsP);
    const kbCohortCoverage = useKbCohortCoverage(geneSymbol);
    // Note: useFusionCoverage logic or props assumed passed or not critical for initial load
    // For 'fusionData', relying on props or let's assume result passes it? 
    // Looking at usage: baseline={effData} fusion={fusionData}. It seems fusionData is missing from props.
    // We'll define it as null for now to prevent crash if not passed.
    const fusionData = null; // Placeholder until we confirm source
    const metastasisData = { data: null, loading: false, error: null }; // Mock placeholder for now
    const interceptionData = { data: null, loading: false, error: null }; // Mock placeholder
    const amCovered = kbVariant.data?.am_covered;
    const prior = kbVariant.data?.clinvar_prior;


    // --- Effect: Fetch VUS Identification ---
    useEffect(() => {
        const fetchVusIdentify = async () => {
            if (!geneSymbol || (!hgvsP && !activeMutation?.protein_change)) {
                setVusIdentify(null);
                return;
            }

            setVusBusy(true);
            setVusError(null);
            setVusIdentify(null);

            try {
                const params = new URLSearchParams();
                params.append('gene', geneSymbol);
                params.append('variant', hgvsP || activeMutation.protein_change);

                const response = await fetch(`${API_ROOT}/api/vus/identify?${params.toString()}`);
                if (!response.ok) throw new Error('VUS Identify failed');
                const data = await response.json();
                setVusIdentify(data);
            } catch (err) {
                console.error("VUS ID Error:", err);
                setVusError(err.message);
            } finally {
                setVusBusy(false);
            }
        };

        if (geneSymbol) {
            fetchVusIdentify();
        }
    }, [geneSymbol, hgvsP, activeMutation]);

    // --- Effect: Run Efficacy (Manual Trigger) ---
    const runEfficacy = async () => {
        if (!geneSymbol || effBusy) return;
        setEffBusy(true);
        try {
            // Mock call or real call based on routing
            // For now just simulate delay or basic fetch
            await new Promise(r => setTimeout(r, 1000));
            setEffData({ predicted_percent_efficacy: 85, confidence: 0.9, drug: 'Olaparib' }); // Mock
            setEffProv({ method: 'Simulated' });
            setEffOpen(true);
        } catch (e) {
            console.error(e);
        } finally {
            setEffBusy(false);
        }
    };

    // helper 
    const pushAlert = (msg, level) => setAlerts(prev => [...prev, { id: Date.now(), message: msg, level }]);

    // Check for Ayesha Mode
    const isAyesha = patientId === 'AK' || patientId === 'ayesha_11_17_25' || activeMutation?.patientId === 'AK';

    if (isAyesha && !isLoading && status === 'complete' && result) {
        return (
            <AyeshaAnalysisWrapper
                result={{ ...result, vusIdentify }} // Pass vusIdentify explicitly
                status={status}
                error={error}
                isLoading={isLoading}
                activeMutation={activeMutation}
                patientMutations={patientMutations}
                runEfficacy={runEfficacy}
                effBusy={effBusy}
                effData={effData}
                effProv={effProv}
                effOpen={effOpen}
                setEffOpen={setEffOpen}
                setProfile={setProfile}
                metastasisData={metastasisData}
                interceptionData={interceptionData}
            // Pass existing children or content for drawers
            >
                {/* Advanced Drawers Content for Ayesha Mode */}
                {/* Metastatic Potential Assessment */}
                {geneSymbol && (
                    <div className="mt-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Metastasis Assessment</h4>
                        <MetastasisReport
                            data={metastasisData.data}
                            loading={metastasisData.loading}
                            error={metastasisData.error}
                        />
                    </div>
                )}

                {/* Metastatic Interception */}
                {geneSymbol && chrom && pos && ref && alt && (
                    <div className="mt-6 space-y-4">
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-3">Design CRISPR Interception</h3>
                            <div className="flex flex-wrap gap-2">
                                {['angiogenesis', 'EMT', 'invasion', 'intravasation', 'homing_extravasation', 'dormancy', 'reactivation'].map(step => (
                                    <button
                                        key={step}
                                        onClick={() => setSelectedMissionStep(step === selectedMissionStep ? null : step)}
                                        className={`px-4 py-2 rounded transition-colors text-sm ${selectedMissionStep === step
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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

                {/* Cohort Trials */}
                {effData && <div className="mt-6"><CohortTrialsPanel efficacy={effData} /></div>}
            </AyeshaAnalysisWrapper>
        );
    }

    return (
        <div className={className}>
            <h2 className="text-2xl font-semibold text-purple-300">Analysis Results</h2>
            <div className="flex items-center justify-between">
                <div className="text-xs text-gray-400">Profile</div>
                <ProfileToggles value={profile} onChange={setProfile} />
            </div>    {/* VUS Resolution (ground truth: /api/vus/identify) */}
            {
                (vusBusy || vusIdentify || vusError) && (
                    <div className="p-3 bg-gray-700 rounded-md border border-gray-600">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-purple-300">VUS Resolution</h3>
                            <div className="text-xs text-gray-400">source: /api/vus/identify</div>
                        </div>
                        {vusBusy && <div className="text-sm text-gray-300 mt-1">Resolving variant…</div>}
                        {vusError && <div className="text-sm text-red-200 mt-1">VUS identify failed: {vusError}</div>}
                        {vusIdentify && (
                            <div className="mt-2 space-y-2">
                                <div className="text-sm text-gray-200">
                                    <span className="font-semibold">Verdict:</span> {vusIdentify?.triage?.verdict || '—'}
                                    <span className="ml-3 text-gray-400">(path: {vusIdentify?.provenance?.resolution_path || vusIdentify?.triage?.resolution_path || '—'})</span>
                                </div>
                                <div className="text-xs text-gray-300">
                                    <span className="font-semibold">ClinVar:</span> {vusIdentify?.coverage?.clinvar?.status || '—'}
                                    <span className="ml-3"><span className="font-semibold">Evo2 min_delta:</span> {vusIdentify?.sequence?.min_delta ?? '—'}</span>
                                    <span className="ml-3"><span className="font-semibold">Pathway relevance:</span> {vusIdentify?.pathway_context?.pathway_relevance || '—'}</span>
                                </div>
                                <div className="text-xs text-gray-300">
                                    <span className="font-semibold">Patient axis:</span> {vusIdentify?.pathway_context?.patient_actionable_axis || '—'}
                                    <span className="ml-3"><span className="font-semibold">Variant axis:</span> {vusIdentify?.pathway_context?.variant_axis || '—'}</span>
                                </div>
                                {Array.isArray(vusIdentify?.next_actions) && vusIdentify.next_actions.length > 0 && (
                                    <div className="mt-2">
                                        <div className="text-xs text-gray-400 mb-1">Next actions</div>
                                        <ul className="list-disc list-inside text-xs text-gray-200 space-y-0.5">
                                            {vusIdentify.next_actions.slice(0, 4).map((a, idx) => (
                                                <li key={idx}><span className="font-semibold">{a.label || a.action}</span>: {a.description}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )
            }
            {/* Active Mutation Focus */}
            {
                activeMutation && (
                    <div className="p-3 mb-2 bg-gray-700 rounded-lg shadow-md border border-gray-600 flex items-center justify-between">
                        <h4 className="text-md font-semibold text-purple-300">
                            Current Focus: <span className="text-white">{activeMutation.gene || activeMutation.hugo_gene_symbol} - {activeMutation.variant || activeMutation.hgvs_p || activeMutation.protein_change}</span>
                        </h4>
                        <WIWFMButton onClick={runEfficacy} disabled={effBusy} />
                    </div>
                )
            }

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
                            try { toast.info('Opening Dossier with current variant.'); } catch (_) { }
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
                {result.summary && (
                    <div className="mt-1 text-sm text-gray-300">
                        {typeof result.summary === 'string' ? (
                            result.summary
                        ) : (
                            <div className="space-y-2">
                                {result.summary.literature_summary && <p>{result.summary.literature_summary}</p>}
                                {result.summary.clinical_significance && (
                                    <p className="text-xs italic border-t border-gray-600 pt-1">
                                        <span className="font-semibold">Significance:</span> {result.summary.clinical_significance}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}
                <p className="mt-1 text-xs text-gray-500">{MESSAGES.disclaimers.vepSimulation}</p>
            </div>

            {/* Clinical Significance Context */}
            {
                result.clinical_significance_context && (
                    <div className="p-3 bg-indigo-900 bg-opacity-60 border border-indigo-700 rounded">
                        <h3 className="text-lg font-semibold mb-1 text-indigo-300">Clinical Context & Significance:</h3>
                        <div
                            className="prose prose-sm prose-invert max-w-none text-gray-300"
                            dangerouslySetInnerHTML={{
                                __html: result.clinical_significance_context.replace(/\n/g, '<br />')
                            }}
                        />
                    </div>
                )
            }

            {/* Gene Summary Statuses */}
            {
                result.gene_summary_statuses && Object.keys(result.gene_summary_statuses).length > 0 && (
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
                )
            }

            {/* Evidence */}
            {/* Evidence */}
            {
                result.evidence && (
                    <details className="bg-gray-700 rounded-md border border-gray-600">
                        <summary className="p-2 cursor-pointer text-sm text-gray-400 hover:text-gray-200">
                            View Full Evidence String
                        </summary>
                        <pre className="p-3 text-xs text-gray-300 whitespace-pre-wrap bg-gray-750 rounded-b-md">
                            {typeof result.evidence === 'string' ? result.evidence : JSON.stringify(result.evidence, null, 2)}
                        </pre>
                    </details>
                )
            }

            {/* Provenance */}
            <ProvenanceBar provenance={result?.provenance} profile={profile} mode={result?.mode} />

            {/* KB Provenance Panel */}
            {
                (kbGene.provenance || kbVariant.provenance || kbCohortCoverage.provenance) && (
                    <KbProvenancePanel
                        provenance={{
                            gene: kbGene.provenance,
                            variant: kbVariant.provenance,
                            cohort: kbCohortCoverage.provenance
                        }}
                        title="Knowledge Base Data Provenance"
                    />
                )
            }

            {/* Metastatic Potential Assessment */}
            {
                geneSymbol && (
                    <div className="mt-4">
                        <MetastasisReport
                            data={metastasisData.data}
                            loading={metastasisData.loading}
                            error={metastasisData.error}
                        />
                    </div>
                )
            }

            {/* Metastatic Interception (Weapon Design) */}
            {
                geneSymbol && chrom && pos && ref && alt && (
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
                                        className={`px-4 py-2 rounded transition-colors ${selectedMissionStep === step
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
                )
            }

            {/* Baseline vs Fusion (visible when AM coverage exists) */}
            {
                amCovered === true && (
                    <div className="mt-2">
                        <BaselineVsFusionMiniCompare baseline={effData /* placeholder: reuse last */} fusion={fusionData} />
                    </div>
                )
            }

            <EfficacyModal open={effOpen} onClose={() => setEffOpen(false)} data={effData} provenance={effProv} />
            {/* Cohort + Trials context from efficacy */}
            {effData && <CohortTrialsPanel efficacy={effData} />}

            {/* RUO Label - inline */}
            <div className="mt-4">
                <RUOLabel position="inline" variant="compact" />
            </div>
        </div >
    );
};

export default AnalysisResults;
