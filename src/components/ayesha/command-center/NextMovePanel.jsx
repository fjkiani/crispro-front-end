/**
 * NextMovePanel — Pre-split, pre-translated clinical & data actions.
 *
 * Pure renderer. Receives fully-formed action arrays from the orchestrator.
 * Supports inline entry slot: when an action has `entryForm`, clicking it
 * expands the form in-place.
 *
 * Props:
 *   clinicalActions — [{ icon, label, reason, route, priority }]
 *   dataActions     — [{ icon, label, reason, route, priority, entryForm?: ReactNode }]
 *   defaultVisible  — Number of actions to show per tier before "show all"
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ActionRow({ action, navigate }) {
    const [expanded, setExpanded] = useState(false);

    const handleClick = () => {
        if (action.entryForm) {
            setExpanded(!expanded);
        } else if (action.route) {
            navigate(action.route);
        }
    };

    const priorityClass =
        action.priority === 'high' && action.tier === 'clinical' ? 'cc-action--high-clinical' :
            action.priority === 'high' && action.tier === 'data' ? 'cc-action--high-data' :
                action.priority === 'medium' ? 'cc-action--medium' :
                    'cc-action--low';

    return (
        <div>
            <div
                className={`cc-action ${priorityClass}`}
                onClick={handleClick}
                style={{ cursor: action.route || action.entryForm ? 'pointer' : 'default' }}
            >
                <span className="cc-action__icon">{action.icon}</span>
                <div>
                    <div className="cc-action__label">{action.label}</div>
                    {action.reason && (
                        <div className="cc-action__unlocks">{action.reason}</div>
                    )}
                </div>
                {action.entryForm && (
                    <span style={{ marginLeft: 'auto', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-hint)' }}>
                        {expanded ? '▾ Close' : '▸ Enter'}
                    </span>
                )}
                {!action.entryForm && action.route && (
                    <span style={{ marginLeft: 'auto', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-hint)' }}>
                        →
                    </span>
                )}
            </div>
            {expanded && action.entryForm && (
                <div style={{ padding: 'var(--card-padding)', paddingTop: 0 }}>
                    {action.entryForm}
                </div>
            )}
        </div>
    );
}

export default function NextMovePanel({
    clinicalActions = [],
    dataActions = [],
    defaultVisible = 3,
}) {
    const navigate = useNavigate();
    const [showAllClinical, setShowAllClinical] = useState(false);
    const [showAllData, setShowAllData] = useState(false);

    const visibleClinical = showAllClinical ? clinicalActions : clinicalActions.slice(0, defaultVisible);
    const visibleData = showAllData ? dataActions : dataActions.slice(0, defaultVisible);

    return (
        <section>
            <h2 className="cc-section-title">Next Moves</h2>

            {/* Clinical tier */}
            {clinicalActions.length > 0 && (
                <div style={{ marginBottom: 'var(--section-gap)' }}>
                    <div className="cc-signal-teaser__group-label" style={{ marginBottom: 8 }}>
                        Clinical ({clinicalActions.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {visibleClinical.map((action, i) => (
                            <ActionRow key={i} action={{ ...action, tier: 'clinical' }} navigate={navigate} />
                        ))}
                    </div>
                    {clinicalActions.length > defaultVisible && (
                        <button className="cc-toggle" onClick={() => setShowAllClinical(!showAllClinical)}>
                            {showAllClinical ? 'Show fewer' : `Show all ${clinicalActions.length}`}
                        </button>
                    )}
                </div>
            )}

            {/* Data tier */}
            {dataActions.length > 0 && (
                <div>
                    <div className="cc-signal-teaser__group-label" style={{ marginBottom: 8 }}>
                        Data Gaps ({dataActions.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {visibleData.map((action, i) => (
                            <ActionRow key={i} action={{ ...action, tier: 'data' }} navigate={navigate} />
                        ))}
                    </div>
                    {dataActions.length > defaultVisible && (
                        <button className="cc-toggle" onClick={() => setShowAllData(!showAllData)}>
                            {showAllData ? 'Show fewer' : `Show all ${dataActions.length}`}
                        </button>
                    )}
                </div>
            )}

            {clinicalActions.length === 0 && dataActions.length === 0 && (
                <div className="cc-signal-nodata">
                    <span className="cc-signal-nodata__text">
                        No actions generated — all signals clear or data complete.
                    </span>
                </div>
            )}
        </section>
    );
}
