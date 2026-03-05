/**
 * BiomarkerFit — Shows which biomarker profiles make this drug a good/bad fit.
 * Green chips for positive, red for negative.
 */
import React from 'react';
import { colors, radii, typography } from '../arsenalTokens';

const BIOMARKER_TRANSLATIONS = {
    Platinum_Sensitive: 'Responsive to platinum chemo',
    CSC_High: 'High cancer stem cell activity',
    ALDH_High: 'High ALDH (cancer stem cell marker)',
    DLST_High: 'High DLST (energy metabolism)',
    Hedgehog_Active: 'Active Hedgehog signaling',
    Wnt_Active: 'Active WNT signaling',
    HIF1a_High: 'High HIF-1α (low oxygen response)',
    Statin_Naive: 'Not currently on statins',
    COX2_Overexpressing: 'High COX-2 expression',
    DRD2_Expressing: 'DRD2 receptor present',
    HDAC_Sensitive: 'Sensitive to HDAC inhibitors',
};

const BiomarkerChip = ({ marker, type }) => {
    const isPos = type === 'positive';
    const translation = BIOMARKER_TRANSLATIONS[marker];
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', gap: '0.15rem',
            padding: '0.4rem 0.75rem', borderRadius: radii.pill,
            background: isPos ? colors.successBg : colors.errorBg,
            border: `1px solid ${isPos ? colors.successBorder : colors.errorBorder}`,
        }}>
            <span style={{
                fontSize: '0.82rem', fontWeight: 700,
                color: isPos ? colors.successText : colors.errorText,
            }}>
                {isPos ? '✓' : '✕'} {marker.replace(/_/g, ' ')}
            </span>
            {translation && (
                <span style={{ fontSize: '0.72rem', color: colors.muted, fontWeight: 400 }}>
                    {translation}
                </span>
            )}
        </div>
    );
};

const BiomarkerFit = ({ positive, negative }) => {
    if ((!positive || positive.length === 0) && (!negative || negative.length === 0)) return null;

    return (
        <div style={{
            background: colors.bgCard, borderRadius: radii.section,
            border: `1px solid ${colors.border}`, padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}>
            <h3 style={{ ...typography.sectionTitle, color: colors.caption, margin: '0 0 0.5rem' }}>
                Biomarker Fit
            </h3>
            <p style={{ fontSize: '0.82rem', color: colors.muted, margin: '0 0 1rem', lineHeight: 1.4 }}>
                Which biological markers suggest this drug may or may not work for this patient.
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {positive?.map(m => <BiomarkerChip key={m} marker={m} type="positive" />)}
                {negative?.map(m => <BiomarkerChip key={m} marker={m} type="negative" />)}
            </div>
        </div>
    );
};

export default BiomarkerFit;
