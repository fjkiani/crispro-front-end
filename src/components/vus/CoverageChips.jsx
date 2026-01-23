import React, { useState, useEffect } from 'react';
import kbClient from '../../lib/kbClient.js';

const CoverageChips = ({ coverage, showHelpers = true, geneSymbol = null, variantInfo = null }) => {
    const [kbCoverage, setKbCoverage] = useState({});
    const [loading, setLoading] = useState(false);

    // Load KB coverage data when gene or variant info is available
    useEffect(() => {
        const loadKbCoverage = async () => {
            if (!geneSymbol && !variantInfo) return;
            
            setLoading(true);
            try {
                const coverageData = {};
                
                // Load variant coverage info if available
                if (variantInfo && variantInfo.gene && variantInfo.hgvsP) {
                    const variantInfo_kb = await kbClient.getVariantInfo(variantInfo.gene, variantInfo.hgvsP);
                    if (variantInfo_kb) {
                        coverageData.clinvar = {
                            status: variantInfo_kb.clinvarPrior,
                            source: 'KB'
                        };
                        coverageData.alphamissense = variantInfo_kb.amCovered;
                    }
                }
                
                setKbCoverage(coverageData);
            } catch (error) {
                console.warn('Failed to load KB coverage:', error);
            } finally {
                setLoading(false);
            }
        };

        loadKbCoverage();
    }, [geneSymbol, variantInfo]);

    // Merge KB coverage with provided coverage (KB takes precedence)
    const mergedCoverage = {
        ...coverage,
        ...kbCoverage
    };
    if (!mergedCoverage) {
        return (
            <div className="flex flex-wrap gap-2">
                <div className="px-3 py-1 bg-gray-700 text-gray-400 rounded-full text-xs">
                    ClinVar —
                </div>
                <div className="px-3 py-1 bg-gray-700 text-gray-400 rounded-full text-xs">
                    AM —
                </div>
            </div>
        );
    }

    const getClinVarColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pathogenic':
            case 'likely pathogenic':
                return 'bg-red-600 text-white';
            case 'benign':
            case 'likely benign':
                return 'bg-green-600 text-white';
            case 'uncertain significance':
            case 'vus':
                return 'bg-yellow-600 text-white';
            default:
                return 'bg-gray-600 text-gray-300';
        }
    };

    const getAMColor = (hasCoverage) => {
        return hasCoverage ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300';
    };

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
                {/* ClinVar Coverage */}
                <div
                    className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${
                        mergedCoverage.clinvar ? getClinVarColor(mergedCoverage.clinvar.status) : 'bg-gray-700 text-gray-400'
                    }`}
                    title={showHelpers ? "ClinVar classification and review status" : undefined}
                >
                    <span>{mergedCoverage.clinvar ? '✓' : '—'}</span>
                    <span>ClinVar</span>
                    {mergedCoverage.clinvar && (
                        <span className="ml-1 text-xs">
                            {mergedCoverage.clinvar.status || 'Unknown'}
                        </span>
                    )}
                </div>

                {/* AlphaMissense Coverage */}
                <div
                    className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${
                        getAMColor(mergedCoverage.alphamissense)
                    }`}
                    title={showHelpers ? "AlphaMissense missense variant coverage" : undefined}
                >
                    <span>{mergedCoverage.alphamissense ? '✓' : '—'}</span>
                    <span>AM</span>
                    {mergedCoverage.alphamissense && (
                        <span className="ml-1 text-xs">
                            {typeof mergedCoverage.alphamissense === 'number' 
                                ? mergedCoverage.alphamissense.toFixed(2) 
                                : 'Covered'
                            }
                        </span>
                    )}
                </div>
            </div>
            
            {showHelpers && (
                <div className="text-xs text-gray-500 mt-2">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                            Pathogenic
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                            Benign
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                            VUS
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                            AM Covered
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoverageChips;
