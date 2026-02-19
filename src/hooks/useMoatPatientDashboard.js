import { useCallback, useEffect, useMemo, useState } from "react";
import { buildAyeshaCompleteCareV2Request } from "../utils/patientGates";
import { API_ROOT } from '../lib/apiConfig';


function cacheKey(profileId) {
  return `moat_dashboard_cache:${profileId}`;
}

function loadCache(profileId) {
  try {
    const raw = localStorage.getItem(cacheKey(profileId));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveCache(profileId, payload) {
  try {
    localStorage.setItem(cacheKey(profileId), JSON.stringify(payload));
  } catch {
    // ignore
  }
}

export function useMoatPatientDashboard(profile) {
  const profileId = profile?.meta?.profile_id || "unknown";

  const [status, setStatus] = useState("idle"); // idle | running | success | error
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const cached = useMemo(() => loadCache(profileId), [profileId]);

  useEffect(() => {
    if (cached?.result) {
      setResult(cached.result);
      setStatus("success");
    }
  }, [cached]);

  const run = useCallback(async () => {
    if (!profile) {
      console.warn("⚠️ MOAT Dashboard: No profile provided");
      return;
    }

    console.log("🚀 MOAT Dashboard: Starting MOAT update...");
    setStatus("running");
    setError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const requestBody = buildAyeshaCompleteCareV2Request(profile);
      console.log("📤 MOAT Dashboard: Sending request", requestBody);

      const res = await fetch(`${API_ROOT}/api/ayesha/complete_care_v2`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        let detail = `HTTP ${res.status}`;
        try {
          const j = await res.json();
          detail = j?.detail || j?.message || detail;
        } catch {
          // ignore
        }
        console.error("❌ MOAT Dashboard: Request failed", detail);
        throw new Error(detail);
      }

      const data = await res.json();
      console.log("✅ MOAT Dashboard: Response received", data);
      setResult(data);
      setStatus("success");
      saveCache(profileId, { saved_at: new Date().toISOString(), result: data });
      console.log("✅ MOAT Dashboard: State updated, result set");
      return data;
    } catch (e) {
      clearTimeout(timeoutId);
      const msg =
        e?.name === "AbortError"
          ? "MOAT update timed out after 60s. Backend may be slow/unavailable."
          : e?.message || "Unknown error";
      console.error("❌ MOAT Dashboard: Error", e, msg);
      setError(msg);
      setStatus("error");
      return null;
    }
  }, [profile, profileId]);

  return {
    status,
    error,
    result,
    lastSavedAt: cached?.saved_at || null,
    run,
    clearCache: () => {
      localStorage.removeItem(cacheKey(profileId));
      setResult(null);
      setStatus("idle");
      setError(null);
    },
  };
}

