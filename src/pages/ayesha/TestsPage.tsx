/**
 * TestsPage — the slim orchestrator.
 * Mars rules: 876 lines → ~100 lines. Every section is a component.
 * Tells the patient a story, not a spreadsheet.
 */
import React, { useState, useRef, useEffect } from "react";
import { Box, Collapse, Container, Divider, IconButton, Stack, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { useTestsPageState } from "../../hooks/ayesha/useTestsPageState";
import PatientStoryHero from "../../components/ayesha/tests/PatientStoryHero";
import ScenarioSelector from "../../components/ayesha/tests/ScenarioSelector";
import AxisSummaryStrip from "../../components/ayesha/tests/AxisSummaryStrip";
import MechanismInsightPanel from "../../components/ayesha/tests/MechanismInsightPanel";
import MissingDataRoadmap from "../../components/ayesha/tests/MissingDataRoadmap";
import AxisCoverageTable from "../../components/ayesha/tests/AxisCoverageTable";
import SystemAlerts from "../../components/ayesha/tests/SystemAlerts";

export default function TestsPage() {
  const state = useTestsPageState();
  const [showTechnical, setShowTechnical] = useState(false);
  const reactiveRef = useRef<HTMLDivElement>(null);
  const prevScenarioRef = useRef<string>("");

  // Auto-scroll to reactive content when scenario changes
  useEffect(() => {
    const key = `${state.activeLevelKey}:${state.scenarioId}:${state.l3ScenarioId}`;
    if (prevScenarioRef.current && prevScenarioRef.current !== key) {
      // Small delay to let React render the new content
      requestAnimationFrame(() => {
        reactiveRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
    prevScenarioRef.current = key;
  }, [state.activeLevelKey, state.scenarioId, state.l3ScenarioId]);

  // Loading
  if (state.isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Box sx={{ p: 8, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">Loading tests page…</Typography>
        </Box>
      </Container>
    );
  }

  // Error
  if (state.error) {
    return (
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Box sx={{ p: 4, bgcolor: "#fef2f2", borderRadius: 3, border: "1px solid #fca5a5" }}>
          <Typography variant="h6" sx={{ fontWeight: 900, color: "#dc2626" }}>Error loading tests</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {String(state.error)}
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Box sx={{ maxWidth: 1100, mx: "auto" }}>
        {/* 1. Patient story hero — what we found */}
        <PatientStoryHero
          coverage={state.coverage}
          expectedMechanism={state.expectedMechanism}
          activeLevelKey={state.activeLevelKey}
          completenessMissing={state.completenessMissing}
        />

        {/* 2. Scenario explorer — moved UP so user sees toggle before content */}
        <ScenarioSelector
          l2Options={state.l2Options}
          l3Options={state.l3Options}
          activeLevelKey={state.activeLevelKey}
          scenarioId={state.scenarioId}
          l3ScenarioId={state.l3ScenarioId}
          effectivePairedL2={state.effectivePairedL2}
          onSelectL1={state.setModeL1}
          onSelectL2={state.setModeL2}
          onSelectL3={state.setModeL3}
          onPairedL2Change={state.setPairedL2}
        />

        {/* 3. Axis summary strip — compact at-a-glance pathway overview */}
        <div ref={reactiveRef}>
          <AxisSummaryStrip
            coverage={state.coverage}
            activeLevelKey={state.activeLevelKey}
          />
        </div>

        {/* 4. Pathway cards — what we know (and don't) */}
        <MechanismInsightPanel
          coverage={state.coverage}
          expectedMechanism={state.expectedMechanism}
          mechanismViewMode={state.mechanismViewMode}
          onViewModeChange={state.setMechanismViewMode}
          scenarioRequires={state.scenarioRequires}
          activeScenarioCard={state.activeScenarioCard}
          scenarioAlignment={state.scenarioAlignment}
          isPreview={state.isPreview}
          activeLevelKey={state.activeLevelKey}
        />

        {/* 5. Missing data roadmap — what tests to ask about */}
        <MissingDataRoadmap
          completenessMissing={state.completenessMissing}
          monitoringBaselineMissing={state.monitoringBaselineMissing}
          expressionTripwireError={state.expressionTripwireError}
          testsNeeded={state.testsNeeded}
        />

        {/* 6. Technical deep-dive — collapsible for oncologists */}
        <Divider sx={{ my: 3 }} />
        <Stack
          direction="row"
          alignItems="center"
          gap={1}
          sx={{ cursor: "pointer", mb: 1 }}
          onClick={() => setShowTechnical(!showTechnical)}
        >
          <IconButton size="small">
            <ExpandMoreIcon
              sx={{
                transform: showTechnical ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 900, color: "#64748b" }}>
            Technical detail (for your care team)
          </Typography>
        </Stack>
        <Collapse in={showTechnical}>
          <Box sx={{ mt: 1 }}>
            <AxisCoverageTable
              coverage={state.coverage}
              mechanismViewMode={state.mechanismViewMode}
              onViewModeChange={state.setMechanismViewMode}
              isPreview={state.isPreview}
            />
            <SystemAlerts alerts={state.axisUnknownAlerts} />
          </Box>
        </Collapse>
      </Box>
    </Container>
  );
}
