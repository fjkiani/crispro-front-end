/**
 * IOHarmGateSection — shared IO Harm Prevention wrapper.
 * Both Phase3Treatment and AyeshaTherapyFit render IOHarmPreventionPanel identically.
 * This extracts the common pattern.
 *
 * Used by: Phase3Treatment, AyeshaTherapyFit, Digital Twin (future)
 */
import React, { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

const IOHarmPreventionPanel = React.lazy(() => import('../ayesha/IOHarmPreventionPanel'));

export default function IOHarmGateSection({ ioHarmData, suppressFooterDisclaimer = false }) {
    if (!ioHarmData) return null;

    return (
        <Box className="tf-section">
            <Suspense fallback={<CircularProgress size={32} />}>
                <IOHarmPreventionPanel
                    riskBenefitDecision={ioHarmData.decision_result}
                    biomarkerDrivers={ioHarmData.biomarker_drivers}
                    checkpointExpression={ioHarmData.checkpoint_expression}
                    ioProfileCard={ioHarmData.io_profile_card}
                    safetyGate={ioHarmData.safety_gate || { active: true }}
                    suppressFooterDisclaimer={suppressFooterDisclaimer}
                />
            </Suspense>
        </Box>
    );
}
