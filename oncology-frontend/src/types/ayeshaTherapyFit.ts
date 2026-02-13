export type TherapyFitLevelKey = "L1" | "L2" | "L3";

export type LabelStatus = "ON_LABEL" | "OFF_LABEL" | "UNKNOWN";

export type EvidenceTier = "supported" | "consider" | "insufficient" | "unknown" | string;

export type ClinicalBand =
  | "A (Preferred)"
  | "B (Good)"
  | "C (Consider)"
  | "D (Low/VUS)"
  | string;

export type RuoReason =
  | "off-label"
  | "unknown-label"
  | "no-citations"
  | "low-evidence"
  | string
  | null;

export interface DrugCard {
  name: string;
  efficacy_score: number;
  confidence: number;
  evidence_tier: EvidenceTier;
  badges: string[];
  citations_count: number;
  clinical_band: ClinicalBand;
  label_status: LabelStatus;
  ruo_reason: RuoReason;
}

export interface EscapeWarning {
  axis: string;
  severity: "high" | "watch" | string;
  note: string;
}

/**
 * Raw mechanism panel as returned by `/api/ayesha/therapy-fit/scenarios`.
 * (This is the current backend shape and the one used in Example C.)
 */
export interface MechanismPanelRaw {
  mechanism_axes: string[];
  baseline_mechanism_vector: number[];
  current_mechanism_vector: number[];
  mechanism_delta: number[];
  escape_warnings: EscapeWarning[];
  provenance: Record<string, unknown>;

  // Extra fields currently present (optional for forward-compat)
  targeted_axes?: string[];
  mechanism_top_axes?: Array<{ axis: string; value: number }>;
  mechanism_alignment?: Record<string, number>;
}

/**
 * Normalized mechanism panel for UI consumption.
 * If you use this shape, normalize from `MechanismPanelRaw`:
 * - axes = mechanism_axes
 * - baseline = baseline_mechanism_vector
 * - current = current_mechanism_vector
 * - delta = mechanism_delta
 */
export interface MechanismPanel {
  axes: string[];
  baseline: number[];
  current: number[];
  delta: number[];
  escape_warnings: EscapeWarning[];
  provenance: Record<string, unknown>;
}

export interface ScenarioPreviewTopKItem {
  name: string;
  efficacy_score: number;
  confidence: number;
  evidence_tier: EvidenceTier;
  clinical_band: ClinicalBand;
  badges: string[];
}

export interface ScenarioPreview {
  top_drug: string | null;
  efficacy_score: number;
  confidence: "Low" | "Medium" | "High" | string;
  evidence_tier: EvidenceTier;
  citations_count: number;
  badges: string[];
  rationale: string | null;
  top_k: ScenarioPreviewTopKItem[];
}

export interface ScenarioCardBase {
  id: string;
  name: string;
  locked: boolean;
  requires: string[];
  meta: Record<string, unknown>;
}

export interface ScenarioCardL2 extends ScenarioCardBase {
  preview: ScenarioPreview | null;
  mechanism_panel: MechanismPanelRaw | null;
  preview_status: string;
}

export interface ScenarioMatrixEntry {
  status: string;
  generated_at: string | null;
  ttl_seconds: number;
  scenario_version_hash: string;
  pipeline_version_hash: string;
  error: string | null;
  preview: ScenarioPreview | null;
  mechanism_panel: MechanismPanelRaw | null;
}

export interface ScenarioCardL3 extends ScenarioCardBase {
  preview_matrix: {
    by_l2: Record<string, ScenarioMatrixEntry | null>;
  };
}

export type ScenarioCard = ScenarioCardL2 | ScenarioCardL3;

export interface PreviewCacheMeta {
  status: "empty" | "computing" | "stale" | "ok" | "degraded" | string;
  generated_at: string | null;
  ttl_seconds: number;
  scenario_version_hash: string | null;
  pipeline_version_hash: string | null;
  errors: Array<Record<string, unknown>>;
}

export interface ScenariosResponse {
  l2_scenarios: ScenarioCardL2[];
  l3_scenarios: ScenarioCardL3[];
  preview_cache: PreviewCacheMeta;
}

export type DrugQueryNotFound = {
  found: false;
  message: "not found in drug panel" | string;
};

export type DrugQueryFound = {
  found: true;
  drug: DrugCard & Record<string, unknown>;
};

export type DrugQueryLevelResult = DrugQueryFound | DrugQueryNotFound;

export type DrugQueryResponse = {
  drug_query: string;
} & Partial<Record<TherapyFitLevelKey, DrugQueryLevelResult>>;

export interface AnalyzeLevelResponse {
  drugs: Array<DrugCard & Record<string, unknown>>;
  pathway_scores: Record<string, unknown>;
  provenance: Record<string, unknown>;
}

export type AnalyzeResponse = Partial<Record<TherapyFitLevelKey, AnalyzeLevelResponse>>;

export interface PanelCatalogDrug {
  name: string;
  evidence_tier: EvidenceTier;
  badges: string[];
  citations_count: number;
  label_status: LabelStatus;
}

export type PanelCatalogResponse = {
  generated_at?: string;
} & Partial<Record<TherapyFitLevelKey, { drugs: PanelCatalogDrug[] }>>;

