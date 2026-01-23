import React, { useState, useEffect } from 'react';
import { HeroMetrics, ResponseCharts, OverlapAnalysis, ValidationStatus, PatientTable } from './platinum';

const API_ROOT = import.meta.env.VITE_API_ROOT || '';

const Field = ({ label, children }) => (
  <label className="block text-sm text-gray-300 mb-2">
    <span className="block mb-1 text-gray-400">{label}</span>
    {children}
  </label>
);

const CohortLab = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState('cbioportal'); // 'cbioportal' or 'platinum'
  
  // cBioPortal state
  const [studyId, setStudyId] = useState('ov_tcga');
  const [genes, setGenes] = useState('BRCA1,BRCA2');
  const [limit, setLimit] = useState(200);
  const [mode, setMode] = useState('both');
  const [profile, setProfile] = useState('baseline');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [metrics, setMetrics] = useState(null);
  
  // Platinum Response state
  const [platinumLoading, setPlatinumLoading] = useState(false);
  const [platinumError, setPlatinumError] = useState(null);
  const [platinumStats, setPlatinumStats] = useState(null);
  const [platinumOverlap, setPlatinumOverlap] = useState(null);
  const [platinumData, setPlatinumData] = useState(null);
  const [mergedData, setMergedData] = useState([]);

  const run = async () => {
    setLoading(true);
    setError(null);
    setRows([]);
    setMetrics(null);
    try {
      const payload = {
        mode,
        study_id: studyId,
        genes: genes.split(',').map(s => s.trim()).filter(Boolean),
        limit: Number(limit) || 200,
        profile,
      };
      const res = await fetch(`${API_ROOT}/api/datasets/extract_and_benchmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.detail || `HTTP ${res.status}`);
      setRows(json?.rows || []);
      setMetrics(json?.metrics || null);
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  // Load platinum response data
  const loadPlatinumData = async () => {
    setPlatinumLoading(true);
    setPlatinumError(null);
    try {
      // Fetch platinum response data
      const platinumRes = await fetch(`${API_ROOT}/api/datasets/platinum_response?limit=1000`);
      if (!platinumRes.ok) throw new Error(`HTTP ${platinumRes.status}`);
      const platinumJson = await platinumRes.json();
      setPlatinumData(platinumJson);
      
      // Fetch overlap analysis
      const overlapRes = await fetch(`${API_ROOT}/api/datasets/platinum_response/overlap`);
      if (!overlapRes.ok) throw new Error(`HTTP ${overlapRes.status}`);
      const overlapJson = await overlapRes.json();
      setPlatinumOverlap(overlapJson);
      
      // Compute stats
      const stats = {
        jr2_total_patients: platinumJson.total || 0,
        zo_total_patients: overlapJson.zo_total || 0,
        overlap_patients: overlapJson.overlap_count || 0,
        zo_patients_with_mutations: overlapJson.zo_total || 0, // Approximation
        jr2_response_distribution: platinumJson.metadata?.response_distribution || {},
      };
      setPlatinumStats(stats);
      
      // Merge data for patient table (if available)
      if (platinumJson.patients && Array.isArray(platinumJson.patients)) {
        // For now, just use platinum data - full merge would require Zo's mutation data endpoint
        setMergedData(platinumJson.patients);
      }
    } catch (e) {
      setPlatinumError(e?.message || String(e));
    } finally {
      setPlatinumLoading(false);
    }
  };

  // Auto-load platinum data when tab is active
  useEffect(() => {
    if (activeTab === 'platinum' && !platinumStats && !platinumLoading) {
      loadPlatinumData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  return (
    <div className="mt-8 p-4 rounded-lg border border-gray-700 bg-gray-800">
      <h2 className="text-xl font-semibold text-green-300 mb-2">Cohort Lab</h2>
      <p className="text-sm text-gray-400 mb-4">Extract cohorts, query platinum response data, and run benchmarks in research-mode.</p>
      
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-4 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('cbioportal')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'cbioportal'
              ? 'text-green-400 border-b-2 border-green-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          cBio Data Lab
        </button>
        <button
          onClick={() => setActiveTab('platinum')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'platinum'
              ? 'text-green-400 border-b-2 border-green-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          ⚔️ Platinum Response
        </button>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'cbioportal' && (
        <div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
        <Field label="Study ID">
          <input className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600" value={studyId} onChange={e => setStudyId(e.target.value)} />
        </Field>
        <Field label="Genes (comma-separated)">
          <input className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600" value={genes} onChange={e => setGenes(e.target.value)} />
        </Field>
        <Field label="Limit">
          <input type="number" className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600" value={limit} onChange={e => setLimit(e.target.value)} />
        </Field>
        <Field label="Mode">
          <select className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600" value={mode} onChange={e => setMode(e.target.value)}>
            <option value="both">both</option>
            <option value="extract_only">extract_only</option>
            <option value="run_only">run_only</option>
          </select>
        </Field>
        <Field label="Profile">
          <select className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600" value={profile} onChange={e => setProfile(e.target.value)}>
            <option value="baseline">baseline</option>
            <option value="richer_s">richer_s</option>
            <option value="fusion">fusion</option>
          </select>
        </Field>
      </div>

      <button onClick={run} disabled={loading} className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
        {loading ? 'Running…' : 'Run Extract & Benchmark'}
      </button>

      {error && (
        <div className="mt-3 text-sm text-red-300">Error: {error}</div>
      )}

      {metrics && (
        <div className="mt-4 p-3 rounded border border-gray-700 bg-gray-750">
          <h3 className="text-lg font-semibold text-gray-200 mb-2">Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm text-gray-300">
            <div><span className="text-gray-400">Count:</span> {metrics.count}</div>
            <div><span className="text-gray-400">Positives:</span> {metrics.positives}</div>
            <div><span className="text-gray-400">Prevalence:</span> {(metrics.prevalence ?? 0).toFixed(3)}</div>
            <div><span className="text-gray-400">AUPRC (proxy):</span> {(metrics.auprc_proxy ?? 0).toFixed(3)}</div>
            <div><span className="text-gray-400">Profile:</span> {metrics.profile}</div>
          </div>
          {Array.isArray(metrics.by_gene) && metrics.by_gene.length > 0 && (
            <div className="mt-3">
              <h4 className="text-sm text-gray-300 mb-1">Per-gene prevalence</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {metrics.by_gene.map((g) => (
                  <div key={g.gene} className="p-2 rounded border border-gray-700 bg-gray-800 text-sm text-gray-200">
                    <div className="text-gray-400">{g.gene}</div>
                    <div>n={g.n} · prev={(g.prevalence ?? 0).toFixed(3)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {rows && rows.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700 text-sm">
            <thead className="bg-gray-750">
              <tr>
                <th className="px-2 py-1 text-left text-gray-400">Sample</th>
                <th className="px-2 py-1 text-left text-gray-400">Gene</th>
                <th className="px-2 py-1 text-left text-gray-400">HGVS</th>
                <th className="px-2 py-1 text-left text-gray-400">Coord</th>
                <th className="px-2 py-1 text-left text-gray-400">Platinum</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {rows.slice(0, 100).map((r, i) => (
                <tr key={i}>
                  <td className="px-2 py-1 text-gray-200">{r.sample_id}</td>
                  <td className="px-2 py-1 text-gray-200">{r.gene}</td>
                  <td className="px-2 py-1 text-gray-300">{r.hgvs_p || '—'}</td>
                  <td className="px-2 py-1 text-gray-300">{r.chrom}:{r.pos} {r.ref}>{r.alt}</td>
                  <td className="px-2 py-1 text-gray-200">{Number(r.outcome_platinum) === 1 ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length > 100 && (
            <div className="mt-2 text-xs text-gray-400">Showing first 100 rows</div>
          )}
        </div>
      )}
        </div>
      )}
      
      {activeTab === 'platinum' && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Platinum response data extracted from TCGA-OV (Jr2's dataset) with overlap analysis against Zo's mutation dataset.
            </p>
            <button
              onClick={loadPlatinumData}
              disabled={platinumLoading}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              {platinumLoading ? 'Loading…' : 'Refresh Data'}
            </button>
          </div>
          
          {platinumError && (
            <div className="mb-4 p-3 rounded bg-red-900/30 border border-red-700 text-sm text-red-300">
              Error: {platinumError}
            </div>
          )}
          
          {platinumLoading && !platinumStats && (
            <div className="text-center py-8 text-gray-400">Loading platinum response data...</div>
          )}
          
          {platinumStats && (
            <>
              <HeroMetrics stats={platinumStats} />
              <ResponseCharts stats={platinumStats} jr2Data={platinumData} />
              <OverlapAnalysis overlapData={platinumOverlap} />
              <ValidationStatus stats={platinumStats} overlapData={platinumOverlap} />
              {mergedData.length > 0 && (
                <PatientTable mergedData={mergedData} />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CohortLab;







