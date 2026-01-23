import React, { useState, useEffect } from 'react';

const DraftMessageModal = ({ isOpen, onClose, taskTitle, initialDraftText, onSendMessage }) => {
  const [draftText, setDraftText] = useState(initialDraftText || '');

  useEffect(() => {
    // Update text area if the initial draft text changes (e.g., new task selected for modal)
    setDraftText(initialDraftText || '');
  }, [initialDraftText]);

  if (!isOpen) return null;

  const handleSend = () => {
    onSendMessage(draftText);
    onClose(); // Close modal after sending/saving
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out" role="dialog" aria-modal="true">
      <div className="relative bg-white w-full max-w-lg mx-auto rounded-lg shadow-xl p-6 transform transition-all duration-300 ease-in-out scale-100">
        <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Draft Patient Message</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 text-2xl font-semibold leading-none focus:outline-none"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {taskTitle && (
            <div className="mb-3 p-2 bg-slate-50 border border-slate-200 rounded-md">
                <p className="text-xs text-slate-500">Regarding task:</p>
                <p className="text-sm text-slate-700 font-medium">{taskTitle}</p>
            </div>
        )}

        <textarea 
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          placeholder="Compose your message to the patient..."
          rows={6}
          className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-sm"
        />

        <div className="flex justify-end items-center pt-4 border-t border-gray-200 mt-4">
          <button 
            onClick={onClose} 
            className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400"
          >
            Cancel
          </button>
          <button 
            onClick={handleSend} 
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default DraftMessageModal; 