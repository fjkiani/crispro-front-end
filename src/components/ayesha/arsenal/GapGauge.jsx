/**
 * GapGauge — Log-scale IC₅₀/free Cₘₐₓ gap ratio bar with threshold lines.
 * Props:
 *   gap     — numeric gap ratio
 *   isFail  — flat red bar for FAIL drugs
 *   size    — 'sm' (card) or 'lg' (detail page)
 *   showLabels — show axis labels (detail page only)
 */
import React from 'react';
import {
    colors, radii, transitions,
    gapColor, gapToPercent, THRESHOLD_5X, THRESHOLD_50X,
} from './arsenalTokens';

const GapGauge = ({ gap, isFail = false, size = 'sm', showLabels = false }) => {
    if (gap == null) return null;
    const isLg = size === 'lg';
    const h = isLg ? '12px' : '8px';
    const dotSize = isLg ? 16 : 12;
    const r = isLg ? radii.gaugeLg : radii.gauge;
    const thresholdW = isLg ? '2px' : '1px';

    if (isFail) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '8px' }}>
                <div style={{ flex: 1, height: h, background: colors.errorBorder, borderRadius: r, overflow: 'hidden' }}>
                    <div style={{ width: '100%', height: '100%', background: colors.fail, borderRadius: r, opacity: 0.7 }} />
                </div>
                <span style={{ fontSize: '0.7rem', color: colors.fail, fontWeight: 800 }}>✕</span>
            </div>
        );
    }

    const pct = gapToPercent(gap);
    const color = gapColor(gap);

    return (
        <div>
            <div style={{
                position: 'relative', height: h, background: colors.bgSubtle,
                borderRadius: r, overflow: 'hidden', marginTop: '8px',
            }}>
                {/* Fill bar */}
                <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0,
                    width: `${pct}%`, borderRadius: r,
                    background: color, opacity: isLg ? 0.6 : 0.7,
                    transition: transitions.gauge,
                }} />
                {/* 5× threshold */}
                <div style={{
                    position: 'absolute', left: `${THRESHOLD_5X}%`, top: 0, bottom: 0,
                    width: thresholdW, background: colors.pass, opacity: isLg ? 0.5 : 0.4,
                }} />
                {/* 50× threshold */}
                <div style={{
                    position: 'absolute', left: `${THRESHOLD_50X}%`, top: 0, bottom: 0,
                    width: thresholdW, background: colors.fail, opacity: isLg ? 0.5 : 0.4,
                }} />
                {/* Indicator dot */}
                <div style={{
                    position: 'absolute', left: `${pct}%`, top: '-2px',
                    width: `${dotSize}px`, height: `${dotSize}px`, borderRadius: '50%',
                    background: color, border: '2px solid #fff',
                    transform: 'translateX(-50%)', transition: transitions.gaugePos,
                    boxShadow: `0 1px ${isLg ? 6 : 4}px ${color}40`,
                }} />
            </div>
            {showLabels && (
                <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: '0.7rem', color: colors.caption, marginTop: '0.5rem',
                }}>
                    <span>← Better</span>
                    <span>5× (viable)</span>
                    <span>50× (fail)</span>
                    <span>Worse →</span>
                </div>
            )}
        </div>
    );
};

export default GapGauge;
