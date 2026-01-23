/**
 * SyntheticLethalityCard Component
 * 
 * Displays synthetic lethality and essentiality analysis results.
 * Modular, self-contained component.
 */

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Chip,
  Alert,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Psychology,
  ExpandMore,
  CheckCircle,
  Warning,
  Science,
} from '@mui/icons-material';

export const SyntheticLethalityCard = ({ slResult, loading = false }) => {
  const [expandedSection, setExpandedSection] = useState(null);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <LinearProgress />
          <Typography sx={{ mt: 1 }}>Loading synthetic lethality analysis...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!slResult) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary">No synthetic lethality data available</Typography>
        </CardContent>
      </Card>
    );
  }

  const slDetected = slResult.synthetic_lethality_detected || false;
  const essentialityScores = slResult.essentiality_scores || [];
  const brokenPathways = slResult.broken_pathways || [];
  const essentialPathways = slResult.essential_pathways || [];
  const recommendedDrugs = slResult.recommended_drugs || [];
  const suggestedTherapy = slResult.suggested_therapy;

  return (
    <Card>
      <CardHeader
        avatar={<Psychology />}
        title="Synthetic Lethality Analysis"
        subheader={slDetected ? 'Synthetic Lethality Detected' : 'No Synthetic Lethality'}
      />
      <CardContent>
        {/* Main Alert */}
        {slDetected && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Synthetic Lethality Opportunity Detected
            </Typography>
            {slResult.double_hit_description && (
              <Typography variant="body2">
                {slResult.double_hit_description}
              </Typography>
            )}
          </Alert>
        )}

        {/* Suggested Therapy */}
        {suggestedTherapy && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Suggested Therapy
            </Typography>
            <Chip
              label={suggestedTherapy}
              color="primary"
              size="medium"
            />
          </Box>
        )}

        {/* Essentiality Scores */}
        {essentialityScores.length > 0 && (
          <Accordion
            expanded={expandedSection === 'essentiality'}
            onChange={() => setExpandedSection(expandedSection === 'essentiality' ? null : 'essentiality')}
            sx={{ mb: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle2">
                Gene Essentiality Scores ({essentialityScores.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {essentialityScores.map((score, idx) => (
                  <ListItem key={idx}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" fontWeight="medium">
                            {score.gene}
                          </Typography>
                          <Chip
                            label={score.essentiality_level}
                            size="small"
                            color={score.essentiality_score >= 0.7 ? 'error' : score.essentiality_score >= 0.5 ? 'warning' : 'default'}
                          />
                          <LinearProgress
                            variant="determinate"
                            value={score.essentiality_score * 100}
                            sx={{ width: 100, height: 8, borderRadius: 1 }}
                          />
                          <Typography variant="caption">
                            {(score.essentiality_score * 100).toFixed(0)}%
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          {score.pathway_impact && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              {score.pathway_impact}
                            </Typography>
                          )}
                          {score.functional_consequence && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              {score.functional_consequence}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Broken Pathways */}
        {brokenPathways.length > 0 && (
          <Accordion
            expanded={expandedSection === 'broken'}
            onChange={() => setExpandedSection(expandedSection === 'broken' ? null : 'broken')}
            sx={{ mb: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle2">
                Broken Pathways ({brokenPathways.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {brokenPathways.map((pathway, idx) => (
                <Alert key={idx} severity="warning" sx={{ mb: 1 }}>
                  <Typography variant="body2" fontWeight="medium">
                    {pathway.pathway_name} ({pathway.status})
                  </Typography>
                  {pathway.description && (
                    <Typography variant="caption" color="text.secondary">
                      {pathway.description}
                    </Typography>
                  )}
                  {pathway.genes_affected && pathway.genes_affected.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption">Affected genes: </Typography>
                      {pathway.genes_affected.map((gene, gIdx) => (
                        <Chip key={gIdx} label={gene} size="small" sx={{ mr: 0.5 }} />
                      ))}
                    </Box>
                  )}
                </Alert>
              ))}
            </AccordionDetails>
          </Accordion>
        )}

        {/* Essential Pathways (Backups) */}
        {essentialPathways.length > 0 && (
          <Accordion
            expanded={expandedSection === 'essential'}
            onChange={() => setExpandedSection(expandedSection === 'essential' ? null : 'essential')}
            sx={{ mb: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle2">
                Essential Backup Pathways ({essentialPathways.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {essentialPathways.map((pathway, idx) => (
                <Box key={idx} sx={{ mb: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="body2" fontWeight="medium">
                    {pathway.pathway_name}
                  </Typography>
                  {pathway.description && (
                    <Typography variant="caption" color="text.secondary">
                      {pathway.description}
                    </Typography>
                  )}
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
        )}

        {/* Recommended Drugs */}
        {recommendedDrugs.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              <Science sx={{ verticalAlign: 'middle', mr: 0.5 }} />
              Recommended Drugs ({recommendedDrugs.length})
            </Typography>
            <List>
              {recommendedDrugs.map((drug, idx) => (
                <ListItem
                  key={idx}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" fontWeight="medium">
                          {drug.drug_name}
                        </Typography>
                        <Chip label={drug.drug_class} size="small" variant="outlined" />
                        {drug.fda_approved && (
                          <Chip label="FDA Approved" size="small" color="success" />
                        )}
                        {drug.confidence && (
                          <Chip
                            label={`${(drug.confidence * 100).toFixed(0)}% confidence`}
                            size="small"
                            color={drug.confidence > 0.7 ? 'success' : 'default'}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        {drug.target_pathway && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            Target: {drug.target_pathway}
                          </Typography>
                        )}
                        {drug.mechanism && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {drug.mechanism}
                          </Typography>
                        )}
                        {drug.rationale && (
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                            {Array.isArray(drug.rationale) ? drug.rationale.join('; ') : drug.rationale}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Explanation */}
        {slResult.explanation && (
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" gutterBottom>
              Explanation
            </Typography>
            {slResult.explanation.summary && (
              <Typography variant="body2" color="text.secondary" paragraph>
                {slResult.explanation.summary}
              </Typography>
            )}
            {slResult.explanation.key_points && slResult.explanation.key_points.length > 0 && (
              <Box component="ul" sx={{ pl: 2 }}>
                {slResult.explanation.key_points.map((point, idx) => (
                  <li key={idx}>
                    <Typography variant="body2" color="text.secondary">
                      {point}
                    </Typography>
                  </li>
                ))}
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

