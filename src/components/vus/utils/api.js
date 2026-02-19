import { API_ROOT } from '../../../lib/apiConfig';

const memoryCache = new Map();
const LS_KEY = '__vus_cache_v1';

function readStore() {
	try {
		const raw = localStorage.getItem(LS_KEY);
		return raw ? JSON.parse(raw) : {};
	} catch (_) { return {}; }
}

function writeStore(store) {
	try { localStorage.setItem(LS_KEY, JSON.stringify(store)); } catch (_) {}
}

const keyOf = (url) => url;

export async function fetchJsonCached(path, { timeoutMs = 10000 } = {}) {
	const url = `${API_ROOT}${path}`;
	const k = keyOf(url);
	if (memoryCache.has(k)) return memoryCache.get(k);
	const store = readStore();
	if (store[k]) {
		memoryCache.set(k, store[k]);
		return store[k];
	}
	const controller = new AbortController();
	const t = setTimeout(() => controller.abort(), timeoutMs);
	try {
		const res = await fetch(url, { signal: controller.signal });
		const json = await res.json().catch(() => ({}));
		if (!res.ok) throw new Error(json?.detail || `HTTP ${res.status}`);
		memoryCache.set(k, json);
		const next = { ...store, [k]: json };
		writeStore(next);
		return json;
	} finally {
		clearTimeout(t);
	}
}

export function buildVariantQuery({ chrom, pos, ref, alt }) {
	if (!chrom || !pos || !ref || !alt) return null;
	return `chrom=${encodeURIComponent(chrom)}&pos=${encodeURIComponent(pos)}&ref=${encodeURIComponent(ref)}&alt=${encodeURIComponent(alt)}`;
}


