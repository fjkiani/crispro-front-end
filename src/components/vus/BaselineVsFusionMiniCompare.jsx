import React from 'react';

const Cell = ({ label, value }) => (
	<div className="p-2 border border-gray-700 rounded-md">
		<div className="text-xs text-gray-400">{label}</div>
		<div className="text-sm text-gray-200">{value ?? '—'}</div>
	</div>
);

const BaselineVsFusionMiniCompare = ({ baseline, fusion }) => {
	return (
		<div className="mt-3 grid grid-cols-2 gap-2">
			<div>
				<div className="text-xs text-gray-400 mb-1">Baseline (1B, delta‑only)</div>
				<Cell label="Top therapy" value={baseline?.drugs?.[0]?.therapy} />
				<Cell label="Efficacy" value={baseline?.drugs?.[0]?.efficacy_score?.toFixed?.(2)} />
				<Cell label="Confidence" value={baseline?.drugs?.[0]?.confidence?.toFixed?.(2)} />
			</div>
			<div>
				<div className="text-xs text-gray-400 mb-1">Fusion (AM‑covered)</div>
				<Cell label="Top therapy" value={fusion?.drugs?.[0]?.therapy} />
				<Cell label="Efficacy" value={fusion?.drugs?.[0]?.efficacy_score?.toFixed?.(2)} />
				<Cell label="Confidence" value={fusion?.drugs?.[0]?.confidence?.toFixed?.(2)} />
			</div>
		</div>
	);
};

export default BaselineVsFusionMiniCompare;