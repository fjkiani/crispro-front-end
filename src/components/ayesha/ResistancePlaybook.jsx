/**
 * ResistancePlaybook Component
 * 
 * Displays resistance playbook data from complete_care_v2:
 * - Resistance risks (5 mechanisms with confidence scores)
 * - Combo strategies (7 strategies with rank scores, evidence tiers)
 * - Next-line switches (6 options with rationale)
 * - Trial keywords (for filtering)
 */
import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WarningIcon from '@mui/icons-material/Warning';
import ScienceIcon from '@mui/icons-material/Science';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SearchIcon from '@mui/icons-material/Search';

const ResistancePlaybook = ({ resistance_playbook }) => {
  const [expandedSection, setExpandedSection] = useState('risks');

  if (!resistance_playbook) {
    return (
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Resistance Playbook
        </Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          Resistance playbook data not available. NGS data may be required.
        </Alert>
      </Paper>
    );
  }

  const { risks = [], combo_strategies = [], next_line_switches = [], trial_keywords = [], provenance = {} } = resistance_playbook;

  // Helper: Get confidence color
  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.7) return 'error';
    if (confidence >= 0.4) return 'warning';
    return 'info';
  };

  // Helper: Get evidence tier color
  const getEvidenceTierColor = (tier) => {
    const tierMap = {
      'VALIDATED': 'success',
      'TREND': 'info',
      'CLINICAL_TRIAL': 'primary',
      'STANDARD_OF_CARE': 'success',
      'LITERATURE_BASED': 'default',
      'PRECLINICAL': 'warning',
      'EXPERT_OPINION': 'default',
    };
    return tierMap[tier] || 'default';
  };

  // Helper: Format confidence as percentage
  const formatConfidence = (confidence) => {
    return `${(confidence * 100).toFixed(0)}%`;
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <WarningIcon color="warning" />
        <Typography variant="h6">
          Resistance Playbook
        </Typography>
      </Box>

      {/* Resistance Risks Section */}
      <Accordion 
        expanded={expandedSection === 'risks'} 
        onChange={() => setExpandedSection(expandedSection === 'risks' ? '' : 'risks')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
            <WarningIcon color="error" />
            <Typography variant="subtitle1" sx={{ flex: 1 }}>
              Resistance Risks ({risks.length})
            </Typography>
            {risks.length > 0 && (
              <Chip 
                label={`${risks.length} mechanisms detected`} 
                color="error" 
                size="small" 
              />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {risks.length === 0 ? (
            <Alert severity="info">No resistance risks detected.</Alert>
          ) : (
            <Grid container spacing={2}>
              {risks.map((risk, idx) => (
                <Grid item xs={12} md={6} key={idx}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {risk.type}
                        </Typography>
                        <Chip 
                          label={formatConfidence(risk.confidence)} 
                          color={getConfidenceColor(risk.confidence)}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {risk.evidence}
                      </Typography>
                      {risk.triggers && risk.triggers.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Triggers:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {risk.triggers.map((trigger, tIdx) => (
                              <Chip key={tIdx} label={trigger} size="small" variant="outlined" />
                            ))}
                          </Box>
                        </Box>
                      )}
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Source: {risk.source}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Combo Strategies Section */}
      <Accordion 
        expanded={expandedSection === 'combos'} 
        onChange={() => setExpandedSection(expandedSection === 'combos' ? '' : 'combos')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
            <ScienceIcon color="primary" />
            <Typography variant="subtitle1" sx={{ flex: 1 }}>
              Combination Strategies ({combo_strategies.length})
            </Typography>
            {combo_strategies.length > 0 && (
              <Chip 
                label={`${combo_strategies.length} strategies`} 
                color="primary" 
                size="small" 
              />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {combo_strategies.length === 0 ? (
            <Alert severity="info">No combination strategies available.</Alert>
          ) : (
            <List>
              {combo_strategies
                .sort((a, b) => (b.rank_score || 0) - (a.rank_score || 0))
                .map((combo, idx) => (
                  <ListItem key={idx} sx={{ flexDirection: 'column', alignItems: 'stretch', mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1, width: '100%' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                          {combo.drugs?.join(' + ') || 'Unknown combination'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {combo.moa}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          <strong>Indication:</strong> {combo.indication}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                        {combo.rank_score !== undefined && (
                          <Chip 
                            label={`Rank: ${combo.rank_score.toFixed(2)}`} 
                            color="primary" 
                            size="small" 
                          />
                        )}
                        {combo.evidence_tier && (
                          <Chip 
                            label={combo.evidence_tier} 
                            color={getEvidenceTierColor(combo.evidence_tier)}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                    {combo.rationale && (
                      <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
                        <strong>Rationale:</strong> {combo.rationale}
                      </Typography>
                    )}
                    {combo.trials && combo.trials.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Related Trials:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                          {combo.trials.slice(0, 3).map((trial, tIdx) => (
                            <Chip key={tIdx} label={trial} size="small" variant="outlined" />
                          ))}
                          {combo.trials.length > 3 && (
                            <Chip label={`+${combo.trials.length - 3} more`} size="small" variant="outlined" />
                          )}
                        </Box>
                      </Box>
                    )}
                    {combo.triggers && combo.triggers.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Triggers:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                          {combo.triggers.map((trigger, tIdx) => (
                            <Chip key={tIdx} label={trigger} size="small" variant="outlined" color="warning" />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </ListItem>
                ))}
            </List>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Next-Line Switches Section */}
      <Accordion 
        expanded={expandedSection === 'switches'} 
        onChange={() => setExpandedSection(expandedSection === 'switches' ? '' : 'switches')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
            <SwapHorizIcon color="secondary" />
            <Typography variant="subtitle1" sx={{ flex: 1 }}>
              Next-Line Switches ({next_line_switches.length})
            </Typography>
            {next_line_switches.length > 0 && (
              <Chip 
                label={`${next_line_switches.length} options`} 
                color="secondary" 
                size="small" 
              />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {next_line_switches.length === 0 ? (
            <Alert severity="info">No next-line switches recommended.</Alert>
          ) : (
            <List>
              {next_line_switches
                .sort((a, b) => (b.rank_score || 0) - (a.rank_score || 0))
                .map((switchOption, idx) => (
                  <ListItem key={idx} sx={{ flexDirection: 'column', alignItems: 'stretch', mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1, width: '100%' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                          {switchOption.drug}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Class:</strong> {switchOption.drug_class}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          <strong>Indication:</strong> {switchOption.indication}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                        {switchOption.rank_score !== undefined && (
                          <Chip 
                            label={`Rank: ${switchOption.rank_score.toFixed(2)}`} 
                            color="secondary" 
                            size="small" 
                          />
                        )}
                        {switchOption.evidence_tier && (
                          <Chip 
                            label={switchOption.evidence_tier} 
                            color={getEvidenceTierColor(switchOption.evidence_tier)}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                    {switchOption.rationale && (
                      <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
                        <strong>Rationale:</strong> {switchOption.rationale}
                      </Typography>
                    )}
                    {switchOption.trials && switchOption.trials.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Related Trials:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                          {switchOption.trials.slice(0, 3).map((trial, tIdx) => (
                            <Chip key={tIdx} label={trial} size="small" variant="outlined" />
                          ))}
                          {switchOption.trials.length > 3 && (
                            <Chip label={`+${switchOption.trials.length - 3} more`} size="small" variant="outlined" />
                          )}
                        </Box>
                      </Box>
                    )}
                  </ListItem>
                ))}
            </List>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Trial Keywords Section */}
      {trial_keywords && trial_keywords.length > 0 && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <SearchIcon color="action" />
            <Typography variant="subtitle2" fontWeight="bold">
              Trial Keywords
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {trial_keywords.map((keyword, idx) => (
              <Chip key={idx} label={keyword} size="small" variant="outlined" />
            ))}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Use these keywords to filter clinical trials for resistance-specific options.
          </Typography>
        </Box>
      )}

      {/* Provenance */}
      {provenance && Object.keys(provenance).length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Data source: {provenance.status || 'Generated'}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ResistancePlaybook;
