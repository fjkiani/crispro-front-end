/**
 * fetchWithRetry — Drop-in fetch wrapper that handles Render free-tier cold starts.
 *
 * Problem: Render free-tier services sleep after 15 min of inactivity. When the
 * service is waking up, it returns 502/503 with NO response body and NO CORS headers.
 * The browser sees this as "TypeError: Failed to fetch" (network error), not an HTTP
 * error — so normal response.ok checks don't catch it.
 *
 * Solution: Retry up to MAX_RETRIES times with exponential backoff on:
 *   - TypeError (network error / CORS-less 502/503)
 *   - HTTP 502, 503, 504 responses
 *
 * Usage: drop-in replacement for fetch()
 *   import { fetchWithRetry } from '@/lib/fetchWithRetry';
 *   const res = await fetchWithRetry(url, options);
 */

const MAX_RETRIES = 2;
const BASE_DELAY_MS = 3000; // 3s first retry, 6s second retry

/**
 * Sleep for ms milliseconds.
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * fetchWithRetry — retries on network errors and 502/503/504.
 *
 * @param {string|URL} url
 * @param {RequestInit} [options]
 * @param {object} [retryOptions]
 * @param {number} [retryOptions.maxRetries=2]
 * @param {number} [retryOptions.baseDelayMs=3000]
 * @returns {Promise<Response>}
 */
export async function fetchWithRetry(url, options = {}, retryOptions = {}) {
  const maxRetries = retryOptions.maxRetries ?? MAX_RETRIES;
  const baseDelayMs = retryOptions.baseDelayMs ?? BASE_DELAY_MS;

  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, options);

      // Retry on gateway errors (Render waking up)
      if ((res.status === 502 || res.status === 503 || res.status === 504) && attempt < maxRetries) {
        const delay = baseDelayMs * (attempt + 1);
        console.warn(
          `[fetchWithRetry] ${res.status} on ${url} — retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`
        );
        await sleep(delay);
        continue;
      }

      return res;
    } catch (err) {
      // TypeError: Failed to fetch = network error or CORS-less 502/503
      lastError = err;

      if (attempt < maxRetries) {
        const delay = baseDelayMs * (attempt + 1);
        console.warn(
          `[fetchWithRetry] Network error on ${url} — retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries}):`,
          err?.message
        );
        await sleep(delay);
      }
    }
  }

  // All retries exhausted — throw the last error
  throw lastError;
}

export default fetchWithRetry;
