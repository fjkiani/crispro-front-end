import React from 'react';
import { INSIGHT_LABELS, INSIGHT_HELPERS, INSIGHT_THRESHOLDS } from './constants.jsx';
import { useKbGene, useKbVariant } from '../../hooks/useKb.js';
import KbHelperTooltip from './KbHelperTooltip.jsx';

const InsightChips = ({ insights, showHelpers = true, geneSymbol = null, variantInfo = null }) => {
    // Use KB hooks for data fetching
    const kbGene = useKbGene(geneSymbol);
    const kbVariant = useKbVariant(
        variantInfo?.gene || geneSymbol, 
        variantInfo?.hgvsP
    );

    // Extract helper text from KB data
    const getHelperText = (insightKey) => {
        // Try KB data first, fallback to constants
        if (kbGene.data?.helperCopy?.[insightKey]) {
            return kbGene.data.helperCopy[insightKey];
        }
        if (kbVariant.data?.helperCopy?.[insightKey]) {
            return kbVariant.data.helperCopy[insightKey];
        }
        return INSIGHT_HELPERS[insightKey];
    };

    const getProvenance = () => {
        return kbGene.provenance || kbVariant.provenance;
    };
    if (!insights) {
        return (
            <div className="flex flex-wrap gap-2">
                {Object.keys(INSIGHT_LABELS).map(key => (
                    <div key={key} className="px-3 py-1 bg-gray-700 text-gray-400 rounded-full text-xs">
                        {INSIGHT_LABELS[key]} —
                    </div>
                ))}
            </div>
        );
    }

    const getChipColor = (value) => {
        if (value >= INSIGHT_THRESHOLDS.high) return 'bg-green-600 text-white';
        if (value >= INSIGHT_THRESHOLDS.mid) return 'bg-yellow-600 text-white';
        return 'bg-gray-600 text-gray-300';
    };

    const getChipIcon = (value) => {
        if (value >= INSIGHT_THRESHOLDS.high) return '✓';
        if (value >= INSIGHT_THRESHOLDS.mid) return '~';
        return '—';
    };

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
                {Object.entries(INSIGHT_LABELS).map(([key, label]) => {
                    const value = insights[key];
                    const hasValue = value !== undefined && value !== null;
                    
                    const chip = (
                        <div
                            key={key}
                            className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${
                                hasValue ? getChipColor(value) : 'bg-gray-700 text-gray-400'
                            }`}
                        >
                            <span>{getChipIcon(value)}</span>
                            <span>{label}</span>
                            {hasValue && (
                                <span className="ml-1 font-mono text-xs">
                                    {typeof value === 'number' ? value.toFixed(2) : value}
                                </span>
                            )}
                        </div>
                    );

                    // Wrap with KB helper tooltip if enabled
                    if (showHelpers) {
                        return (
                            <KbHelperTooltip
                                key={key}
                                helperText={getHelperText(key)}
                                provenance={getProvenance()}
                                variant={hasValue && value >= INSIGHT_THRESHOLDS.high ? 'verified' : 'info'}
                            >
                                {chip}
                            </KbHelperTooltip>
                        );
                    }

                    return chip;
                })}
            </div>
            
            {showHelpers && (
                <div className="text-xs text-gray-500 mt-2">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                            High (≥{INSIGHT_THRESHOLDS.high})
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                            Medium (≥{INSIGHT_THRESHOLDS.mid})
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
                            Low (&lt;{INSIGHT_THRESHOLDS.mid})
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InsightChips;
