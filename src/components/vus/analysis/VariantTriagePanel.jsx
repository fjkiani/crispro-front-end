import React from 'react';
import { STATUS_COLORS } from '../constants.jsx';

const VariantTriagePanel = ({ vusIdentify, isLoading, error }) => {
    // If not running or no result yet, show loading or placeholder
    if (isLoading) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 rounded-lg border border-red-100 p-6">
                <h3 className="text-red-800 font-semibold mb-2">Analysis Unavailable</h3>
                <p className="text-red-600 text-sm">{error}</p>
            </div>
        );
    }

    if (!vusIdentify) return null;

    const verdict = vusIdentify?.triage?.verdict || 'Uncertain';
    // Map verdict to color (using light theme compatible colors)
    const getVerdictColor = (v) => {
        const lower = v.toLowerCase();
        if (lower.includes('pathogenic')) return 'bg-red-100 text-red-800 border-red-200';
        if (lower.includes('benign')) return 'bg-green-100 text-green-800 border-green-200';
        return 'bg-amber-100 text-amber-800 border-amber-200';
    };

    const nextActions = vusIdentify?.next_actions || [];

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
            <div className="p-6">
                {/* Header: Verdict */}
                <div className="flex items-center gap-4 mb-4">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${getVerdictColor(verdict)} uppercase tracking-wide`}>
                        {verdict}
                    </span>
                    <span className="text-sm text-gray-500 font-medium tracking-tight">
                        Resolution Path: {vusIdentify?.provenance?.resolution_path || 'Standard'}
                    </span>
                </div>

                {/* Main Proposition */}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Is this variant meaningful?
                </h2>
                <div className="prose prose-gray text-gray-600 mb-6">
                    <p>
                        Based on current guidelines, this variant is classified as <strong className="text-gray-900">{verdict}</strong>.
                        {vusIdentify?.pathway_context?.pathway_relevance && (
                            <span> It is associated with the <strong>{vusIdentify.pathway_context.pathway_relevance}</strong> pathway.</span>
                        )}
                    </p>
                </div>

                {/* Next Actions (The "So What?") */}
                {nextActions.length > 0 && (
                    <div className="bg-indigo-50 rounded-lg border border-indigo-100 p-4">
                        <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-wide mb-3 flex items-center">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                            Recommended Next Actions
                        </h4>
                        <ul className="space-y-3">
                            {nextActions.slice(0, 3).map((action, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <div className="mt-0.5 flex-shrink-0 w-5 h-5 bg-white rounded-full border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-sm text-xs font-bold">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <p className="text-indigo-900 font-semibold text-sm">{action.label || action.action}</p>
                                        <p className="text-indigo-700 text-xs mt-0.5 leading-relaxed">{action.description}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Footer Metadata (Trusted Source) */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex gap-4 text-xs text-gray-500">
                <span> ClinVar: <strong>{vusIdentify?.coverage?.clinvar?.status || 'N/A'}</strong></span>
                <span> Evo2 Score: <strong>{vusIdentify?.sequence?.min_delta ?? '—'}</strong></span>
            </div>
        </div>
    );
};

export default VariantTriagePanel;
