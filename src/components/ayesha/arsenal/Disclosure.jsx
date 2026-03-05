/**
 * Disclosure — Collapsible section with ▸ toggle.
 * Used by: DrugCard (Tier 2/3), ArsenalDrugDetailPage (RUO section).
 */
import React, { useState } from 'react';
import { colors, transitions } from './arsenalTokens';

const Disclosure = ({ label, defaultOpen = false, children }) => {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div>
            <button
                onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
                style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '0.4rem 0', fontSize: '0.8rem', fontWeight: 700,
                    color: colors.accent, display: 'flex', alignItems: 'center',
                    gap: '0.4rem', width: '100%', textAlign: 'left',
                }}
            >
                <span style={{
                    transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: transitions.disclosure,
                    display: 'inline-block',
                }}>▸</span>
                {label}
            </button>
            {open && (
                <div style={{
                    paddingLeft: '0.2rem', paddingTop: '0.25rem',
                    display: 'flex', flexDirection: 'column', gap: '0.5rem',
                }}>
                    {children}
                </div>
            )}
        </div>
    );
};

export default Disclosure;
