/**
 * RuoFlags — Translated Research Use Only warning chips.
 * Uses translateRuo() for human-readable text.
 */
import React from 'react';
import { colors, radii } from './arsenalTokens';
import { translateRuo } from './ruoTranslations';

const RuoFlags = ({ reasons, size = 'sm' }) => {
    if (!reasons?.length) return null;
    const isLg = size === 'lg';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: isLg ? '0.4rem' : '0.3rem' }}>
            {reasons.map((reason, i) => (
                <div key={i} style={{
                    fontSize: isLg ? '0.8rem' : '0.75rem',
                    color: colors.errorText, fontWeight: 500,
                    padding: isLg ? '0.35rem 0.65rem' : '0.25rem 0.5rem',
                    borderRadius: isLg ? radii.badge : radii.small,
                    background: colors.errorBg,
                    border: `1px solid ${colors.errorBorder}`,
                    lineHeight: 1.3,
                }}>
                    ⚠ {translateRuo(reason)}
                </div>
            ))}
        </div>
    );
};

export default RuoFlags;
