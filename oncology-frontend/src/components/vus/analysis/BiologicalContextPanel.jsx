import React from 'react';
import InsightChips from '../InsightChips';

const BiologicalContextPanel = ({ insights, geneSymbol, variantInfo }) => {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                What does this variant change biologically?
            </h2>

            {/* We reuse InsightChips but wrap it to control styling if needed, or pass 'light' mode prop if supported later. 
                For now, InsightChips uses hardcoded colours, which is fine, but we ensure the container is clean. */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <InsightChips
                    insights={insights}
                    geneSymbol={geneSymbol}
                    variantInfo={variantInfo}
                />
            </div>

            <p className="text-xs text-gray-500 mt-4 italic">
                These scores reflect the variant's impact on protein function, gene regulation, and cell essentiality.
            </p>
        </div>
    );
};

export default BiologicalContextPanel;
