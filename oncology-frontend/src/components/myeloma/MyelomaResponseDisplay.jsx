import React from 'react';
import { Box, Typography, Paper, Chip, Divider, Grid, Link as MuiLink, Button } from '@mui/material';
import BaseCard from '../common/BaseCard';
import { Link, useNavigate } from 'react-router-dom';
import useAppStore from '../../store';

const getImpactColor = (impact_level) => {
  if (typeof impact_level !== 'number') {
    return "grey"; // Default color for errors or non-numeric values
  }
  if (impact_level >= 3) return "error.main"; // Red
  if (impact_level >= 2) return "warning.main"; // Orange
  if (impact_level >= 1) return "info.main"; // Gold/Blue
  return "success.main"; // Green
};

const MyelomaResponseDisplay = ({ results }) => {
  const navigate = useNavigate();
  const { setActiveMutation } = useAppStore();

  if (!results) {
    return <BaseCard title="Awaiting Analysis..."><Typography>Submit patient mutations to analyze drug response.</Typography></BaseCard>;
  }

  const { prediction, pathway_scores, detailed_analysis } = results;

  return (
    <Box>
      <BaseCard title="Analysis Complete" sx={{ mb: 3 }}>
        <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
          Final Prediction: {prediction}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">RAS/MAPK Pathway Impact Score:</Typography>
            <Chip label={pathway_scores.summed_impact_ras_pathway.toFixed(2)} color="primary" size="medium" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">TP53 Pathway Impact Score:</Typography>
            <Chip label={pathway_scores.summed_impact_tp53.toFixed(2)} color="primary" size="medium" />
          </Grid>
        </Grid>
      </BaseCard>

      <BaseCard title="Detailed Variant-Level Analysis">
        {detailed_analysis && detailed_analysis.length > 0 ? (
          detailed_analysis.map((detail, index) => (
            <Box key={index} sx={{
              borderLeft: `6px solid ${getImpactColor(detail.calculated_impact_level)}`,
              pl: 2,
              mb: 3,
              pb: 1,
              bgcolor: 'background.paper',
            }}>
              <Typography variant="h6" sx={{ mt: 1 }}>Variant: {detail.variant}</Typography>
              <Typography variant="body1">
                <b>Calculated Impact Level: {typeof detail.calculated_impact_level === 'number' ? detail.calculated_impact_level.toFixed(1) : detail.calculated_impact_level}</b><br/>
                Zeta Oracle Interpretation: <i>'{detail.evo2_result?.interpretation || 'N/A'}'</i><br/>
                Zeta Score (Δ): {typeof detail.evo2_result?.zeta_score === 'number' ? detail.evo2_result.zeta_score.toFixed(6) : 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>
                <b>Explanation:</b> The Zeta Score measures the change in the protein's stability and function caused by the mutation. A negative score, like the one here, indicates the mutation is disruptive and likely harmful. A positive score suggests the change is tolerated.
              </Typography>
              {/* Link to ClinVar */}
              {detail.variant && (
                <MuiLink 
                  href={`https://www.ncbi.nlm.nih.gov/clinvar/?term=${detail.variant}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}
                >
                  View on ClinVar ↗
                </MuiLink>
              )}

              {/* --- Call to Action Button (Design CRISPR Therapy) --- */}
              {typeof detail.calculated_impact_level === 'number' && detail.calculated_impact_level >= 2 && (
                <Box sx={{ mt: 2 }}>
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    onClick={() => {
                      // Construct the data for handoff
                      const mutationForHandoff = {
                        hugo_gene_symbol: detail.gene,
                        protein_change: detail.variant.split(' ')[1], // Extract just the p. format
                        genomic_coordinate_hg38: `${detail.chrom}:${detail.pos}`, // Construct locus
                        sequence_for_perplexity: "", // We don't have this from current backend
                      };
                      setActiveMutation(mutationForHandoff);
                      navigate('/crispr-designer'); // Navigate to CRISPR Designer
                    }}
                  >
                    🎯 Design CRISPR Therapy
                  </Button>
                </Box>
              )}
              {index < detailed_analysis.length - 1 && <Divider sx={{ my: 2 }} />}
            </Box>
          ))
        ) : (
          <Typography>No detailed analysis available.</Typography>
        )}
      </BaseCard>
    </Box>
  );
};

export default MyelomaResponseDisplay; 