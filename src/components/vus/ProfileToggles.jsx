import React from 'react';

const profiles = [
	{ key: 'baseline', label: 'Baseline (1B, delta‑only)' },
	{ key: 'richer', label: 'Richer S' },
	{ key: 'fusion', label: 'Fusion' },
];

const ProfileToggles = ({ value = 'baseline', onChange }) => {
	return (
		<div className="flex flex-wrap gap-2">
			{profiles.map((p) => (
				<button
					key={p.key}
					onClick={() => onChange && onChange(p.key)}
					className={`text-xs px-2 py-1 rounded border ${
						value === p.key
							? 'bg-purple-600 text-white border-purple-600'
							: 'bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700'
					}`}
				>
					{p.label}
				</button>
			))}
		</div>
	);
};

export default ProfileToggles;









