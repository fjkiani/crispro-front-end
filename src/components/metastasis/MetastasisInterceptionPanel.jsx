/**
 * MetastasisInterceptionPanel Component
 * Displays CRISPR interception weapons for metastatic cascade steps
 * - Validated target gene
 * - Ranked guide RNA candidates with assassin scores
 * - Provenance and RUO disclaimer
 */
import React from 'react';
import { Target, Zap, Shield, AlertTriangle, Info } from 'lucide-react';

/**
 * Main Interception Panel Component
 */
export function MetastasisInterceptionPanel({ data, loading, error }) {
  if (loading) {
    return (
      <div className="bg-slate-800/50 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400"></div>
          <span className="text-slate-300">Forging interception weapons...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="text-red-400" size={20} />
          <span className="text-red-300">Error: {error}</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Mission Objective Header */}
      <div className="bg-gradient-to-r from-cyan-900/30 to-slate-800/30 rounded-lg p-6 border border-cyan-500/20">
        <h3 className="text-2xl font-bold text-cyan-300 mb-2">{data.mission_objective}</h3>
        <p className="text-slate-400 text-sm">Mission Step: <span className="text-cyan-400">{data.mission_step}</span></p>
      </div>

      {/* Validated Target */}
      <ValidatedTargetCard target={data.validated_target} />

      {/* Considered Targets (if any) */}
      {data.considered_targets && data.considered_targets.length > 0 && (
        <ConsideredTargetsCard targets={data.considered_targets} />
      )}

      {/* Guide Candidates */}
      {data.candidates && data.candidates.length > 0 ? (
        <GuideCandidatesTable candidates={data.candidates} />
      ) : (
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="text-yellow-400" size={20} />
            <span className="text-yellow-300">No guide candidates generated. See provenance warnings.</span>
          </div>
        </div>
      )}

      {/* Rationale */}
      {data.rationale && data.rationale.length > 0 && (
        <RationaleCard rationale={data.rationale} />
      )}

      {/* Provenance */}
      <ProvenanceBar provenance={data.provenance} />

      {/* RUO Disclaimer */}
      <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <Info className="text-orange-400 flex-shrink-0" size={20} />
          <span className="text-orange-300 text-sm">
            <strong>Research Use Only (RUO)</strong>: This analysis is for research purposes only and not for clinical decision-making.
            All designs require experimental validation.
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Validated Target Card
 */
function ValidatedTargetCard({ target }) {
  return (
    <div className="bg-slate-800/50 rounded-lg p-6 border border-cyan-500/30">
      <div className="flex items-center space-x-3 mb-4">
        <Target className="text-cyan-400" size={24} />
        <h4 className="text-xl font-bold text-cyan-300">Validated Target</h4>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-slate-400 text-sm mb-1">Gene</p>
          <p className="text-2xl font-bold text-white">{target.gene}</p>
        </div>
        <div>
          <p className="text-slate-400 text-sm mb-1">Rank Score</p>
          <p className="text-2xl font-bold text-cyan-300">{(target.rank_score * 100).toFixed(1)}%</p>
        </div>
      </div>

      {/* Rationale */}
      {target.rationale && target.rationale.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <p className="text-slate-400 text-sm mb-2">Rationale</p>
          <ul className="space-y-1">
            {target.rationale.map((item, idx) => (
              <li key={idx} className="text-slate-300 text-sm flex items-start">
                <span className="text-cyan-400 mr-2">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Considered Targets Card
 */
function ConsideredTargetsCard({ targets }) {
  return (
    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
      <h4 className="text-lg font-bold text-slate-300 mb-4">Runner-Up Targets</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {targets.map((target, idx) => (
          <div key={idx} className="bg-slate-700/30 rounded p-3">
            <p className="text-white font-bold">{target.gene}</p>
            <p className="text-slate-400 text-sm">Score: {(target.rank_score * 100).toFixed(1)}%</p>
            <p className="text-slate-500 text-xs mt-1">{target.brief_rationale}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Guide Candidates Table
 */
function GuideCandidatesTable({ candidates }) {
  return (
    <div className="bg-slate-800/50 rounded-lg p-6 border border-purple-500/30">
      <div className="flex items-center space-x-3 mb-4">
        <Zap className="text-purple-400" size={24} />
        <h4 className="text-xl font-bold text-purple-300">Guide RNA Arsenal</h4>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left text-slate-400 text-sm py-2 pr-4">Sequence</th>
              <th className="text-left text-slate-400 text-sm py-2 pr-4">PAM</th>
              <th className="text-center text-slate-400 text-sm py-2 pr-4">GC%</th>
              <th className="text-center text-slate-400 text-sm py-2 pr-4">Efficacy</th>
              <th className="text-center text-slate-400 text-sm py-2 pr-4">Safety</th>
              <th className="text-center text-slate-400 text-sm py-2 pr-4">
                <div className="flex items-center justify-center space-x-1">
                  <Zap size={14} className="text-purple-400" />
                  <span>Assassin</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate, idx) => (
              <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                <td className="py-3 pr-4">
                  <code className="text-cyan-300 text-xs bg-slate-900/50 px-2 py-1 rounded">
                    {candidate.sequence}
                  </code>
                </td>
                <td className="py-3 pr-4">
                  <span className="text-slate-300 text-sm">{candidate.pam}</span>
                </td>
                <td className="text-center py-3 pr-4">
                  <span className="text-slate-300 text-sm">{(candidate.gc * 100).toFixed(0)}%</span>
                </td>
                <td className="text-center py-3 pr-4">
                  <ScoreBar value={candidate.efficacy_proxy} color="blue" />
                </td>
                <td className="text-center py-3 pr-4">
                  <ScoreBar value={candidate.safety_score} color="green" />
                </td>
                <td className="text-center py-3 pr-4">
                  <ScoreBar value={candidate.assassin_score} color="purple" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Score Bar Component
 */
function ScoreBar({ value, color }) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500'
  };

  const bgColorClasses = {
    blue: 'bg-blue-900/30',
    green: 'bg-green-900/30',
    purple: 'bg-purple-900/30'
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-16 h-2 ${bgColorClasses[color]} rounded-full overflow-hidden`}>
        <div
          className={`h-full ${colorClasses[color]} transition-all duration-300`}
          style={{ width: `${value * 100}%` }}
        />
      </div>
      <span className="text-slate-300 text-xs font-mono">{(value * 100).toFixed(0)}%</span>
    </div>
  );
}

/**
 * Rationale Card
 */
function RationaleCard({ rationale }) {
  return (
    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
      <h4 className="text-lg font-bold text-slate-300 mb-4">Design Rationale</h4>
      <ul className="space-y-2">
        {rationale.map((item, idx) => (
          <li key={idx} className="text-slate-300 text-sm flex items-start">
            <span className="text-cyan-400 mr-2">→</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Provenance Bar
 */
function ProvenanceBar({ provenance }) {
  return (
    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="text-slate-400">Provenance:</span>
        <span className="bg-slate-800 px-2 py-1 rounded text-cyan-400">
          Run ID: {provenance.run_id.slice(0, 8)}
        </span>
        <span className="bg-slate-800 px-2 py-1 rounded text-purple-400">
          {provenance.ruleset_version}
        </span>
        <span className="bg-slate-800 px-2 py-1 rounded text-blue-400">
          Profile: {provenance.profile}
        </span>
        {provenance.methods && provenance.methods.length > 0 && (
          <span className="bg-slate-800 px-2 py-1 rounded text-green-400">
            Methods: {provenance.methods.join(', ')}
          </span>
        )}
        {provenance.status_warnings && provenance.status_warnings.length > 0 && (
          <div className="flex items-center space-x-2 bg-yellow-900/30 px-2 py-1 rounded">
            <AlertTriangle size={14} className="text-yellow-400" />
            <span className="text-yellow-300">{provenance.status_warnings.length} warning(s)</span>
          </div>
        )}
      </div>
      
      {/* Show warnings */}
      {provenance.status_warnings && provenance.status_warnings.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-700">
          <p className="text-slate-400 text-xs mb-2">Warnings:</p>
          <ul className="space-y-1">
            {provenance.status_warnings.map((warning, idx) => (
              <li key={idx} className="text-yellow-300 text-xs flex items-start">
                <span className="text-yellow-400 mr-2">⚠</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default MetastasisInterceptionPanel;


