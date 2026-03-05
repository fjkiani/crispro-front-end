import React from 'react';

const ArsenalDivider = ({ label, color, count, subtitle }) => (
    <div style={{ maxWidth: '1400px', margin: '3rem auto 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ height: '2px', flex: 1, background: `linear-gradient(90deg, ${color}40, transparent)` }} />
            <h2 style={{
                fontSize: '0.95rem', fontWeight: 800, color: color || '#0f172a',
                letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0, whiteSpace: 'nowrap',
            }}>
                {label}
                <span style={{ fontWeight: 600, opacity: 0.5, marginLeft: '0.75rem', fontSize: '0.85rem' }}>
                    [{count}]
                </span>
            </h2>
            <div style={{ height: '2px', flex: 1, background: `linear-gradient(90deg, transparent, ${color}40)` }} />
        </div>
        {subtitle && (
            <p style={{ textAlign: 'center', fontSize: '0.82rem', color: '#94a3b8', fontWeight: 400, margin: '0.5rem 0 0', lineHeight: 1.4 }}>
                {subtitle}
            </p>
        )}
    </div>
);

export default ArsenalDivider;
