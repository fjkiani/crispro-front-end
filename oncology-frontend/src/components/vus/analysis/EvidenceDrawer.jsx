import React, { useState } from 'react';

const EvidenceDrawer = ({ evidence, summary, clinicalContext }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!evidence && !summary && !clinicalContext) return null;

    return (
        <div className="border-t border-gray-200 mt-8 pt-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 font-medium transition-colors"
            >
                <svg className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                {isOpen ? 'Hide Detailed Evidence' : 'Show Detailed Evidence & Context'}
            </button>

            {isOpen && (
                <div className="mt-6 space-y-6 animate-fadeIn">
                    {/* Summary */}
                    {summary && (
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Literature Summary</h4>
                            <div className="prose prose-sm prose-indigo text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                {typeof summary === 'string' ? summary : (
                                    <>
                                        {summary.literature_summary && <p>{summary.literature_summary}</p>}
                                        {summary.clinical_significance && (
                                            <div className="mt-3 pt-3 border-t border-gray-200">
                                                <strong className="text-gray-700">Significance:</strong> {summary.clinical_significance}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Clinical Context */}
                    {clinicalContext && (
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Clinical Context</h4>
                            <div
                                className="prose prose-sm prose-gray bg-white p-4 rounded-lg border border-gray-200 text-gray-700"
                                dangerouslySetInnerHTML={{ __html: clinicalContext.replace(/\n/g, '<br/>') }}
                            />
                        </div>
                    )}

                    {/* Raw Evidence */}
                    {evidence && (
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Raw Evidence Chain</h4>
                            <pre className="text-xs font-mono text-gray-500 bg-gray-50 p-4 rounded-lg border border-gray-200 whitespace-pre-wrap overflow-x-auto">
                                {typeof evidence === 'string' ? evidence : JSON.stringify(evidence, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EvidenceDrawer;
