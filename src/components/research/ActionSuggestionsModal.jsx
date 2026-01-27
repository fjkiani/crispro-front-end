import React, { useState, useEffect } from 'react';

const ActionSuggestionsModal = ({ isOpen, onClose, followupData, onSubmit }) => {
  const [selectedSuggestions, setSelectedSuggestions] = useState(new Set());

  // Reset selections when suggestions change (e.g., new trial selected)
  useEffect(() => {
    setSelectedSuggestions(new Set());
  }, [followupData.suggestions]);

  if (!isOpen) return null;

  const handleCheckboxChange = (suggestion) => {
    const newSelectedSuggestions = new Set(selectedSuggestions);
    if (newSelectedSuggestions.has(suggestion)) {
      newSelectedSuggestions.delete(suggestion);
    } else {
      newSelectedSuggestions.add(suggestion);
    }
    setSelectedSuggestions(newSelectedSuggestions);
  };

  const handleSubmit = () => {
    onSubmit(Array.from(selectedSuggestions), followupData.trialId, followupData.trialTitle);
    onClose(); // Close modal after submit
  };

  const suggestionsToShow = followupData.suggestions || [];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
      <div className="relative bg-white w-full max-w-2xl mx-auto rounded-lg shadow-xl p-6">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Plan Follow-up Tasks</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 text-2xl font-semibold"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-1">
          Select actions to create tasks for trial: 
          <span className="font-semibold">{followupData.trialTitle || 'N/A'}</span> (ID: {followupData.trialId || 'N/A'})
        </p>

        {suggestionsToShow.length === 0 ? (
          <p className="text-gray-500 italic my-4">No specific follow-up suggestions available for this trial.</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 mb-4 mt-3">
            {suggestionsToShow.map((suggestion, index) => (
              <div key={index} className="p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                <label htmlFor={`suggestion-${index}`} className="flex items-start cursor-pointer">
                  <input 
                    type="checkbox" 
                    id={`suggestion-${index}`} 
                    checked={selectedSuggestions.has(suggestion)}
                    onChange={() => handleCheckboxChange(suggestion)}
                    className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <div className="ml-3 text-sm flex-grow">
                    <p className="font-medium text-gray-800">{suggestion.suggestion || 'No suggestion text'}</p>
                    {suggestion.criterion && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        <span className="font-semibold">Regarding Criterion:</span> {suggestion.criterion}
                      </p>
                    )}
                    {suggestion.draft_text && (
                        <p className="text-xs text-gray-500 mt-0.5 bg-gray-100 p-1.5 rounded">
                            <span className="font-semibold">Details:</span> {suggestion.draft_text}
                        </p>
                    )}
                  </div>
                </label>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end items-center pt-4 border-t mt-4">
          <button 
            onClick={onClose} 
            className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={selectedSuggestions.size === 0 && suggestionsToShow.length > 0} // Disable if no suggestions or none selected
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
          >
            Create {selectedSuggestions.size > 0 ? selectedSuggestions.size : ''} Task(s)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionSuggestionsModal; 