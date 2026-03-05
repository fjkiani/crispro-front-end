/**
 * CompletenessStrip — Reusable progress bar for data coverage.
 *
 * Pure renderer. Receives:
 *   score     — 0-1 completeness fraction
 *   missing   — Array of missing field names
 *   route     — Route to navigate for CTA
 *   ctaLabel  — CTA button text
 *
 * Zero hardcoded values. All colors via CSS custom properties.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function CompletenessStrip({ score = 0, missing = [], route, ctaLabel }) {
    const navigate = useNavigate();
    const pct = Math.round(score * 100);

    return (
        <div className="cc-completeness">
            <div className="cc-completeness__header">
                <span className="cc-completeness__pct">{pct}% data coverage</span>
                {route && ctaLabel && (
                    <button className="cc-toggle" onClick={() => navigate(route)}>
                        {ctaLabel} →
                    </button>
                )}
            </div>
            <div className="cc-completeness__bar">
                <div
                    className="cc-completeness__fill"
                    style={{ width: `${pct}%` }}
                />
            </div>
            {missing.length > 0 && (
                <span className="cc-completeness__missing">
                    Missing: {missing.join(', ')}
                </span>
            )}
        </div>
    );
}
