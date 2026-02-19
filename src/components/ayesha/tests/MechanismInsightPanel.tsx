/**
 * MechanismInsightPanel — Mars grade.
 * Split layout: "What we found" (evaluated) vs "Not yet tested" (unknowns).
 * No mixing evaluated and untested in the same grid.
 */
import React from "react";
import {
    Alert,
    Box,
    Chip,
    Grid,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";
import type { AxisCoverage, ExpectedMechanismLike } from "../../../logic/axisCoverage";
import { safeArray, getAxisCardMode } from "./testsConstants";
import AxisStoryCard from "./AxisStoryCard";

interface MechanismInsightPanelProps {
    coverage: AxisCoverage[];
    expectedMechanism: ExpectedMechanismLike | null;
    mechanismViewMode: "expected" | "model";
    onViewModeChange: (mode: "expected" | "model") => void;
    scenarioRequires: string[];
    activeScenarioCard: any;
    scenarioAlignment: Record<string, number> | null;
    isPreview: boolean;
    activeLevelKey: "L1" | "L2" | "L3";
}

export default function MechanismInsightPanel({
    coverage,
    expectedMechanism,
    mechanismViewMode,
    onViewModeChange,
    scenarioRequires,
    activeScenarioCard,
    scenarioAlignment,
    isPreview,
    activeLevelKey,
}: MechanismInsightPanelProps) {
    const inputsUsedMap = expectedMechanism?.inputs_used || {};

    // Split into evaluated vs not-tested
    const evaluated = coverage.filter((r) => {
        const mode = getAxisCardMode(r);
        return mode === "signal" || mode === "quiet";
    });
    const notTested = coverage.filter((r) => getAxisCardMode(r) === "not-tested");

    return (
        <Box sx={{ mb: 3 }}>
            {/* Section header */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2.5 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a" }}>
                        Your biological pathways
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Each card below represents one way we can analyze your tumor.
                        Pathways with data show what we found; untested pathways show which tests could reveal more.
                    </Typography>
                </Box>
                {isPreview && (
                    <ToggleButtonGroup
                        value={mechanismViewMode}
                        exclusive
                        onChange={(_, v) => { if (v) onViewModeChange(v); }}
                        size="small"
                        sx={{ flexShrink: 0, ml: 2 }}
                    >
                        <ToggleButton value="expected" sx={{ fontWeight: 900, textTransform: "none", px: 2 }}>
                            Expected
                        </ToggleButton>
                        <ToggleButton value="model" sx={{ fontWeight: 900, textTransform: "none", px: 2 }}>
                            Model
                        </ToggleButton>
                    </ToggleButtonGroup>
                )}
            </Stack>

            {/* ✅ What we found */}
            {evaluated.length > 0 && (
                <Box sx={{ mb: 3 }}>
                    <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: "#166534" }}>
                            ✅ What we found
                        </Typography>
                        <Chip
                            size="small"
                            label={`${evaluated.length} pathway${evaluated.length !== 1 ? "s" : ""}`}
                            sx={{ fontWeight: 800, bgcolor: "#dcfce7", color: "#166534" }}
                        />
                    </Stack>
                    <Grid container spacing={2}>
                        {evaluated.map((row) => (
                            <Grid item xs={12} sm={6} md={4} key={row.axis}>
                                <AxisStoryCard
                                    coverage={row}
                                    inputsUsed={(inputsUsedMap as any)?.[row.axis] || null}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* ⏳ Not yet tested */}
            {notTested.length > 0 && (
                <Box sx={{ mb: 2 }}>
                    <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: "#64748b" }}>
                            ⏳ Not yet tested
                        </Typography>
                        <Chip
                            size="small"
                            label={`${notTested.length} pathway${notTested.length !== 1 ? "s" : ""}`}
                            sx={{ fontWeight: 800, bgcolor: "#f1f5f9", color: "#64748b" }}
                        />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        These pathways need additional tests before we can analyze them. Each card below tells you which test to ask your doctor about.
                    </Typography>
                    <Grid container spacing={2}>
                        {notTested.map((row) => (
                            <Grid item xs={12} sm={6} md={4} key={row.axis}>
                                <AxisStoryCard
                                    coverage={row}
                                    inputsUsed={null}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* All evaluated with no findings */}
            {evaluated.length === 0 && notTested.length > 0 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    No pathway data is available yet. Select a scenario above to preview how additional test results would populate these cards.
                </Alert>
            )}

            {/* Provenance */}
            {mechanismViewMode === "expected" && expectedMechanism?.provenance && (
                <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="caption">
                        <strong>Source:</strong> {expectedMechanism.provenance.source} · <strong>Method:</strong> {expectedMechanism.provenance.method}
                    </Typography>
                    <br />
                    <Typography variant="caption" color="text.secondary">
                        {expectedMechanism.provenance.ruo_disclaimer}
                    </Typography>
                </Alert>
            )}

            {/* Burden flag */}
            {mechanismViewMode === "expected" && expectedMechanism?.burden_flag && (
                <Chip
                    label={`Tumor Burden: ${expectedMechanism.burden_flag}`}
                    color={expectedMechanism.burden_flag === "high" ? "error" : "warning"}
                    variant="outlined"
                    sx={{ fontWeight: 900, mt: 2 }}
                />
            )}

            {/* Data this scenario adds */}
            {isPreview && scenarioRequires.length > 0 && (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: "#64748b" }}>
                        This scenario assumes the following data is available:
                    </Typography>
                    <Stack direction="row" gap={0.5} flexWrap="wrap" sx={{ mt: 0.5 }}>
                        {scenarioRequires.map((r) => (
                            <Chip key={String(r)} label={String(r)} size="small" color="success" variant="outlined" sx={{ fontWeight: 800 }} />
                        ))}
                    </Stack>
                </Box>
            )}

            {/* Escape warnings */}
            {(() => {
                const escapeWarnings = safeArray(activeScenarioCard?.mechanism_panel?.escape_warnings);
                if (!escapeWarnings.length) return null;
                return (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                        <strong>⚠️ Resistance Warning:</strong> {escapeWarnings.join("; ")}
                    </Alert>
                );
            })()}
        </Box>
    );
}
