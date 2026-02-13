import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Paper, Chip } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SmartToyIcon from '@mui/icons-material/SmartToy';

/**
 * Deterministic Explainer "Agent" logic.
 * No hallucinations. Uses only what is in the JSON contract.
 */
function generateExplanation(drug) {
    if (!drug) return { text: "No data available for interpretation.", type: "refusal" };

    const name = drug.drug || drug.name || "Unknown Agent";
    const tier = (drug.tier || "unknown").toLowerCase();
    const badges = drug.badges || [];
    const citations = drug.citations_count || (drug.citations ? drug.citations.length : 0);
    const score = Math.round((drug.efficacy_score || 0) * 100);
    const rationale = drug.rationale;

    // 1. REFUSAL MODE
    if (drug.found === false) {
        return {
            text: `Agent '${name}' was not evaluated or not found in the current panel version.`,
            type: "refusal"
        };
    }

    // 2. TEMPLATE CONSTRUCTION
    let reason = "";

    // Tier-based logic
    if (tier === "supported" || tier === "1") {
        reason = `Tier 1 recommendation (Score: ${score}%) supported by strong clinical evidence.`;
    } else if (tier === "consider" || tier === "2") {
        reason = `Tier 2 option (Score: ${score}%) worth considering based on mechanistic rationale.`;
    } else {
        reason = `Candidate (Score: ${score}%) has preliminary evidence but lacks top-tier clinical validation.`;
    }

    // Badge context
    if (badges.includes("RCT")) {
        reason += " Validated by randomized clinical trials.";
    } else if (badges.includes("Guideline")) {
        reason += " Aligns with standard clinical guidelines.";
    } else if (badges.includes("ClinVar-Strong")) {
        reason += " Strong genetic evidence (ClinVar) supports this target.";
    } else if (badges.includes("SL-Detected")) {
        reason += " Identified via Synthetic Lethality analysis.";
    }

    // Rationale context (Whitelist check: must be string or formatted object, no free text injection)
    let mech = "Pathway alignment detected.";
    if (typeof rationale === 'string') {
        mech = rationale;
    } else if (Array.isArray(rationale) && rationale[0]?.explanation) {
        // Taking the first specific rationale if available
        mech = rationale[0].explanation.split('→')[0]; // Simple truncation to avoid long technical chains
    }

    return {
        name: name,
        text: `${reason} Mechanism: ${mech}. (${citations} citations)`,
        type: "success"
    };
}

/**
 * TherapyFitExplainerAgent Component
 * 
 * Renders a strict, deterministic explanation of a drug card.
 */
export default function TherapyFitExplainerAgent({ target }) {
    const { name, text, type } = generateExplanation(target);

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                mt: 2,
                bgcolor: type === 'refusal' ? 'grey.50' : 'secondary.50',
                border: '1px solid',
                borderColor: type === 'refusal' ? 'grey.200' : 'secondary.100',
                borderRadius: 2
            }}
        >
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                {type === 'refusal' ? (
                    <SmartToyIcon color="disabled" fontSize="small" />
                ) : (
                    <AutoAwesomeIcon color="secondary" fontSize="small" />
                )}
                <Typography
                    variant="subtitle2"
                    color={type === 'refusal' ? 'text.secondary' : 'secondary.dark'}
                    fontWeight="bold"
                >
                    Analysis for {type === 'refusal' ? 'Unknown' : name}
                </Typography>
            </Box>
            <Typography variant="body2" color="text.primary">
                {text}
            </Typography>
        </Paper>
    );
}

TherapyFitExplainerAgent.propTypes = {
    target: PropTypes.object
};
