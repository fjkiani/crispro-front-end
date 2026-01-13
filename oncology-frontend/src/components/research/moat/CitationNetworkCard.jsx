/**
 * Citation Network Card Component
 * 
 * Displays key papers, publication trends, and top journals
 * 
 * Research Use Only - Not for Clinical Diagnosis
 */

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Link,
  Paper,
  Grid
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArticleIcon from '@mui/icons-material/Article';
import SchoolIcon from '@mui/icons-material/School';
import LinkIcon from '@mui/icons-material/Link';

export default function CitationNetworkCard({ citationNetwork }) {
  if (!citationNetwork) {
    return null;
  }

  const keyPapers = citationNetwork.key_papers || [];
  const publicationTrends = citationNetwork.publication_trends || {};
  const topJournals = citationNetwork.top_journals || [];

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">Citation Network</Typography>
        </Box>

        <Grid container spacing={2}>
          {/* Key Papers */}
          <Grid item xs={12} md={6}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ArticleIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Key Papers ({keyPapers.length})
                </Typography>
              </Box>
              {keyPapers.length > 0 ? (
                <List dense>
                  {keyPapers.slice(0, 5).map((paper, idx) => {
                    const pmid = paper.pmid || paper.pubmed_id || '';
                    const title = paper.title || 'Untitled';
                    const citationCount = paper.citation_count || paper.citations || 0;
                    const url = pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}` : null;

                    return (
                      <ListItem
                        key={idx}
                        sx={{
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 1,
                          mb: 0.5,
                          py: 0.5
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <ArticleIcon fontSize="small" color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            url ? (
                              <Link
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                  textDecoration: 'none',
                                  fontWeight: 'medium',
                                  fontSize: '0.875rem',
                                  '&:hover': {
                                    textDecoration: 'underline'
                                  }
                                }}
                              >
                                {title}
                              </Link>
                            ) : (
                              <Typography variant="body2" fontWeight="medium">
                                {title}
                              </Typography>
                            )
                          }
                          secondary={
                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                              {pmid && (
                                <Chip
                                  label={`PMID: ${pmid}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}
                                />
                              )}
                              {citationCount > 0 && (
                                <Chip
                                  label={`${citationCount} citations`}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No key papers identified
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Publication Trends */}
          <Grid item xs={12} md={6}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Publication Trends
                </Typography>
              </Box>
              {Object.keys(publicationTrends).length > 0 ? (
                <Paper sx={{ p: 1.5, bgcolor: 'grey.50' }}>
                  {Object.entries(publicationTrends)
                    .sort(([a], [b]) => b.localeCompare(a))
                    .slice(0, 5)
                    .map(([year, count]) => (
                      <Box key={year} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">{year}</Typography>
                        <Chip label={count} size="small" color="primary" variant="outlined" />
                      </Box>
                    ))}
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>
                    Note: Line chart visualization can be added for better trend visualization
                  </Typography>
                </Paper>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No trend data available
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Top Journals */}
          <Grid item xs={12}>
            {topJournals.length > 0 && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <SchoolIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Top Journals
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {topJournals.map((journal, idx) => (
                    <Chip
                      key={idx}
                      label={journal}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}















