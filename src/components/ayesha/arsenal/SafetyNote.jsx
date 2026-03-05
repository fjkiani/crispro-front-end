/**
 * SafetyNote — Drug-specific safety warnings.
 * Currently: Ritonavir co-administration context.
 * Extensible for future drug-specific notes.
 */
import React from 'react';
import { colors, radii } from './arsenalTokens';

const SAFETY_NOTES = {
    ritonavir: "⚠️ Ritonavir's primary role here is as a drug interaction enhancer, not a direct anti-cancer agent. Clinical relevance depends on co-administration context.",
};

const SafetyNote = ({ drugName, size = 'sm' }) => {
    const key = (drugName || '').toLowerCase();
    const note = SAFETY_NOTES[key];
    if (!note) return null;
    const isLg = size === 'lg';

    return (
        <div style={{
            padding: isLg ? '0.75rem 1rem' : '0.5rem 0.75rem',
            borderRadius: isLg ? radii.pill : radii.pill,
            background: colors.warningBg,
            border: `1px solid ${colors.warningBorder}`,
            color: colors.warning,
            fontSize: isLg ? '0.88rem' : '0.78rem',
            fontWeight: 600, lineHeight: 1.4,
        }}>
            {note}
        </div>
    );
};

export default SafetyNote;
