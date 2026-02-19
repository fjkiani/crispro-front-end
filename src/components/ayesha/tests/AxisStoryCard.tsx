/**
 * AxisStoryCard — Mars grade.
 * Three modes: signal (green), quiet (muted), not-tested (dashed).
 * Each card explains what the pathway means for the patient,
 * names relevant drugs, and says what test would check it.
 */
import React from "react";
import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import type { AxisCoverage } from "../../../logic/axisCoverage";
import {
    getAxisIcon,
    getAxisPlainName,
    AXIS_PATIENT_STORIES,
    type AxisCardMode,
    getAxisCardMode,
} from "./testsConstants";

interface AxisStoryCardProps {
    coverage: AxisCoverage;
    inputsUsed: Record<string, any> | null;
}

function getBarGradient(val: number): string {
    if (val >= 0.7) return "linear-gradient(90deg, #22c55e, #16a34a)";
    if (val >= 0.4) return "linear-gradient(90deg, #f59e0b, #d97706)";
    if (val > 0) return "linear-gradient(90deg, #94a3b8, #64748b)";
    return "#e2e8f0";
}

function getBorderColor(mode: AxisCardMode, val: number): string {
    if (mode === "not-tested") return "#cbd5e1";
    if (val >= 0.7) return "#22c55e";
    if (val >= 0.4) return "#f59e0b";
    return "#e2e8f0";
}

function getPatientExplanation(axis: string, mode: AxisCardMode, val: number): string {
    const story = AXIS_PATIENT_STORIES[axis];
    if (!story) return "";
    if (mode === "not-tested") return story.notTested;
    if (val >= 0.4) return story.whenHigh;
    return story.whenLow;
}

export default function AxisStoryCard({ coverage: row, inputsUsed }: AxisStoryCardProps) {
    const icon = getAxisIcon(row.axis);
    const plain = getAxisPlainName(row.axis);
    const story = AXIS_PATIENT_STORIES[row.axis];
    const mode = getAxisCardMode(row);
    const val = row.evaluable && row.evidence.kind !== "none" ? (row.evidence as any).rawValue || 0 : 0;

    const explanation = getPatientExplanation(row.axis, mode, val);
    const borderColor = getBorderColor(mode, val);

    return (
        <Card
            sx={{
                borderRadius: 3,
                border: mode === "not-tested" ? "1.5px dashed #cbd5e1" : `1.5px solid ${borderColor}`,
                bgcolor: mode === "not-tested" ? "#f8fafc" : "#fff",
                transition: "all 0.25s ease",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                "&:hover": {
                    transform: mode !== "not-tested" ? "translateY(-3px)" : "none",
                    boxShadow: mode !== "not-tested" ? `0 6px 20px ${borderColor}25` : "none",
                },
            }}
        >
            <CardContent sx={{ p: 2.5, flex: 1, display: "flex", flexDirection: "column" }}>
                {/* Header: icon + name + status */}
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 900, color: "#0f172a", lineHeight: 1.2 }}>
                            {icon} {row.axis}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                            {plain}
                        </Typography>
                    </Box>
                    {mode === "signal" && (
                        <Chip
                            size="small"
                            label={val >= 0.7 ? "Active" : "Moderate"}
                            sx={{
                                fontWeight: 800,
                                bgcolor: val >= 0.7 ? "#dcfce7" : "#fef3c7",
                                color: val >= 0.7 ? "#166534" : "#92400e",
                            }}
                        />
                    )}
                    {mode === "quiet" && (
                        <Chip size="small" label="Low" sx={{ fontWeight: 800, bgcolor: "#f1f5f9", color: "#64748b" }} />
                    )}
                    {mode === "not-tested" && (
                        <Chip size="small" label="Not tested" variant="outlined" sx={{ fontWeight: 800, color: "#94a3b8" }} />
                    )}
                </Stack>

                {/* What this pathway is */}
                {story && (
                    <Typography variant="caption" sx={{ color: "#94a3b8", mb: 1, display: "block", fontStyle: "italic" }}>
                        {story.whatItIs}
                    </Typography>
                )}

                {/* Progress bar (only for tested) */}
                {mode !== "not-tested" && (
                    <Box sx={{ mb: 1.5 }}>
                        <Box sx={{ width: "100%", height: 6, borderRadius: 3, bgcolor: "#f1f5f9", overflow: "hidden" }}>
                            <Box
                                sx={{
                                    width: `${Math.min(val * 100, 100)}%`,
                                    height: "100%",
                                    borderRadius: 3,
                                    background: getBarGradient(val),
                                    transition: "width 0.6s ease",
                                }}
                            />
                        </Box>
                    </Box>
                )}

                {/* Patient explanation — the core content */}
                <Typography
                    variant="body2"
                    sx={{
                        color: mode === "not-tested" ? "#64748b" : "#1e293b",
                        lineHeight: 1.5,
                        fontSize: "0.85rem",
                        flex: 1,
                    }}
                >
                    {explanation}
                </Typography>

                {/* REMOVED: Static relevant drugs block - Liability/Bias fix */}

                {/* Biomarker inputs (for evaluated cards) */}
                {inputsUsed && mode !== "not-tested" && (
                    <Box sx={{ mt: 1, pt: 1, borderTop: "1px solid #f1f5f9" }}>
                        <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600 }}>
                            Based on:{" "}
                            {Object.entries(inputsUsed)
                                .filter(([, v]) => v !== null && v !== undefined)
                                .map(([k, v]) => `${k}: ${typeof v === "number" ? (v as number).toFixed?.(1) || v : v}`)
                                .join(" · ")}
                        </Typography>
                    </Box>
                )}

                {/* Recommended test for untested */}
                {mode === "not-tested" && row.recommendedTest && (
                    <Box sx={{ mt: "auto", pt: 1.5 }}>
                        <Chip
                            size="small"
                            label={`🔬 Ask about: ${row.recommendedTest}`}
                            variant="outlined"
                            sx={{
                                fontWeight: 700,
                                color: "#3b82f6",
                                borderColor: "#93c5fd",
                                bgcolor: "#eff6ff",
                            }}
                        />
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}
