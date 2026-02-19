/**
 * Tests page constants and utility functions.
 * Mars rules: every label, every explanation, every scenario name
 * must be readable by a patient with zero oncology background.
 */
import type { AxisCoverage } from "../../../logic/axisCoverage";
import { CANONICAL_MISSING_STRINGS } from "../../../logic/axisCoverage";

// ---------------------------------------------------------------------------
// Axis metadata (icons + labels)
// ---------------------------------------------------------------------------
export const AXIS_LABELS: Record<string, { title: string; plain: string; icon: string }> = {
    DDR: { title: "DDR", plain: "DNA repair", icon: "🧬" },
    MAPK: { title: "MAPK", plain: "Growth signaling", icon: "📡" },
    PI3K: { title: "PI3K", plain: "Survival signaling", icon: "🔬" },
    VEGF: { title: "VEGF", plain: "Blood vessel growth", icon: "🩸" },
    HER2: { title: "HER2", plain: "HER2 axis", icon: "🎯" },
    IO: { title: "IO", plain: "Immune / inflammation", icon: "🛡️" },
    Efflux: { title: "Efflux", plain: "Drug transport (efflux)", icon: "💊" },
};

// ---------------------------------------------------------------------------
// Axis patient stories — what each pathway means FOR THE PATIENT
// ---------------------------------------------------------------------------
export const AXIS_PATIENT_STORIES: Record<string, {
    whatItIs: string;
    whenHigh: string;
    whenLow: string;
    notTested: string;
}> = {
    DDR: {
        whatItIs: "How well your tumor can repair its own DNA",
        whenHigh: "High genomic instability detected. This suggests the tumor's DNA repair mechanisms are compromised.",
        whenLow: "Genomic profile suggests intact DNA repair mechanisms.",
        notTested: "We haven't checked this yet. An HRD test would measure DNA repair deficiency.",
    },
    IO: {
        whatItIs: "How visible your tumor is to your immune system",
        whenHigh: "Elevated immune biomarkers detected. The tumor microenvironment shows signs of inflammation.",
        whenLow: "Immune signals are low. The tumor appears to be in an immune-quiet state.",
        notTested: "We need TMB and PD-L1 testing to characterize the immune profile.",
    },
    VEGF: {
        whatItIs: "Whether your tumor is growing new blood vessels to feed itself",
        whenHigh: "Active angiogenesis signals detected. The tumor shows high expression of blood vessel growth factors.",
        whenLow: "Angiogenesis signals are low.",
        notTested: "RNA expression testing would measure angiogenesis markers.",
    },
    Efflux: {
        whatItIs: "Whether your tumor has 'pumps' that can push drugs back out",
        whenHigh: "High expression of drug efflux pumps detected.",
        whenLow: "Drug transport markers appear normal.",
        notTested: "Expression testing for ABCB1/MDR1 would measure this.",
    },
    MAPK: {
        whatItIs: "A growth signaling pathway that tells cancer cells to multiply",
        whenHigh: "MAPK pathway activation detected. The tumor shows signs of improved growth signaling.",
        whenLow: "MAPK signaling appears baseline.",
        notTested: "Somatic mutation testing would check for BRAF/KRAS/NRAS mutations.",
    },
    PI3K: {
        whatItIs: "A survival pathway that helps cancer cells resist cell death",
        whenHigh: "PI3K pathway activation detected.",
        whenLow: "PI3K signaling appears baseline.",
        notTested: "Mutation testing for PIK3CA would check this pathway.",
    },
    HER2: {
        whatItIs: "Whether your tumor overexpresses the HER2 protein",
        whenHigh: "HER2 overexpression or amplification detected.",
        whenLow: "HER2 levels appear normal.",
        notTested: "IHC/FISH testing checks for HER2 status.",
    },
};

// ---------------------------------------------------------------------------
// Scenario stories — human-readable names for every scenario ID
// ---------------------------------------------------------------------------
export const SCENARIO_STORIES: Record<string, { label: string; desc: string; color: string }> = {
    // L2 scenarios
    "L2A_HRDhi_TMBhi": { label: "Strong repair deficiency + high mutations", desc: "DNA repair is broken and mutation load is high — best chance for targeted + immunotherapy", color: "#22c55e" },
    "L2B_HRDlowTMBlow": { label: "Repair intact, low mutations", desc: "Standard profile — fewer targeted options, broader chemotherapy likely indicated", color: "#f59e0b" },
    "L2C_HRDhiTMBlow": { label: "Repair deficient only", desc: "DNA repair is broken but mutation count is low — PARP inhibitors may work", color: "#3b82f6" },
    "L2D_HRDlowTMBhigh": { label: "High mutations only", desc: "High mutation burden may trigger immune response — immunotherapy candidate", color: "#8b5cf6" },
    "L2K_BestCase_Kinetic": { label: "Best possible outcome", desc: "All favorable markers present — strongest therapy options available", color: "#22c55e" },
    "L2K_WorstCase_Kinetic": { label: "Drug resistance present", desc: "Resistance markers detected — requires careful therapy selection to overcome resistance", color: "#ef4444" },
    "L2K_RARAlphaGOF": { label: "RARA pathway active", desc: "Retinoid pathway mutation found — emerging treatment options being studied", color: "#06b6d4" },
    // L3 scenarios
    "L3A_VEGFhigh_CA125high": { label: "High blood vessel growth + elevated CA-125", desc: "Active tumor blood vessel supply + elevated marker — anti-VEGF therapy + monitoring", color: "#ef4444" },
    "L3B_Efflux/CA125high": { label: "Drug resistance pumps active", desc: "Drug efflux pumps detected — may reduce chemotherapy effectiveness", color: "#f59e0b" },
    "L3C_Inflamed_CA125low": { label: "Immune-active tumor, stable markers", desc: "Inflammatory signals present with stable CA-125 — immunotherapy candidate", color: "#22c55e" },
};

export function getScenarioStory(id: string): { label: string; desc: string; color: string } {
    return SCENARIO_STORIES[id] || { label: id, desc: "Research scenario", color: "#94a3b8" };
}

// ---------------------------------------------------------------------------
// Missing data explanations (patient-friendly)
// ---------------------------------------------------------------------------
export const MISSING_EXPLANATIONS: Record<string, { what: string; unlocks: string }> = {
    [CANONICAL_MISSING_STRINGS.NGS_COORDS]: {
        what: "Tumor NGS with genomic coordinates for somatic variants.",
        unlocks: "Unlocks mutation-level pathway analysis.",
    },
    [CANONICAL_MISSING_STRINGS.HRD]: {
        what: "HRD score — checks if your tumor's DNA repair is broken.",
        unlocks: "Tells us if PARP inhibitors (Olaparib) could work.",
    },
    [CANONICAL_MISSING_STRINGS.TMB]: {
        what: "TMB — counts how many mutations your tumor has.",
        unlocks: "Tells us if immunotherapy might trigger an immune response.",
    },
    [CANONICAL_MISSING_STRINGS.RNA]: {
        what: "RNA expression panel — shows which genes are actively turned on.",
        unlocks: "Reveals blood vessel growth, drug pumps, and immune signals.",
    },
    [CANONICAL_MISSING_STRINGS.CA125]: {
        what: "CA-125 blood test — a tumor marker for monitoring.",
        unlocks: "Enables treatment response tracking over time.",
    },
};

// ---------------------------------------------------------------------------
// Rendering utilities
// ---------------------------------------------------------------------------
export function formatAxisTitle(axis: string): string {
    const label = AXIS_LABELS[axis];
    return label ? `${label.icon} ${label.title} — ${label.plain}` : axis;
}

export function formatAxisTitleShort(axis: string): string {
    const label = AXIS_LABELS[axis];
    return label ? `${label.title}` : axis;
}

export function getAxisIcon(axis: string): string {
    return AXIS_LABELS[axis]?.icon || "📊";
}

export function getAxisPlainName(axis: string): string {
    return AXIS_LABELS[axis]?.plain || axis;
}

export function renderStatusLabel(row: AxisCoverage): { label: string; color: "success" | "warning" | "info" | "default" | "error" } {
    if (row.status === "High") return { label: "High", color: "success" };
    if (row.status === "Neutral") return { label: "Neutral", color: "warning" };
    if (row.status === "Low") return { label: "Low", color: "info" };
    return { label: "Unknown", color: "default" };
}

export function topMissing(missing: string[], n = 3): string[] {
    return missing.slice(0, n);
}

// ---------------------------------------------------------------------------
// Safe array helper
// ---------------------------------------------------------------------------
export function safeArray<T = any>(v: any): T[] {
    return Array.isArray(v) ? v : [];
}

export function asStr(v: any): string {
    if (v == null) return "";
    if (typeof v === "string") return v;
    try { return JSON.stringify(v); } catch { return String(v); }
}

// ---------------------------------------------------------------------------
// Axis card mode determination
// ---------------------------------------------------------------------------
export type AxisCardMode = "signal" | "quiet" | "not-tested";

export function getAxisCardMode(row: AxisCoverage): AxisCardMode {
    if (!row.evaluable || row.status === "Unknown") return "not-tested";
    const val = row.evidence.kind !== "none" ? (row.evidence as any).rawValue : null;
    if (val === null || val === undefined || val === 0) return "not-tested";
    if (val >= 0.4) return "signal";
    return "quiet";
}
