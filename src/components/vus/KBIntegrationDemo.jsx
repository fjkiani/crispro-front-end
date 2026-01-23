import React, { useState, useEffect } from 'react';
import kbClient from '../../lib/kbClient.js';
import InsightChips from './InsightChips.jsx';
import CoverageChips from './CoverageChips.jsx';

const KBIntegrationDemo = () => {
    const [geneSymbol, setGeneSymbol] = useState('TP53');
    const [variantInfo, setVariantInfo] = useState({ gene: 'BRAF', hgvsP: 'V600E' });
    const [kbData, setKbData] = useState({});
    const [loading, setLoading] = useState(false);

    // Mock insights data
    const mockInsights = {
        functionality: 0.85,
        chromatin: 0.72,
        essentiality: 0.91,
        regulatory: 0.68
    };

    // Mock coverage data
    const mockCoverage = {
        clinvar: {
            status: 'pathogenic (criteria provided)',
            source: 'API'
        },
        alphamissense: true
    };

    const loadKbData = async () => {
        setLoading(true);
        try {
            const data = {};
            
            // Load gene info
            if (geneSymbol) {
                data.gene = await kbClient.getGeneInfo(geneSymbol);
            }
            
            // Load variant info
            if (variantInfo.gene && variantInfo.hgvsP) {
                data.variant = await kbClient.getVariantInfo(variantInfo.gene, variantInfo.hgvsP);
            }
            
            // Load pathway info
            data.pathway = await kbClient.getPathwayInfo('MM_core');
            
            setKbData(data);
        } catch (error) {
            console.error('Failed to load KB data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadKbData();
    }, [geneSymbol, variantInfo]);

    return (
        <div className="p-6 bg-gray-900 text-white">
            <h2 className="text-2xl font-bold mb-6">Knowledge Base Integration Demo</h2>
            
            {/* Controls */}
            <div className="mb-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Gene Symbol:</label>
                    <input
                        type="text"
                        value={geneSymbol}
                        onChange={(e) => setGeneSymbol(e.target.value)}
                        className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                        placeholder="e.g., TP53, BRAF"
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Variant Gene:</label>
                        <input
                            type="text"
                            value={variantInfo.gene}
                            onChange={(e) => setVariantInfo(prev => ({ ...prev, gene: e.target.value }))}
                            className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">HGVS Protein:</label>
                        <input
                            type="text"
                            value={variantInfo.hgvsP}
                            onChange={(e) => setVariantInfo(prev => ({ ...prev, hgvsP: e.target.value }))}
                            className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white w-full"
                        />
                    </div>
                </div>
                
                <button
                    onClick={loadKbData}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-white"
                >
                    {loading ? 'Loading...' : 'Reload KB Data'}
                </button>
            </div>

            {/* KB Data Display */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gene Info */}
                <div className="bg-gray-800 p-4 rounded">
                    <h3 className="text-lg font-semibold mb-3">Gene Information</h3>
                    {kbData.gene ? (
                        <div className="space-y-2">
                            <p><strong>Symbol:</strong> {kbData.gene.symbol}</p>
                            <p><strong>Name:</strong> {kbData.gene.name}</p>
                            <p><strong>Function:</strong> {kbData.gene.function}</p>
                            <p><strong>Helper Copy:</strong> {kbData.gene.helperCopy}</p>
                        </div>
                    ) : (
                        <p className="text-gray-400">No gene data loaded</p>
                    )}
                </div>

                {/* Variant Info */}
                <div className="bg-gray-800 p-4 rounded">
                    <h3 className="text-lg font-semibold mb-3">Variant Information</h3>
                    {kbData.variant ? (
                        <div className="space-y-2">
                            <p><strong>Gene:</strong> {kbData.variant.gene}</p>
                            <p><strong>HGVS Protein:</strong> {kbData.variant.hgvsP}</p>
                            <p><strong>Mechanism:</strong> {kbData.variant.mechanism}</p>
                            <p><strong>Helper Copy:</strong> {kbData.variant.helperCopy}</p>
                            <p><strong>AM Covered:</strong> {kbData.variant.amCovered ? 'Yes' : 'No'}</p>
                            <p><strong>ClinVar Prior:</strong> {kbData.variant.clinvarPrior}</p>
                        </div>
                    ) : (
                        <p className="text-gray-400">No variant data loaded</p>
                    )}
                </div>

                {/* Pathway Info */}
                <div className="bg-gray-800 p-4 rounded">
                    <h3 className="text-lg font-semibold mb-3">Pathway Information</h3>
                    {kbData.pathway ? (
                        <div className="space-y-2">
                            <p><strong>Name:</strong> {kbData.pathway.name}</p>
                            <p><strong>Description:</strong> {kbData.pathway.description}</p>
                            <p><strong>Genes:</strong> {kbData.pathway.genes.join(', ')}</p>
                            <p><strong>Helper Copy:</strong> {kbData.pathway.helperCopy}</p>
                        </div>
                    ) : (
                        <p className="text-gray-400">No pathway data loaded</p>
                    )}
                </div>

                {/* Component Integration */}
                <div className="bg-gray-800 p-4 rounded">
                    <h3 className="text-lg font-semibold mb-3">Component Integration</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium mb-2">Insight Chips (with KB helpers):</h4>
                            <InsightChips 
                                insights={mockInsights}
                                geneSymbol={geneSymbol}
                                variantInfo={variantInfo}
                                showHelpers={true}
                            />
                        </div>
                        
                        <div>
                            <h4 className="font-medium mb-2">Coverage Chips (with KB data):</h4>
                            <CoverageChips 
                                coverage={mockCoverage}
                                geneSymbol={geneSymbol}
                                variantInfo={variantInfo}
                                showHelpers={true}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Cache Stats */}
            <div className="mt-6 bg-gray-800 p-4 rounded">
                <h3 className="text-lg font-semibold mb-3">Cache Statistics</h3>
                <div className="text-sm">
                    <p><strong>Cache Size:</strong> {kbClient.getCacheStats().size} items</p>
                    <p><strong>Cached Keys:</strong> {kbClient.getCacheStats().keys.join(', ')}</p>
                </div>
            </div>
        </div>
    );
};

export default KBIntegrationDemo;



