import React from 'react';

// Compact, defensive provenance row used across VUS Explorer
// Props: { provenance?: object, profile?: 'baseline'|'richer'|'fusion', mode?: string }
const ProvenanceBar = ({ provenance = {}, profile = 'baseline', mode }) => {
  const runId = provenance?.efficacy_run || provenance?.run_id || provenance?.id || 'N/A';
  const flags = provenance?.flags || provenance?.feature_flags_snapshot || {};
  const cacheInfo = provenance?.cache || provenance?.cache_status || undefined; // optional 'hit' | 'miss'
  const method = provenance?.method || provenance?.policy_version || undefined;
  const urls = Array.isArray(provenance?.urls) ? provenance.urls : [];

  const Pill = ({ children, className = '' }) => (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] ${className}`}>
      {children}
    </span>
  );

  return (
    <div className="mt-2 p-2 bg-gray-700 rounded-md border border-gray-600 flex flex-wrap gap-2 items-center">
      <Pill className="bg-gray-800 text-gray-200 border-gray-500">
        <span className="opacity-80 mr-1">Run</span>
        <span className="font-mono">{String(runId).slice(0, 16)}</span>
      </Pill>
      <Pill className="bg-gray-800 text-purple-200 border-purple-600">
        <span className="opacity-80 mr-1">Profile</span>
        <span className="uppercase font-semibold">{profile}</span>
      </Pill>
      {mode && (
        <Pill className="bg-gray-800 text-blue-200 border-blue-600">
          <span className="opacity-80 mr-1">Mode</span>
          <span>{mode}</span>
        </Pill>
      )}
      {cacheInfo && (
        <Pill className={`bg-gray-800 border ${cacheInfo === 'hit' ? 'text-green-200 border-green-600' : 'text-yellow-200 border-yellow-600'}`}>
          <span className="opacity-80 mr-1">Cache</span>
          <span>{cacheInfo}</span>
        </Pill>
      )}
      {method && (
        <Pill className="bg-gray-800 text-indigo-200 border-indigo-600">
          <span className="opacity-80 mr-1">Policy</span>
          <span>{method}</span>
        </Pill>
      )}
      {Object.keys(flags || {}).length > 0 && (
        <Pill className="bg-gray-800 text-gray-300 border-gray-600">
          <span className="opacity-80 mr-1">Flags</span>
          <span className="font-mono truncate" title={JSON.stringify(flags)}>
            {Object.entries(flags)
              .slice(0, 3)
              .map(([k, v]) => `${k}:${String(v)}`)
              .join(' ')}
            {Object.keys(flags).length > 3 ? ' …' : ''}
          </span>
        </Pill>
      )}
      {urls.length > 0 && (
        <Pill className="bg-gray-800 text-gray-200 border-gray-600">
          <span className="opacity-80 mr-1">URLs</span>
          <span>{urls.length}</span>
        </Pill>
      )}
      <div className="ml-auto text-[11px] text-gray-400">Research‑mode; audit‑ready provenance.</div>
    </div>
  );
};

export default ProvenanceBar;





