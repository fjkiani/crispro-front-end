import React, { useState } from 'react';
import { useActivity, ACTIVITY_TYPES } from '../../context/ActivityContext';
import SporadicProvenanceCard from '../sporadic/SporadicProvenanceCard.jsx';

const Row = ({ d }) => {
	const [expanded, setExpanded] = useState(false);
	
	return (
		<>
			<tr className="border-b border-gray-700 hover:bg-gray-750 cursor-pointer" onClick={() => setExpanded(!expanded)}>
				<td className="py-2 px-2 text-gray-200">
					<span className="mr-2">{expanded ? '▼' : '▶'}</span>
					{d?.therapy || '—'}
				</td>
				<td className="py-2 px-2 text-gray-300">{d?.efficacy_score?.toFixed ? d.efficacy_score.toFixed(2) : '—'}</td>
				<td className="py-2 px-2 text-gray-300">{d?.confidence?.toFixed ? d.confidence.toFixed(2) : '—'}</td>
				<td className="py-2 px-2 text-gray-300">{d?.evidence_tier || '—'}</td>
				<td className="py-2 px-2 text-gray-400">{(d?.badges || []).join(', ')}</td>
			</tr>
			{expanded && (
				<tr className="bg-gray-900">
					<td colSpan="5" className="py-3 px-4">
						<div className="space-y-3 text-sm">
							{/* Insights Chips */}
							{d?.insights && (
								<div>
									<div className="text-xs font-semibold text-gray-400 mb-2">Insights</div>
									<div className="flex flex-wrap gap-2">
										{typeof d.insights.functionality === 'number' && (
											<div className="px-2 py-1 rounded-full bg-blue-900/40 text-blue-200 text-xs">
												Functionality: {d.insights.functionality.toFixed(2)}
											</div>
										)}
										{typeof d.insights.chromatin === 'number' && (
											<div className="px-2 py-1 rounded-full bg-green-900/40 text-green-200 text-xs">
												Chromatin: {d.insights.chromatin.toFixed(2)}
											</div>
										)}
										{typeof d.insights.essentiality === 'number' && (
											<div className="px-2 py-1 rounded-full bg-purple-900/40 text-purple-200 text-xs">
												Essentiality: {d.insights.essentiality.toFixed(2)}
											</div>
										)}
										{typeof d.insights.regulatory === 'number' && (
											<div className="px-2 py-1 rounded-full bg-yellow-900/40 text-yellow-200 text-xs">
												Regulatory: {d.insights.regulatory.toFixed(2)}
											</div>
										)}
									</div>
								</div>
							)}
							
							{/* Rationale */}
							{d?.rationale && d.rationale.length > 0 && (
								<div>
									<div className="text-xs font-semibold text-gray-400 mb-2">Rationale</div>
									<ul className="list-disc list-inside space-y-1 text-gray-300">
										{d.rationale.map((r, i) => (
											<li key={i} className="text-xs">
												{r.type ? `${r.type}: ` : ''}{r.value || r.message || JSON.stringify(r)}
											</li>
										))}
									</ul>
								</div>
							)}
							
							{/* Provenance */}
							{d?.provenance && (
								<div>
									<div className="text-xs font-semibold text-gray-400 mb-1">Provenance</div>
									<div className="text-xs text-gray-500 space-y-1">
										{d.provenance.method && <div>Method: {d.provenance.method}</div>}
										{d.provenance.model_id && <div>Model: {d.provenance.model_id}</div>}
										{d.provenance.run_id && <div>Run: {d.provenance.run_id}</div>}
									</div>
								</div>
							)}
                                               {/* Sporadic Cancer Provenance */}
                                               {d?.sporadic_gates_provenance && (
                                               <div className="mt-3">
                                               <SporadicProvenanceCard
                                                   drugName={d?.therapy || d?.name || "Unknown"}
                                                   provenance={d.sporadic_gates_provenance}
                                               />
                                               </div>
                                               )}
						</div>
					</td>
				</tr>
			)}
		</>
	);
};

const EfficacyModal = ({ open, onClose, data, provenance }) => {
	if (!open) return null;
	const drugs = data?.drugs || [];
	const { addActivity } = useActivity ? useActivity() : { addActivity: () => {} };

	const download = (content, filename, type) => {
		const blob = new Blob([content], { type });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url; a.download = filename; a.click();
		URL.revokeObjectURL(url);
	};

	const exportJSON = () => {
		const payload = { provenance, drugs };
		download(JSON.stringify(payload, null, 2), 'efficacy_result.json', 'application/json');
		addActivity && addActivity(ACTIVITY_TYPES.AGENCY_ACTION_SUCCESS || ACTIVITY_TYPES.GENOMIC_ANALYSIS, 'Exported WIWFM JSON', { count: drugs.length });
	};

	const exportCSV = () => {
		const header = ['therapy','efficacy_score','confidence','evidence_tier','badges'];
		const rows = drugs.map(d => [
			JSON.stringify(d?.therapy ?? ''),
			(d?.efficacy_score ?? ''),
			(d?.confidence ?? ''),
			JSON.stringify(d?.evidence_tier ?? ''),
			JSON.stringify((d?.badges || []).join('|'))
		]);
		const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
		download(csv, 'efficacy_result.csv', 'text/csv');
		addActivity && addActivity(ACTIVITY_TYPES.AGENCY_ACTION_SUCCESS || ACTIVITY_TYPES.GENOMIC_ANALYSIS, 'Exported WIWFM CSV', { count: drugs.length });
	};
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
			<div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-full max-w-3xl">
				<div className="p-4 flex items-center justify-between border-b border-gray-700">
					<h3 className="text-xl font-semibold text-purple-300">Therapy fit (research‑mode)</h3>
					<button className="text-gray-300 hover:text-white" onClick={onClose}>✕</button>
				</div>
				<div className="p-4 space-y-3">
					<table className="w-full text-sm">
						<thead>
							<tr className="text-gray-400">
								<th className="text-left py-2 px-2">Therapy</th>
								<th className="text-left py-2 px-2">Efficacy</th>
								<th className="text-left py-2 px-2">Confidence</th>
								<th className="text-left py-2 px-2">Tier</th>
								<th className="text-left py-2 px-2">Badges</th>
							</tr>
						</thead>
						<tbody>
							{drugs.map((d, i) => <Row key={`${d?.therapy || 'x'}-${i}`} d={d} />)}
						</tbody>
					</table>
					<div className="text-xs text-gray-400">
						What this means today: ranked therapies reflect our current signals (S/P/E) and research‑mode gates. Always check the Dossier and citations.
					</div>
					{provenance && (
						<div className="text-xs text-gray-500">run: {provenance?.efficacy_run || provenance?.run_id || 'N/A'}</div>
					)}
					<div className="pt-2 flex items-center gap-2">
						<button onClick={exportJSON} className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-200 border border-gray-600 hover:bg-gray-600">Export JSON</button>
						<button onClick={exportCSV} className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-200 border border-gray-600 hover:bg-gray-600">Export CSV</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default EfficacyModal;


