/**
 * PatientStoryHero — the opening pitch.
 * Mars rules: tell the patient what we found in one breath.
 */
import React from "react";
import { Alert, Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import type { AxisCoverage, ExpectedMechanismLike } from "../../../logic/axisCoverage";
import { getAxisIcon, getAxisPlainName } from "./testsConstants";

interface PatientStoryHeroProps {
    coverage: AxisCoverage[];
    expectedMechanism: ExpectedMechanismLike | null;
    activeLevelKey: "L1" | "L2" | "L3";
    completenessMissing: string[];
}

function getAxisSentence(row: AxisCoverage): string | null {
    if (!row.evaluable || row.status === "Unknown") return null;
    const plain = getAxisPlainName(row.axis);
    const val = row.evidence.kind !== "none" ? (row.evidence as any).rawValue : null;
    if (val === null || val === undefined) return null;

    if (row.axis === "DDR") {
        if (val >= 0.7) return "DNA repair pathway is compromised — this often means PARP inhibitors could be effective";
        if (val >= 0.4) return "DNA repair shows moderate deficiency — PARP inhibitor response is uncertain";
        return "DNA repair appears intact — PARP inhibitors may have limited benefit";
    }
    if (row.axis === "IO") {
        if (val >= 0.7) return "Immune markers suggest immunotherapy could be effective";
        if (val >= 0.4) return "Moderate immune signals — immunotherapy response is possible but uncertain";
        return "Low immune markers — immunotherapy alone may have limited benefit";
    }
    if (row.axis === "VEGF") {
        if (val >= 0.7) return "High blood vessel growth signaling — anti-VEGF therapy may help";
        return `${plain} pathway shows limited activity`;
    }
    if (row.axis === "Efflux") {
        if (val >= 0.7) return "Drug resistance pumps are active — may affect drug delivery";
        return `${plain} appears manageable`;
    }

    if (val >= 0.7) return `${plain} shows high activity`;
    if (val >= 0.4) return `${plain} shows moderate activity`;
    return `${plain} shows low activity`;
}

export default function PatientStoryHero({
    coverage,
    expectedMechanism,
    activeLevelKey,
    completenessMissing,
}: PatientStoryHeroProps) {
    const evaluable = coverage.filter((r) => r.evaluable);
    const unknown = coverage.filter((r) => !r.evaluable);
    const total = coverage.length;

    // Top findings — sorted by value descending
    const topFindings = evaluable
        .filter((r) => r.evidence.kind !== "none" && (r.evidence as any).rawValue > 0)
        .sort((a, b) => ((b.evidence as any).rawValue || 0) - ((a.evidence as any).rawValue || 0))
        .slice(0, 3);

    return (
        <>
            {/* RUO Disclaimer — always visible */}
            <Alert severity="info" sx={{ mb: 2 }}>
                <strong>Research Use Only (RUO).</strong> This is a data-readiness and coverage report, not medical advice.
            </Alert>

            <Card
                sx={{
                    mb: 3,
                    borderRadius: 3,
                    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                    color: "#fff",
                    overflow: "hidden",
                }}
            >
                <CardContent sx={{ p: 4 }}>
                    {/* Header */}
                    <Typography variant="overline" sx={{ letterSpacing: 2, fontWeight: 900, color: "#94a3b8" }}>
                        AYESHA · YOUR TEST RESULTS
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, mt: 1, mb: 2 }}>
                        We analyzed{" "}
                        <Box component="span" sx={{ color: "#60a5fa" }}>
                            {evaluable.length} of {total}
                        </Box>{" "}
                        biological pathways
                    </Typography>

                    {evaluable.length === 0 ? (
                        <Typography sx={{ color: "#94a3b8", mb: 2 }}>
                            No pathways could be evaluated with current data. Select a scenario below to explore what additional tests would reveal.
                        </Typography>
                    ) : (
                        <>
                            <Typography sx={{ color: "#cbd5e1", mb: 2.5, fontSize: "1.05rem" }}>
                                {activeLevelKey === "L1"
                                    ? "Using your baseline record only. Select a scenario to see what additional tests would show."
                                    : `Based on ${activeLevelKey === "L2" ? "HRD + TMB data" : "HRD, TMB, RNA expression & CA-125 data"}, here's what we found:`}
                            </Typography>

                            {/* Top findings */}
                            <Stack gap={1.5} sx={{ mb: 2.5 }}>
                                {topFindings.map((row) => {
                                    const sentence = getAxisSentence(row);
                                    if (!sentence) return null;
                                    const val = (row.evidence as any).rawValue || 0;
                                    const statusColor = val >= 0.7 ? "#22c55e" : val >= 0.4 ? "#f59e0b" : "#94a3b8";
                                    return (
                                        <Stack key={row.axis} direction="row" alignItems="center" gap={1.5}>
                                            <Box
                                                sx={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: "50%",
                                                    backgroundColor: statusColor,
                                                    flexShrink: 0,
                                                }}
                                            />
                                            <Typography sx={{ color: "#e2e8f0", fontSize: "0.95rem" }}>
                                                <strong>{getAxisIcon(row.axis)} {getAxisPlainName(row.axis)}:</strong>{" "}
                                                {sentence}
                                            </Typography>
                                        </Stack>
                                    );
                                })}
                            </Stack>
                        </>
                    )}

                    {/* Data gap callout */}
                    {unknown.length > 0 && (
                        <Box
                            sx={{
                                mt: 1,
                                p: 2,
                                borderRadius: 2,
                                bgcolor: "rgba(255,255,255,0.06)",
                                border: "1px solid rgba(255,255,255,0.1)",
                            }}
                        >
                            <Typography sx={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                                ⏳ <strong>{unknown.length} pathways</strong> need more data —{" "}
                                {completenessMissing.length > 0
                                    ? `ask your doctor about: ${completenessMissing.slice(0, 2).join(", ")}`
                                    : "additional testing may help"}
                            </Typography>
                        </Box>
                    )}

                    {/* Mode chip */}
                    <Stack direction="row" gap={1} sx={{ mt: 2 }}>
                        <Chip
                            label={`Mode: ${activeLevelKey}`}
                            sx={{ fontWeight: 900, bgcolor: "rgba(96,165,250,0.15)", color: "#60a5fa" }}
                        />
                        {expectedMechanism && (
                            <Chip
                                label="Context-derived analysis"
                                sx={{ fontWeight: 900, bgcolor: "rgba(34,197,94,0.15)", color: "#22c55e" }}
                            />
                        )}
                    </Stack>
                </CardContent>
            </Card>
        </>
    );
}
