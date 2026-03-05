import React from 'react';

const StatCard = ({ value, label, color, icon }) => (
    <div style={{
        flex: '1 1 160px',
        padding: '1.5rem 1.25rem',
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        alignItems: 'center',
        justifyContent: 'center',
    }}>
        <div style={{
            fontSize: '0.75rem',
            color: '#64748b',
            fontWeight: 800,
            letterSpacing: '0.1em',
            textTransform: 'uppercase'
        }}>
            {icon} {label}
        </div>
        <div style={{
            fontSize: '2.4rem',
            fontWeight: 900,
            color: color || '#0f172a',
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
            letterSpacing: '-0.02em'
        }}>
            {value}
        </div>
    </div>
);

export default StatCard;
