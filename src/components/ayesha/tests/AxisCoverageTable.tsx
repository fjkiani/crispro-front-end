/**
 * AxisCoverageTable — the technical deep-dive table.
 * Cleaned: no raw code paths. Human-readable evidence source descriptions.
 */
import React from "react";
import {
    Box,
    Card,
    CardContent,
    Chip,
    Divider,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography,
} from "@mui/material";
import type { AxisCoverage } from "../../../logic/axisCoverage";
import { formatAxisTitle, renderStatusLabel } from "./testsConstants";

interface AxisCoverageTableProps {
    coverage: AxisCoverage[];
    mechanismViewMode: "expected" | "model";
    onViewModeChange: (mode: "expected" | "model") => void;
    isPreview: boolean;
}

function renderStatusChip(row: AxisCoverage) {
    const { label, color } = renderStatusLabel(row);
    return <Chip size="small" label={label} color={color as any} sx={{ fontWeight: 900 }} />;
}

/** Human-readable source description instead of raw code paths */
function getEvidenceDescription(row: AxisCoverage): { source: string; detail: string } {
    if (row.evidence.kind === "pathway_scores") {
        const val = row.evidence.rawValue;
        return {
            source: "Based on your current test results",
            detail: `Signal strength: ${(val * 100).toFixed(1)}%`,
        };
    }
    if (row.evidence.kind === "mechanism_panel") {
        const val = row.evidence.rawValue;
        return {
            source: "Projected from scenario simulation",
            detail: `Predicted signal: ${(val * 100).toFixed(1)}%`,
        };
    }
    if (row.evidence.kind === "expected_mechanism") {
        const val = row.evidence.rawValue;
        return {
            source: "Inferred from your tumor type and biomarkers",
            detail: `Expected signal: ${(val * 100).toFixed(1)}%`,
        };
    }
    return {
        source: "Not enough data to evaluate",
        detail: row.evidence.note || "",
    };
}

export default function AxisCoverageTable({
    coverage,
    mechanismViewMode,
    onViewModeChange,
    isPreview,
}: AxisCoverageTableProps) {
    return (
        <Card sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}>
            <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: "#0f172a" }}>
                        Today's assessment by topic (axes)
                    </Typography>
                    <Stack direction="row" gap={1} alignItems="center">
                        {isPreview && (
                            <ToggleButtonGroup
                                value={mechanismViewMode}
                                exclusive
                                onChange={(_, v) => { if (v) onViewModeChange(v); }}
                                size="small"
                            >
                                <ToggleButton value="expected" sx={{ fontWeight: 900, textTransform: 'none', fontSize: '0.75rem', px: 1.5 }}>
                                    Expected
                                </ToggleButton>
                                <ToggleButton value="model" sx={{ fontWeight: 900, textTransform: 'none', fontSize: '0.75rem', px: 1.5 }}>
                                    Model
                                </ToggleButton>
                            </ToggleButtonGroup>
                        )}
                        <Chip label={`Axes: ${coverage.length}`} sx={{ fontWeight: 900, bgcolor: "#e2e8f0" }} />
                    </Stack>
                </Stack>
                <Divider sx={{ my: 1.5 }} />

                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 900 }}>Topic</TableCell>
                            <TableCell sx={{ fontWeight: 900 }}>Enough data?</TableCell>
                            <TableCell sx={{ fontWeight: 900 }}>Signal</TableCell>
                            <TableCell sx={{ fontWeight: 900 }}>
                                <Tooltip title="How we determined the signal for this pathway — from your test results, a scenario simulation, or tumor type inference." arrow>
                                    <span>Where it came from</span>
                                </Tooltip>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 900 }}>Next test (if needed)</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {coverage.map((row) => {
                            const evidence = getEvidenceDescription(row);
                            return (
                                <TableRow key={row.axis}>
                                    <TableCell sx={{ fontWeight: 900 }}>{formatAxisTitle(row.axis)}</TableCell>
                                    <TableCell>{row.evaluable ? <Chip size="small" label="Yes" color="success" /> : <Chip size="small" label="No" />}</TableCell>
                                    <TableCell>{renderStatusChip(row)}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {evidence.source}
                                        </Typography>
                                        {evidence.detail && (
                                            <Typography variant="caption" color="text.secondary">
                                                {evidence.detail}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {row.status === "Unknown" ? (
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                                    Unknown · Data needed
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Recommended test: <strong>{row.recommendedTest || "Data needed"}</strong>
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                —
                                            </Typography>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
