import React, { useState } from 'react';
import { Box, Typography, Paper, Button, Alert } from '@mui/material';
import { Code, ExpandMore, ExpandLess } from '@mui/icons-material';

const endpointContext = {
  '/predict_variant_impact': {
    title: 'Variant Pathogenicity Analysis',
    summary: 'Mutation shows catastrophic protein disruption (18,750% impact) - highly vulnerable therapeutic target confirmed.',
    rdImplication: 'GO decision: Target validated for therapeutic intervention. Mutation creates exploitable vulnerability.',
    narrativeOutcome: 'CONFIRMED: This mutation is devastatingly functional. Target validated for therapeutic intervention.'
  },
  '/predict_gene_essentiality': {
    title: 'Cancer Dependency Analysis', 
    summary: 'PIK3CA shows 92% essentiality across 1,000+ cancer cell lines - critical survival dependency identified.',
    rdImplication: 'GO decision: Cancer critically depends on this gene. Therapeutic intervention will be lethal to cancer cells.',
    narrativeOutcome: 'CONFIRMED: Cancer is critically dependent on this gene. Attacking it will be lethal.'
  },
  '/predict_chromatin_accessibility': {
    title: 'Target Accessibility Analysis',
    summary: 'Chromatin shows 88% accessibility - optimal conditions for both CRISPR and small molecule approaches.',
    rdImplication: 'GO decision: Target is druggable. Both gene editing and traditional drug approaches are viable.',
    narrativeOutcome: 'CONFIRMED: Target is open and accessible. Therapeutics will reach their destination.'
  },
  '/generate_optimized_guide_rna': {
    title: 'Precision CRISPR Design',
    summary: 'Generated guide RNA with 94.5% predicted efficacy and zero off-target effects for E542K site.',
    rdImplication: 'Deliverable: Ready-to-use CRISPR guides with protocols. High probability of successful editing.',
    narrativeOutcome: 'WEAPON FORGED: High-efficacy guide RNA designed for precision target elimination.'
  },
  '/generate_protein_inhibitor': {
    title: 'Novel Inhibitor Generation',
    summary: 'Novel inhibitor designed with -12.3 kcal/mol binding affinity and optimized drug-like properties.',
    rdImplication: 'Deliverable: Lead compound candidate ready for synthesis and testing. Strong binding predicted.',
    narrativeOutcome: 'CHEMICAL WEAPON DESIGNED: Novel inhibitor with optimal binding affinity generated.'
  },
  '/predict_protein_structure': {
    title: 'Structural Integrity Validation',
    summary: 'Designed molecules show 87.2% structural confidence - will fold correctly and maintain function.',
    rdImplication: 'Validation: Therapeutics are structurally sound. Safe to proceed with synthesis and testing.',
    narrativeOutcome: 'STRUCTURE VALIDATED: Designed molecules maintain stable, functional conformations.'
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

const EndpointBreakdown = ({ endpoint, jsonData }) => {
  const [expanded, setExpanded] = useState(false);

  const context = endpointContext[endpoint] || {
    title: 'API Analysis',
    summary: 'Analysis completed with actionable insights.',
    rdImplication: 'Results provide valuable data for R&D decision making.',
    narrativeOutcome: 'Analysis completed successfully.'
  };

  return (
    <Paper sx={{ 
      mt: 3, 
      borderRadius: 3, 
      overflow: 'hidden', 
      background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
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
        background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.15), rgba(96, 165, 250, 0.05))',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Box sx={{ 
              p: 1.5, 
              borderRadius: 2, 
              background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.3), rgba(96, 165, 250, 0.2))',
              mr: 2
            }}>
              <Code sx={{ color: '#60a5fa', fontSize: '1.4rem' }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 700, 
                fontFamily: 'monospace', 
                fontSize: '1.1rem',
                color: 'white',
                mb: 0.5
              }}>
                {endpoint}
              </Typography>
              <Typography variant="caption" sx={{ 
                fontSize: '0.9rem',
                color: 'rgba(255,255,255,0.7)',
                fontWeight: 500
              }}>
                {context.title}
              </Typography>
            </Box>
          </Box>
      <Button
            size="small"
        variant="outlined"
        onClick={() => setExpanded(!expanded)}
            endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
            sx={{ 
              fontSize: '0.8rem', 
              fontWeight: 700, 
              minWidth: 'auto', 
              px: 2, 
              py: 1,
              borderColor: 'rgba(255,255,255,0.3)',
              color: 'white',
              '&:hover': {
                borderColor: '#60a5fa',
                backgroundColor: 'rgba(96, 165, 250, 0.1)',
              }
            }}
          >
            {expanded ? 'HIDE' : 'DETAILS'}
      </Button>
        </Box>
        
        {/* Key Outcome - Always Visible */}
        <Alert 
          severity="success" 
          sx={{ 
            mt: 3, 
            background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.2), rgba(52, 211, 153, 0.1))',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            borderRadius: 2,
            py: 2,
            '& .MuiAlert-icon': {
              color: '#34d399'
            }
          }}
        >
          <Typography variant="body1" sx={{ 
            fontWeight: 600, 
            fontSize: '1rem', 
            lineHeight: 1.5,
            color: 'white'
          }}>
            {context.narrativeOutcome}
          </Typography>
        </Alert>
      </Box>

      {/* Expandable Details */}
      {expanded && (
        <Box>
          {/* Analysis Summary */}
          <Box sx={{ 
            p: 3, 
            background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.08), rgba(96, 165, 250, 0.03))',
            borderBottom: '1px solid rgba(255,255,255,0.05)'
          }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 700, 
              mb: 2, 
              color: '#60a5fa',
              fontSize: '1.1rem'
            }}>
              📊 Analysis Summary
            </Typography>
            <Typography variant="body1" sx={{ 
              fontSize: '1rem', 
              color: 'rgba(255,255,255,0.9)', 
              mb: 2, 
              lineHeight: 1.6,
              fontWeight: 500
            }}>
              {context.summary}
            </Typography>
          </Box>
          
          {/* R&D Implication */}
          <Box sx={{ 
            p: 3, 
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(34, 197, 94, 0.03))',
            borderBottom: '1px solid rgba(255,255,255,0.05)'
          }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 700, 
              mb: 2, 
              color: '#22c55e',
              fontSize: '1.1rem'
            }}>
              🎯 R&D Decision Impact
            </Typography>
            <Typography variant="body1" sx={{ 
              fontSize: '1rem', 
              color: 'rgba(255,255,255,0.9)', 
              lineHeight: 1.6,
              fontWeight: 500
            }}>
              {context.rdImplication}
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
                color: 'rgba(255,255,255,0.9)',
                fontSize: '0.85rem'
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