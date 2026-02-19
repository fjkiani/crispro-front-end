/**
 * ScenarioSelector — Mars grade.
 * No cryptic IDs. Every scenario is a story card with a human name,
 * one-sentence explanation, and color coding.
 */
import React, { useState } from "react";
import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    Chip,
    Collapse,
    Grid,
    IconButton,
    MenuItem,
    Select,
    Stack,
    Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { getScenarioStory } from "./testsConstants";

interface ScenarioOption {
    id: string;
    name: string;
}

interface ScenarioSelectorProps {
    l2Options: ScenarioOption[];
    l3Options: ScenarioOption[];
    activeLevelKey: "L1" | "L2" | "L3";
    scenarioId: string;
    l3ScenarioId: string;
    effectivePairedL2: string;
    onSelectL1: () => void;
    onSelectL2: (id: string) => void;
    onSelectL3: (id: string) => void;
    onPairedL2Change: (id: string) => void;
}

function ScenarioCard({
    id,
    isActive,
    onClick,
}: {
    id: string;
    isActive: boolean;
    onClick: () => void;
}) {
    const story = getScenarioStory(id);
    return (
        <Card
            sx={{
                borderRadius: 2.5,
                border: isActive ? `2px solid ${story.color}` : "1px solid #e2e8f0",
                bgcolor: isActive ? `${story.color}08` : "#fff",
                transition: "all 0.2s ease",
                "&:hover": {
                    borderColor: story.color,
                    transform: "translateY(-1px)",
                    boxShadow: `0 4px 12px ${story.color}20`,
                },
            }}
        >
            <CardActionArea onClick={onClick} sx={{ p: 0 }}>
                <CardContent sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}>
                    <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 0.5 }}>
                        <Box
                            sx={{
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                bgcolor: story.color,
                                flexShrink: 0,
                            }}
                        />
                        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: "#0f172a", lineHeight: 1.3 }}>
                            {story.label}
                        </Typography>
                    </Stack>
                    <Typography variant="caption" sx={{ color: "#64748b", lineHeight: 1.4, display: "block" }}>
                        {story.desc}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}

export default function ScenarioSelector({
    l2Options,
    l3Options,
    activeLevelKey,
    scenarioId,
    l3ScenarioId,
    effectivePairedL2,
    onSelectL1,
    onSelectL2,
    onSelectL3,
    onPairedL2Change,
}: ScenarioSelectorProps) {
    const [showAdvanced, setShowAdvanced] = useState(false);

    return (
        <Card sx={{ mb: 3, borderRadius: 3, border: "1px solid #e2e8f0" }}>
            <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a", mb: 0.5 }}>
                    What if we had more data?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                    These scenarios show how your analysis would change with additional test results.
                    Each represents a different combination of biomarker findings.
                </Typography>

                {/* Baseline */}
                <Box sx={{ mb: 2.5 }}>
                    <Chip
                        label="⬅ Return to baseline (current data only)"
                        onClick={onSelectL1}
                        variant={activeLevelKey === "L1" ? "filled" : "outlined"}
                        color={activeLevelKey === "L1" ? "primary" : "default"}
                        sx={{ fontWeight: 800, mb: 1 }}
                    />
                </Box>

                {/* L2 Scenarios — HRD + TMB */}
                {l2Options.length > 0 && (
                    <Box sx={{ mb: 2.5 }}>
                        <Typography variant="overline" sx={{ fontWeight: 900, color: "#3b82f6", letterSpacing: 1.5 }}>
                            + DNA Repair & Mutation Testing (HRD + TMB)
                        </Typography>
                        <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                            {l2Options.map((o) => (
                                <Grid item xs={12} sm={6} md={4} key={o.id}>
                                    <ScenarioCard
                                        id={o.id}
                                        isActive={scenarioId === o.id && activeLevelKey === "L2"}
                                        onClick={() => onSelectL2(o.id)}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                {/* L3 Scenarios — RNA + CA-125 */}
                {l3Options.length > 0 && (
                    <Box sx={{ mb: 1 }}>
                        <Typography variant="overline" sx={{ fontWeight: 900, color: "#8b5cf6", letterSpacing: 1.5 }}>
                            + Gene Expression & CA-125 (RNA + Tumor Markers)
                        </Typography>
                        <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                            {l3Options.map((o) => (
                                <Grid item xs={12} sm={6} md={4} key={o.id}>
                                    <ScenarioCard
                                        id={o.id}
                                        isActive={l3ScenarioId === o.id && activeLevelKey === "L3"}
                                        onClick={() => onSelectL3(o.id)}
                                    />
                                </Grid>
                            ))}
                        </Grid>

                        {/* Paired L2 selector for L3 */}
                        {l3ScenarioId && l2Options.length > 0 && (
                            <Box sx={{ mt: 1.5, p: 2, borderRadius: 2, bgcolor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                                <Typography variant="caption" sx={{ fontWeight: 900, color: "#64748b" }}>
                                    Combined with which DNA repair scenario?
                                </Typography>
                                <Select
                                    fullWidth
                                    size="small"
                                    value={effectivePairedL2}
                                    onChange={(e) => onPairedL2Change(String(e.target.value || ""))}
                                    sx={{ mt: 0.5, bgcolor: "#fff" }}
                                >
                                    {l2Options.map((o) => {
                                        const story = getScenarioStory(o.id);
                                        return (
                                            <MenuItem key={o.id} value={o.id}>
                                                {story.label}
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </Box>
                        )}
                    </Box>
                )}

                {/* Advanced: raw dropdowns for edge cases */}
                <Box sx={{ mt: 1 }}>
                    <Stack
                        direction="row"
                        alignItems="center"
                        gap={0.5}
                        sx={{ cursor: "pointer" }}
                        onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                        <IconButton size="small">
                            <ExpandMoreIcon
                                sx={{
                                    transform: showAdvanced ? "rotate(180deg)" : "rotate(0deg)",
                                    transition: "transform 0.2s",
                                    fontSize: "1rem",
                                }}
                            />
                        </IconButton>
                        <Typography variant="caption" color="text.secondary">
                            Advanced: show raw scenario IDs
                        </Typography>
                    </Stack>
                    <Collapse in={showAdvanced}>
                        <Stack direction="row" gap={2} sx={{ mt: 1 }}>
                            <Select
                                fullWidth
                                size="small"
                                value={scenarioId}
                                displayEmpty
                                onChange={(e) => onSelectL2(String(e.target.value || ""))}
                            >
                                <MenuItem value=""><em>Select L2…</em></MenuItem>
                                {l2Options.map((o) => <MenuItem key={o.id} value={o.id}>{o.id}</MenuItem>)}
                            </Select>
                            <Select
                                fullWidth
                                size="small"
                                value={l3ScenarioId}
                                displayEmpty
                                onChange={(e) => onSelectL3(String(e.target.value || ""))}
                            >
                                <MenuItem value=""><em>Select L3…</em></MenuItem>
                                {l3Options.map((o) => <MenuItem key={o.id} value={o.id}>{o.id}</MenuItem>)}
                            </Select>
                        </Stack>
                    </Collapse>
                </Box>
            </CardContent>
        </Card>
    );
}
