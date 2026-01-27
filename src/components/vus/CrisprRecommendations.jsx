import React from 'react';
import { CONFIDENCE_COLORS, PREDICTION_COLORS, MESSAGES, DEFAULT_CLASSES, EXTERNAL_URLS } from './constants.jsx';

const CrisprRecommendations = ({ 
    activeMutation,
    analysisResult,
    onDesign,
    onGoToAnalysis,
    className = "p-4 bg-gray-800 rounded-lg shadow-xl border border-gray-700 space-y-4"
}) => {
    const getConfidenceColor = (score) => {
        if (score >= 0.8) return CONFIDENCE_COLORS.high;
        if (score >= 0.6) return CONFIDENCE_COLORS.medium;
        return CONFIDENCE_COLORS.low;
    };

    const getClassificationColor = (classification) => {
        if (!classification) return PREDICTION_COLORS.default;
        const lowerClass = classification.toLowerCase();
        if (lowerClass.includes('pathogenic')) return PREDICTION_COLORS.pathogenic;
        if (lowerClass.includes('benign')) return PREDICTION_COLORS.benign;
        return PREDICTION_COLORS.default;
    };

    // Find VEP details for active mutation
    const activeMutationVEP = activeMutation && analysisResult?.simulated_vep_details 
        ? analysisResult.simulated_vep_details.find(
            detail => detail.gene_symbol === activeMutation.hugo_gene_symbol && 
                      (detail.protein_change === activeMutation.protein_change || 
                       detail.canonical_variant_id === activeMutation.protein_change || 
                       detail.input_variant_query === activeMutation.protein_change ||
                       detail.input_variant_query === `${activeMutation.hugo_gene_symbol} ${activeMutation.protein_change}`)
        )
        : null;

    // Find specific CRISPR recommendation for active mutation
    const specificCrisprRecForActiveMutation = activeMutation && analysisResult?.crispr_recommendations
        ? analysisResult.crispr_recommendations.find(
            rec => rec.target_gene === activeMutation.hugo_gene_symbol && 
                   ((rec.target_variant && rec.target_variant.startsWith(activeMutation.protein_change)) || 
                    !rec.target_variant)
        )
        : null;

    const hasGeneralCrisprRecommendations = analysisResult?.crispr_recommendations?.length > 0;

    const renderCrisprRecommendationCard = (rec, index) => (
        <div key={index} className="p-3 rounded-md border border-gray-700 bg-gray-750 hover:border-green-600 transition-colors">
            <strong className="text-green-400 block mb-1">
                Target: {rec.target_gene} ({rec.target_variant || 'N/A'})
            </strong>
            <span className="text-xs text-gray-400 block mb-0.5">
                Approach: {rec.recommended_approach || 'N/A'}
            </span>
            <p className="text-sm text-gray-300 mb-1">
                Rationale: {rec.rationale || 'N/A'}
            </p>
            <p className="text-xs text-gray-400">
                Confidence: 
                <span className={`font-medium ml-1 ${getConfidenceColor(rec.confidence_score)}`}>
                    {rec.confidence_score !== null && rec.confidence_score !== undefined 
                        ? `${(rec.confidence_score * 100).toFixed(0)}%` 
                        : 'N/A'}
                </span>
            </p>
            {rec.source && (
                <p className="text-xs text-gray-500 mt-1 italic">Source: {rec.source}</p>
            )}
        </div>
    );

    // Demo readiness chips (placeholders, gracefully use insights if present)
    const insights = analysisResult?.insights || {};
    const accessScore = typeof insights.chromatin === 'number' ? insights.chromatin : null;
    const onTargetLabel = accessScore === null ? 'Demo' : accessScore >= 0.6 ? 'Likely targetable' : 'Needs review';
    const onTargetTone = accessScore === null ? 'bg-gray-800 text-gray-300 border-gray-600' : (accessScore >= 0.6 ? 'bg-green-900/40 text-green-300 border-green-700' : 'bg-yellow-900/40 text-yellow-300 border-yellow-700');
    const offTargetPreview = 'Preview'; // placeholder label
    const deliveryNote = 'AAV/LNP (discuss)'; // placeholder label

    return (
        <div className={className}>
            {activeMutation && (
                <div className="p-3 mb-4 bg-gray-700 rounded-lg shadow-md border border-gray-600">
                    <h4 className="text-md font-semibold text-purple-300">
                        CRISPR Target Focus: <span className="text-white">{activeMutation.hugo_gene_symbol} - {activeMutation.protein_change}</span>
                    </h4>
                </div>
            )}

            {/* Readiness (Demo) */}
            <div className="space-y-1">
                <div className="text-xs text-gray-400">CRISPR readiness (Demo)</div>
                <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md border text-xs ${onTargetTone}`} title="On‑target feasibility">
                        <span className="font-semibold mr-1">On‑target:</span>{onTargetLabel}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-md border text-xs ${onTargetTone}`} title="Access to target (chromatin)">
                        <span className="font-semibold mr-1">Access:</span>{accessScore === null ? 'N/A' : `${Math.round(accessScore * 100)}%`}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-md border text-xs bg-gray-800 text-gray-300 border-gray-600" title="Potential off‑targets (preview)">
                        <span className="font-semibold mr-1">Off‑targets:</span>{offTargetPreview}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-md border text-xs bg-gray-800 text-gray-300 border-gray-600" title="Delivery notes (demo)">
                        <span className="font-semibold mr-1">Delivery:</span>{deliveryNote}
                    </span>
                </div>
            </div>

            <h2 className="text-2xl font-semibold text-green-300 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zM9 11a1 1 0 11-2 0 1 1 0 012 0zm2-2a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                </svg>
                CRISPR Therapeutic Recommendations (Conceptual)
            </h2>
            <p className="text-md text-gray-400 mb-4">
                Based on the Evo2 variant analysis, the following CRISPR therapeutic approaches could be considered:
            </p>

            {activeMutation && activeMutationVEP ? (
                // Case 1: Active mutation focus with VEP details found
                <div className="p-3 bg-gray-750 rounded-md border border-gray-600 space-y-3">
                    <div>
                        <h5 className="text-lg font-semibold text-gray-100">
                            {activeMutation.hugo_gene_symbol} {activeMutation.protein_change}
                        </h5>
                        <p className="text-sm text-gray-300">
                            Classification: <span className={`font-medium ${getClassificationColor(activeMutationVEP.simulated_classification)}`}>
                                {activeMutationVEP.simulated_classification || 'N/A (VEP classification not found for focus)'}
                            </span>
                        </p>
                    </div>
                    <div className="pt-1">
                        <h6 className="text-sm font-semibold text-gray-200 mb-1">Recommended Approach:</h6>
                        {specificCrisprRecForActiveMutation ? (
                            <div className="text-sm text-gray-300 space-y-2">
                                {specificCrisprRecForActiveMutation.editing_type && (
                                    <p><span className="font-semibold text-gray-100">Editing Type:</span> {specificCrisprRecForActiveMutation.editing_type}</p>
                                )}
                                {specificCrisprRecForActiveMutation.recommended_approach && (
                                    <p><span className="font-semibold text-gray-100">Approach Details:</span> {specificCrisprRecForActiveMutation.recommended_approach}</p>
                                )}
                                {specificCrisprRecForActiveMutation.rationale && (
                                    <p><span className="font-semibold text-gray-100">Rationale:</span> {specificCrisprRecForActiveMutation.rationale}</p>
                                )}
                                {specificCrisprRecForActiveMutation.potential_tools && specificCrisprRecForActiveMutation.potential_tools.length > 0 && (
                                    <div>
                                        <span className="font-semibold text-gray-100">Potential Tools:</span>
                                        <ul className="list-disc list-inside ml-4 text-gray-400">
                                            {specificCrisprRecForActiveMutation.potential_tools.map((tool, index) => (
                                                <li key={index}>{tool}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {specificCrisprRecForActiveMutation.confidence_score !== null && specificCrisprRecForActiveMutation.confidence_score !== undefined && (
                                    <p>
                                        <span className="font-semibold text-gray-100">Confidence:</span> 
                                        <span className={`font-medium ml-1 ${getConfidenceColor(specificCrisprRecForActiveMutation.confidence_score)}`}>
                                            {(specificCrisprRecForActiveMutation.confidence_score * 100).toFixed(0)}%
                                        </span>
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic">
                                No specific CRISPR recommendation directly available for {activeMutation.hugo_gene_symbol} {activeMutation.protein_change} in the current analysis. General strategies may apply.
                            </p>
                        )}
                    </div>
                    {activeMutation.genomic_coordinate_hg38 ? (
                        <button
                            onClick={() => onDesign(activeMutation)}
                            className="mt-3 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm flex items-center"
                            title="Design CRISPR Guides (Opens External Tool)"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                            Design CRISPR Guides
                        </button>
                    ) : (
                        <p className="text-xs text-yellow-500 mt-2">
                            {MESSAGES.errors.noCoordinates}
                        </p>
                    )}
                    {/* If no specific rec for active mutation, but general ones exist, show them below the focused section */}
                    {!specificCrisprRecForActiveMutation && hasGeneralCrisprRecommendations && (
                        <div className="mt-4 pt-4 border-t border-gray-700">
                            <h6 className="text-sm font-semibold text-gray-300 mb-2">General CRISPR Recommendations from Analysis:</h6>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {analysisResult.crispr_recommendations.map((rec, index) => renderCrisprRecommendationCard(rec, index))}
                            </div>
                        </div>
                    )}
                </div>
            ) : hasGeneralCrisprRecommendations ? (
                // Case 2: No active mutation focus OR VEP details for focus not found, BUT general CRISPR recommendations exist
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analysisResult.crispr_recommendations.map((rec, index) => renderCrisprRecommendationCard(rec, index))}
                </div>
            ) : (
                <div className="text-center py-6">
                    <p className="text-gray-400">CRISPR recommendations require a completed genomic analysis with relevant findings.</p>
                    <p className="text-sm text-gray-500 mt-2">Please run an analysis first. If analysis is done, ensure it produced CRISPR-related suggestions.</p>
                    <button 
                        onClick={onGoToAnalysis}
                        className="mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded"
                    >
                        Go to Analysis View
                    </button>
                </div>
            )}
            <p className="text-xs text-gray-500 italic mt-2">
                {MESSAGES.disclaimers.clinicalDecisions}
            </p>
        </div>
    );
};

export default CrisprRecommendations;
