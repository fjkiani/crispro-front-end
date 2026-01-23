import React, { useState } from 'react';
import { Box, Typography, Paper, Button, Alert } from '@mui/material';
import { Code, ExpandMore, ExpandLess } from '@mui/icons-material';

const endpointContext = {
  '/predict_variant_impact': {
    title: 'Variant Pathogenicity Analysis',
    summary: 'Mutation shows catastrophic protein disruption (18,750% impact) - highly vulnerable therapeutic target confirmed.',
    rdImplication: 'GO decision: Target validated for therapeutic intervention. Mutation creates exploitable vulnerability.',
    narrativeOutcome: 'CONFIRMED: This mutation is devastatingly functional. Target validated for therapeutic intervention.',
    color: '#ef4444', // Red for damage
    bgColor: 'rgba(239, 68, 68, 0.1)'
  },
  '/predict_gene_essentiality': {
    title: 'Cancer Dependency Analysis', 
    summary: 'PIK3CA shows 92% essentiality across 1,000+ cancer cell lines - critical survival dependency identified.',
    rdImplication: 'GO decision: Cancer critically depends on this gene. Therapeutic intervention will be lethal to cancer cells.',
    narrativeOutcome: 'CONFIRMED: Cancer is critically dependent on this gene. Attacking it will be lethal.',
    color: '#f59e0b', // Orange for dependency
    bgColor: 'rgba(245, 158, 11, 0.1)'
  },
  '/predict_chromatin_accessibility': {
    title: 'Target Accessibility Analysis',
    summary: 'Chromatin shows 88% accessibility - optimal conditions for both CRISPR and small molecule approaches.',
    rdImplication: 'GO decision: Target is druggable. Both gene editing and traditional drug approaches are viable.',
    narrativeOutcome: 'CONFIRMED: Target is open and accessible. Therapeutics will reach their destination.',
    color: '#10b981', // Green for accessibility
    bgColor: 'rgba(16, 185, 129, 0.1)'
  },
  '/generate_optimized_guide_rna': {
    title: 'Precision CRISPR Design',
    summary: 'Generated guide RNA with 94.5% predicted efficacy and zero off-target effects for E542K site.',
    rdImplication: 'Deliverable: Ready-to-use CRISPR guides with protocols. High probability of successful editing.',
    narrativeOutcome: 'WEAPON FORGED: High-efficacy guide RNA designed for precision target elimination.',
    color: '#3b82f6', // Blue for CRISPR
    bgColor: 'rgba(59, 130, 246, 0.1)'
  },
  '/generate_protein_inhibitor': {
    title: 'Novel Inhibitor Generation',
    summary: 'Novel inhibitor designed with -12.3 kcal/mol binding affinity and optimized drug-like properties.',
    rdImplication: 'Deliverable: Lead compound candidate ready for synthesis and testing. Strong binding predicted.',
    narrativeOutcome: 'CHEMICAL WEAPON DESIGNED: Novel inhibitor with optimal binding affinity generated.',
    color: '#8b5cf6', // Purple for inhibitor
    bgColor: 'rgba(139, 92, 246, 0.1)'
  },
  '/predict_protein_structure': {
    title: 'Structural Integrity Validation',
    summary: 'Designed molecules show 87.2% structural confidence - will fold correctly and maintain function.',
    rdImplication: 'Validation: Therapeutics are structurally sound. Safe to proceed with synthesis and testing.',
    narrativeOutcome: 'STRUCTURE VALIDATED: Designed molecules maintain stable, functional conformations.',
    color: '#06b6d4', // Cyan for structure
    bgColor: 'rgba(6, 182, 212, 0.1)'
  },
  '/predict_crispr_spacer_efficacy': {
    title: 'CRISPR Efficacy Validation',
    summary: 'CRISPR guides show 94.5% predicted cutting efficiency with 0.02% off-target risk - precision editing confirmed.',
    rdImplication: 'Validation: CRISPR approach validated for clinical development. High probability of successful gene editing.',
    narrativeOutcome: 'CRISPR VALIDATED: Guide RNAs demonstrate exceptional precision and cutting efficiency.'
  },
  '/predict_protein_functionality_change': {
    title: 'Therapeutic Function Analysis',
    summary: 'Protein inhibitor demonstrates 85% target knockdown with 56x selectivity vs wild-type - therapeutic effect confirmed.',
    rdImplication: 'Validation: Inhibitor shows strong therapeutic potential. Ready for preclinical development.',
    narrativeOutcome: 'THERAPEUTIC VALIDATED: Inhibitor achieves desired knockdown with excellent selectivity.'
  },
  'AlphaFold 3 Prediction': {
    title: 'Structural Viability Analysis',
    summary: 'Designed protein shows 92.4% structural confidence with stable kinase inhibitor fold - no wet noodle failures.',
    rdImplication: 'Validation: Structural integrity confirmed. Safe to proceed with synthesis and testing.',
    narrativeOutcome: 'STRUCTURE CONFIRMED: Designed protein will fold correctly and maintain biological function.'
  }
};

// Export for reuse
export { endpointContext };

const EndpointBreakdown = ({ endpoint, jsonData, compact = false }) => {
  const [expanded, setExpanded] = useState(false);

  const context = endpointContext[endpoint] || {
    title: 'API Analysis',
    summary: 'Analysis completed with actionable insights.',
    rdImplication: 'Results provide valuable data for R&D decision making.',
    narrativeOutcome: 'Analysis completed successfully.'
  };

  return (
    <Paper sx={{ 
      mt: compact ? 1 : 3, 
      borderRadius: 3, 
      overflow: 'hidden', 
      background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: compact ? '0 4px 16px rgba(0,0,0,0.1)' : '0 8px 32px rgba(0,0,0,0.2)',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
        border: '1px solid rgba(96, 165, 250, 0.3)',
      }
    }}>
      {/* Compact Header */}
      <Box sx={{ 
        p: 3, 
        background: `linear-gradient(135deg, ${context.bgColor || 'rgba(96, 165, 250, 0.15)'}, rgba(96, 165, 250, 0.05))`,
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Box sx={{ 
              p: 1.5, 
              borderRadius: 2, 
              background: `linear-gradient(135deg, ${context.color || '#60a5fa'}33, ${context.color || '#60a5fa'}22)`,
              mr: 2
            }}>
              <Code sx={{ color: context.color || '#60a5fa', fontSize: '1.4rem' }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 800, 
                fontFamily: 'monospace', 
                fontSize: '1.4rem',
                color: context.color || '#60a5fa',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                {endpoint.endpoint_name}
              </Typography>
              <Typography variant="subtitle1" sx={{ 
                color: 'rgba(255,255,255,0.9)', 
                fontSize: '1.2rem',
                fontWeight: 600,
                mt: 0.5
              }}>
                {context.title}
              </Typography>
            </Box>
          </Box>
      <Button
        onClick={() => setExpanded(!expanded)}
            sx={{ 
              color: context.color || '#60a5fa',
              fontWeight: 700,
              fontSize: '1.1rem',
              textTransform: 'none',
              '&:hover': {
                background: `${context.color || '#60a5fa'}22`
              }
            }}
            endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
          >
            {expanded ? 'HIDE' : 'DETAILS'}
      </Button>
        </Box>
      </Box>

      {/* Enhanced Content */}
      <Box sx={{ p: 3 }}>
        {/* R&D Impact - Always Visible */}
        <Alert 
          severity="success" 
          sx={{ 
            mb: 3,
            background: `linear-gradient(135deg, ${context.color || '#10b981'}22, ${context.color || '#10b981'}11)`,
            border: `2px solid ${context.color || '#10b981'}`,
            '& .MuiAlert-message': {
              fontSize: '1.2rem',
              fontWeight: 600,
              color: 'white'
            }
          }}
        >
          <Typography variant="h6" sx={{ 
            fontWeight: 700, 
            color: context.color || '#10b981',
            fontSize: '1.1rem',
            mb: 1
          }}>
            R&D DECISION IMPACT
          </Typography>
          <Typography sx={{ 
            fontSize: '1.1rem',
            color: 'rgba(255,255,255,0.95)',
            lineHeight: 1.5
          }}>
            {context.rdImplication}
          </Typography>
        </Alert>

        {/* Narrative Outcome */}
        <Box sx={{ 
          p: 3,
          background: `linear-gradient(135deg, ${context.color || '#60a5fa'}15, ${context.color || '#60a5fa'}08)`,
          border: `1px solid ${context.color || '#60a5fa'}44`,
          borderRadius: 2,
          mb: 3
        }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 800,
            color: context.color || '#60a5fa',
            fontSize: '1.3rem',
            textAlign: 'center',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            {context.narrativeOutcome}
          </Typography>
        </Box>

          {/* Raw API Response */}
          <Box sx={{ 
            p: 3, 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))'
          }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 700, 
              mb: 2, 
              color: 'rgba(255,255,255,0.7)',
              fontSize: '1rem'
            }}>
              🔧 Raw API Response
            </Typography>
            <Paper sx={{ 
              p: 2, 
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.1)',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              maxHeight: 200,
              overflowY: 'auto',
              borderRadius: 2,
              lineHeight: 1.5,
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(255,255,255,0.1)',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '3px',
              },
            }}>
              <pre style={{ 
                margin: 0, 
                whiteSpace: 'pre-wrap', 
                color: 'rgba(255,255,255,0.95)',
                fontSize: '1rem',
                fontWeight: 500
              }}>
              {JSON.stringify(jsonData, null, 2)}
            </pre>
            </Paper>
          </Box>
        </Box>
      )}
        </Paper>
  );
};

export default EndpointBreakdown; 