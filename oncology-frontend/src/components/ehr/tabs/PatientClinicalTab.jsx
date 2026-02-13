import React, { useState } from 'react';
import {
    IconClipboardList, IconLayoutKanban, IconNotes, IconTestPipe, IconWashMachine
} from "@tabler/icons-react";
import ConsultationPanel from '../../collaboration/ConsultationPanel';
import { formatDate } from '../RenderIncludedInfo';

const PatientClinicalTab = ({
    patientId,
    currentUser,
    demographics,
    diagnosis,
    initialPatientData,
    medicalHistory,
    currentMedications,
    allergies,
    suggestionChips,
    highlightSections,
    isMainWsConnected,
    mainWsReadyState,
    promptText,
    setPromptText,
    handlePromptFormSubmit,
    isProcessingPrompt,
    promptResult,
    activeActionTab,
    setActiveActionTab,
    handlePlaceholderAction,
    submitPromptViaWebSocket,
    handleQuickSummaryClick,
    activeAgentMessage,
    mainWsError,
    promptError,
    showDeepDiveButton,
    setShowDeepDiveButton,
    isConsultPanelOpen,
    currentConsultation,
    handleCloseConsultation,
    isCoPilotActionsVisible,
    setIsCoPilotActionsVisible,
    contextMainWsUrl,
    handleSaveTrial, // Add handleSaveTrial
    handleInitiateConsultation, // Add handleInitiateConsultation for deep dive buttons
}) => {
    const [expandedSections, setExpandedSections] = useState({});

    return (
        <>
            {/* --- CoPilot Prompt Panel (Input Area Only) --- */}
            <section className="p-4 bg-white rounded shadow sticky top-5 z-10 border-b border-gray-200">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-semibold text-indigo-700">CoPilot Actions</h3>
                    <button
                        onClick={() => setIsCoPilotActionsVisible(!isCoPilotActionsVisible)}
                        className="px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200 transition-colors"
                    >
                        {isCoPilotActionsVisible ? 'Hide' : 'Show'}
                    </button>
                </div>
                {/* Display MAIN WebSocket Connection Status */}
                {isCoPilotActionsVisible && (
                    <>
                        <div className="text-xs mb-2 text-right">
                            Connection Status:
                            {contextMainWsUrl ? (
                                <span className={`font-semibold ${isMainWsConnected ? 'text-green-600' : (mainWsReadyState === 0 ? 'text-yellow-600' : 'text-red-600')}`}>
                                    {isMainWsConnected ? 'Connected' : (mainWsReadyState === 0 ? 'Connecting...' : (mainWsReadyState === 2 ? 'Closing...' : 'Disconnected'))}
                                </span>
                            ) : (
                                <span className="text-gray-500 font-semibold">Inactive (No Patient ID)</span>
                            )}
                        </div>
                        <form onSubmit={handlePromptFormSubmit} className="space-y-3">
                            <textarea
                                value={promptText}
                                onChange={(e) => setPromptText(e.target.value)}
                                placeholder={`Ask about ${demographics.name || 'this patient'} (e.g., "Summarize latest notes", "What was the last WBC?", "Notify PCP about elevated glucose")`}
                                className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                rows={3}
                                disabled={isProcessingPrompt || !isMainWsConnected}
                            />
                            {/* --- Quick Action Buttons/Tags --- */}
                            <div className="flex flex-wrap gap-2 text-xs mb-2">
                                <span className="font-medium text-gray-600 mr-1">Quick Actions:</span>
                                <button type="button" onClick={() => setPromptText('Summarize the patient record')} className="py-0.5 px-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors">Summarize</button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const recentLabName = initialPatientData?.labs?.[0]?.test;
                                        const recentImageName = initialPatientData?.imagingStudies?.[0]?.type;
                                        const testExample = recentLabName || recentImageName || '[Test/Finding]';
                                        setPromptText(`What was the result of the ${testExample}?`);
                                    }}
                                    className="py-0.5 px-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                                >Ask Question</button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const condition = diagnosis?.primary || '[Condition/Finding]';
                                        setPromptText(`Notify [Recipient Role e.g., PCP] about ${condition}`);
                                    }}
                                    className="py-0.5 px-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                                >Draft Notification</button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const reason = diagnosis?.primary ? `follow-up for ${diagnosis.primary}` : 'follow-up';
                                        setPromptText(`Schedule ${reason} for [Timeframe e.g., next week]`);
                                    }}
                                    className="py-0.5 px-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                                >Schedule</button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const condition = diagnosis?.primary || '[Condition]';
                                        setPromptText(`Find clinical trials for ${condition}`);
                                    }}
                                    className="py-0.5 px-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                                >Find Trials</button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const reason = diagnosis?.primary ? `evaluation for ${diagnosis.primary}` : 'evaluation';
                                        setPromptText(`Draft referral to [Specialty] for ${reason}`);
                                    }}
                                    className="py-0.5 px-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                                >Draft Referral</button>
                            </div>

                            {/* --- Suggested Action Tabs --- */}
                            <div className="flex flex-wrap gap-2 text-xs border-t pt-2 mb-2">
                                <span className="font-medium text-gray-600 mr-1 self-center">Suggested Actions:</span>
                                <button
                                    type="button"
                                    onClick={() => setActiveActionTab('admin')}
                                    className={`py-0.5 px-2 rounded transition-colors ${activeActionTab === 'admin' ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                >
                                    Admin/Coordinator
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveActionTab('clinical')}
                                    className={`py-0.5 px-2 rounded transition-colors ${activeActionTab === 'clinical' ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                >
                                    Clinical/Nursing
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveActionTab('research')}
                                    className={`py-0.5 px-2 rounded transition-colors ${activeActionTab === 'research' ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                >
                                    Research
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveActionTab('pharmacy')}
                                    className={`py-0.5 px-2 rounded transition-colors ${activeActionTab === 'pharmacy' ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                >
                                    Pharmacy
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveActionTab(null)} // Button to close tabs
                                    title="Hide Actions"
                                    className={`py-0.5 px-2 rounded transition-colors text-red-600 hover:bg-red-100 ${!activeActionTab ? 'invisible' : ''}`}
                                >
                                    ✕
                                </button>
                            </div>

                            {/* --- Action Button Display Area --- */}
                            {activeActionTab && (
                                <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200 min-h-[50px]">
                                    {activeActionTab === 'admin' && (
                                        <div className="flex flex-wrap gap-1.5">
                                            <button type="button" onClick={(e) => handlePlaceholderAction('Schedule Follow-up', e)} className="px-2 py-1 rounded text-xs text-white bg-blue-500 hover:bg-blue-600">Schedule Follow-up</button>
                                            <button type="button" onClick={(e) => handlePlaceholderAction('Draft Referral', e)} className="px-2 py-1 rounded text-xs text-white bg-blue-500 hover:bg-blue-600">Draft Referral</button>
                                        </div>
                                    )}
                                    {activeActionTab === 'clinical' && (
                                        <div className="flex flex-wrap gap-1.5">
                                            <button type="button" onClick={(e) => handlePlaceholderAction('Notify PCP', e)} className="px-2 py-1 rounded text-xs text-white bg-green-500 hover:bg-green-600">Notify PCP</button>
                                            <button type="button" onClick={(e) => handlePlaceholderAction('Draft Lab Order', e)} className="px-2 py-1 rounded text-xs text-white bg-green-500 hover:bg-green-600">Draft Lab Order</button>
                                            <button type="button" onClick={(e) => handlePlaceholderAction('Flag for Review', e)} className="px-2 py-1 rounded text-xs text-white bg-green-500 hover:bg-green-600">Flag for Review</button>
                                        </div>
                                    )}
                                    {activeActionTab === 'research' && (
                                        <div className="flex flex-wrap gap-1.5">
                                            <button type="button" onClick={(e) => handlePlaceholderAction('Check Trial Eligibility', e)} className="px-2 py-1 rounded text-xs text-white bg-purple-500 hover:bg-purple-600">Check Trial Eligibility</button>
                                        </div>
                                    )}
                                    {activeActionTab === 'pharmacy' && (
                                        <div className="flex flex-wrap gap-1.5">
                                            <button type="button" onClick={(e) => handlePlaceholderAction('Review Side Effects', e)} className="px-2 py-1 rounded text-xs text-white bg-yellow-500 hover:bg-yellow-600">Review Side Effects</button>
                                            <button type="button" onClick={(e) => handlePlaceholderAction('Check Interactions', e)} className="px-2 py-1 rounded text-xs text-white bg-yellow-500 hover:bg-yellow-600">Check Interactions</button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* --- Submit Buttons Row --- */}
                            <div className="flex items-center space-x-2">
                                <button
                                    type="submit"
                                    disabled={isProcessingPrompt || !promptText.trim() || !isMainWsConnected}
                                    className={`flex-grow px-4 py-2 rounded-md text-white font-semibold transition-colors duration-200 ${isProcessingPrompt || !promptText.trim() || !isMainWsConnected ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                                >
                                    {isProcessingPrompt ? 'Processing...' : 'Submit Prompt'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => submitPromptViaWebSocket("analyze_genomic_profile", { messageType: "agent_command", commandDetails: {} })}
                                    disabled={isProcessingPrompt || !isMainWsConnected}
                                    className={`px-4 py-2 rounded-md text-white font-semibold transition-colors duration-200 ${isProcessingPrompt || !isMainWsConnected ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                                >
                                    {isProcessingPrompt ? 'Processing...' : 'Analyze Genomic Profile'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleQuickSummaryClick}
                                    disabled={isProcessingPrompt || !isMainWsConnected}
                                    className={`px-4 py-2 rounded-md text-white font-semibold transition-colors duration-200 ${isProcessingPrompt || !isMainWsConnected ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                                >
                                    {isProcessingPrompt ? 'Processing...' : 'Quick Summary'}
                                </button>
                            </div>
                        </form>
                        {/* --- Display Active Agent Message --- */}
                        {activeAgentMessage && (
                            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 text-blue-700 rounded text-xs italic">
                                <p>{activeAgentMessage}</p>
                            </div>
                        )}
                        {/* --- Display Prompt Results/Errors --- */}
                        {mainWsError && !promptError && (
                            <div className="mt-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                                <p><strong>Connection Error:</strong> {promptError || mainWsError.message}</p>
                            </div>
                        )}
                        {promptError && (
                            <div className="mt-2 p-2 bg-red-100 border border-red-300 text-red-700 rounded text-xs">
                                <p><strong>Error:</strong> {promptError}</p>
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* --- CoPilot Output Panel (Results Area) --- */}
            {promptResult && (
                <section className="mt-4 mb-6 p-4 bg-white rounded shadow border border-blue-200">
                    <h3 className="text-xl font-semibold mb-3 border-b pb-2 text-blue-700">CoPilot Output</h3>
                    <div className="text-sm space-y-3">
                        <p className="font-semibold mb-1">CoPilot Response (Status: <span className={`font-bold ${promptResult.status === 'success' ? 'text-green-700' : 'text-orange-700'}`}>{promptResult.status}</span>)</p>

                        {/* Summary Output */}
                        {promptResult.output?.output?.summary_text && (
                            <div className="mt-1 border-t pt-2">
                                <h4 className="font-medium text-gray-700">[Clinician/User] Generated Summary:</h4>
                                <p className="text-sm text-gray-800 whitespace-pre-wrap">{promptResult.output.output.summary_text}</p>
                                {showDeepDiveButton && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            submitPromptViaWebSocket("Perform a deep dive summarization of the patient record", { source: 'deep_dive_button', messageType: "prompt" });
                                            setShowDeepDiveButton(false);
                                        }}
                                        disabled={isProcessingPrompt || !isMainWsConnected}
                                        className={`mt-3 px-3 py-1.5 rounded-md text-white text-xs font-semibold transition-colors duration-200 ${isProcessingPrompt || !isMainWsConnected ? 'bg-gray-300 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'}`}
                                    >
                                        {isProcessingPrompt ? 'Processing...' : 'Get Deeper Insights'}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Deep Dive Sections */}
                        {promptResult.output?.output?.deep_dive_sections && (
                            <div className="mt-6 p-4 border border-blue-200 rounded-lg bg-blue-50/50">
                                <h3 className="text-xl font-semibold text-blue-700 mb-4">Holistic Analysis & Deeper Insights:</h3>
                                {promptResult.output.output.deep_dive_sections.map((section, index) => {
                                    let sectionTitle = section.topic;
                                    if (section.source && section.source.includes("_LLM")) {
                                        sectionTitle = section.topic;
                                    } else if (section.source) {
                                        const agentName = section.source.replace("Conceptual", "").replace("Agent", " Agent");
                                        sectionTitle = `Insight from ${agentName}: ${section.topic}`;
                                    }

                                    return (
                                        <div key={index} className="mb-4 p-3 border border-gray-300 rounded-md bg-white shadow-sm">
                                            <h4 className="text-md font-semibold text-gray-700 mb-2">{sectionTitle}</h4>
                                            {section.elaboration && (
                                                <div className="text-sm text-gray-600">
                                                    <p className="whitespace-pre-wrap">{
                                                        expandedSections[index] ? section.elaboration : (section.elaboration.substring(0, 150) + (section.elaboration.length > 150 ? "..." : ""))
                                                    }</p>
                                                    {section.elaboration.length > 150 && (
                                                        <button
                                                            onClick={() => setExpandedSections(prev => ({ ...prev, [index]: !prev[index] }))}
                                                            className="text-blue-600 hover:text-blue-800 text-xs mt-1"
                                                        >
                                                            {expandedSections[index] ? "Read Less" : "Read More"}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                            {/* Evidence Snippets */}
                                            {section.evidence_snippets && section.evidence_snippets.length > 0 && expandedSections[index] && (
                                                <div className="mt-3 pt-2 border-t border-gray-200">
                                                    <h5 className="text-xs font-semibold text-gray-500 mb-1">Supporting Evidence:</h5>
                                                    <ul className="space-y-2">
                                                        {section.evidence_snippets.map((evidence, evidence_idx) => (
                                                            <li key={evidence_idx} className="text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-200">
                                                                <div className="font-medium text-gray-700 mb-0.5">
                                                                    Source Type: {evidence.metadata?.source_type || evidence.source_type || (evidence.source ? evidence.source.split('(')[0].trim() : 'Unknown Type')}
                                                                    {(evidence.metadata?.document_date || evidence.document_date) && ` - Date: ${formatDate(evidence.metadata?.document_date || evidence.document_date)}`}
                                                                </div>
                                                                <div className="text-gray-600">
                                                                    <span className="italic">Author/Actor:</span> {evidence.metadata?.actor || evidence.metadata?.author || evidence.metadata?.recorded_by || (evidence.source && evidence.source.includes('(') ? evidence.source.split('(')[1].replace(')', '').replace('by ', '').trim() : 'Unknown')}
                                                                </div>
                                                                <p className="mt-1 text-gray-700 whitespace-pre-wrap bg-white p-1 border border-gray-100 rounded-sm">
                                                                    "{typeof evidence === 'string' ? evidence : (evidence.page_content || evidence.snippet || 'No content')}"
                                                                </p>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {/* Consult Button */}
                                            {expandedSections[index] && (
                                                <div className="mt-3 text-right">
                                                    <button
                                                        onClick={() => {
                                                            handleInitiateConsultation(
                                                                { id: 'dr_b', name: 'Dr. Baker (PCP)' },
                                                                `Consult on: ${section.topic}`,
                                                                section.elaboration,
                                                                section.elaboration
                                                            );
                                                        }}
                                                        disabled={!patientId || !isMainWsConnected}
                                                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors duration-200 ${!patientId || !isMainWsConnected ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-purple-100 text-purple-700 hover:bg-purple-200 hover:shadow-md'}`}
                                                        title={patientId && isMainWsConnected ? "Consult a colleague about this specific insight" : "Cannot consult (missing patient data or disconnected)"}
                                                    >
                                                        Consult Colleague on this Insight
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Genomic Analysis Output */}
                        {promptResult.output?.output?.analysis_summary && Array.isArray(promptResult.output?.output?.details) && (
                            <div className="mt-3 border-t pt-3">
                                <h4 className="text-md font-semibold text-gray-700 mb-1">Genomic Analysis Report:</h4>
                                {/* ... Simplified version of Genomic Analysis rendering ... */}
                                <p className="text-xs text-gray-700 whitespace-pre-wrap">{promptResult.output?.output?.natural_language_summary || "See details below."}</p>
                                {/* Full details rendering omitted for brevity but should be here */}
                                <div className="mt-2 text-xs text-gray-500 italic">Complete analysis details available in full record.</div>
                            </div>
                        )}

                        {/* AI Answer Output */}
                        {promptResult.output?.output?.answer_text && (
                            <div className="mt-1 border-t pt-2">
                                <h4 className="font-medium text-gray-700">[Clinician/User] AI Answer:</h4>
                                <p className="text-sm text-gray-800 whitespace-pre-wrap">{promptResult.output?.output?.answer_text}</p>
                            </div>
                        )}

                        {/* Found Trials / Eligibility */}
                        {/* Note: Logic for found_trials or trials_with_assessment */}
                        {((promptResult.output?.output?.found_trials && Array.isArray(promptResult.output.output.found_trials)) ||
                            (promptResult.output?.output?.trials_with_assessment && Array.isArray(promptResult.output.output.trials_with_assessment))) && (
                                <div className="mt-1 border-t pt-2">
                                    <h4 className="font-medium text-gray-700">
                                        [Research] Clinical Trial Eligibility Assessment:
                                    </h4>
                                    <ul className="space-y-3 pl-2 mt-1">
                                        {(promptResult.output.output.trials_with_assessment || promptResult.output.output.found_trials).map((trial, index) => {
                                            const assessment = trial.llm_assessment || {};
                                            return (
                                                <li key={trial.nct_id || index} className="text-sm border border-gray-200 rounded-md p-3 shadow-sm">
                                                    <p className="font-semibold text-gray-800">{trial.title} (Phase {trial.phase})</p>
                                                    <p className="text-xs text-gray-600">NCT ID: {trial.nct_id} | Status: {trial.status}</p>
                                                    {assessment.eligibility_status && (
                                                        <p className="text-xs font-semibold mt-1 mb-1 px-2 py-0.5 rounded-full inline-block bg-gray-100">
                                                            Eligibility: {assessment.eligibility_status}
                                                        </p>
                                                    )}
                                                    <button
                                                        onClick={() => handleSaveTrial(trial)}
                                                        className="mt-3 w-full border border-indigo-300 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 text-xs font-semibold py-1 rounded flex items-center justify-center gap-1"
                                                    >
                                                        <IconLayoutKanban size={14} /> Add to Workflow
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}

                    </div>
                </section>
            )}

            {/* --- Demographics Summary --- */}
            <section className="mb-6 p-4 bg-white rounded shadow">
                <h3 className="text-xl font-semibold mb-3 border-b pb-2 text-gray-800">Demographics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <p><strong>Name:</strong> {`${demographics.first_name || ''} ${demographics.last_name || ''}`.trim() || 'N/A'}</p>
                    <p><strong>DOB:</strong> {formatDate(demographics.dob)}</p>
                    <p><strong>Sex:</strong> {demographics.gender || 'N/A'}</p>
                    <p><strong>Contact:</strong> {demographics.contact || 'N/A'}</p>
                </div>
            </section>

            {/* --- Diagnosis --- */}
            <section className={`mb-6 p-4 bg-white rounded shadow ${highlightSections?.includeDiagnosis ? 'border-2 border-yellow-400 shadow-lg shadow-yellow-200/50' : ''}`}>
                <h3 className="text-xl font-semibold mb-3 border-b pb-2 text-gray-800">Diagnosis</h3>
                <div className="text-sm">
                    <p><strong>Primary:</strong> {diagnosis.primary || 'N/A'}</p>
                    <p><strong>Diagnosed Date:</strong> {formatDate(diagnosis.date_of_diagnosis)}</p>
                    <p><strong>Stage:</strong> {diagnosis.stage || 'N/A'}</p>
                    <p><strong>Histology:</strong> {diagnosis.histology || 'N/A'}</p>
                </div>
            </section>

            {/* --- Genomic Profile --- */}
            {initialPatientData.mutations && initialPatientData.mutations.length > 0 && (
                <section className="mb-6 p-4 bg-white rounded shadow">
                    <h3 className="text-xl font-semibold mb-3 border-b pb-2 text-gray-800">Genomic Profile - Mutations</h3>
                    <div className="space-y-2">
                        {initialPatientData.mutations.map((mutation, index) => (
                            <div key={mutation.mutation_id || `mutation-${index}`} className="p-2 border rounded bg-gray-50 text-sm">
                                <p className="font-semibold">
                                    {mutation.hugo_gene_symbol || 'N/A'} {mutation.protein_change || 'N/A'} ({mutation.variant_type || 'N/A'})
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* --- Notes --- */}
            <section className={`mb-6 p-4 bg-white rounded shadow ${highlightSections?.includeNotes ? 'border-2 border-yellow-400 shadow-lg shadow-yellow-200/50' : ''}`}>
                <h3 className="text-xl font-semibold mb-3 border-b pb-2 text-gray-800">Progress Notes</h3>
                {initialPatientData.notes && initialPatientData.notes.length > 0 ? (
                    <div className="space-y-4">
                        {initialPatientData.notes.map((note, index) => (
                            <div key={note.noteId || `note-${index}`} className="p-3 border rounded bg-gray-50 text-sm">
                                <p className="font-semibold">{formatDate(note.date)} - {note.author || 'N/A'} ({note.type || 'Note'})</p>
                                <p className="mt-1 whitespace-pre-wrap">{note.content || note.text || 'No content.'}</p>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-sm text-gray-500">No notes available.</p>}
            </section>

            {/* --- Consultation Panel (Renders if Dr. A initiated) --- */}
            {isConsultPanelOpen && currentConsultation && (
                <div className="absolute top-16 right-5 z-20">
                    <ConsultationPanel
                        patientId={patientId}
                        consultationRoomId={currentConsultation.roomId}
                        currentUser={currentUser}
                        participants={currentConsultation.participants}
                        initialContext={currentConsultation.initialContext}
                        onClose={handleCloseConsultation}
                    />
                </div>
            )}

            {/* --- Contextual Suggestion Chips --- */}
            {suggestionChips.length > 0 && (
                <div className="mt-4 pt-3 border-t">
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">Contextual Suggestions:</h4>
                    <div className="flex flex-wrap gap-2">
                        {suggestionChips.map((chip) => (
                            <button
                                key={chip.id}
                                type="button"
                                onClick={() => {
                                    const targetElement = document.getElementById(chip.targetElementId);
                                    if (targetElement) {
                                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    }
                                }}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200`}
                            >
                                {chip.text}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

export default PatientClinicalTab;
