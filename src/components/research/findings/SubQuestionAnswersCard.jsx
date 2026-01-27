/**
 * Sub-Question Answers Card Component
 * 
 * Displays answers to individual sub-questions with confidence scores and sources
 * 
 * Research Use Only - Not for Clinical Diagnosis
 */

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Link
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LinkIcon from '@mui/icons-material/Link';

export default function SubQuestionAnswersCard({ answers = [] }) {
  if (!answers || answers.length === 0) {
    return null;
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.7) return 'success';
    if (confidence >= 0.5) return 'warning';
    return 'default';
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <QuestionAnswerIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">Sub-Question Answers</Typography>
          <Chip
            label={`${answers.length} answered`}
            size="small"
            sx={{ ml: 2 }}
            color="primary"
            variant="outlined"
          />
        </Box>

        <Box>
          {answers.map((answer, idx) => {
            const question = answer.question || answer.sub_question || 'Unknown question';
            const answerText = answer.answer || answer.response || 'No answer provided';
            const confidence = answer.confidence || answer.confidence_score || null;
            const sources = answer.sources || answer.source_pmids || [];

            return (
              <Accordion key={idx} sx={{ mb: 1, boxShadow: 1 }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pr: 2 }}>
                    <QuestionAnswerIcon
                      fontSize="small"
                      sx={{ mr: 1, color: 'text.secondary' }}
                    />
                    <Typography
                      variant="subtitle2"
                      sx={{
                        flex: 1,
                        fontWeight: 'medium'
                      }}
                    >
                      {question}
                    </Typography>
                    {confidence !== null && (
                      <Chip
                        label={`${(confidence * 100).toFixed(0)}%`}
                        size="small"
                        color={getConfidenceColor(confidence)}
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    {/* Answer Text */}
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 2,
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.6
                      }}
                    >
                      {answerText}
                    </Typography>

                    {/* Confidence Bar */}
                    {confidence !== null && (
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            Confidence
                          </Typography>
                          <Typography variant="caption" fontWeight="bold">
                            {(confidence * 100).toFixed(0)}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={confidence * 100}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor:
                                confidence >= 0.7 ? 'success.main' :
                                confidence >= 0.5 ? 'warning.main' : 'error.main'
                            }
                          }}
                        />
                      </Box>
                    )}

                    {/* Sources */}
                    {sources.length > 0 && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                          Sources:
                        </Typography>
                        <List dense sx={{ py: 0 }}>
                          {sources.map((source, sourceIdx) => {
                            const pmid = typeof source === 'string' ? source : source.pmid || source;
                            const title = typeof source === 'object' ? source.title : null;
                            const url = `https://pubmed.ncbi.nlm.nih.gov/${pmid.replace(/[^0-9]/g, '')}`;

                            return (
                              <ListItem
                                key={sourceIdx}
                                sx={{
                                  py: 0.5,
                                  px: 1,
                                  borderRadius: 1,
                                  '&:hover': {
                                    backgroundColor: 'action.hover'
                                  }
                                }}
                              >
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                  <LinkIcon fontSize="small" color="action" />
                                </ListItemIcon>
                                <ListItemText
                                  primary={
                                    <Link
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      sx={{
                                        textDecoration: 'none',
                                        '&:hover': {
                                          textDecoration: 'underline'
                                        }
                                      }}
                                    >
                                      {title || `PMID: ${pmid}`}
                                    </Link>
                                  }
                                  secondary={title ? `PMID: ${pmid}` : null}
                                />
                              </ListItem>
                            );
                          })}
                        </List>
                      </Box>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
}















