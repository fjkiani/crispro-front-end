import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import HolisticScoreCard from "../../components/trials/HolisticScoreCard";
import { useAyeshaTherapyFitBundle } from "../../hooks/useAyeshaTherapyFitBundle";

const API_ROOT = import.meta.env.VITE_API_ROOT || "http://127.0.0.1:8000";

const DIMENSIONS = [
  { key: "ddr", label: "DDR" },
  { key: "mapk", label: "MAPK" },
  { key: "pi3k", label: "PI3K" },
  { key: "vegf", label: "VEGF" },
  { key: "her2", label: "HER2" },
  { key: "io", label: "IO" },
  { key: "efflux", label: "Efflux" },
];

function clamp01(x) {
  if (x === null || x === undefined) return null;
  const n = Number(x);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(1, n));
}

function buildVectorFromTherapyFit({ pathwayScores, tumorContext }) {
  const ps = pathwayScores && typeof pathwayScores === "object" ? pathwayScores : {};
  const tc = tumorContext && typeof tumorContext === "object" ? tumorContext : {};

  // Pathway scores are the best current “grounded” signal we have for mechanism,
  // because they are downstream of Evo2-driven sequence scoring + pathway aggregation.
  const ddr = clamp01(ps.ddr ?? ps.pathway_ddr ?? ps.pathway_burden_ddr);
  const mapk = clamp01(ps.mapk ?? ps.pathway_mapk ?? ps.pathway_burden_mapk);
  const pi3k = clamp01(ps.pi3k ?? ps.pathway_pi3k ?? ps.pathway_burden_pi3k);
  const vegf = clamp01(ps.vegf ?? ps.pathway_vegf ?? ps.pathway_burden_vegf);
  const her2 = clamp01(ps.her2 ?? ps.pathway_her2 ?? ps.pathway_burden_her2);

  // IO is tumor-context driven (TMB/MSI). If unknown, keep it null (honest UI).
  const tmb = tc.tmb ?? tc.tmb_score;
  const msi = tc.msi_status ?? tc.msi;
  let io = null;
  if (tmb !== undefined || msi !== undefined) {
    const tmbHigh = Number.isFinite(Number(tmb)) && Number(tmb) >= 20;
    const msiHigh = String(msi || "").toUpperCase() === "MSI-HIGH" || String(msi || "") === "MSI-High";
    io = tmbHigh || msiHigh ? 1.0 : 0.0;
  }

  // Efflux is currently a proxy. If treatment history exists elsewhere, we can upgrade this.
  // For now, keep it conservative (0.0) unless explicitly provided.
  const efflux = clamp01(ps.efflux ?? ps.pathway_efflux) ?? 0.0;

  const vector = { ddr, mapk, pi3k, vegf, her2, io, efflux };
  return vector;
}

export default function AyeshaHolisticScoring() {
  const { data: bundle, isLoading: bundleLoading, error: bundleError } = useAyeshaTherapyFitBundle({ level: "l1" });

  const [vectorMode, setVectorMode] = useState("auto"); // auto | manual
  const [manualVector, setManualVector] = useState(() =>
    DIMENSIONS.reduce((acc, d) => ({ ...acc, [d.key]: "" }), {})
  );
  const [loadingTrials, setLoadingTrials] = useState(false);
  const [trialsError, setTrialsError] = useState(null);
  const [trialsResponse, setTrialsResponse] = useState(null);

  const therapyFitPathwayScores = bundle?.levels?.L1?.pathway_scores || bundle?.levels?.l1?.pathway_scores || {};
  const patientContext = bundle?.patient_context || {};
  const tumorContext = patientContext?.tumor_context || {};

  const autoVector = useMemo(() => {
    return buildVectorFromTherapyFit({ pathwayScores: therapyFitPathwayScores, tumorContext });
  }, [therapyFitPathwayScores, tumorContext]);

  const effectiveVector = useMemo(() => {
    if (vectorMode === "auto") return autoVector;
    const out = {};
    for (const d of DIMENSIONS) {
      const v = clamp01(manualVector[d.key]);
      out[d.key] = v;
    }
    return out;
  }, [vectorMode, autoVector, manualVector]);

  const vectorCompleteness = useMemo(() => {
    const vals = DIMENSIONS.map((d) => effectiveVector[d.key]);
    const present = vals.filter((v) => typeof v === "number" && Number.isFinite(v)).length;
    return { present, total: DIMENSIONS.length };
  }, [effectiveVector]);

  const vectorSourceLabel = vectorMode === "auto"
    ? "Auto (derived from therapy-fit pathway scores + tumor context)"
    : "Manual (user-entered)";

  const inputsChecklist = useMemo(() => {
    const hasTmb = tumorContext?.tmb_score !== undefined || tumorContext?.tmb !== undefined;
    const hasMsi = tumorContext?.msi_status !== undefined || tumorContext?.msi !== undefined;
    const hasHrd = tumorContext?.hrd_score !== undefined;
    const hasSomatic = Array.isArray(tumorContext?.somatic_mutations) && tumorContext.somatic_mutations.length > 0;
    const hasGermlinePgx = Array.isArray(patientContext?.germline_variants) && patientContext.germline_variants.length > 0;
    const hasCa125 = patientContext?.ca125_value !== undefined || patientContext?.ca125 !== undefined;

    return [
      { label: "Tumor NGS (somatic mutations + report JSON)", have: hasSomatic, why: "Needed for true mechanism & resistance features." },
      { label: "HRD score", have: hasHrd, why: "Gates PARP-axis and DDR confidence." },
      { label: "TMB score", have: hasTmb, why: "Supports IO eligibility (IO axis)." },
      { label: "MSI status", have: hasMsi, why: "Supports IO eligibility (IO axis)." },
      { label: "PGx germline variants (DPYD/UGT1A1/TPMT/etc.)", have: hasGermlinePgx, why: "Enables PGx safety term (contraindications/dose)." },
      { label: "CA-125 (baseline + trend)", have: hasCa125, why: "Improves resistance/monitoring terms when present." },
    ];
  }, [tumorContext, patientContext]);

  const runHolisticTrials = async () => {
    setTrialsError(null);
    setTrialsResponse(null);
    setLoadingTrials(true);
    try {
      const payload = {
        stage: "IVB",
        treatment_line: "first-line",
        germline_status: "negative",
        location_state: "NY",
        max_results: 10,
        tumor_context: tumorContext || {},
        sae_mechanism_vector: effectiveVector,
      };

      const res = await fetch(`${API_ROOT}/api/ayesha/trials/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Trials search failed: ${res.status} ${res.statusText} :: ${text}`);
      }

      const data = await res.json();
      setTrialsResponse(data);
    } catch (e) {
      setTrialsError(e?.message || String(e));
    } finally {
      setLoadingTrials(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      <Stack spacing={2} sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 900 }}>
          Ayesha — Holistic Scoring (Patient ↔ Trial Feasibility)
        </Typography>
        <Alert severity="error">
          <strong>Research Use Only (RUO):</strong> This page explains and visualizes feasibility scoring. It is not clinical advice.
        </Alert>
      </Stack>

      {bundleLoading && (
        <Alert severity="info">Loading Ayesha context (therapy-fit)…</Alert>
      )}
      {bundleError && (
        <Alert severity="warning">
          Couldn’t load therapy-fit context. You can still run trials scoring with a manual vector, but the “auto vector” won’t be grounded.
          <Box sx={{ mt: 1, fontFamily: "monospace", fontSize: 12, opacity: 0.8 }}>
            {bundleError.message}
          </Box>
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                What drives the Holistic Score
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                The score is computed server-side by combining:
                <ul style={{ marginTop: 8, marginBottom: 0 }}>
                  <li><strong>Mechanism fit</strong>: patient 7D vector vs trial 7D MoA vector</li>
                  <li><strong>Eligibility</strong>: trial criteria checks (currently conservative)</li>
                  <li><strong>PGx safety</strong>: germline pharmacogene contraindications/dose risk</li>
                  <li><strong>Resistance risk</strong>: optional; requires SAE features</li>
                </ul>
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                Mechanism vector source
              </Typography>

              <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: "wrap" }}>
                <Chip
                  label="Auto (recommended)"
                  color={vectorMode === "auto" ? "primary" : "default"}
                  variant={vectorMode === "auto" ? "filled" : "outlined"}
                  onClick={() => setVectorMode("auto")}
                />
                <Chip
                  label="Manual"
                  color={vectorMode === "manual" ? "primary" : "default"}
                  variant={vectorMode === "manual" ? "filled" : "outlined"}
                  onClick={() => setVectorMode("manual")}
                />
              </Stack>

              <Alert severity={vectorMode === "auto" ? "success" : "warning"} sx={{ mb: 2 }}>
                <strong>Vector:</strong> {vectorSourceLabel}
                <br />
                <strong>Completeness:</strong> {vectorCompleteness.present}/{vectorCompleteness.total} dimensions populated
              </Alert>

              {vectorMode === "manual" && (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                    Enter 7D mechanism vector (0–1)
                  </Typography>
                  <Grid container spacing={1}>
                    {DIMENSIONS.map((d) => (
                      <Grid item xs={6} key={d.key}>
                        <TextField
                          label={d.label}
                          value={manualVector[d.key]}
                          onChange={(e) => setManualVector((prev) => ({ ...prev, [d.key]: e.target.value }))}
                          size="small"
                          fullWidth
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              )}

              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                What Ayesha needs to provide (to make this dynamic)
              </Typography>
              <Stack spacing={1}>
                {inputsChecklist.map((item) => (
                  <Box key={item.label} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                    <Chip
                      label={item.have ? "Have" : "Missing"}
                      size="small"
                      color={item.have ? "success" : "default"}
                      variant={item.have ? "filled" : "outlined"}
                      sx={{ mt: "2px" }}
                    />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {item.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.why}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                Run Holistic Scoring on Ayesha Trials
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                This calls <code>/api/ayesha/trials/search</code> and passes the mechanism vector. Trials are enriched with MoA vectors and scored with a full breakdown.
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  onClick={runHolisticTrials}
                  disabled={loadingTrials}
                >
                  {loadingTrials ? "Scoring…" : "Run scoring"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setTrialsResponse(null);
                    setTrialsError(null);
                  }}
                  disabled={loadingTrials}
                >
                  Clear
                </Button>
              </Stack>

              {trialsError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {trialsError}
                </Alert>
              )}

              {trialsResponse?.provenance && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <strong>Provenance:</strong>{" "}
                  {trialsResponse.provenance?.router_version
                    ? `router_version=${String(trialsResponse.provenance.router_version)}`
                    : "see response.provenance"}
                </Alert>
              )}

              <Divider sx={{ my: 2 }} />

              {Array.isArray(trialsResponse?.trials) && trialsResponse.trials.length > 0 ? (
                <Stack spacing={2}>
                  {trialsResponse.trials.map((t) => (
                    <Card key={t.nct_id || t.nctId || t.id || Math.random()} variant="outlined" sx={{ borderRadius: 3 }}>
                      <CardContent>
                        <Stack spacing={1}>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                              {t.title || t.brief_title || t.official_title || (t.nct_id || t.nctId || "NCT")}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {t.nct_id || t.nctId ? `NCT: ${t.nct_id || t.nctId}` : null}
                              {t.overall_status ? ` · status: ${t.overall_status}` : null}
                              {t.phase ? ` · phase: ${t.phase}` : null}
                            </Typography>
                          </Box>

                          <HolisticScoreCard trial={t} />

                          {Array.isArray(t.eligibility_breakdown) && t.eligibility_breakdown.length > 0 ? (
                            <Box>
                              <Typography variant="caption" sx={{ fontWeight: 800 }}>
                                Eligibility breakdown (RUO)
                              </Typography>
                              <Box sx={{ mt: 0.5 }}>
                                {t.eligibility_breakdown.slice(0, 6).map((line, idx) => (
                                  <Typography key={idx} variant="caption" color="text.secondary" display="block">
                                    - {line}
                                  </Typography>
                                ))}
                              </Box>
                            </Box>
                          ) : null}
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              ) : (
                <Alert severity="warning">
                  No trials scored yet. Click “Run scoring”. If this fails, confirm the backend is running and <code>VITE_API_ROOT</code> points to it.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

