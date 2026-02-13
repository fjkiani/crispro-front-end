import React from 'react';

/**
 * GeneToggle - Steerability Controls for Simulation
 * Mandated by 07_STRATEGIC_DELIVERABLES_PLAN.md (Deliverable 2)
 * 
 * Allows user to toggle specific genes (NF1, BRCA1, TP53) to ON/OFF (Mutated/WT)
 * state to see "What-If" effects on resistance.
 */
const GeneToggle = ({ genes, onToggle }) => {
    // genes: { "NF1": true, "BRCA1": false ... } where true = Mutated

    return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">Genetic Steerability (Simulation)</h4>
            <div className="space-y-3">
                {Object.entries(genes).map(([gene, isMutated]) => (
                    <div key={gene} className="flex justify-between items-center group">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-800">{gene}</span>
                            <span className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors">
                                {isMutated ? "Loss-of-Function Simulated" : "Wild-Type"}
                            </span>
                        </div>

                        <button
                            onClick={() => onToggle(gene, !isMutated)}
                            className={`
                                relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                                transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                                ${isMutated ? 'bg-blue-600' : 'bg-gray-200'}
                            `}
                        >
                            <span className="sr-only">Toggle {gene}</span>
                            <span
                                aria-hidden="true"
                                className={`
                                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
                                    transition duration-200 ease-in-out
                                    ${isMutated ? 'translate-x-5' : 'translate-x-0'}
                                `}
                            />
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-4 p-2 bg-blue-50 text-xs text-blue-700 rounded border border-blue-100">
                <span className="font-bold">Note:</span> Toggling genes recalculates the **Mechanism Vector** instantly via the Clinical Heuristic Engine.
            </div>
        </div>
    );
};

export default GeneToggle;
