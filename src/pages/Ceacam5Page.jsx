/**
 * CrisPRO CEACAM5 Intelligence Demo
 * Brenus Pharma / STC-1010 program
 * Research Use Only — Not for Clinical Decision Making
 *
 * Tabs: Gate Simulator | Comparator Landscape | Assay Coverage Gap | Retroactive Proof | Sanofi Executive View
 * Personas: BD | CMO | CFO | Scientist
 */

import React, { useEffect, useState, useCallback, useRef } from "react";
import { API_ROOT } from "../lib/apiConfig";

const API_BASE = API_ROOT || "https://crispro-backend-v2-production.up.railway.app";

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#ffffff", surface: "#f8f8f6", border: "#e5e5e0", borderMd: "#d0d0c8",
  accent: "#0279EE", accentBg: "#EFF6FF",
  green: "#16a34a", greenBg: "#f0fdf4",
  red: "#dc2626", redBg: "#fef2f2",
  amber: "#d97706", amberBg: "#fffbeb",
  orange: "#ea580c", purple: "#9333ea",
  text: "#0f0f0e", textSub: "#44443e", muted: "#888880", faint: "#b8b8b0",
  yellow: "#E9ED4C",
};

const PERSONA_COLORS = { bd: "#0279EE", cmo: "#16a34a", cfo: "#9333ea", scientist: "#ea580c" };
const PERSONA_LABELS = { bd: "Business Dev", cmo: "CMO", cfo: "CFO / Investor", scientist: "Scientist" };

const VALIDITY_COLOR = (v) => {
  if (v.startsWith("UNPROVEN")) return C.accent;
  if (v.startsWith("PROVISIONAL")) return C.amber;
  if (v.startsWith("PARTIAL")) return C.orange;
  if (v.startsWith("FALSIFIED")) return C.red;
  return C.muted;
};

// ── API helpers ───────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `API error ${res.status}`);
  }
  return res.json();
}

const gateSimulate = (req) => apiFetch("/api/ceacam5/gate-simulate", { method: "POST", body: JSON.stringify(req) });
const getComparators = () => apiFetch("/api/ceacam5/comparators");
const getCeacam5Scenarios = () => apiFetch("/api/ceacam5/scenarios");
const getSanofiPayload = () => apiFetch("/api/ceacam5/sanofi-payload");

// ── Static data ───────────────────────────────────────────────────────────────
const ASSET_LABELS = {
  "SAR445877": "SAR445877 (PD1×IL-15)",
  "SAR445953": "SAR445953 (CEACAM5×CD3)",
  "tusamitamab": "Tusamitamab (ADC)",
  "STC-1010": "STC-1010 / BreAK CRC-001",
};
const ASSET_DESCRIPTIONS = {
  "SAR445877": "IO-activating bispecific. Requires IO-permissive TME. Collapses in liver-met patients (EC-07).",
  "SAR445953": "CEACAM5×CD3 T-cell engager. Requires CEACAM5 expression. More robust to liver mets.",
  "tusamitamab": "CEACAM5-targeting ADC. EU clinical hold (France, Spain, Sweden, Netherlands) as of Mar 2026.",
  "STC-1010": "Haptenated whole-cell vaccine. IO-dominant mechanism. BreAK CRC-001 Phase Ia ongoing.",
};

const ASSAY_MARKERS = [
  { id: "gzmb", name: "GzmB (Granzyme B)", axis: "Effector Function", color: "#0279EE",
    what_it_detects: "Active cytotoxic T-cell killing. GzmB+ = T-cells are engaged and killing.",
    positive_scenario: "GzmB+ with low ORR → priming works, killing works, bottleneck is elsewhere (trafficking, TME suppression).",
    negative_scenario: "GzmB- with low ORR → T-cells are not activated. Haptenation failed to prime effectors, or Tregs are suppressing." },
  { id: "tox", name: "TOX", axis: "Exhaustion Status", color: "#ea580c",
    what_it_detects: "T-cell exhaustion master regulator. TOX+ = T-cells are present but exhausted.",
    positive_scenario: "TOX+ with low ORR → T-cells reached the tumor but became exhausted. Next: anti-exhaustion combination (anti-LAG3, anti-TIM3).",
    negative_scenario: "TOX- with low ORR → T-cells are not exhausted but not killing. Suggests trafficking failure or MHC-I loss." },
  { id: "mhci", name: "MHC-I", axis: "Antigen Presentation", color: "#16a34a",
    what_it_detects: "Tumor antigen presentation to CD8 T-cells. MHC-I loss = immune evasion.",
    positive_scenario: "MHC-I+ with low ORR → tumor is presenting antigen; T-cells are not recognizing or killing.",
    negative_scenario: "MHC-I- with low ORR → tumor has lost antigen presentation. Next: MHC-I restoration (epigenetic agents)." },
  { id: "tls", name: "TLS (Tertiary Lymphoid Structures)", axis: "Immune Architecture", color: "#9333ea",
    what_it_detects: "Organized immune aggregates in tumor. TLS+ = sustained anti-tumor immune response.",
    positive_scenario: "TLS+ with low ORR → immune architecture is forming; response may be delayed. Consider extended follow-up.",
    negative_scenario: "TLS- with low ORR → no organized immune response. Tumor microenvironment is fully suppressive." },
];

const LIQUID_BIOPSY_FALLBACK = [
  { label: "Tier 1 (Preferred)", method: "Paired tumor biopsies (on-treatment, Cycle 2)", markers: "GzmB, TOX, MHC-I, TLS — full panel", limitation: "40–60% dropout rate (patient refusal, necrotic/inaccessible lesions)", color: C.green },
  { label: "Tier 2 (If biopsies fail)", method: "ctDNA clearance + peripheral blood immunophenotyping", markers: "ctDNA at Cycle 2; peripheral GzmB+/TOX+ CD8 T-cells by flow cytometry", limitation: "Peripheral ≠ intratumoral. ctDNA measures burden reduction, not effector function.", color: C.accent },
  { label: "Tier 3 (Minimum viable)", method: "ctDNA clearance alone", markers: "ctDNA at Cycle 2", limitation: "No immune mechanism data. Provides pharmacodynamic signal only.", color: C.amber },
];

// ── Shared sub-components ─────────────────────────────────────────────────────
function ClaimBadge({ type }) {
  const isSourced = type.startsWith("SOURCED");
  const isComputed = type.startsWith("COMPUTED");
  const isOA = type.startsWith("OPEN") || type.startsWith("OA-");
  const bg = isSourced ? C.greenBg : isComputed ? C.accentBg : isOA ? C.amberBg : C.surface;
  const color = isSourced ? C.green : isComputed ? C.accent : isOA ? C.amber : C.muted;
  const label = isSourced ? "SOURCED" : isComputed ? "COMPUTED" : isOA ? "OPEN ASSUMPTION" : "INFERRED";
  return (
    <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.06em", background: bg, color, padding: "2px 6px", borderRadius: 4, textTransform: "uppercase", border: `1px solid ${color}30` }}>
      {label}
    </span>
  );
}

function SectionLabel({ children }) {
  return <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>{children}</div>;
}

function GateSlider({ label, value, onChange, min = 0, max = 1, step = 0.01, tickMarks, formatValue, color = C.accent }) {
  const pct = ((value - min) / (max - min)) * 100;
  const display = formatValue ? formatValue(value) : `${Math.round(value * 100)}%`;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.textSub }}>{label}</span>
        <span style={{ fontSize: 14, fontWeight: 800, color, fontVariantNumeric: "tabular-nums" }}>{display}</span>
      </div>
      <div style={{ position: "relative", height: 6, background: C.border, borderRadius: 3, marginBottom: 4 }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width 0.12s ease" }} />
        {tickMarks?.map((t) => {
          const tPct = ((t.value - min) / (max - min)) * 100;
          return <div key={t.value} style={{ position: "absolute", left: `${tPct}%`, top: -3, width: 2, height: 12, background: C.borderMd, borderRadius: 1, transform: "translateX(-50%)" }} />;
        })}
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} style={{ width: "100%", margin: "2px 0 0", cursor: "pointer", accentColor: color }} />
      {tickMarks && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
          {tickMarks.map((t) => <span key={t.value} style={{ fontSize: 10, color: C.faint, fontWeight: 500 }}>{t.label}</span>)}
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, sub, color, claimType, warning, highlighted, highlightColor }) {
  return (
    <div style={{ background: C.surface, border: `${highlighted ? "2px" : "1px"} solid ${highlighted ? (highlightColor || C.accent) : C.border}`, borderRadius: 12, padding: "16px 18px", boxShadow: highlighted ? `0 0 0 3px ${(highlightColor || C.accent)}18` : "none", transition: "all 0.2s" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 900, color: color || C.text, letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.textSub, fontWeight: 500, marginBottom: 6 }}>{sub}</div>}
      {claimType && <ClaimBadge type={claimType} />}
      {warning && <div style={{ marginTop: 8, padding: "8px 10px", background: C.amberBg, border: `1px solid ${C.amber}30`, borderRadius: 6, fontSize: 11, color: C.amber, fontWeight: 600, lineHeight: 1.4 }}>{warning}</div>}
    </div>
  );
}

// ── Narrative Panel ───────────────────────────────────────────────────────────
function NarrativePanel({ narrative, persona, personaColor }) {
  const [visible, setVisible] = useState(false);
  const prevRef = useRef(null);

  useEffect(() => {
    if (!narrative) return;
    if (prevRef.current !== narrative.headline) {
      setVisible(false);
      const t = setTimeout(() => setVisible(true), 60);
      prevRef.current = narrative.headline;
      return () => clearTimeout(t);
    }
  }, [narrative]);

  if (!narrative) return null;

  const headlineColor = narrative.headline.includes("not launchable") || narrative.headline.includes("cannot launch") ? C.red
    : narrative.headline.includes("target configuration") ? C.green
    : narrative.headline.includes("contradiction") || narrative.headline.includes("wrong patients") ? C.amber
    : C.text;

  return (
    <div style={{ opacity: visible ? 1 : 0, transition: "opacity 0.2s ease", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 20px", marginBottom: 20 }}>
      {persona && (
        <div style={{ fontSize: 10, fontWeight: 800, color: personaColor, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
          {PERSONA_LABELS[persona]} Lens
        </div>
      )}
      <div style={{ fontSize: 16, fontWeight: 800, color: headlineColor, lineHeight: 1.4, marginBottom: 14, letterSpacing: "-0.02em" }}>
        {narrative.headline}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        {[
          { label: "Enrollment Pool", text: narrative.pool_sentence },
          { label: "Response Rate", text: narrative.orr_sentence },
          { label: "Trial Economics", text: narrative.cost_sentence },
          { label: "Mechanism Fit", text: narrative.fit_sentence },
        ].map(({ label, text }) => (
          <div key={label} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 12, color: C.textSub, lineHeight: 1.5 }}>{text}</div>
          </div>
        ))}
      </div>
      {narrative.risk_sentence && (
        <div style={{ padding: "10px 14px", background: C.amberBg, border: `1px solid ${C.amber}30`, borderRadius: 8, fontSize: 12, color: C.amber, fontWeight: 600, lineHeight: 1.5, marginBottom: 10 }}>
          {narrative.risk_sentence}
        </div>
      )}
      <div style={{ padding: "10px 14px", background: C.accentBg, border: `1px solid ${C.accent}30`, borderRadius: 8, fontSize: 13, color: C.accent, fontWeight: 700, lineHeight: 1.5 }}>
        {narrative.bottom_line}
      </div>
    </div>
  );
}

// ── Persona Question Panel ────────────────────────────────────────────────────
function PersonaQuestionPanel({ persona, personaData, personaColor }) {
  if (!persona || !personaData) return null;
  return (
    <div style={{ background: C.bg, border: `1.5px solid ${personaColor}30`, borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: personaColor, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
        {PERSONA_LABELS[persona]} — Questions They Will Ask
      </div>
      <div style={{ fontSize: 13, fontStyle: "italic", color: C.textSub, marginBottom: 12, lineHeight: 1.5 }}>
        "{personaData.their_question}"
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {personaData.questions.map((q, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: personaColor, minWidth: 18, marginTop: 1 }}>{i + 1}.</span>
            <span style={{ fontSize: 13, color: C.textSub, lineHeight: 1.5 }}>{q}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── TAB 1: Gate Simulator ─────────────────────────────────────────────────────
function TabGateSimulator({ persona, personaData, personaColor }) {
  const [asset, setAsset] = useState("SAR445877");
  const [ceacam5, setCeacam5] = useState(0.50);
  const [ioStr, setIoStr] = useState(0.0);
  const [liverMet, setLiverMet] = useState(false);
  const [antiCorr, setAntiCorr] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedConflict, setExpandedConflict] = useState(false);
  const debounceRef = useRef(null);

  const runSimulate = useCallback(async (a, c5, io, lm, ac) => {
    setLoading(true); setError(null);
    try {
      const res = await gateSimulate({ asset: a, ceacam5_threshold: c5, io_stringency: io, liver_met: lm, anti_correlated: ac });
      setResult(res);
    } catch (e) { setError(e.message || "Simulation failed"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSimulate(asset, ceacam5, ioStr, liverMet, antiCorr), 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [asset, ceacam5, ioStr, liverMet, antiCorr, runSimulate]);

  const pool = result?.enrollment_pool;
  const poolColor = pool?.viability_color === "green" ? C.green : pool?.viability_color === "amber" ? C.amber : C.red;
  const orrLow = result ? Math.round(result.orr_projection.low * 100) : null;
  const orrHigh = result ? Math.round(result.orr_projection.high * 100) : null;

  // Persona-driven metric highlighting
  const highlighted = personaData?.highlighted_metrics || [];
  const isHighlighted = (key) => highlighted.includes(key);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", height: "calc(100vh - 112px)" }}>
      {/* Left: Controls */}
      <div style={{ borderRight: `1px solid ${C.border}`, overflowY: "auto", padding: "20px 16px", background: C.surface }}>
        <SectionLabel>Asset</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 20 }}>
          {["SAR445877", "SAR445953", "tusamitamab", "STC-1010"].map((a) => (
            <button key={a} onClick={() => setAsset(a)} style={{ textAlign: "left", padding: "10px 12px", borderRadius: 8, cursor: "pointer", border: `1.5px solid ${asset === a ? C.accent : C.border}`, background: asset === a ? C.accentBg : C.bg, transition: "all 0.15s" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: asset === a ? C.accent : C.text, marginBottom: 2 }}>
                {ASSET_LABELS[a]}
                {a === "tusamitamab" && <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 800, background: C.redBg, color: C.red, padding: "1px 5px", borderRadius: 3 }}>EU HOLD</span>}
              </div>
              <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.4 }}>{ASSET_DESCRIPTIONS[a].split(".")[0]}.</div>
            </button>
          ))}
        </div>

        <SectionLabel>Gate Parameters</SectionLabel>
        <GateSlider label="CEACAM5 IHC Threshold" value={ceacam5} onChange={setCeacam5} color={C.accent}
          tickMarks={[{ value: 0, label: "None" }, { value: 0.5, label: "≥50%" }, { value: 0.8, label: "≥80%" }, { value: 1.0, label: "Max" }]}
          formatValue={(v) => v === 0 ? "No gate" : `≥${Math.round(v * 100)}%`} />
        <GateSlider label="IO-Permissive Stringency" value={ioStr} onChange={setIoStr} color="#0891b2"
          tickMarks={[{ value: 0, label: "None" }, { value: 0.5, label: "Moderate" }, { value: 1.0, label: "Strict" }]}
          formatValue={(v) => { if (v === 0) return "No IO gate"; if (v <= 0.33) return "Loose (Immunoscore)"; if (v <= 0.66) return "Moderate"; return "Strict (pTMB ≥28)"; }} />

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.textSub, marginBottom: 6 }}>Liver Mets</div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setLiverMet(false)} style={{ flex: 1, padding: "8px 0", borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${!liverMet ? C.green : C.border}`, background: !liverMet ? C.greenBg : C.bg, color: !liverMet ? C.green : C.muted, transition: "all 0.15s" }}>No liver mets</button>
            <button onClick={() => setLiverMet(true)} style={{ flex: 1, padding: "8px 0", borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${liverMet ? C.red : C.border}`, background: liverMet ? C.redBg : C.bg, color: liverMet ? C.red : C.muted, transition: "all 0.15s" }}>Liver mets present</button>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.textSub }}>Anti-Correlation</span>
            <span style={{ fontSize: 9, fontWeight: 800, background: C.amberBg, color: C.amber, padding: "2px 6px", borderRadius: 4, textTransform: "uppercase" }}>EXISTENTIAL KNOB</span>
          </div>
          <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5, marginBottom: 8 }}>If CEACAM5-high and IO-permissive are anti-correlated in CRC, the enrollment pool collapses. The $150K IHC study resolves this. [OA-26]</div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setAntiCorr(false)} style={{ flex: 1, padding: "8px 0", borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${!antiCorr ? C.green : C.border}`, background: !antiCorr ? C.greenBg : C.bg, color: !antiCorr ? C.green : C.muted, transition: "all 0.15s" }}>Independent</button>
            <button onClick={() => setAntiCorr(true)} style={{ flex: 1, padding: "8px 0", borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${antiCorr ? C.red : C.border}`, background: antiCorr ? C.redBg : C.bg, color: antiCorr ? C.red : C.muted, transition: "all 0.15s" }}>Anti-Correlated</button>
          </div>
        </div>
      </div>

      {/* Right: Live Output */}
      <div style={{ overflowY: "auto", padding: "24px 28px", background: C.bg }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>MSS mCRC · Gate Simulator</div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: C.text, margin: "0 0 4px", letterSpacing: "-0.03em" }}>{ASSET_LABELS[asset]}</h2>
          <div style={{ fontSize: 13, color: C.muted }}>{ASSET_DESCRIPTIONS[asset]}</div>
        </div>

        {error && <div style={{ padding: "12px 16px", background: C.redBg, border: `1px solid ${C.red}30`, borderRadius: 8, marginBottom: 16, fontSize: 13, color: C.red }}>{error}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 16 }}>
          <MetricCard label="Enrollment Pool" value={pool ? `${pool.n_per_year.toLocaleString()}/yr` : "—"} sub={pool?.viability} color={pool ? poolColor : C.muted} claimType={pool?.claim_type} highlighted={isHighlighted("enrollment_pool")} highlightColor={personaColor} />
          <MetricCard label="Projected ORR" value={orrLow !== null ? `${orrLow}–${orrHigh}%` : "—"} sub={result?.orr_projection.label} color={orrHigh !== null && orrHigh >= 35 ? C.green : orrHigh !== null && orrHigh >= 15 ? C.amber : C.muted} claimType={result?.orr_projection.claim_type} highlighted={isHighlighted("orr_projection")} highlightColor={personaColor} />
          <MetricCard label="Cost / Responder" value={result?.cost_per_responder.low ? `$${Math.round(result.cost_per_responder.low / 1000)}K–$${Math.round((result.cost_per_responder.high || 0) / 1000)}K` : "—"} sub="Phase 2 economics" color={C.textSub} claimType={result?.cost_per_responder.claim_type} highlighted={isHighlighted("cost_per_responder")} highlightColor={personaColor} />
        </div>

        {result && (
          <div style={{ background: C.accentBg, border: `1.5px solid ${C.accent}30`, borderRadius: 12, padding: "14px 18px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>Mechanism Fit Score</div>
              <div style={{ fontSize: 34, fontWeight: 900, color: C.accent, letterSpacing: "-0.04em", lineHeight: 1 }}>{result.fit_score.fit_A.toFixed(4)}</div>
              <div style={{ fontSize: 12, color: C.textSub, marginTop: 4 }}>Archetype: <strong>{result.fit_score.archetype}</strong></div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Scoring method</div>
              <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, color: C.text, background: C.surface, padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.border}` }}>Mechanism alignment score</div>
            </div>
          </div>
        )}

        {/* Narrative Panel */}
        <NarrativePanel narrative={result?.narrative} persona={persona} personaColor={personaColor} />

        {/* Persona Questions */}
        <PersonaQuestionPanel persona={persona} personaData={personaData} personaColor={personaColor} />

        {result?.structural_contradiction?.active && (
          <div style={{ background: C.redBg, border: `1.5px solid ${C.red}40`, borderRadius: 12, padding: "14px 18px", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.red }}>Structural Contradiction Detected</div>
              <button onClick={() => setExpandedConflict(!expandedConflict)} style={{ fontSize: 11, color: C.red, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>{expandedConflict ? "Collapse" : "Expand"}</button>
            </div>
            <div style={{ fontSize: 13, color: C.red, lineHeight: 1.6 }}>{result.structural_contradiction.message?.split(".")[0]}.</div>
            {expandedConflict && (
              <div style={{ marginTop: 10, fontSize: 12, color: C.textSub, lineHeight: 1.6 }}>
                <p style={{ margin: "0 0 8px" }}>{result.structural_contradiction.message}</p>
                <p style={{ margin: 0, fontStyle: "italic", color: C.muted }}>Scientific note: Gonzalez-Exposito 2019 (JITC) shows CEA-LOW cells have high WNT/β-catenin activity — this is a drug resistance finding, NOT an immune exclusion finding. [OA-26 — CRC ρ unknown]</p>
              </div>
            )}
          </div>
        )}

        {result?.eu_hold_warning && (
          <div style={{ background: C.redBg, border: `1px solid ${C.red}30`, borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 12, color: C.red, fontWeight: 600, lineHeight: 1.5 }}>{result.eu_hold_warning}</div>
        )}

        {loading && <div style={{ fontSize: 13, color: C.muted, fontWeight: 500, textAlign: "center", padding: "20px 0" }}>Computing gate...</div>}
      </div>
    </div>
  );
}

// ── TAB 2: Comparator Landscape ───────────────────────────────────────────────
function TabComparators({ persona, personaData, personaColor }) {
  const [comparators, setComparators] = useState([]);
  const [pVector, setPVector] = useState({});
  const [archetypes, setArchetypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [showArchetypes, setShowArchetypes] = useState(false);

  useEffect(() => {
    Promise.all([getComparators(), getSanofiPayload()])
      .then(([comp, payload]) => {
        setComparators(comp.comparators);
        setPVector(comp.p_vector);
        setArchetypes(payload.archetype_table || []);
      })
      .catch(() => setError("Could not load comparator data"))
      .finally(() => setLoading(false));
  }, []);

  const maxFit = Math.max(...comparators.map((c) => c.fit_A), 0.85);

  const ZONE_COLORS = { "Responder": C.green, "Gap": C.amber, "Non-responder": C.red, "Gate 2 Blocked": C.muted };

  return (
    <div style={{ padding: "32px 40px", maxWidth: 960, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Block 4 · Comparator Analysis</div>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: C.text, margin: "0 0 8px", letterSpacing: "-0.03em" }}>Comparator Landscape</h2>
        <p style={{ fontSize: 14, color: C.textSub, margin: 0, lineHeight: 1.6, maxWidth: 640 }}>BreAK CRC-001 (INDEX) ranks #1 against 7 comparator trials in MSS mCRC. Mechanism validity is labeled honestly — UNPROVEN means Phase Ia only, not that the mechanism is wrong.</p>
      </div>

      {persona && personaData && (
        <PersonaQuestionPanel persona={persona} personaData={personaData} personaColor={personaColor} />
      )}

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 18px", marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.textSub, marginBottom: 10 }}>STC-1010 Program Profile</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {Object.entries(pVector).map(([ax, val]) => (
            <div key={ax} style={{ background: val > 0.3 ? C.accentBg : C.bg, border: `1px solid ${val > 0.3 ? C.accent + "40" : C.border}`, borderRadius: 6, padding: "6px 10px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{ax}</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: val > 0.3 ? C.accent : C.textSub }}>{val.toFixed(2)}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: C.muted }}>IO axis (0.70) is the dominant dimension — STC-1010 is the only comparator with IO as primary mechanism.</div>
      </div>

      {error && <div style={{ color: C.red, fontSize: 13, marginBottom: 16 }}>{error}</div>}
      {loading && <div style={{ color: C.muted, fontSize: 13 }}>Loading comparators...</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {comparators.map((c) => {
          const isIndex = c.core_id === "INDEX";
          const barWidth = (c.fit_A / maxFit) * 100;
          const vColor = VALIDITY_COLOR(c.mechanism_validity);
          const isHovered = hovered === c.core_id;
          return (
            <div key={c.core_id} onMouseEnter={() => setHovered(c.core_id)} onMouseLeave={() => setHovered(null)}
              style={{ background: isIndex ? C.accentBg : isHovered ? C.surface : C.bg, border: `1.5px solid ${isIndex ? C.accent + "40" : isHovered ? C.borderMd : C.border}`, borderRadius: 10, padding: "12px 16px", transition: "all 0.15s", cursor: "default" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: isIndex ? C.accent : C.muted, width: 28 }}>#{c.rank}</span>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: isIndex ? C.accent : C.text }}>{c.trial_name}</span>
                    {isIndex && <span style={{ marginLeft: 8, fontSize: 9, fontWeight: 800, background: C.accent, color: "#fff", padding: "2px 6px", borderRadius: 4 }}>INDEX</span>}
                    <div style={{ fontSize: 11, color: C.muted, fontFamily: "ui-monospace, monospace", marginTop: 1 }}>{c.nct_id}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: isIndex ? C.accent : C.textSub, letterSpacing: "-0.03em" }}>{c.fit_A.toFixed(4)}</div>
                </div>
              </div>
              <div style={{ height: 5, background: C.border, borderRadius: 3, overflow: "hidden", marginBottom: 8 }}>
                <div style={{ width: `${barWidth}%`, height: "100%", background: isIndex ? C.accent : vColor, borderRadius: 3, transition: "width 0.4s ease" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: vColor, background: `${vColor}15`, padding: "2px 7px", borderRadius: 4, border: `1px solid ${vColor}30` }}>{c.mechanism_validity.split("—")[0].trim()}</span>
                {isHovered && <span style={{ fontSize: 11, color: C.textSub }}>{c.mechanism_validity}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Archetype Table */}
      {archetypes.length > 0 && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
          <button onClick={() => setShowArchetypes(!showArchetypes)} style={{ width: "100%", padding: "14px 20px", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>MSS CRC Biomarker Archetype Table</div>
            <div style={{ fontSize: 12, color: C.muted }}>10 archetypes × 4 trials · {showArchetypes ? "▲ Collapse" : "▼ Expand"}</div>
          </button>
          {showArchetypes && (
            <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${C.border}` }}>
              <div style={{ paddingTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                {archetypes.map((a) => {
                  const zoneColor = ZONE_COLORS[a.zone] || C.muted;
                  return (
                    <div key={a.id} style={{ display: "grid", gridTemplateColumns: "40px 80px 1fr 1fr 80px 80px", gap: 10, alignItems: "center", padding: "8px 10px", background: C.bg, borderRadius: 8, border: `1px solid ${C.border}` }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: C.muted }}>{a.id}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: C.textSub }}>{a.trial}</span>
                      <span style={{ fontSize: 11, color: C.text }}>{a.biomarker}</span>
                      <span style={{ fontSize: 11, color: C.textSub, fontFamily: "ui-monospace, monospace" }}>{a.observed_hr}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: zoneColor, background: `${zoneColor}15`, padding: "2px 6px", borderRadius: 4, textAlign: "center" }}>{a.zone}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, color: a.gate_2 === "VERIFIED" ? C.green : a.gate_2 === "EXPLORATORY" ? C.amber : C.red }}>{a.gate_2}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 12, fontSize: 11, color: C.muted }}>Source: crispro_sanofi_pitch_deck_audited_v2.json v2 (2026-06-03). All HRs from published subgroup analyses.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── TAB 3: Assay Coverage Gap ─────────────────────────────────────────────────
function TabAssayGap({ persona, personaData, personaColor }) {
  const [expanded, setExpanded] = useState(null);
  const [showFallback, setShowFallback] = useState(false);

  return (
    <div style={{ padding: "32px 40px", maxWidth: 960, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>MC-05 · Translational Differentiation</div>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: C.text, margin: "0 0 8px", letterSpacing: "-0.03em" }}>Assay Coverage Gap</h2>
        <p style={{ fontSize: 14, color: C.textSub, margin: 0, lineHeight: 1.6, maxWidth: 680 }}>Without these 4 markers, a negative ORR in BreAK CRC-001 is scientifically indistinguishable from GVAX (ORR 0/22, confirmed priming, no mechanistic insight). With them, a negative ORR maps to a specific bottleneck and defines the next experiment.</p>
      </div>

      {persona && personaData && <PersonaQuestionPanel persona={persona} personaData={personaData} personaColor={personaColor} />}

      <div style={{ background: C.amberBg, border: `1.5px solid ${C.amber}40`, borderRadius: 12, padding: "14px 18px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.amber, marginBottom: 4 }}>The GVAX Comparison</div>
          <div style={{ fontSize: 13, color: C.textSub, lineHeight: 1.5 }}>GVAX + CRS-207 (CORE-03): ORR 0/22 in MSS CRC. Confirmed priming. No mechanistic insight. Series B conversation ended. <strong>That is the outcome without the assay package.</strong></div>
        </div>
        <div style={{ flexShrink: 0, background: C.redBg, border: `1px solid ${C.red}30`, borderRadius: 8, padding: "10px 14px", textAlign: "center", marginLeft: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.red, textTransform: "uppercase" }}>GVAX ORR</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: C.red }}>0/22</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        {ASSAY_MARKERS.map((m) => {
          const isExpanded = expanded === m.id;
          return (
            <div key={m.id} onClick={() => setExpanded(isExpanded ? null : m.id)}
              style={{ background: C.bg, border: `1.5px solid ${isExpanded ? m.color : C.border}`, borderRadius: 12, padding: "18px 20px", cursor: "pointer", transition: "all 0.2s", boxShadow: isExpanded ? `0 0 0 3px ${m.color}15` : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: m.color }}>{m.name}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>{m.axis}</div>
                </div>
                <span style={{ fontSize: 9, fontWeight: 800, background: C.redBg, color: C.red, padding: "3px 7px", borderRadius: 4, textTransform: "uppercase" }}>MISSING</span>
              </div>
              <div style={{ fontSize: 13, color: C.textSub, lineHeight: 1.5, marginBottom: 10 }}>{m.what_it_detects}</div>
              {isExpanded && (
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>If {m.name}+ with low ORR:</div>
                    <div style={{ fontSize: 12, color: C.textSub, lineHeight: 1.5 }}>{m.positive_scenario}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.red, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>If {m.name}− with low ORR:</div>
                    <div style={{ fontSize: 12, color: C.textSub, lineHeight: 1.5 }}>{m.negative_scenario}</div>
                  </div>
                </div>
              )}
              <div style={{ marginTop: 8, fontSize: 11, color: m.color, fontWeight: 600 }}>{isExpanded ? "▲ Collapse" : "▼ Expand failure scenarios"}</div>
            </div>
          );
        })}
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
        <button onClick={() => setShowFallback(!showFallback)} style={{ width: "100%", padding: "14px 20px", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Liquid Biopsy Fallback Hierarchy</div>
          <div style={{ fontSize: 12, color: C.muted }}>40–60% biopsy dropout rate in mCRC · {showFallback ? "▲ Collapse" : "▼ Expand"}</div>
        </button>
        {showFallback && (
          <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${C.border}` }}>
            <div style={{ paddingTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              {LIQUID_BIOPSY_FALLBACK.map((tier) => (
                <div key={tier.label} style={{ padding: "12px 14px", borderRadius: 8, background: `${tier.color}10`, border: `1px solid ${tier.color}30` }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: tier.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{tier.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>{tier.method}</div>
                  <div style={{ fontSize: 12, color: C.textSub, marginBottom: 4 }}>{tier.markers}</div>
                  <div style={{ fontSize: 11, color: C.muted, fontStyle: "italic" }}>{tier.limitation}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── TAB 4: Retroactive Proof ──────────────────────────────────────────────────
function TabProof() {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCeacam5Scenarios()
      .then((r) => setScenarios(r.scenarios))
      .catch(() => setError("Could not load proof scenarios"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: "40px 48px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Validation · Brenus-Specific</div>
        <h1 style={{ fontSize: 30, fontWeight: 900, color: C.text, margin: "0 0 12px", letterSpacing: "-0.04em", lineHeight: 1.1 }}>Retroactive Prediction Proof</h1>
        <p style={{ fontSize: 15, color: C.textSub, lineHeight: 1.7, maxWidth: 640, margin: 0 }}>Before seeing trial outcomes, CrisPRO scored each patient profile using its mechanism alignment model. In all three cases, the model correctly separated responders from non-responders — with no outcome data in the model.</p>
      </div>

      {error && <div style={{ color: C.red, fontSize: 13, marginBottom: 16 }}>{error}</div>}
      {loading && <div style={{ color: C.muted, fontSize: 13 }}>Loading proof scenarios...</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 32 }}>
        {scenarios.map((s) => (
          <div key={s.id} style={{ background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "22px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 18, right: 18, background: s.verdict.includes("post-hoc") ? C.amberBg : C.greenBg, border: `1px solid ${s.verdict.includes("post-hoc") ? C.amber + "40" : C.green + "40"}`, borderRadius: 6, padding: "3px 10px", fontSize: 10, fontWeight: 800, color: s.verdict.includes("post-hoc") ? C.amber : C.green, letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.verdict} ✓</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>{s.cancer_label}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.text, letterSpacing: "-0.02em", marginBottom: 4, lineHeight: 1.2, paddingRight: 80 }}>{s.title}</div>
            <div style={{ fontSize: 11, color: C.muted, fontFamily: "ui-monospace, monospace", marginBottom: 16 }}>{s.pmcid}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              <div style={{ background: C.greenBg, border: `1px solid ${C.green}30`, borderRadius: 9, padding: "12px 14px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.green, textTransform: "uppercase", marginBottom: 4 }}>Responder</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: C.green, letterSpacing: "-0.04em", lineHeight: 1 }}>{s.responder_fit.toFixed(3)}</div>
                <div style={{ fontSize: 11, color: C.green, marginTop: 3 }}>{s.responder_profile}</div>
              </div>
              <div style={{ background: C.redBg, border: `1px solid ${C.red}30`, borderRadius: 9, padding: "12px 14px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.red, textTransform: "uppercase", marginBottom: 4 }}>Non-Responder</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: C.red, letterSpacing: "-0.04em", lineHeight: 1 }}>{s.non_responder_fit.toFixed(3)}</div>
                <div style={{ fontSize: 11, color: C.red, marginTop: 3 }}>{s.non_responder_profile}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.surface, borderRadius: 8, padding: "10px 14px", marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.textSub }}>Score delta</span>
              <span style={{ fontSize: 20, fontWeight: 900, color: C.accent }}>{s.delta}</span>
            </div>
            <div style={{ fontSize: 12, color: C.textSub, lineHeight: 1.5, marginBottom: 8 }}>{s.published_result}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <a href={`https://doi.org/${s.published_doi}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: C.accent, textDecoration: "none" }}>doi:{s.published_doi}</a>
              <ClaimBadge type={s.claim_type} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "24px 28px", maxWidth: 720 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 10 }}>How the model works</div>
        <p style={{ fontSize: 14, color: C.textSub, lineHeight: 1.75, margin: "0 0 10px" }}>Each trial and patient profile is encoded as a 7D mechanism vector across DDR, MAPK, PI3K, VEGF, HER2, IO, and Efflux axes. The model scores alignment using a proprietary mechanism alignment method.</p>
        <p style={{ fontSize: 14, color: C.textSub, lineHeight: 1.75, margin: 0 }}>No outcome data. No LLM. No hallucination. The liver-met subgroup split (EC-07), the CEACAM5 ≥80% trend (CR-03), and the pTMB ≥28 signal (CR-16) were all recoverable from mechanism alignment alone — before seeing the published results.</p>
      </div>
    </div>
  );
}

// ── TAB 5: Sanofi Executive View ──────────────────────────────────────────────
function TabSanofi({ persona, setPersona, personaColor }) {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedGate, setExpandedGate] = useState(false);

  useEffect(() => {
    getSanofiPayload()
      .then(setPayload)
      .catch(() => setError("Could not load Sanofi executive payload"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, color: C.muted }}>Loading executive payload...</div>;
  if (error) return <div style={{ padding: 40, color: C.red }}>{error}</div>;
  if (!payload) return null;

  const activePersona = payload.personas[persona] || payload.personas["bd"];
  const pColor = PERSONA_COLORS[persona] || C.accent;

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Sanofi Oncology Partnering · Finalist Pitch · July 1, 2026</div>
        <h2 style={{ fontSize: 26, fontWeight: 900, color: C.text, margin: "0 0 8px", letterSpacing: "-0.03em" }}>Executive View</h2>
        <p style={{ fontSize: 14, color: C.textSub, margin: 0, lineHeight: 1.6 }}>Select a stakeholder persona to see the argument framed for their primary concern. All numbers sourced from ceacam5_sanofi_executive_payload_v2.json v2.1 (2026-06-03).</p>
      </div>

      {/* Persona selector (full-width in this tab) */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {Object.entries(PERSONA_LABELS).map(([id, label]) => {
          const pc = PERSONA_COLORS[id];
          const isActive = persona === id;
          return (
            <button key={id} onClick={() => setPersona(id)} style={{ flex: 1, padding: "12px 16px", borderRadius: 10, cursor: "pointer", border: `2px solid ${isActive ? pc : C.border}`, background: isActive ? `${pc}12` : C.bg, transition: "all 0.15s" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: isActive ? pc : C.textSub }}>{label}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{payload.personas[id]?.primary_concern}</div>
            </button>
          );
        })}
      </div>

      {/* Their question */}
      <div style={{ background: `${pColor}10`, border: `1.5px solid ${pColor}30`, borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: pColor, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Their Question</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text, lineHeight: 1.5, fontStyle: "italic" }}>"{activePersona.their_question}"</div>
      </div>

      {/* Key numbers */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.textSub, marginBottom: 12 }}>Key Numbers for This Audience</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {activePersona.key_numbers?.map((kn, i) => (
            <div key={i} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{kn.label}</div>
                <ClaimBadge type={kn.claim_type} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: pColor, marginBottom: 6 }}>{kn.value}</div>
              <div style={{ fontSize: 12, color: C.textSub, lineHeight: 1.5 }}>{kn.context}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Questions they will ask */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.textSub, marginBottom: 12 }}>Questions They Will Ask</div>
        {activePersona.questions?.map((q, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: pColor, minWidth: 20 }}>{i + 1}.</span>
            <span style={{ fontSize: 13, color: C.textSub, lineHeight: 1.5 }}>{q}</span>
          </div>
        ))}
      </div>

      {/* Persona-specific extra content */}
      {persona === "cfo" && activePersona.gate_economics && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
          <button onClick={() => setExpandedGate(!expandedGate)} style={{ width: "100%", padding: "14px 20px", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Gate Economics Comparison</div>
            <div style={{ fontSize: 12, color: C.muted }}>{expandedGate ? "▲ Collapse" : "▼ Expand"}</div>
          </button>
          {expandedGate && (
            <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${C.border}` }}>
              <div style={{ paddingTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                {Object.entries(activePersona.gate_economics).map(([key, gate]) => (
                  <div key={key} style={{ padding: "12px 14px", borderRadius: 8, background: C.bg, border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>{gate.gate}</div>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, color: C.textSub }}><strong>{gate.n_per_year?.toLocaleString()}</strong> pts/yr</span>
                      <span style={{ fontSize: 12, color: C.textSub }}>ORR: <strong>{gate.orr}</strong></span>
                      {gate.cost_per_responder && <span style={{ fontSize: 12, color: C.textSub }}>Cost/responder: <strong>{gate.cost_per_responder}</strong></span>}
                      {gate.reduction && <span style={{ fontSize: 12, fontWeight: 700, color: C.green }}>{gate.reduction} reduction</span>}
                    </div>
                    {gate.note && <div style={{ fontSize: 11, color: C.muted, marginTop: 4, fontStyle: "italic" }}>{gate.note}</div>}
                    <div style={{ marginTop: 6 }}><ClaimBadge type={gate.claim_type} /></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {persona === "cmo" && activePersona.weakest_links && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.textSub, marginBottom: 12 }}>Weakest Links — What the CMO Will Attack</div>
          {activePersona.weakest_links.map((wl, i) => (
            <div key={i} style={{ marginBottom: 14, padding: "12px 14px", background: C.redBg, border: `1px solid ${C.red}20`, borderRadius: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.red, marginBottom: 4 }}>Attack: {wl.attack}</div>
              <div style={{ fontSize: 12, color: C.textSub, marginBottom: 4 }}>Our number: <em>{wl.our_number}</em></div>
              <div style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>Fix: {wl.fix}</div>
            </div>
          ))}
        </div>
      )}

      {persona === "scientist" && activePersona.biomarker_dependency_map && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.textSub, marginBottom: 12 }}>Biomarker Dependency Map</div>
          {Object.entries(activePersona.biomarker_dependency_map).map(([cluster, data]) => (
            <div key={cluster} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{data.description || cluster}</div>
              {data.pairs?.map((pair, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: C.bg, borderRadius: 6, border: `1px solid ${C.border}`, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{pair.pair}</span>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {pair.rho !== undefined && <span style={{ fontSize: 12, fontWeight: 700, color: C.accent }}>ρ={pair.rho}</span>}
                    <span style={{ fontSize: 11, color: C.textSub }}>{pair.relationship}</span>
                    <ClaimBadge type={pair.claim_type} />
                  </div>
                </div>
              ))}
              {data.pair && (
                <div style={{ padding: "8px 10px", background: C.amberBg, border: `1px solid ${C.amber}30`, borderRadius: 6 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 4 }}>{data.pair}</div>
                  <div style={{ fontSize: 11, color: C.textSub }}>NSCLC: {data.nsclc}</div>
                  <div style={{ fontSize: 11, color: C.amber, fontWeight: 600 }}>CRC: {data.crc}</div>
                  <div style={{ fontSize: 11, color: C.textSub, marginTop: 4, fontStyle: "italic" }}>{data.why_it_matters}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Gate economics summary (always shown) */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.textSub, marginBottom: 12 }}>Population Funnel — All Gates</div>
        {payload.gate_economics_summary?.gates?.map((gate, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{gate.gate}</div>
              {gate.caveat && <div style={{ fontSize: 11, color: C.amber, marginTop: 2 }}>{gate.caveat}</div>}
              {gate.note && <div style={{ fontSize: 11, color: C.muted, marginTop: 2, fontStyle: "italic" }}>{gate.note}</div>}
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{gate.n_per_year?.toLocaleString()}/yr</div>
              <div style={{ fontSize: 11, color: C.textSub }}>ORR: {gate.orr}</div>
              {gate.cost_per_responder && <div style={{ fontSize: 11, color: C.green, fontWeight: 600 }}>{gate.cost_per_responder}</div>}
            </div>
          </div>
        ))}
        <div style={{ marginTop: 10, fontSize: 11, color: C.muted }}>Source: ceacam5_sanofi_executive_payload_v2.json v2.1 (2026-06-03). SEER 2024 base [CR-25].</div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const TAB_LABELS = {
  simulator:   "Gate Simulator",
  comparators: "Comparator Landscape",
  assay:       "Assay Coverage Gap",
  proof:       "Retroactive Proof",
  sanofi:      "Sanofi Executive View",
};

export default function Ceacam5Page() {
  const [activeTab, setActiveTab] = useState("simulator");
  const [activePersona, setActivePersona] = useState(null); // null = no persona selected
  const [sanofiPersonas, setSanofiPersonas] = useState(null);

  // Fetch persona data once
  useEffect(() => {
    getSanofiPayload()
      .then((p) => setSanofiPersonas(p.personas))
      .catch(() => {});
  }, []);

  const personaData = activePersona && sanofiPersonas ? sanofiPersonas[activePersona] : null;
  const personaColor = activePersona ? PERSONA_COLORS[activePersona] : C.accent;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif", WebkitFontSmoothing: "antialiased" }}>
      {/* Header */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", background: C.bg, position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, background: C.accent, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: 14 }}>C</span>
          </div>
          <div>
            <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.03em", color: C.text }}>CrisPRO</span>
            <span style={{ fontSize: 13, color: C.muted, marginLeft: 8 }}>CEACAM5 Intelligence</span>
          </div>
          <a href="/demo" style={{ marginLeft: 12, fontSize: 12, color: C.muted, textDecoration: "none", padding: "4px 10px", borderRadius: 6, border: `1px solid ${C.border}` }}>← 8D Simulator</a>
        </div>

        {/* Center: Tab bar */}
        <div style={{ display: "flex", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 3, gap: 2 }}>
          {Object.entries(TAB_LABELS).map(([tab, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "5px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "none", background: activeTab === tab ? "#fff" : "transparent", color: activeTab === tab ? C.text : C.muted, boxShadow: activeTab === tab ? "0 1px 3px rgba(0,0,0,0.08)" : "none", transition: "all 0.15s", whiteSpace: "nowrap" }}>
              {label}
              {tab === "sanofi" && <span style={{ marginLeft: 4, fontSize: 8, fontWeight: 800, background: C.yellow, color: "#000", padding: "1px 4px", borderRadius: 3 }}>NEW</span>}
            </button>
          ))}
        </div>

        {/* Right: Persona selector + badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 3, gap: 2 }}>
            <button onClick={() => setActivePersona(null)} style={{ padding: "4px 10px", borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "none", background: !activePersona ? "#fff" : "transparent", color: !activePersona ? C.text : C.muted, transition: "all 0.15s" }}>All</button>
            {Object.entries(PERSONA_LABELS).map(([id, label]) => {
              const pc = PERSONA_COLORS[id];
              const isActive = activePersona === id;
              return (
                <button key={id} onClick={() => setActivePersona(isActive ? null : id)} style={{ padding: "4px 10px", borderRadius: 5, fontSize: 11, fontWeight: 700, cursor: "pointer", border: "none", background: isActive ? `${pc}18` : "transparent", color: isActive ? pc : C.muted, transition: "all 0.15s" }}>
                  {label}
                </button>
              );
            })}
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, background: C.amberBg, color: C.amber, padding: "3px 8px", borderRadius: 4, textTransform: "uppercase" }}>Brenus / STC-1010</div>
          <div style={{ fontSize: 11, color: C.faint }}>Research Use Only</div>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "simulator"   && <TabGateSimulator persona={activePersona} personaData={personaData} personaColor={personaColor} />}
      {activeTab === "comparators" && <TabComparators persona={activePersona} personaData={personaData} personaColor={personaColor} />}
      {activeTab === "assay"       && <TabAssayGap persona={activePersona} personaData={personaData} personaColor={personaColor} />}
      {activeTab === "proof"       && <TabProof />}
      {activeTab === "sanofi"      && <TabSanofi persona={activePersona || "bd"} setPersona={setActivePersona} personaColor={personaColor} />}
    </div>
  );
}
