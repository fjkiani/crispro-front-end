/**
 * SOC (Standard of Care) Recommendation Card
 * 
 * Displays recommended first-line treatment regimen with:
 * - Regimen name
 * - Confidence score
 * - Rationale
 * - Evidence citations
 */
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const SOCRecommendationCard = ({
  regimen,
  confidence,
  guideline_confidence,
  patient_fit_score,
  patient_fit_confidence,
  engine_validation_status,
  alignment_flag,
  engine_validation,
  available_prediction_drugs,
  missing_backbone_drugs,
  rationale,
  evidence,
  add_ons = [],
}) => {
  if (!regimen) return null;

  const guidelineConfidence = typeof guideline_confidence === 'number' ? guideline_confidence : confidence;
  const guidelineConfidencePercent = Math.round(((guidelineConfidence || 0) * 100));
  const guidelineConfidenceColor = guidelineConfidence >= 0.9 ? 'success' : guidelineConfidence >= 0.7 ? 'warning' : 'error';

  const hasPatientFit = typeof patient_fit_score === 'number' && typeof patient_fit_confidence === 'number';
  const patientFitScorePercent = hasPatientFit ? Math.round((patient_fit_score || 0) * 100) : null;
  const patientFitConfidencePercent = hasPatientFit ? Math.round((patient_fit_confidence || 0) * 100) : null;
  const patientFitColor = (patient_fit_score || 0) >= 0.7 ? 'success' : (patient_fit_score || 0) >= 0.5 ? 'warning' : 'error';

  const alignSeverity = alignment_flag?.severity || null;
  const showDiscordance = alignSeverity === 'warn' || alignSeverity === 'alarm';

  // Format regimen for display - handle both string and object formats
  const formatRegimen = () => {
    try {
      // Handle string directly
      if (typeof regimen === 'string') {
        return regimen;
      }

      // Handle object formats
      if (typeof regimen === 'object' && regimen !== null && !Array.isArray(regimen)) {
        // First, try to extract string values from the object
        const values = Object.values(regimen);
        const validValues = values
          .filter(v => v != null && typeof v === 'string')
          .map(v => String(v).trim())
          .filter(v => v.length > 0);

        if (validValues.length > 0) {
          // Join string values with " + " separator
          return validValues.join(' + ');
        }

        // Fallback: format keys as readable drug names
        const keys = Object.keys(regimen);
        if (keys.length > 0) {
          const formatted = keys
            .map(key => {
              // Convert snake_case to Title Case
              return String(key)
                .replace(/_/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());
            })
            .join(' + ');
          return formatted || 'Standard Regimen';
        }

        return 'Standard Regimen';
      }

      // Fallback for any other type
      return String(regimen || 'Standard Regimen');
    } catch (error) {
      console.error('Error formatting regimen:', error, regimen);
      return 'Standard Regimen';
    }
  };

  const regimenText = formatRegimen();

  // Ensure all props are safe for rendering
  const safeRationale = typeof rationale === 'string' ? rationale : (rationale ? JSON.stringify(rationale) : null);
  const safeEvidence = typeof evidence === 'string' ? evidence : (evidence ? JSON.stringify(evidence) : null);
  const backboneInputs = engine_validation?.backbone_inputs || null;
  const computation = engine_validation?.computation || null;
  const engineNote = typeof engine_validation?.note === 'string' ? engine_validation.note : null;
  const availablePredictions = Array.isArray(available_prediction_drugs) ? available_prediction_drugs : [];
  const missingBackbone = Array.isArray(missing_backbone_drugs) ? missing_backbone_drugs : [];

  return (
    <Card sx={{ bgcolor: 'primary.50', border: '2px solid', borderColor: 'primary.main' }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Typography variant="h6">
            Standard of Care Recommendation
          </Typography>
        </Box>

        {/* Regimen */}
        <Box mb={2}>
          <Typography variant="h6" gutterBottom sx={{ wordBreak: 'break-word', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            {regimenText}
          </Typography>
          {add_ons && Array.isArray(add_ons) && add_ons.length > 0 && (
            <Box mt={1}>
              <Typography variant="subtitle2" gutterBottom>
                <strong>Add-ons:</strong>
              </Typography>
              {add_ons.map((addon, idx) => {
                // Ensure addon is an object with a drug property
                const drugName = addon?.drug || addon?.name || String(addon);
                const addonRationale = addon?.rationale || null;
                const addonEvidence = addon?.evidence || null;

                return (
                  <Box key={idx} mb={1} sx={{ pl: 2, borderLeft: '2px solid', borderColor: 'primary.main' }}>
                    <Typography variant="body2" fontWeight="bold">
                      {String(drugName)}
                    </Typography>
                    {addonRationale && (
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                        {String(addonRationale)}
                      </Typography>
                    )}
                    {addonEvidence && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'block', mt: 0.5 }}>
                        Evidence: {String(addonEvidence)}
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>

        {/* Confidence - Only show if we have a numeric value */}
        {typeof guidelineConfidence === 'number' ? (
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" mb={0.5}>
              <Typography variant="body2">
                <strong>Guideline confidence:</strong>
              </Typography>
              <Typography variant="body2" fontWeight="bold" color={`${guidelineConfidenceColor}.main`}>
                {guidelineConfidencePercent}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(guidelineConfidencePercent, 100)}
              color={guidelineConfidenceColor}
              sx={{ height: 10, borderRadius: 5 }}
            />
            <Chip
              label="NCCN Guideline-Aligned"
              size="small"
              color="success"
              sx={{ mt: 1 }}
            />
          </Box>
        ) : (
          <Box mb={2}>
            <Chip
              label="NCCN Guideline-Aligned"
              color="success"
              variant="outlined"
              size="small"
            />
          </Box>
        )}

        {/* Therapy Fit (WIWFM) validation for SOC backbone */}
        <Box mb={2}>
          <Typography variant="subtitle2" gutterBottom>
            Patient Fit for Standard of Care
          </Typography>
          <Chip
            label="RUO · Patient Fit Overlay"
            size="small"
            color="info"
            variant="outlined"
            sx={{ mb: 1 }}
          />
          {hasPatientFit ? (
            <Box>
              <Box display="flex" justifyContent="space-between" mb={0.5}>
                <Typography variant="body2">
                  <strong>Patient-fit score:</strong>
                </Typography>
                <Typography variant="body2" fontWeight="bold" color={`${patientFitColor}.main`}>
                  {patientFitScorePercent}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(patientFitScorePercent, 100)}
                color={patientFitColor}
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Engine confidence: {patientFitConfidencePercent}%
              </Typography>
              {showDiscordance && (
                <Chip
                  label={alignSeverity === 'alarm' ? 'Discordance: review urgently' : 'Discordance: review'}
                  size="small"
                  color={alignSeverity === 'alarm' ? 'error' : 'warning'}
                  sx={{ mt: 1 }}
                />
              )}

              {(backboneInputs || computation || engineNote) && (
                <Accordion sx={{ mt: 1 }} elevation={0}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      Show computation (inputs + formula)
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {backboneInputs && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                        <Typography variant="caption" color="text.secondary">
                          Backbone drugs used for validation:
                        </Typography>
                        <Typography variant="body2">
                          <strong>Carboplatin</strong>: efficacy {Math.round((backboneInputs.carboplatin?.efficacy_score || 0) * 100)}% · confidence {Math.round((backboneInputs.carboplatin?.confidence || 0) * 100)}%
                        </Typography>
                        <Typography variant="body2">
                          <strong>Paclitaxel</strong>: efficacy {Math.round((backboneInputs.paclitaxel?.efficacy_score || 0) * 100)}% · confidence {Math.round((backboneInputs.paclitaxel?.confidence || 0) * 100)}%
                        </Typography>
                      </Box>
                    )}

                    {computation && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Formula:
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {computation.patient_fit_score || 'avg(backbone efficacy scores)'}
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {computation.patient_fit_confidence || 'avg(backbone confidences)'}
                        </Typography>
                        {computation.scope && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {computation.scope}
                          </Typography>
                        )}
                      </Box>
                    )}

                    {engineNote && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Engine note:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {engineNote}
                        </Typography>
                      </Box>
                    )}

                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      Research Use Only (RUO). This is a patient-fit hypothesis overlay on top of guideline SOC—not a directive.
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              )}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {engine_validation_status === 'wiwfm_not_run'
                ? 'WIWFM overlay not computed for this response. (No patient-fit language should be inferred.)'
                : engine_validation_status === 'wiwfm_missing_drugs'
                  ? `WIWFM ran, but SOC backbone overlay could not be computed (missing: ${missingBackbone.length ? missingBackbone.join(', ') : 'unknown'}).`
                  : 'WIWFM overlay not available for this response.'}
            </Typography>
          )}
          {alignment_flag?.message && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              {alignment_flag.message}
            </Typography>
          )}
          {availablePredictions.length > 0 && !hasPatientFit ? (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              WIWFM returned: {availablePredictions.slice(0, 10).join(', ')}{availablePredictions.length > 10 ? '…' : ''}
            </Typography>
          ) : null}
        </Box>

        {/* Rationale */}
        {safeRationale && (
          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>
              Rationale
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {safeRationale}
            </Typography>
          </Box>
        )}

        {/* Evidence */}
        {safeEvidence && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Evidence
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {safeEvidence}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SOCRecommendationCard;
