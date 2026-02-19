import React from 'react';
import WIWFMButton from '../WIWFMButton';

const TherapyImplicationsPanel = ({
    activeMutation,
    effData,
    effProv,
    effBusy,
    onRunEfficacy,
    effOpen
}) => {

    // We assume the parent handles the modal state for now, or we can move the button here.
    // The architecture says this panel is the "WIWFM CTA" container.

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Therapy Implications
            </h2>
            <p className="text-gray-600 mb-6 text-sm">
                Analyze how this variant interacts with known treatment options.
            </p>

            <div className="flex items-center gap-4">
                <div className="flex-grow">
                    {/* The WIWFMButton component itself is styled as a button. 
                        We might want to wrap it or restyle it for Light Theme if the original is too dark. 
                        Ideally, pass a className or variant to it. Assuming standard usage first. */}
                    <WIWFMButton
                        onClick={onRunEfficacy}
                        disabled={effBusy}
                        className="w-full justify-center py-4 text-lg bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all text-white font-semibold rounded-lg flex items-center gap-2"
                        label={effBusy ? "Analyzing Treatment Options..." : "Check Therapeutic Impact"}
                    />
                </div>
            </div>

            {/* Hint / Disclaimer */}
            <p className="text-xs text-center text-gray-400 mt-3">
                Generates a ranked hypothesis of actionable vs. gated therapies. Research use only.
            </p>
        </div>
    );
};

export default TherapyImplicationsPanel;
