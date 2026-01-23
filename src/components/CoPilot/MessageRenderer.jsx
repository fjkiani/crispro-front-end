import React from 'react';
import { Box, Paper, Typography, Avatar, Button, Chip } from '@mui/material';
import { SmartToy as AIIcon, Launch as LaunchIcon } from '@mui/icons-material';
import { EvidenceBadges, EvidenceTier, CitationsList } from './Evidence';
import { ActionStatusMessage } from './Actions';

/**
 * Message Renderer Component
 * Handles rendering individual chat messages with all their components
 */
export const MessageRenderer = ({ message, onQuickAction }) => {
  const isUser = message.type === 'user';

  return (
    <Box
      key={message.id}
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 2,
      }}
    >
      <Box sx={{ maxWidth: '80%', display: 'flex', alignItems: 'flex-start' }}>
        {!isUser && (
          <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
            <AIIcon />
          </Avatar>
        )}

        <Paper
          sx={{
            p: 2,
            bgcolor: isUser ? 'primary.main' : 'grey.100',
            color: isUser ? 'primary.contrastText' : 'text.primary',
            borderRadius: 2,
          }}
        >
          {message.isActionInProgress || message.isActionResult || message.isActionError ? (
            <ActionStatusMessage message={message} />
          ) : (
            <Typography variant="body2">{message.content}</Typography>
          )}

          {/* Enhanced Evidence Display (Phase 2 - Component-Based) */}
          {!isUser && (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {/* Backend Evidence Badges (from efficacy/deep analysis) */}
              {message.backend_badges && message.backend_badges.length > 0 && (
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {message.backend_badges.map((badge, idx) => (
                    <Chip
                      key={idx}
                      size="small"
                      label={badge}
                      color={
                        badge === 'RCT' ? 'success' :
                        badge === 'Guideline' ? 'info' :
                        badge === 'ClinVar-Strong' ? 'warning' :
                        badge === 'PathwayAligned' ? 'success' : 'default'
                      }
                      variant="filled"
                      sx={{ fontSize: '0.7rem', height: '20px' }}
                    />
                  ))}
                </Box>
              )}

              {/* Evidence Badges and Quality Indicators */}
              <EvidenceBadges
                badges={message.evidence_badges}
                evidenceLevel={message.evidence_level}
                confidence={message.confidence_score}
              />

              {/* Evidence Tier Indicator */}
              <EvidenceTier tier={message.evidence_tier} />

              {/* Top Citations from Backend */}
              {message.top_citations && message.top_citations.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}>
                    📚 Key Citations:
                  </Typography>
                  {message.top_citations.map((citation, idx) => (
                    <Box key={idx} sx={{ mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        PMID: {citation.pmid}
                      </Typography>
                      {citation.title && (
                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                          {citation.title}
                        </Typography>
                      )}
                      {citation.publication_types && citation.publication_types.length > 0 && (
                        <Typography variant="caption" sx={{ display: 'block', color: 'info.main' }}>
                          {citation.publication_types.join(', ')}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              )}

              {/* Provenance (run_signature, operational_mode) */}
              {(message.run_signature || message.operational_mode || message.scoring_mode) && (
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                  {message.run_signature && (
                    <Chip
                      size="small"
                      label={`Run: ${message.run_signature}`}
                      variant="outlined"
                      onClick={() => {
                        const runUrl = `${window.location.origin}/myeloma-digital-twin?run=${message.run_signature}`;
                        navigator.clipboard.writeText(runUrl);
                      }}
                      sx={{ cursor: 'pointer', fontSize: '0.65rem' }}
                    />
                  )}
                  {message.operational_mode && (
                    <Chip
                      size="small"
                      label={`Mode: ${message.operational_mode}`}
                      color={message.operational_mode === 'clinical' ? 'warning' : 'default'}
                      variant="outlined"
                      sx={{ fontSize: '0.65rem' }}
                    />
                  )}
                  {message.scoring_mode && message.scoring_mode.startsWith('massive') && (
                    <Chip
                      size="small"
                      label="Demo Mode"
                      color="warning"
                      variant="outlined"
                      sx={{ fontSize: '0.65rem' }}
                    />
                  )}
                </Box>
              )}
            </Box>
          )}

          {/* Enhanced Supporting Papers (Phase 2 - Component-Based) */}
          {!isUser && (
            <CitationsList papers={message.supporting_papers} />
          )}

          {/* Intent Information (Phase 1 Q2C) */}
          {!isUser && message.intent && (
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                size="small"
                label={`Intent: ${message.intent}`}
                color="info"
                variant="outlined"
              />
              {message.intent_confidence && (
                <Chip
                  size="small"
                  label={`Confidence: ${message.intent_confidence}`}
                  color="default"
                  variant="outlined"
                />
              )}
            </Box>
          )}

          {/* Suggested Actions (Phase 1 Q2C) */}
          {!isUser && message.suggested_actions && message.suggested_actions.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 'bold', mb: 1, display: 'block' }}>
                Quick Actions:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {message.suggested_actions.map((action, index) => (
                  <Button
                    key={index}
                    size="small"
                    variant="outlined"
                    startIcon={<LaunchIcon />}
                    onClick={() => onQuickAction(action, message)}
                    disabled={!action.endpoint}
                    sx={{
                      fontSize: '0.75rem',
                      padding: '2px 8px',
                      opacity: action.endpoint ? 1 : 0.5,
                      '&:hover': {
                        backgroundColor: action.endpoint ? 'primary.main' : 'grey.300',
                        color: action.endpoint ? 'primary.contrastText' : 'text.primary'
                      }
                    }}
                  >
                    {action.label}
                  </Button>
                ))}
              </Box>
            </Box>
          )}

          {/* Suggestions */}
          {!isUser && message.suggestions && message.suggestions.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 'bold', mb: 1, display: 'block' }}>
                Suggested questions:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {message.suggestions.map((suggestion, index) => (
                  <Chip
                    key={index}
                    size="small"
                    label={suggestion}
                    onClick={() => onQuickAction({ type: 'suggestion', content: suggestion })}
                    sx={{ fontSize: '0.75rem', cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

