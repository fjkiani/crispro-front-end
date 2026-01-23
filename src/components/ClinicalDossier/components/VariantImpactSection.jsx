import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Collapse,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  Science,
  Info,
  Warning,
  CheckCircle,
  LocalPharmacy
} from '@mui/icons-material';

/**
 * VariantImpactSection Component
 * 
 * Displays variant-level analysis with expandable cards showing
 * gene, HGVS notation, classification, inheritance, functional impact, and rationale
 * 
 * @param {Object} props
 * @param {Array<VariantData>} props.variants - Array of variant data objects
 */
const VariantImpactSection = ({ variants = [] }) => {
  const [expandedVariants, setExpandedVariants] = useState(new Set());

  const toggleVariant = (index) => {
    const newExpanded = new Set(expandedVariants);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedVariants(newExpanded);
  };

  const getClassificationColor = (classification) => {
    switch (classification?.toUpperCase()) {
      case 'PATHOGENIC':
        return 'error';
      case 'VUS':
        return 'warning';
      case 'BENIGN':
        return 'success';
      default:
        return 'default';
    }
  };

  const getInheritanceColor = (inheritance) => {
    switch (inheritance?.toUpperCase()) {
      case 'GERMLINE':
        return 'info';
      case 'SOMATIC':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (!variants || variants.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
          Variant Impact Analysis
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No variant data available.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Science color="primary" />
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Variant Impact Analysis
        </Typography>
        <Tooltip title="Detailed analysis of each variant's functional impact and biological rationale">
          <Info fontSize="small" color="action" sx={{ ml: 1 }} />
        </Tooltip>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {variants.length} variant{variants.length !== 1 ? 's' : ''} identified. 
        Click on any variant card to view detailed analysis.
      </Typography>

      <Grid container spacing={3}>
        {variants.map((variant, index) => {
          const isExpanded = expandedVariants.has(index);
          const functionalImpact = variant.functional_impact || {};

          return (
            <Grid item xs={12} key={index}>
              <Card 
                elevation={2}
                sx={{
                  '&:hover': {
                    boxShadow: 4,
                    transition: 'box-shadow 0.3s'
                  }
                }}
              >
                <CardContent>
                  {/* Header - Always Visible */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {variant.gene || 'Unknown Gene'}
                        </Typography>
                        <Chip
                          label={variant.classification || 'Unknown'}
                          color={getClassificationColor(variant.classification)}
                          size="small"
                        />
                        <Chip
                          label={variant.inheritance || 'Unknown'}
                          color={getInheritanceColor(variant.inheritance)}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                      {variant.hgvs_p && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', mb: 1 }}>
                          {variant.hgvs_p}
                        </Typography>
                      )}
                      {variant.affects_drug_response > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <LocalPharmacy fontSize="small" color="primary" />
                          <Typography variant="caption" color="primary">
                            Affects {variant.affects_drug_response} drug{variant.affects_drug_response !== 1 ? 's' : ''} response
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    <IconButton
                      onClick={() => toggleVariant(index)}
                      size="small"
                      sx={{ ml: 2 }}
                    >
                      {isExpanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </Box>

                  {/* Expanded Content */}
                  <Collapse in={isExpanded}>
                    <Divider sx={{ my: 2 }} />
                    
                    {/* Functional Impact */}
                    {Object.keys(functionalImpact).length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          Functional Impact Scores
                        </Typography>
                        <Grid container spacing={1}>
                          {Object.entries(functionalImpact).map(([key, value]) => (
                            <Grid item xs={6} sm={4} key={key}>
                              <Box sx={{ 
                                p: 1, 
                                bgcolor: 'grey.50', 
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'grey.200'
                              }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {typeof value === 'number' ? value.toFixed(3) : value}
                                </Typography>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}

                    {/* Rationale */}
                    {variant.rationale && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          Biological Rationale
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ 
                          p: 2, 
                          bgcolor: 'grey.50', 
                          borderRadius: 1,
                          borderLeft: '3px solid',
                          borderColor: 'primary.main'
                        }}>
                          {variant.rationale}
                        </Typography>
                      </Box>
                    )}

                    {/* Warning if no rationale */}
                    {!variant.rationale && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1, 
                        p: 1.5, 
                        bgcolor: 'warning.light', 
                        borderRadius: 1,
                        mb: 2
                      }}>
                        <Warning fontSize="small" color="warning" />
                        <Typography variant="caption" color="text.secondary">
                          No biological rationale available for this variant.
                        </Typography>
                      </Box>
                    )}
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
};

export default VariantImpactSection;
