/**
 * Papers List Component
 * 
 * Displays PubMed articles from Research Intelligence portal results
 * 
 * Research Use Only - Not for Clinical Diagnosis
 */

import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Link,
  Chip,
  Paper
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

export default function PapersList({ papers, maxDisplay = 10 }) {
  if (!papers || papers.length === 0) {
    return null;
  }

  const displayPapers = papers.slice(0, maxDisplay);
  const remainingCount = papers.length - maxDisplay;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Articles Found ({papers.length})
      </Typography>
      <List dense>
        {displayPapers.map((paper, idx) => {
          const title = paper.title || paper.Title || 'Untitled';
          const pmid = paper.pmid || paper.PMID || paper.pubmed_id || null;
          const doi = paper.doi || paper.DOI || null;
          const journal = paper.journal || paper.Journal || paper.source || null;
          const authors = paper.authors || paper.Authors || null;
          const year = paper.year || paper.Year || paper.publication_date?.split('-')[0] || null;
          const abstract = paper.abstract || paper.Abstract || null;

          // Build PubMed URL
          const pubmedUrl = pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}` : null;

          return (
            <ListItem
              key={idx}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
                bgcolor: 'background.paper',
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              <ListItemIcon>
                <ArticleIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box>
                    {pubmedUrl ? (
                      <Link
                        href={pubmedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        <Typography variant="body2" fontWeight="medium">
                          {title}
                        </Typography>
                        <OpenInNewIcon fontSize="small" />
                      </Link>
                    ) : (
                      <Typography variant="body2" fontWeight="medium">
                        {title}
                      </Typography>
                    )}
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 0.5 }}>
                    {journal && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {journal}
                        {year && ` (${year})`}
                      </Typography>
                    )}
                    {authors && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {Array.isArray(authors) ? authors.slice(0, 3).join(', ') : authors}
                        {Array.isArray(authors) && authors.length > 3 && ' et al.'}
                      </Typography>
                    )}
                    {abstract && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: 'block',
                          mt: 0.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {abstract}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                      {pmid && (
                        <Chip
                          label={`PMID: ${pmid}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      {doi && (
                        <Chip
                          label={`DOI: ${doi}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>
                }
              />
            </ListItem>
          );
        })}
      </List>
      {remainingCount > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          ... and {remainingCount} more articles
        </Typography>
      )}
    </Box>
  );
}




