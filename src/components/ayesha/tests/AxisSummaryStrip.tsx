/**
 * AxisSummaryStrip — compact horizontal overview of all 7 axes.
 * Shows at-a-glance pathway status as colored pills.
 * Data-driven from coverage[] — no hardcoding.
 */
import React from "react";
import { Box, Stack, Tooltip, Typography } from "@mui/material";
import type { AxisCoverage } from "../../../logic/axisCoverage";
import { getAxisIcon, getAxisPlainName, getAxisCardMode } from "./testsConstants";

interface AxisSummaryStripProps {
    coverage: AxisCoverage[];
    activeLevelKey: "L1" | "L2" | "L3";
}

function getPillStyle(mode: "signal" | "quiet" | "not-tested", val: number) {
    if (mode === "signal") {
        return {
            bgcolor: val >= 0.7 ? "#dcfce7" : "#fef3c7",
            color: val >= 0.7 ? "#166534" : "#92400e",
            border: val >= 0.7 ? "1.5px solid #22c55e" : "1.5px solid #f59e0b",
        };
    }
    if (mode === "quiet") {
        return {
            bgcolor: "#f1f5f9",
            color: "#64748b",
            border: "1.5px solid #e2e8f0",
        };
    }
    // not-tested
    return {
        bgcolor: "transparent",
        color: "#94a3b8",
        border: "1.5px dashed #cbd5e1",
    };
}

function getStatusLabel(mode: "signal" | "quiet" | "not-tested", val: number): string {
    if (mode === "not-tested") return "Not tested";
    if (mode === "signal") return val >= 0.7 ? "Active" : "Moderate";
    return "Low";
}

export default function AxisSummaryStrip({ coverage, activeLevelKey }: AxisSummaryStripProps) {
    const evaluated = coverage.filter((r) => getAxisCardMode(r) !== "not-tested");
    const total = coverage.length;

    return (
        <Box
            sx={{
                mb: 3,
                p: 2,
                borderRadius: 2.5,
                bgcolor: "#fff",
                border: "1px solid #e2e8f0",
            }}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: "#0f172a" }}>
                    Pathway overview
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
                    {evaluated.length} of {total} evaluated · Mode: {activeLevelKey}
                </Typography>
            </Stack>
            <Stack direction="row" gap={1} flexWrap="wrap">
                {coverage.map((row) => {
                    const mode = getAxisCardMode(row);
                    const val = row.evaluable && row.evidence.kind !== "none" ? (row.evidence as any).rawValue || 0 : 0;
                    const style = getPillStyle(mode, val);
                    const statusLabel = getStatusLabel(mode, val);
                    const plainName = getAxisPlainName(row.axis);
                    const icon = getAxisIcon(row.axis);

                    return (
                        <Tooltip
                            key={row.axis}
                            title={`${plainName}: ${statusLabel}${mode !== "not-tested" ? ` (${(val * 100).toFixed(0)}%)` : ""}`}
                            arrow
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.75,
                                    px: 1.5,
                                    py: 0.75,
                                    borderRadius: 2,
                                    fontSize: "0.8rem",
                                    fontWeight: 800,
                                    cursor: "default",
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                        transform: "translateY(-1px)",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                    },
                                    ...style,
                                }}
                            >
                                <span>{icon}</span>
                                <span>{row.axis}</span>
                                <Typography
                                    component="span"
                                    sx={{
                                        fontSize: "0.65rem",
                                        fontWeight: 700,
                                        opacity: 0.85,
                                        ml: 0.25,
                                    }}
                                >
                                    {statusLabel}
                                </Typography>
                            </Box>
                        </Tooltip>
                    );
                })}
            </Stack>
        </Box>
    );
}
