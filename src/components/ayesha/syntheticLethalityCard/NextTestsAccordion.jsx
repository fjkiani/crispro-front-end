import React from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SourceSlug from '../shared/SourceSlug';

/**
 * NextTestsAccordion — What tests to order next.
 *
 * Previously 100% hardcoded MBD4-specific medical text.
 * Now driven by `testsNeeded` from the bundle when available,
 * with a short honest fallback when no API data is present.
 */
export function NextTestsAccordion({ testsNeeded, essentialityScores }) {
    const tests = Array.isArray(testsNeeded) ? testsNeeded : [];

    // Derive anchor gene from essentiality scores if available
    const anchorGene = Array.isArray(essentialityScores) && essentialityScores.length > 0
        ? essentialityScores[0]?.gene || null
        : null;

    return (
        <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 900 }}>
                    What tests to order next (highest yield)
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Rendered as coordination prompts (RUO). These align to the gating and receipts shown above.
                </Typography>

                {tests.length > 0 ? (
                    <Box component="ul" sx={{ m: 0, pl: 2 }}>
                        {tests.map((t, idx) => (
                            <li key={t.test || idx}>
                                <Typography variant="body2">
                                    <strong>{t.test}</strong>
                                    {t.unlocks && (
                                        <Typography variant="caption" sx={{ color: 'success.dark', display: 'block', ml: 2 }}>
                                            Unlocks: {t.unlocks}
                                        </Typography>
                                    )}
                                    {t.why && (
                                        <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                                            {t.why}
                                        </Typography>
                                    )}
                                </Typography>
                            </li>
                        ))}
                    </Box>
                ) : (
                    <Box component="ul" sx={{ m: 0, pl: 2 }}>
                        {anchorGene ? (
                            <li>
                                <Typography variant="body2">
                                    <strong>Confirm {anchorGene} status in the tumor</strong> — Tumor NGS should clarify copy number + VAF context (second hit / LOH).
                                </Typography>
                            </li>
                        ) : (
                            <li>
                                <Typography variant="body2">
                                    <strong>Comprehensive genomic profiling</strong> — Additional NGS data would improve confidence and may unlock higher analysis levels.
                                </Typography>
                            </li>
                        )}
                        <li>
                            <Typography variant="body2">
                                <strong>HRD testing</strong> — If HRD is high, PARP sensitivity becomes more defensible.
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body2">
                                <strong>Zygosity / LOH / second hit</strong> — Biallelic loss matters for repair genes; consider matched normal if feasible.
                            </Typography>
                        </li>
                    </Box>
                )}

                <SourceSlug
                    source={tests.length > 0 ? 'bundle.tests_needed' : 'kill_chain_policy (generic prompts)'}
                    compact
                />
            </AccordionDetails>
        </Accordion>
    );
}
