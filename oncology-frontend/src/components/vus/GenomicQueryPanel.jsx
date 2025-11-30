import React from 'react';
import Loader from '../Loader';
import { SUGGESTED_QUERY_TEMPLATES, CATEGORY_COLORS, MESSAGES, DEFAULT_CLASSES, DEFAULT_PLACEHOLDER_GENE, DEFAULT_PLACEHOLDER_VARIANT } from './constants.jsx';

const GenomicQueryPanel = ({ 
    value = '',
    onChange,
    onRun,
    onApplyTemplate,
    isLoading = false,
    isDisabled = false,
    patientMutations = [],
    suggestedTemplates = SUGGESTED_QUERY_TEMPLATES,
    placeholder = MESSAGES.placeholders.query,
    className = DEFAULT_CLASSES.container
}) => {
    const getRandomMutation = (mutations) => {
        if (!mutations || mutations.length === 0) return null;
        return mutations[Math.floor(Math.random() * mutations.length)];
    };

    const fillQueryTemplate = (template, gene = null, variant = null) => {
        let filledQuery = template;
        if (gene) filledQuery = filledQuery.replace('{gene}', gene);
        if (variant) filledQuery = filledQuery.replace('{variant}', variant);
        return filledQuery;
    };

    const applySuggestedQuery = (template) => {
        let query = "";
        let mutationForFocus = null;
        
        if (patientMutations.length > 0) {
            const randomMutation = getRandomMutation(patientMutations);
            if (randomMutation) {
                const gene = randomMutation.hugo_gene_symbol;
                const variant = randomMutation.protein_change;
                mutationForFocus = { gene, variant };
                
                if (template.requiresGene && template.requiresVariant && gene && variant) {
                    query = fillQueryTemplate(template.value, gene, variant);
                } else if (template.requiresGene && gene) {
                    query = fillQueryTemplate(template.value, gene);
                } else {
                    query = fillQueryTemplate(template.value, DEFAULT_PLACEHOLDER_GENE, DEFAULT_PLACEHOLDER_VARIANT);
                    mutationForFocus = { gene: DEFAULT_PLACEHOLDER_GENE, variant: DEFAULT_PLACEHOLDER_VARIANT }; 
                }
            }
        }
        
        if (!query) {
            const placeholderGene = DEFAULT_PLACEHOLDER_GENE;
            const placeholderVariant = template.requiresVariant ? DEFAULT_PLACEHOLDER_VARIANT : "";
            mutationForFocus = { gene: placeholderGene, variant: placeholderVariant }; 
            query = fillQueryTemplate(template.value, placeholderGene, placeholderVariant);
        }
        
        onChange(query);
        onApplyTemplate(query, mutationForFocus);
    };

    const getCategoryColor = (category) => {
        return CATEGORY_COLORS[category] || 'gray';
    };

    const hg38Helper = (
        <div className="mt-2 p-2 bg-gray-700 rounded border border-gray-600 text-xs text-gray-300">
            Tip: Use GRCh38 coordinates like <span className="font-mono">chr7:140453136:T:A</span> (chrom, pos, ref, alt).
        </div>
    );

    return (
        <div className={className}>
            <label htmlFor="genomic-query" className="block text-lg font-semibold text-gray-200 mb-2">
                Genomic Query
            </label>
            <div className="mb-4 p-3 bg-gray-700 rounded-md border border-gray-600">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Suggested Queries:</h4>
                <div className="space-y-1.5">
                    {Object.entries(suggestedTemplates).map(([category, templates]) => (
                        <div key={category}>
                            <span className={`text-xs text-${getCategoryColor(category)}-400 block mb-0.5`}>
                                {category.charAt(0).toUpperCase() + category.slice(1)} Queries:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                                {templates.map((template, idx) => (
                                    <button 
                                        key={`${category}-${idx}`}
                                        onClick={() => applySuggestedQuery(template)}
                                        className={`bg-${getCategoryColor(category)}-900 hover:bg-${getCategoryColor(category)}-800 text-xs text-gray-200 py-1 px-2 rounded transition-colors`}
                                    >
                                        {template.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <p className="mt-2 text-xs text-gray-400 italic">
                    Templates use patient data when available.
                </p>
            </div>
            <textarea 
                id="genomic-query"
                rows="3"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={DEFAULT_CLASSES.input}
            />
            {hg38Helper}
            <button 
                onClick={onRun} 
                disabled={isLoading || !value.trim() || isDisabled}
                className="mt-3 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
                {isLoading ? (
                    <>
                        <Loader size="small" color="white" />
                        <span className="ml-2">{MESSAGES.loading.analysis}</span>
                    </>
                ) : "Analyze Genomic Query"}
            </button>
        </div>
    );
};

export default GenomicQueryPanel;
