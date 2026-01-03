/**
 * Article Summaries Card Component
 * 
 * Displays per-article LLM-generated summaries with key findings
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Link
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArticleIcon from '@mui/icons-material/Article';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LinkIcon from '@mui/icons-material/Link';

export default function ArticleSummariesCard({ summaries = [] }) {
  if (!summaries || summaries.length === 0) {
    return null;
  }

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <ArticleIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">Article Summaries</Typography>
          <Chip
            label={`${summaries.length} article${summaries.length !== 1 ? 's' : ''}`}
            size="small"
            sx={{ ml: 2 }}
            color="primary"
            variant="outlined"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          LLM-generated summaries for each article with key findings
        </Typography>

        <Box>
          {summaries.map((summary, idx) => {
            const title = summary.title || summary.paper_title || 'Untitled';
            const summaryText = summary.summary || summary.llm_summary || 'No summary available';
            const keyFindings = summary.key_findings || summary.findings || [];
            const pmid = summary.pmid || summary.pubmed_id || null;
            const url = pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}` : null;

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
                    <ArticleIcon
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
                      {title}
                    </Typography>
                    {pmid && (
                      <Chip
                        label={`PMID: ${pmid}`}
                        size="small"
                        variant="outlined"
                        sx={{ ml: 1, fontFamily: 'monospace' }}
                      />
                    )}
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    {/* Summary Text */}
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 2,
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.6
                      }}
                    >
                      {summaryText}
                    </Typography>

                    {/* Key Findings */}
                    {keyFindings.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Key Findings:
                        </Typography>
                        <List dense>
                          {keyFindings.map((finding, findingIdx) => {
                            const findingText = typeof finding === 'string' ? finding : finding.text || finding.finding || 'Unknown';
                            return (
                              <ListItem key={findingIdx} sx={{ py: 0.5 }}>
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                  <CheckCircleIcon fontSize="small" color="success" />
                                </ListItemIcon>
                                <ListItemText
                                  primary={findingText}
                                  primaryTypographyProps={{
                                    variant: 'body2'
                                  }}
                                />
                              </ListItem>
                            );
                          })}
                        </List>
                      </Box>
                    )}

                    {/* Link to PubMed */}
                    {url && (
                      <Box sx={{ mt: 2 }}>
                        <Link
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            textDecoration: 'none',
                            '&:hover': {
                              textDecoration: 'underline'
                            }
                          }}
                        >
                          <LinkIcon fontSize="small" />
                          <Typography variant="caption">
                            View on PubMed
                          </Typography>
                        </Link>
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


