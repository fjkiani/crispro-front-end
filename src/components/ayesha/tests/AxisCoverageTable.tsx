/**
 * AxisCoverageTable — the technical deep-dive table.
 * Extracted from TestsPage.tsx lines 749-841.
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
                            <TableCell sx={{ fontWeight: 900 }}>Where it came from</TableCell>
                            <TableCell sx={{ fontWeight: 900 }}>Next test (if needed)</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {coverage.map((row) => (
                            <TableRow key={row.axis}>
                                <TableCell sx={{ fontWeight: 900 }}>{formatAxisTitle(row.axis)}</TableCell>
                                <TableCell>{row.evaluable ? <Chip size="small" label="Yes" color="success" /> : <Chip size="small" label="No" />}</TableCell>
                                <TableCell>{renderStatusChip(row)}</TableCell>
                                <TableCell>
                                    {row.evidence.kind === "pathway_scores" ? (
                                        <Typography variant="body2">
                                            <strong>Structured pathway score</strong> · {row.evidence.rawValue.toFixed(3)}
                                        </Typography>
                                    ) : row.evidence.kind === "mechanism_panel" ? (
                                        <Typography variant="body2">
                                            <strong>Scenario preview vector</strong> · {row.evidence.rawValue.toFixed(3)}{" "}
                                            <Chip size="small" label="Preview/Scenario-derived" sx={{ ml: 1 }} />
                                        </Typography>
                                    ) : row.evidence.kind === "expected_mechanism" ? (
                                        <Typography variant="body2">
                                            <strong>Context-derived</strong> · {row.evidence.rawValue.toFixed(3)}{" "}
                                            <Chip size="small" label="Expected (biomarker)" color="info" sx={{ ml: 1 }} />
                                        </Typography>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            {row.evidence.note}
                                        </Typography>
                                    )}
                                    <Typography variant="caption" color="text.secondary">
                                        Path:{" "}
                                        <code>
                                            {row.evidence.kind === "none" ? "—" : (row.evidence as any).path}
                                        </code>
                                    </Typography>
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
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
