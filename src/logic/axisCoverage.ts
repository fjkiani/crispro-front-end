export type AxisStatus = "High" | "Neutral" | "Low" | "Unknown";

export type AxisEvidence =
  | { kind: "pathway_scores"; rawValue: number; path: string; note?: string }
  | { kind: "mechanism_panel"; rawValue: number; path: string; note: "Preview/Scenario-derived" }
  | { kind: "expected_mechanism"; rawValue: number; path: string; note: "Context-derived (biomarker mapping)" }
  | { kind: "none"; note: "Insufficient structured data" };

export type AxisCoverage = {
  axis: string;
  evaluable: boolean;
  status: AxisStatus;
  evidence: AxisEvidence;
  missingData: string[];
  recommendedTest: string | null;
};

export type CompletenessLike = {
  missing?: string[];
};

export type MechanismPanelLike = {
  // Backend key spellings vary; support the known ones (no new invented fields).
  mechanism_axes?: string[];
  mechanismAxes?: string[];
  mechanismaxes?: string[];
  current_mechanism_vector?: number[];
  currentMechanismVector?: number[];
  currentmechanismvector?: number[];
};

export type ExpectedMechanismLike = {
  mechanism_axes?: string[];
  expected_mechanism_vector?: number[];
  mechanism_alignment?: Record<string, number>;
  top_axes?: Array<{ axis: string; value: number }>;
  inputs_used?: Record<string, Record<string, any>>;
  burden_flag?: string | null;
  provenance?: {
    source?: string;
    method?: string;
    ruo_disclaimer?: string;
    version?: string;
    scenario_version_hash?: string;
  };
};

const CANONICAL_AXES = ["DDR", "MAPK", "PI3K", "VEGF", "HER2", "IO", "Efflux"] as const;

export const CANONICAL_MISSING_STRINGS = {
  NGS_COORDS: "NGS somatic genomic coordinates",
  HRD: "HRD score",
  TMB: "TMB score",
  RNA: "RNA expression data",
  CA125: "CA-125 lab values",
} as const;

function safeArray<T = any>(v: any): T[] {
  return Array.isArray(v) ? v : [];
}

function getNumeric(v: any): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalizeAxisKey(axis: string): string {
  return String(axis || "").trim().toLowerCase();
}

function scoreToStatus01(score: number): AxisStatus {
  // Deterministic, UI-only binning for 0–1 scores.
  // We reuse the existing "bin" thresholds already used in DDRBinGauge:
  // high >= 0.7, medium >= 0.4, else low.
  if (score >= 0.7) return "High";
  if (score >= 0.4) return "Neutral";
  return "Low";
}

function pickRecommendedTest(missing: string[]): string | null {
  // Deterministic priority order for "what unlocks richer levels":
  // L2 gate: NGS coords + HRD + TMB
  // L3 gate: RNA + CA-125
  const s = new Set(missing);
  if (s.has(CANONICAL_MISSING_STRINGS.NGS_COORDS)) return CANONICAL_MISSING_STRINGS.NGS_COORDS;
  if (s.has(CANONICAL_MISSING_STRINGS.HRD)) return CANONICAL_MISSING_STRINGS.HRD;
  if (s.has(CANONICAL_MISSING_STRINGS.TMB)) return CANONICAL_MISSING_STRINGS.TMB;
  if (s.has(CANONICAL_MISSING_STRINGS.RNA)) return CANONICAL_MISSING_STRINGS.RNA;
  if (s.has(CANONICAL_MISSING_STRINGS.CA125)) return CANONICAL_MISSING_STRINGS.CA125;
  return null;
}

function readPathwayScoreForAxis(pathwayScores: Record<string, unknown> | null | undefined, axis: string): number | null {
  const obj = (pathwayScores && typeof pathwayScores === "object") ? pathwayScores : {};
  const axisKey = normalizeAxisKey(axis);

  // Accept common key shapes without guessing new biology:
  // { ddr: 0.5 } or { DDR: 0.5 } or { pathway_ddr: 0.5 }
  const candidates = [
    axisKey,
    axisKey.toUpperCase(),
    `pathway_${axisKey}`,
    `pathway_${axisKey.toUpperCase()}`,
    `pathway_burden_${axisKey}`,
    `pathway_burden_${axisKey.toUpperCase()}`,
  ];

  for (const k of candidates) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      return getNumeric((obj as any)[k]);
    }
  }
  return null;
}

function readMechanismPanelValue(panel: MechanismPanelLike | null | undefined, axis: string): { value: number | null; path: string } {
  const axes = safeArray<string>(panel?.mechanism_axes ?? panel?.mechanismAxes ?? panel?.mechanismaxes);
  const vec = safeArray<number>(panel?.current_mechanism_vector ?? panel?.currentMechanismVector ?? panel?.currentmechanismvector);
  if (!axes.length || !vec.length) return { value: null, path: "mechanism_panel.current_mechanism_vector[?]" };

  const idx = axes.findIndex((a) => normalizeAxisKey(a) === normalizeAxisKey(axis));
  if (idx < 0) return { value: null, path: "mechanism_panel.current_mechanism_vector[axisIndex]" };
  const v = vec[idx];
  const num = getNumeric(v);
  return { value: num, path: `mechanism_panel.current_mechanism_vector[${idx}]` };
}

export function getCanonicalAxesFromMechanismPanel(panel: MechanismPanelLike | null | undefined): string[] {
  const axes = safeArray<string>(panel?.mechanism_axes ?? panel?.mechanismAxes ?? panel?.mechanismaxes).filter(Boolean);
  if (axes.length) return axes;
  // Fallback: fixed canonical list (UI still functions even if scenario payload omits mechanism_axes).
  return Array.from(CANONICAL_AXES);
}

function readExpectedMechanismValue(
  panel: ExpectedMechanismLike | null | undefined,
  axis: string
): { value: number | null; path: string } {
  const alignment = panel?.mechanism_alignment;
  if (alignment && typeof alignment === "object") {
    const axisKey = normalizeAxisKey(axis);
    // Try direct match (DDR) and lowercase (ddr)
    for (const k of [axis, axisKey, axis.toUpperCase()]) {
      if (Object.prototype.hasOwnProperty.call(alignment, k)) {
        const num = getNumeric((alignment as any)[k]);
        if (num !== null) {
          return { value: num, path: `expected_mechanism.mechanism_alignment.${k}` };
        }
      }
    }
  }
  // Fallback to vector
  const axes = safeArray<string>(panel?.mechanism_axes);
  const vec = safeArray<number>(panel?.expected_mechanism_vector);
  if (axes.length && vec.length) {
    const idx = axes.findIndex((a) => normalizeAxisKey(a) === normalizeAxisKey(axis));
    if (idx >= 0) {
      const num = getNumeric(vec[idx]);
      return { value: num, path: `expected_mechanism.expected_mechanism_vector[${idx}]` };
    }
  }
  return { value: null, path: "expected_mechanism[?]" };
}

export function computeAxisCoverage({
  mechanismPanel,
  pathwayScores,
  completeness,
  expectedMechanism,
}: {
  mechanismPanel?: MechanismPanelLike | null;
  pathwayScores?: Record<string, unknown> | null;
  completeness?: CompletenessLike | null;
  expectedMechanism?: ExpectedMechanismLike | null;
}): AxisCoverage[] {
  const missing = safeArray<string>(completeness?.missing);
  const axes = getCanonicalAxesFromMechanismPanel(mechanismPanel);

  return axes.map((axis) => {
    // 0) Highest priority: expected_mechanism (context-derived biomarker mapping)
    if (expectedMechanism) {
      const em = readExpectedMechanismValue(expectedMechanism, axis);
      if (em.value !== null) {
        return {
          axis,
          evaluable: true,
          status: scoreToStatus01(em.value),
          evidence: { kind: "expected_mechanism" as const, rawValue: em.value, path: em.path, note: "Context-derived (biomarker mapping)" as const },
          missingData: [],
          recommendedTest: null,
        };
      }
    }

    // 1) Prefer pathway_scores if present.
    const ps = readPathwayScoreForAxis(pathwayScores || {}, axis);
    if (ps !== null) {
      return {
        axis,
        evaluable: true,
        status: scoreToStatus01(ps),
        evidence: { kind: "pathway_scores" as const, rawValue: ps, path: `pathway_scores.${normalizeAxisKey(axis)}` },
        missingData: [],
        recommendedTest: null,
      };
    }

    // 2) Else use mechanism_panel current vector if present.
    const mp = readMechanismPanelValue(mechanismPanel || {}, axis);
    if (mp.value !== null) {
      return {
        axis,
        evaluable: true,
        status: scoreToStatus01(mp.value),
        evidence: { kind: "mechanism_panel" as const, rawValue: mp.value, path: mp.path, note: "Preview/Scenario-derived" as const },
        missingData: [],
        recommendedTest: null,
      };
    }

    // 3) Unknown.
    return {
      axis,
      evaluable: false,
      status: "Unknown" as const,
      evidence: { kind: "none" as const, note: "Insufficient structured data" as const },
      missingData: missing.slice(),
      recommendedTest: pickRecommendedTest(missing),
    };
  });
}

