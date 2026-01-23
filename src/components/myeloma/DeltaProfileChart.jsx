import React from 'react';

const DeltaProfileChart = ({ profile = [], width = 320, height = 80 }) => {
  if (!Array.isArray(profile) || profile.length === 0) return null;
  const xs = profile.map((_, i) => i);
  const ys = profile.map(p => p.delta || 0);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const pad = 4;
  const scaleX = (i) => pad + (i * (width - 2 * pad)) / (profile.length - 1);
  const scaleY = (y) => {
    const denom = (maxY - minY) || 1e-9;
    return height - pad - ((y - minY) * (height - 2 * pad)) / denom;
  };
  const d = profile.map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(p.delta || 0)}`).join(' ');
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <path d={d} stroke="#1976d2" strokeWidth={1.5} fill="none" />
    </svg>
  );
};

export default DeltaProfileChart; 