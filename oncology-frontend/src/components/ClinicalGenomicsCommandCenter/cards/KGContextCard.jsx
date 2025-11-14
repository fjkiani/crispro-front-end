import React from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Chip, 
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

export const KGContextCard = ({ result }) => {
  if (!result?.kg_context) return null;
  
  const { coverage, pathways } = result.kg_context;
  
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Knowledge Graph Context
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Coverage and pathway mapping from our Knowledge Base
      </Typography>
      
      {/* Coverage by Gene */}
      {coverage && Object.keys(coverage).length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Data Coverage:
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(coverage).map(([gene, cov]) => (
              <Grid item xs={12} sm={6} key={gene}>
                <Paper variant="outlined" sx={{ p: 1.5 }}>
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    {gene}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label="ClinVar"
                      size="small"
                      icon={cov.clinvar ? <CheckCircleIcon /> : <CancelIcon />}
                      color={cov.clinvar ? 'success' : 'default'}
                      variant={cov.clinvar ? 'filled' : 'outlined'}
                    />
                    <Chip 
                      label="AlphaMissense"
                      size="small"
                      icon={cov.alphamissense ? <CheckCircleIcon /> : <CancelIcon />}
                      color={cov.alphamissense ? 'success' : 'default'}
                      variant={cov.alphamissense ? 'filled' : 'outlined'}
                    />
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      
      {/* Pathway Mappings */}
      {pathways && Object.keys(pathways).length > 0 && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2">Pathway Mappings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              {Object.entries(pathways).map(([gene, paths]) => (
                <Box key={gene} sx={{ mb: 1 }}>
                  <Typography variant="body2" fontWeight="bold">
                    {gene}:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                    {paths.map((pathway, idx) => (
                      <Chip 
                        key={idx}
                        label={pathway}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}
      
      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
        💡 Coverage enables Fusion scoring and pathway-aware confidence modulation
      </Typography>
    </Paper>
  );
};

      </Typography>
    </Paper>
  );
};
