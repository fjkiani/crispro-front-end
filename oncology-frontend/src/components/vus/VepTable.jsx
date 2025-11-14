import React from 'react';

const VepTable = ({ 
    vepDetails = [],
    activeMutation,
    className = "space-y-3"
}) => {
    if (!vepDetails || vepDetails.length === 0) {
        return null;
    }

    return (
        <div className={className}>
            <h3 className="text-xl font-semibold text-gray-200">Simulated VEP Details:</h3>
            <div className="overflow-x-auto rounded-md border border-gray-700">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-750">
                        <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">Gene</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">Variant</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">Classification</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">Consequence</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">Pred. Scores</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">Knowledge Bases</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">Evo2 Prediction</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">Delta Score</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">Evo2 Confidence</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">Reasoning</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {vepDetails.map((detail, index) => (
                            <tr 
                                key={index} 
                                className={`hover:bg-gray-750 ${
                                    activeMutation && 
                                    detail.gene_symbol === activeMutation.gene && 
                                    (detail.protein_change === activeMutation.variant || 
                                     detail.canonical_variant_id === activeMutation.variant ||
                                     detail.input_variant_query === activeMutation.variant ||
                                     detail.input_variant_query === `${activeMutation.gene} ${activeMutation.variant}`)
                                        ? 'bg-purple-900 border-l-4 border-purple-500' 
                                        : ''
                                }`}
                            >
                                <td className="px-3 py-2 text-sm">{detail.gene_symbol || 'N/A'}</td>
                                <td className="px-3 py-2 text-sm">
                                    {detail.canonical_variant_id || detail.protein_change || detail.input_variant_query} 
                                    {(detail.variant_type_from_input ? ` (${detail.variant_type_from_input})` : '')}
                                </td>
                                <td className="px-3 py-2 text-sm">{detail.simulated_classification}</td>
                                <td className="px-3 py-2 text-sm">{detail.predicted_consequence || 'N/A'}</td>
                                <td className="px-3 py-2 text-sm">
                                    {detail.simulated_tools ? (
                                        <>
                                            <div>SIFT: {detail.simulated_tools.sift || 'N/A'}</div>
                                            <div>PolyPhen: {detail.simulated_tools.polyphen || 'N/A'}</div>
                                        </>
                                    ) : 'N/A'}
                                </td>
                                <td className="px-3 py-2 text-sm">
                                    {detail.mock_knowledgebases ? (
                                        <>
                                            <div>ClinVar: {detail.mock_knowledgebases.clinvar_significance || 'N/A'}</div>
                                            <div>OncoKB: {detail.mock_knowledgebases.oncokb_level || 'N/A'}</div>
                                        </>
                                    ) : 'N/A'}
                                </td>
                                <td className={`px-3 py-2 text-sm font-medium ${
                                    detail.evo2_prediction?.toLowerCase().includes('pathogenic') || 
                                    detail.evo2_prediction?.toLowerCase().includes('activating') || 
                                    detail.evo2_prediction?.toLowerCase().includes('oncogenic') 
                                        ? 'text-red-400' :
                                    detail.evo2_prediction?.toLowerCase().includes('benign') || 
                                    detail.evo2_prediction?.toLowerCase().includes('neutral') 
                                        ? 'text-green-400' :
                                    detail.evo2_prediction?.toLowerCase().includes('uncertain') || 
                                    detail.evo2_prediction?.toLowerCase().includes('vus') 
                                        ? 'text-yellow-400' :
                                    'text-gray-300'
                                }`}>
                                    {detail.evo2_prediction || 'N/A'}
                                </td>
                                <td className="px-3 py-2 text-sm">
                                    {detail.delta_likelihood_score !== null && detail.delta_likelihood_score !== undefined 
                                        ? detail.delta_likelihood_score.toFixed(6) 
                                        : 'N/A'}
                                </td>
                                <td className="px-3 py-2 text-sm">
                                    {detail.evo2_confidence !== null && detail.evo2_confidence !== undefined 
                                        ? `${(detail.evo2_confidence * 100).toFixed(0)}%` 
                                        : 'N/A'}
                                </td>
                                <td className="px-3 py-2 text-sm max-w-xs whitespace-pre-wrap">
                                    {detail.classification_reasoning}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VepTable;