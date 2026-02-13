import { useState, useCallback } from 'react';

// Initial Mock State (Synchronized with AYESHA_BASE_PROFILE)
const INITIAL_PROFILE_STATE = {
    pfi_months: null, // Compliance: Do not default to 7.5 (Sensitive)
    pfi_status: 'Platinum Unknown', // Compliance: Default to Unknown until dates proven
    line_of_therapy: 2,
    stage: 'IV',
};

export const useProfileEditor = (currentProfile) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Load initial state from storage if available
    const [editState, setEditState] = useState(() => {
        try {
            const saved = localStorage.getItem('ayesha_profile_overrides');
            if (saved) return { ...INITIAL_PROFILE_STATE, ...JSON.parse(saved) };
        } catch (e) { console.error("Failed to load profile overrides", e); }
        return INITIAL_PROFILE_STATE;
    });

    const [isSaving, setIsSaving] = useState(false);
    const [validationWarnings, setValidationWarnings] = useState([]);

    const openEditor = useCallback(() => {
        setIsModalOpen(true);
    }, []);

    const closeEditor = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    const updateField = useCallback((field, value) => {
        setEditState(prev => {
            const newState = { ...prev, [field]: value };

            // COMPLIANCE FIX (Phase 6):
            // Stop auto-calculating status from simple months input.
            // If PFI is edited manually without dates, status must be UNKNOWN.
            if (field === 'pfi_months') {
                newState.pfi_status = 'Platinum Unknown';

                // Signal to UI that dates are needed (could be consumed by UI later)
                if (!prev.dates_confirmed) {
                    console.warn("[Clinical Safety] PFI edited without dates - Status reset to Unknown");
                }
            }
            return newState;
        });
    }, []);

    const saveChanges = useCallback(async () => {
        setIsSaving(true);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            // Persist to LocalStorage
            localStorage.setItem('ayesha_profile_overrides', JSON.stringify(editState));

            // Dispatch event for other hooks (useAyeshaProfile)
            window.dispatchEvent(new Event('ayesha_profile_updated'));

            console.log('[useProfileEditor] Persisted profile changes:', editState);
        } catch (e) {
            console.error("Failed to save profile overrides", e);
        }

        setIsSaving(false);
        setIsModalOpen(false);
        return editState;
    }, [editState]);

    return {
        isModalOpen,
        openEditor,
        closeEditor,
        editState,
        updateField,
        saveChanges,
        isSaving,
    };
};
