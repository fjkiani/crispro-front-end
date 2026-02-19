/**
 * MissingDataRoadmap — patient-actionable test recommendations.
 * Mars rules: tell them what tests to ask about, not what "gates" are missing.
 */
import React from "react";
import { Alert, Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { MISSING_EXPLANATIONS, topMissing } from "./testsConstants";

interface MissingDataRoadmapProps {
    completenessMissing: string[];
    monitoringBaselineMissing: boolean;
    expressionTripwireError: string | null;
}

const ICONS: Record<string, string> = {
    "ngs_somatic_genomic_coords": "🧬",
    "hrd_score": "🔧",
    "tmb_score": "🔬",
    "rna_expression": "📊",
    "ca125_value": "🩸",
};

export default function MissingDataRoadmap({
    completenessMissing,
    monitoringBaselineMissing,
    expressionTripwireError,
}: MissingDataRoadmapProps) {
    if (!completenessMissing.length && !expressionTripwireError) {
        return (
            <Alert severity="success" sx={{ mb: 3 }}>
                All required test data is present. No additional tests are needed for this scenario.
            </Alert>
        );
    }

    const items = topMissing(completenessMissing, 5);

    return (
        <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a", mb: 0.5 }}>
                Tests your doctor might order
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                These additional tests would unlock more pathways for analysis
            </Typography>

            {/* Expression tripwire error */}
            {expressionTripwireError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    <strong>Expression Coverage Too Sparse:</strong> {expressionTripwireError}
                </Alert>
            )}

            {/* Test cards */}
            <Stack gap={1.5}>
                {items.map((m) => {
                    const explain = MISSING_EXPLANATIONS[m];
                    const icon = ICONS[m] || "📋";
                    return (
                        <Card key={m} sx={{ borderRadius: 2, border: "1px solid #e2e8f0" }}>
                            <CardContent sx={{ py: 2, px: 2.5 }}>
                                <Stack direction="row" gap={2} alignItems="flex-start">
                                    <Typography sx={{ fontSize: "1.5rem", mt: 0.25 }}>{icon}</Typography>
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: "#0f172a" }}>
                                            {m.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                                            {explain?.what || "Additional data needed for this pathway."}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: "#3b82f6", fontWeight: 700, mt: 0.5, display: "block" }}>
                                            {explain?.unlocks || "Expands pathway analysis coverage."}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    );
                })}
            </Stack>

            {/* CA-125 monitoring callout */}
            {monitoringBaselineMissing && (
                <Alert severity="info" sx={{ mt: 2 }}>
                    <strong>Monitoring Baseline:</strong> CA-125 baseline helps track treatment response over time.
                    Ask your doctor about routine CA-125 lab work.
                </Alert>
            )}
        </Box>
    );
}
