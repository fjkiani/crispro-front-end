import { useQuery } from '@tanstack/react-query';
import { buildAyeshaTherapyFitBundleUrl } from '../utils/ayeshaApi';


const getAuthToken = () => {
  try {
    const sessionStr = localStorage.getItem('mock_auth_session');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      const t = session?.access_token;
      if (t && t !== 'null' && t !== 'undefined') return t;
    }
  } catch (e) {
    // ignore
  }
  const t2 = localStorage.getItem('supabase_auth_token');
  if (t2 && t2 !== 'null' && t2 !== 'undefined') return t2;
  return null;
};

async function fetchAyeshaTestsUnlocksBundle() {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(buildAyeshaTherapyFitBundleUrl({
    level: 'l1',
    includeSyntheticLethality: true,
  }), {
    method: 'POST',
    headers,
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Failed to load bundle: ${res.status} ${res.statusText}${txt ? ` — ${txt}` : ''}`);
  }

  return res.json();
}

export function useAyeshaTestsUnlocksBundle(options = {}) {
  return useQuery({
    queryKey: ['ayesha-tests-unlocks-bundle', { level: 'l1', include_synthetic_lethality: true }],
    queryFn: fetchAyeshaTestsUnlocksBundle,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    ...options,
  });
}

