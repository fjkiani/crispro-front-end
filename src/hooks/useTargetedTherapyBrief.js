import { useQuery } from '@tanstack/react-query';
import { API_ROOT } from '../lib/apiConfig';


const getAuthToken = () => {
    try {
        const sessionStr = localStorage.getItem('mock_auth_session');
        if (sessionStr) {
            const session = JSON.parse(sessionStr);
            return session.access_token;
        }
    } catch (e) {
        console.warn('Failed to parse auth session', e);
    }
    return localStorage.getItem('supabase_auth_token');
};

const fetchTargetedBrief = async ({ patientId, context }) => {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token && token !== 'null' && token !== 'undefined') {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const payload = {
        patient_id: patientId || "AYESHA_V1",
        disease_context: context,
        simulate_prognosis: null // Can be wired to UI toggles later
    };

    const response = await fetch(`${API_ROOT}/api/ayesha/therapy-fit/targeted-brief`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`Targeted Brief fetch failed: ${response.statusText}`);
    }
    return response.json();
};

export function useTargetedTherapyBrief({ patientId, context }, options = {}) {
    return useQuery({
        queryKey: ['targeted-brief', patientId, context],
        queryFn: () => fetchTargetedBrief({ patientId, context }),
        enabled: !!context, // Only run when context is available (Strangler Pattern)
        // Reduce “calls over and over” in dev: react-query refetches on window focus by default.
        staleTime: 5 * 60 * 1000, // 5 min
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: 1,
        ...options,
    });
}
