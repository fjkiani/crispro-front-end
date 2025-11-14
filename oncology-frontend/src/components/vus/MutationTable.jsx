import React from 'react';
import Loader from '../Loader';
import { MUTATION_TABS, ACTION_BUTTONS, MESSAGES, DEFAULT_CLASSES, EXTERNAL_URLS } from './constants.jsx';
import { useNavigate } from 'react-router-dom';

const MutationTable = ({ 
    mutations = [],
    activeMutation,
    activeMutationTab = 'All',
    mutationTabs = MUTATION_TABS,
    isLoading = false,
    error = null,
    patientId,
    onTabChange,
    onAnalyze,
    onWiwfm,
    onDesign,
    onTrialsClick,
    className = DEFAULT_CLASSES.container
}) => {
    const navigate = useNavigate();
    const filteredMutations = mutations; // Could add filtering logic here based on activeMutationTab

    const defaultActions = [
        {
            ...ACTION_BUTTONS.analyze,
            onClick: (mutation) => {
                const query = `Effect of ${mutation.hugo_gene_symbol} ${mutation.protein_change}`;
                onAnalyze(query, { gene: mutation.hugo_gene_symbol, variant: mutation.protein_change });
            }
        },
        {
            ...ACTION_BUTTONS.wiwfm,
            onClick: (mutation) => onWiwfm && onWiwfm({
                gene: mutation.hugo_gene_symbol,
                hgvs_p: mutation.protein_change,
                chrom: mutation.chrom,
                pos: mutation.pos,
                ref: mutation.ref,
                alt: mutation.alt,
            })
        },
        {
            ...ACTION_BUTTONS.dossier,
            onClick: (mutation) => {
                const dossierPrefill = {
                    gene: mutation.hugo_gene_symbol,
                    variant: mutation.protein_change,
                    hg38: mutation.genomic_coordinate_hg38,
                };
                navigate('/dossier', { state: { dossierPrefill } });
            }
        },
        {
            ...ACTION_BUTTONS.design,
            onClick: (mutation) => onDesign(mutation),
            className: (mutation) => `text-white py-1 px-2 rounded text-xs flex items-center ${
                mutation.genomic_coordinate_hg38 ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 cursor-not-allowed"
            }`,
            disabled: (mutation) => !mutation.genomic_coordinate_hg38,
            tooltip: (mutation) => ({
                title: ACTION_BUTTONS.design.tooltip.title,
                content: `Transfers: Gene (${mutation.hugo_gene_symbol}), Variant (${mutation.protein_change}), Coordinates (${mutation.genomic_coordinate_hg38 || 'N/A'}).`,
                warning: !mutation.genomic_coordinate_hg38 ? ACTION_BUTTONS.design.tooltip.warning : null
            })
        },
        {
            ...ACTION_BUTTONS.trials,
            onClick: (mutation) => {
                const searchTerms = [mutation.hugo_gene_symbol, patientId?.replace('PAT', '')].filter(Boolean).join('+');
                const clinicalTrialsURL = `${EXTERNAL_URLS.CLINICAL_TRIALS}?cond=${searchTerms}&recrs=a&type=Intr`;
                onTrialsClick(clinicalTrialsURL);
            }
        }
    ];

    const renderActionButton = (action, mutation, index) => {
        const isDisabled = action.disabled ? action.disabled(mutation) : false;
        const buttonClassName = typeof action.className === 'function' ? action.className(mutation) : action.className;
        
        return (
            <div key={index} className="relative group">
                <button
                    onClick={() => !isDisabled && action.onClick(mutation)}
                    disabled={isDisabled}
                    className={`${buttonClassName} ${isDisabled ? 'cursor-not-allowed' : ''}`}
                    title={action.title}
                >
                    {action.icon}
                    {action.label}
                </button>
                {action.tooltip && (
                    <div className="absolute z-20 w-64 px-3 py-2 text-xs bg-black text-gray-300 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bottom-full left-1/2 transform -translate-x-1/2 mb-2">
                        <p className="font-medium text-green-400 mb-1">{action.tooltip(mutation).title}</p>
                        <p>{action.tooltip(mutation).content}</p>
                        {action.tooltip(mutation).warning && (
                            <p className="text-yellow-400">{action.tooltip(mutation).warning}</p>
                        )}
                        <div className="absolute w-3 h-3 bg-black transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={className}>
            <h3 className="text-xl font-semibold mb-3 text-gray-200">
                Known Mutations for {patientId}
            </h3>
            <div className="mb-3 flex space-x-1 border-b border-gray-700">
                {mutationTabs.map(tab => (
                    <button 
                        key={tab}
                        onClick={() => onTabChange(tab)}
                        className={`py-2 px-3 text-sm font-medium rounded-t-md transition-colors
                            ${activeMutationTab === tab 
                                ? 'bg-purple-600 text-white border-purple-600'
                                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-750'}
                        `}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            {isLoading ? (
                <Loader />
            ) : filteredMutations.length > 0 ? (
                <div className="overflow-x-auto max-h-[40vh]">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-750 sticky top-0 z-10">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Gene</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Protein Change</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Coord (hg38)</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th> 
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {filteredMutations.map((mutation, index) => (
                                <tr 
                                    key={`mutation-${index}`} 
                                    className={`hover:bg-gray-750 ${
                                        activeMutation && 
                                        activeMutation.gene === mutation.hugo_gene_symbol && 
                                        activeMutation.variant === mutation.protein_change 
                                            ? 'bg-purple-900 border-l-4 border-purple-500' 
                                            : ''
                                    }`}
                                >
                                    <td className="px-3 py-2 text-sm">{mutation.hugo_gene_symbol}</td>
                                    <td className="px-3 py-2 text-sm">{mutation.protein_change}</td>
                                    <td className="px-3 py-2 text-sm">{mutation.variant_type}</td>
                                    <td className="px-3 py-2 text-sm">{mutation.genomic_coordinate_hg38 || "N/A"}</td>
                                    <td className="px-3 py-2">
                                        <div className="flex space-x-2">
                                            {defaultActions.map((action, actionIndex) => 
                                                renderActionButton(action, mutation, actionIndex)
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-400 py-3">
                    {isLoading ? MESSAGES.loading.mutations : 
                     (error && error.includes("not found")) ? error : 
                     (error ? MESSAGES.errors.loadFailed : 
                     MESSAGES.errors.noMutations(patientId))}
                </p>
            )}
        </div>
    );
};

export default MutationTable;
