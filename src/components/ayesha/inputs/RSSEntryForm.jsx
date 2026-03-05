/**
 * RSSEntryForm.jsx
 * 
 * Data entry form for NGS-based Replication Stress Score inputs.
 * Maps directly to RSSService.compute_rss() parameters.
 * 
 * Published source: Konstantinopoulos 2021, PMID 34552099
 * RS-High = ≥1 of: CCNE1-amp, RB1-loss, CDKN2A/B-del, MYC-amp,
 *                   MYCL1-amp, KRAS-amp, ERBB2-amp, NF1-loss
 * 
 * RUO: Research Use Only.
 */
import React, { useState } from "react";
import {
    Box, Typography, TextField, FormControlLabel, Checkbox,
    Button, Chip, Alert, Divider, Collapse, IconButton,
    Tooltip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ScienceIcon from "@mui/icons-material/Science";

const STORAGE_KEY = "ayesha_rss_inputs_v1";

const DEFAULT_STATE = {
    ccne1_copy_number: "",
    rb1_loss: false,
    cdkn2a_deleted: false,
    cdkn2b_deleted: false,
    myc_amplified: false,
    mycl1_amplified: false,
    kras_amplified: false,
    erbb2_amplified: false,
    nf1_loss: false,
};

function loadFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : DEFAULT_STATE;
    } catch {
        return DEFAULT_STATE;
    }
}

function saveToStorage(state) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch { }
}

/** Returns { rs_high: bool | null, triggers: string[] } from local state */
function computeLocalRS(state) {
    const triggers = [];
    const cn = parseFloat(state.ccne1_copy_number);
    if (!isNaN(cn) && cn > 4) triggers.push(`CCNE1-amp (${cn} copies)`);
    if (state.rb1_loss) triggers.push("RB1 loss");
    if (state.cdkn2a_deleted) triggers.push("CDKN2A del");
    if (state.cdkn2b_deleted) triggers.push("CDKN2B del");
    if (state.myc_amplified) triggers.push("MYC amp");
    if (state.mycl1_amplified) triggers.push("MYCL1 amp");
    if (state.kras_amplified) triggers.push("KRAS amp");
    if (state.erbb2_amplified) triggers.push("ERBB2/HER2 amp");
    if (state.nf1_loss) triggers.push("NF1 loss");

    const anyInput = (
        state.ccne1_copy_number !== "" ||
        state.rb1_loss || state.cdkn2a_deleted || state.cdkn2b_deleted ||
        state.myc_amplified || state.mycl1_amplified || state.kras_amplified ||
        state.erbb2_amplified || state.nf1_loss
    );
    if (!anyInput) return { rs_high: null, triggers: [] };
    return { rs_high: triggers.length > 0, triggers };
}

/** Converts state to the dict expected by BundleRequest.rss_inputs */
function toApiPayload(state) {
    const payload = {};
    const cn = parseFloat(state.ccne1_copy_number);
    if (!isNaN(cn)) payload.ccne1_copy_number = cn;
    if (state.rb1_loss !== false) payload.rb1_loss = state.rb1_loss;
    if (state.cdkn2a_deleted !== false) payload.cdkn2a_deleted = state.cdkn2a_deleted;
    if (state.cdkn2b_deleted !== false) payload.cdkn2b_deleted = state.cdkn2b_deleted;
    if (state.myc_amplified !== false) payload.myc_amplified = state.myc_amplified;
    if (state.mycl1_amplified !== false) payload.mycl1_amplified = state.mycl1_amplified;
    if (state.kras_amplified !== false) payload.kras_amplified = state.kras_amplified;
    if (state.erbb2_amplified !== false) payload.erbb2_amplified = state.erbb2_amplified;
    if (state.nf1_loss !== false) payload.nf1_loss = state.nf1_loss;
    return Object.keys(payload).length > 0 ? payload : null;
}

export default function RSSEntryForm({ onChange }) {
    const [state, setState] = useState(loadFromStorage);
    const [expanded, setExpanded] = useState(false);

    const { rs_high, triggers } = computeLocalRS(state);

    const update = (patch) => {
        const next = { ...state, ...patch };
        setState(next);
        saveToStorage(next);
        if (onChange) onChange(toApiPayload(next));
    };

    const clear = () => {
        setState(DEFAULT_STATE);
        saveToStorage(DEFAULT_STATE);
        if (onChange) onChange(null);
    };

    const rsLabel = rs_high === null
        ? null
        : rs_high
            ? { label: "RS-High", color: "warning", sub: "Gemcitabine alone may be sufficient" }
            : { label: "RS-Low", color: "primary", sub: "ATR inhibitor combination may benefit" };

    return (
        <Box sx={{ mt: 2 }}>
            {/* ── Header ── */}
            <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer", mb: 1 }}
                onClick={() => setExpanded((v) => !v)}
            >
                <ScienceIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, flexGrow: 1 }}>
                    Replication Stress (RS) Inputs
                </Typography>
                {rsLabel && (
                    <Chip
                        label={rsLabel.label}
                        color={rsLabel.color}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: "0.7rem" }}
                    />
                )}
                <IconButton size="small">
                    {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1, pl: 0.5 }}>
                From NGS panel · Unlocks ATR trial RS stratification
                (Konstantinopoulos 2021, PMID 34552099) · RUO
            </Typography>

            <Collapse in={expanded}>
                <Box sx={{ pl: 1, pr: 1 }}>

                    {/* ── CCNE1 copy number ── */}
                    <TextField
                        label="CCNE1 copy number"
                        size="small"
                        type="number"
                        inputProps={{ min: 1, max: 30, step: 0.5 }}
                        value={state.ccne1_copy_number}
                        onChange={(e) => update({ ccne1_copy_number: e.target.value })}
                        helperText="> 4 copies = amplified (RS-High trigger)"
                        sx={{ mb: 2, width: "100%" }}
                    />

                    <Divider sx={{ mb: 1.5 }}>
                        <Typography variant="caption" color="text.secondary">
                            RB Pathway Loss
                        </Typography>
                    </Divider>

                    {[
                        { key: "rb1_loss", label: "RB1 loss (deletion or LoF mutation)" },
                        { key: "cdkn2a_deleted", label: "CDKN2A deletion" },
                        { key: "cdkn2b_deleted", label: "CDKN2B deletion" },
                    ].map(({ key, label }) => (
                        <FormControlLabel
                            key={key}
                            control={
                                <Checkbox
                                    size="small"
                                    checked={!!state[key]}
                                    onChange={(e) => update({ [key]: e.target.checked })}
                                />
                            }
                            label={<Typography variant="body2">{label}</Typography>}
                            sx={{ display: "block", mb: 0.5 }}
                        />
                    ))}

                    <Divider sx={{ mb: 1.5, mt: 1.5 }}>
                        <Typography variant="caption" color="text.secondary">
                            Oncogene-Induced RS
                        </Typography>
                    </Divider>

                    {[
                        { key: "myc_amplified", label: "MYC amplification" },
                        { key: "mycl1_amplified", label: "MYCL1 amplification" },
                        { key: "kras_amplified", label: "KRAS amplification (copy number, not point mut)" },
                        { key: "erbb2_amplified", label: "ERBB2 / HER2 amplification" },
                        { key: "nf1_loss", label: "NF1 loss-of-function or deletion" },
                    ].map(({ key, label }) => (
                        <FormControlLabel
                            key={key}
                            control={
                                <Checkbox
                                    size="small"
                                    checked={!!state[key]}
                                    onChange={(e) => update({ [key]: e.target.checked })}
                                />
                            }
                            label={<Typography variant="body2">{label}</Typography>}
                            sx={{ display: "block", mb: 0.5 }}
                        />
                    ))}

                    {/* ── Local classification result ── */}
                    {rsLabel && (
                        <Alert
                            severity={rs_high ? "warning" : "info"}
                            sx={{ mt: 2, mb: 1, fontSize: "0.8rem" }}
                        >
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {rsLabel.label}
                            </Typography>
                            <Typography variant="caption">{rsLabel.sub}</Typography>
                            {triggers.length > 0 && (
                                <Box sx={{ mt: 0.5 }}>
                                    {triggers.map((t) => (
                                        <Chip
                                            key={t}
                                            label={t}
                                            size="small"
                                            sx={{ mr: 0.5, mb: 0.5, fontSize: "0.68rem" }}
                                        />
                                    ))}
                                </Box>
                            )}
                        </Alert>
                    )}

                    <Button
                        variant="text"
                        size="small"
                        onClick={clear}
                        sx={{ mt: 0.5, color: "text.secondary" }}
                    >
                        Clear RS inputs
                    </Button>
                </Box>
            </Collapse>
        </Box>
    );
}
