/**
 * Patient Gates / Data Completeness
 *
 * Dashboard-side gating that mirrors the backend idea of “confidence caps”:
 * the UI should encourage the patient to upload/confirm more data to unlock
 * higher-confidence outputs safely.
 */

export const IntakeLevel = {
  L0: "L0",
  L1: "L1",
  L2: "L2",
};

function truthy(v) {
  return v !== null && v !== undefined && v !== "" && v !== "UNKNOWN";
}

export function computePatientIntake(profile) {
  // Minimal data: disease only
  const hasDisease = truthy(profile?.disease?.type) && truthy(profile?.disease?.stage);

  // Partial data: biomarkers OR mutations
  const b = profile?.tumor_context?.biomarkers || {};
  const hasBiomarkers =
    truthy(b?.pd_l1_status) ||
    truthy(b?.mmr_status) ||
    truthy(b?.p53_status) ||
    truthy(b?.er_status) ||
    truthy(b?.her2_status);

  const hasMutationSignals = Array.isArray(profile?.tumor_context?.somatic_mutations) &&
    profile.tumor_context.somatic_mutations.length > 0;

  // Full data: biomarkers + structured genomics OR additional high-value lab signals
  const hasNGS =
    hasMutationSignals &&
    profile.tumor_context.somatic_mutations.some((m) => truthy(m?.gene) && (truthy(m?.hgvs_p) || truthy(m?.variant)));

  const hasCA125 = truthy(profile?.labs?.ca125_value);
  const hasImaging = truthy(profile?.imaging?.ct_abdomen_pelvis_2025_10_28?.performed_date);

  let level = IntakeLevel.L0;
  if (hasDisease && (hasBiomarkers || hasMutationSignals || hasImaging)) level = IntakeLevel.L1;
  if (hasDisease && hasBiomarkers && (hasNGS || hasCA125)) level = IntakeLevel.L2;

  const confidenceCap = level === IntakeLevel.L2 ? 0.8 : level === IntakeLevel.L1 ? 0.6 : 0.4;

  return {
    level,
    confidenceCap,
    signals: {
      hasDisease,
      hasBiomarkers,
      hasMutationSignals,
      hasNGS,
      hasCA125,
      hasImaging,
    },
  };
}

export function getUnlockTasks(profile) {
  const intake = computePatientIntake(profile);
  const tasks = [];

  // Always encourage confirmation of inferred fields
  const inferred = profile?.inferred_fields || {};
  const inferredKeys = Object.keys(inferred);
  if (inferredKeys.length) {
    tasks.push({
      id: "confirm_inferred",
      title: "Confirm key facts we inferred",
      description: "Confirm treatment line and germline status so we can safely remove conservative caps.",
      cta: { label: "Review & confirm", to: "/patient/onboarding" },
      status: "recommended",
    });
  }

  if (!intake.signals.hasCA125) {
    tasks.push({
      id: "upload_ca125",
      title: "Add CA-125 (baseline + latest)",
      description: "Unlock response forecasting + resistance early-warning using trends.",
      cta: { label: "Add labs", to: "/patient/profile" },
      status: "locked",
    });
  }

  if (!intake.signals.hasNGS) {
    tasks.push({
      id: "upload_ngs",
      title: "Upload NGS / somatic mutation report",
      description: "Unlock high-confidence drug ranking (S/P/E) and deeper resistance modeling.",
      cta: { label: "Start upload", to: "/patient/onboarding" },
      status: "locked",
    });
  }

  if (!intake.signals.hasImaging) {
    tasks.push({
      id: "upload_imaging",
      title: "Upload imaging summary / reports",
      description: "Improves staging context and trial filtering confidence.",
      cta: { label: "Add imaging", to: "/patient/onboarding" },
      status: "recommended",
    });
  }

  return { intake, tasks };
}

export function buildAyeshaCompleteCareV2Request(profile) {
  const inferred = profile?.inferred_fields || {};
  const stage = profile?.disease?.stage;
  const treatmentLine = inferred?.treatment_line?.value || null;
  // Check top-level germline_status first (from actual test results), then inferred fields
  const germlineStatus = profile?.germline_status || inferred?.germline_status?.value || profile?.germline?.status?.toLowerCase() || null;

  const tc = profile?.tumor_context || {};
  const biomarkers = tc?.biomarkers || {};

  return {
    // Required-ish fields for /api/ayesha/complete_care_v2
    stage,
    treatment_line: treatmentLine || "either",
    germline_status: germlineStatus || "unknown",
    location_state: profile?.patient?.demographics?.location_state || "NY",
    has_ascites: !!profile?.clinical?.has_ascites,
    has_peritoneal_disease: !!profile?.clinical?.has_peritoneal_disease,

    // Optional
    ca125_value: profile?.labs?.ca125_value ?? 0,
    ecog_status: profile?.clinical?.ecog_status ?? null,

    // Tumor context (pre-NGS: we pass the biomarker fields we have)
    tumor_context: {
      p53_status: biomarkers?.p53_status || undefined,
      pd_l1: biomarkers?.pd_l1_cps ? { cps: biomarkers.pd_l1_cps, status: biomarkers.pd_l1_status } : undefined,
      er_percent: biomarkers?.er_percent ?? undefined,
      er_status: biomarkers?.er_status || undefined,
      pr_status: biomarkers?.pr_status || undefined,
      mmr_status: biomarkers?.mmr_status || undefined,
      her2_status: biomarkers?.her2_status || undefined,
      folr1_status: biomarkers?.folr1_status || undefined,
      ntrk_status: biomarkers?.ntrk_status || undefined,
      // Keep somatic_mutations as best-effort
      somatic_mutations: Array.isArray(tc?.somatic_mutations) ? tc.somatic_mutations : undefined,
    },

    // Enable the “game”: always request all capabilities; backend will return awaiting_ngs / partials where gated.
    include_trials: true,
    include_soc: true,
    include_ca125: true,
    include_wiwfm: true,
    include_food: false,
    include_resistance: true,
    include_resistance_prediction: false,
    max_trials: 10,
  };
}

