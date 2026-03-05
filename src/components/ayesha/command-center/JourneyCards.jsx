/**
 * JourneyCards — 4 phase-linking cards with live teasers.
 *
 * Pure renderer. Each card shows an icon, label, dynamic teaser,
 * CTA text, and navigates to its journey route on click.
 *
 * Props:
 *   cards — Array of { icon, label, teaser, cta, route, accentVar, bgVar }
 *
 * Zero hardcoded patient data. Colors via CSS custom properties.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function JourneyCards({ cards = [] }) {
    const navigate = useNavigate();

    if (cards.length === 0) return null;

    return (
        <section>
            <h2 className="cc-section-title">Your Journey</h2>
            <div className="cc-journey-grid">
                {cards.map((card, i) => (
                    <div
                        key={i}
                        className="cc-intel-card"
                        onClick={() => navigate(card.route)}
                        style={{
                            '--card-accent': `var(${card.accentVar || '--zeta-slate'})`,
                            '--card-bg': `var(${card.bgVar || '--surface-subtle'})`,
                        }}
                    >
                        <div
                            className="cc-intel-card__icon-wrap"
                            style={{
                                background: `var(${card.bgVar || '--surface-subtle'})`,
                                color: `var(${card.accentVar || '--zeta-slate'})`,
                            }}
                        >
                            {card.icon}
                        </div>
                        <div className="cc-intel-card__title">{card.label}</div>
                        <div className="cc-intel-card__teaser">{card.teaser}</div>
                        <div
                            className="cc-intel-card__cta"
                            style={{ color: `var(${card.accentVar || '--zeta-slate'})` }}
                        >
                            {card.cta} →
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
