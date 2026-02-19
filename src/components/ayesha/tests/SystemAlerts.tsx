/**
 * SystemAlerts — deterministic axis-unknown warnings.
 * Extracted from TestsPage.tsx lines 843-870.
 */
import React from "react";
import { Alert, Box, Stack, Typography } from "@mui/material";

interface AxisUnknownAlert {
    axis: string;
    reason: string;
    missingData: string[];
    recommendedTest: string | null;
}

interface SystemAlertsProps {
    alerts: AxisUnknownAlert[];
}

export default function SystemAlerts({ alerts }: SystemAlertsProps) {
    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 900, color: "#0f172a", mb: 1 }}>
                Alerts (system-generated)
            </Typography>
            {alerts.length ? (
                <Stack gap={1.5}>
                    {alerts.map((a) => (
                        <Alert key={a.axis} severity="warning">
                            <strong>Axis Unknown</strong> · {a.axis}
                            <Box sx={{ mt: 0.5 }}>
                                <Typography variant="body2">
                                    Reason: {a.reason}
                                </Typography>
                                <Typography variant="body2">
                                    Recommended test: <strong>{a.recommendedTest || "Data needed"}</strong>
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    missingData: {a.missingData.length ? a.missingData.join(", ") : "—"}
                                </Typography>
                            </Box>
                        </Alert>
                    ))}
                </Stack>
            ) : (
                <Alert severity="success">No "Axis Unknown" alerts. All axes are evaluable from structured data in this state.</Alert>
            )}
        </Box>
    );
}
