import React from 'react';

/**
 * EMTRiskGauge - Visual Risk Meter for MFAP4/Transcriptomic Risk
 * Mandated by 07_STRATEGIC_DELIVERABLES_PLAN.md (Deliverable 1)
 * 
 * Visualizes the MFAP4 Expression Z-Score against the "High Risk" threshold.
 * - Green Zone: Z-Score < 1.5 (Low Risk)
 * - Red Zone: Z-Score >= 1.5 (High Risk)
 */
const EMTRiskGauge = ({ riskScore, zScore, label = "Transcriptomic Risk (MFAP4)" }) => {
    // Normalize z-score for display (clamp between -3 and +3 generally)
    // 0 is Center. +1.5 is the Threshold.

    // Simple segmented bar visualization
    const segments = 20;
    const thresholdIndex = 15; // Approx 75% mark represents Z=1.5

    // Map Z-score to percentage (0% = -3, 50% = 0, 100% = +3)
    // But clinically we care about 0 to +3 mostly.
    // Let's assume input 'riskScore' is 0-1 probability derived from Z-score, 
    // OR we use Z-score directly. Plan says "Z-score > 1.5".

    let normalizedPosition = 0;
    let displayValue = "";

    if (zScore !== undefined) {
        // Map -2..+4 range to 0..100%
        normalizedPosition = Math.min(Math.max((zScore + 1) / 4, 0), 1) * 100;
        displayValue = `Z=${zScore.toFixed(2)}`;
    } else if (riskScore !== undefined) {
        normalizedPosition = riskScore * 100;
        displayValue = `${(riskScore * 100).toFixed(0)}%`;
    }

    const isHighRisk = zScore >= 1.5 || riskScore > 0.7;

    return (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">{label}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded ${isHighRisk ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {isHighRisk ? "HIGH RISK" : "LOW RISK"}
                </span>
            </div>

            <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                {/* Background Gradient / Zones */}
                <div className="absolute inset-0 w-full h-full opacity-30"
                    style={{ background: 'linear-gradient(to right, #4ade80 0%, #4ade80 60%, #f87171 60%, #f87171 100%)' }}>
                </div>

                {/* Marker */}
                <div
                    className="absolute h-full w-1 bg-black transition-all duration-500 ease-out"
                    style={{ left: `${normalizedPosition}%` }}
                />
            </div>

            <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Low</span>
                <span>Threshold (Z=1.5)</span>
                <span>High</span>
            </div>

            <div className="mt-2 text-center text-xs font-mono text-gray-600">
                Current Value: {displayValue}
            </div>
        </div>
    );
};

export default EMTRiskGauge;
