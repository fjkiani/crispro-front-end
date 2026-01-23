import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Chip, 
  Divider, 
  Grid, 
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { 
  Science,
  Timeline,
  Speed,
  CheckCircle,
  ExpandMore,
  ContentCopy,
  Assessment
} from '@mui/icons-material';
import BaseCard from '../common/BaseCard';

const TranscriptionResults = ({ results }) => {
  if (!results) {
    return (
      <BaseCard title="Awaiting Transcription...">
        <Typography>Submit DNA sequence to simulate transcription process.</Typography>
      </BaseCard>
    );
  }

  // RUNX1 Demo Data
  const demoResults = {
    gene_symbol: results.inputs?.gene_symbol || "RUNX1",
    transcript_count: 3,
    canonical_transcript: "RUNX1-001",
    total_length: 1537, // nucleotides
    coding_length: 1362,
    utr5_length: 89,
    utr3_length: 86,
    exon_count: 8,
    mrna_sequence: "AUGAGCAGCCGGAACUGCAACUGGGCCGUGGAGAGCUACGUGCCCCCUCGGCUGACCGUCCCGCCGUGCCGCCCAGGCUGCCAGCCUCGGCUACGCCUCCCGACCCCGCCGGCCGCGCCCCUCCUCUGCCCAGCUCGGAGCCGAGCUGCUCUGCGAGAAGCGCCGGGAGCGGCUCGGCGAGGCCCUCACGCCGCUCGCCACCCGCCCCUCCCCGCCGUGCCUGGGCGCCCCCGUGCACGUCAAGGACGCGAACCCGCCCUCCGCCACCCUCGCCUCCGCUCCCCUCCGCCACCCGCCUCCCGAGCAGGAGCUCGAGCCCCGAGAGCGCCAGGCGGAGAAGCGGCGGAGCCCGCGCGCGCUCGCCGCCCCGCUCGGAGAGCCGAGAGGAGAGCGCCGGCGAGAGCGCCGCC",
    splice_variants: [
      {
        id: "RUNX1-001",
        type: "Canonical",
        length: 1537,
        exons: [1,2,3,4,5,6,7,8],
        description: "Full-length protein-coding transcript"
      },
      {
        id: "RUNX1-002", 
        type: "Alternative",
        length: 1421,
        exons: [1,2,3,4,5,7,8],
        description: "Skips exon 6, affects DNA-binding domain"
      },
      {
        id: "RUNX1-003",
        type: "Truncated",
        length: 892,
        exons: [1,2,3,4],
        description: "Early termination, potential nonsense-mediated decay"
      }
    ],
    regulatory_elements: [
      {
        type: "Promoter",
        position: "-500 to +100",
        strength: "Strong (TATA-box present)",
        factors: ["SP1", "ETS1", "GATA1"]
      },
      {
        type: "Enhancer",
        position: "+23kb downstream",
        strength: "Moderate",
        factors: ["RUNX1", "CBFβ", "SCL"]
      }
    ],
    quality_metrics: {
      transcription_efficiency: 87.3,
      mrna_stability: 92.1,
      splicing_accuracy: 95.8,
      cap_efficiency: 89.4,
      polya_efficiency: 91.7
    }
  };

  const getQualityColor = (score) => {
    if (score >= 90) return "success";
    if (score >= 80) return "warning";
    return "error";
  };

  return (
    <Box>
      {/* Demo Warning Banner */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>🎭 DEMO MODE:</strong> Simulated transcription based on RUNX1 reference data. 
          Live Evo2 transcriptional modeling integration coming soon!
        </Typography>
      </Alert>

      {/* Transcription Summary */}
      <BaseCard title="🧬 Transcription Complete" sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" color="primary">
              {demoResults.gene_symbol} → mRNA Processing
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Generated {demoResults.transcript_count} transcript variants from genomic sequence
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip 
                icon={<Timeline />} 
                label={`${demoResults.total_length} nt`} 
                color="primary" 
                size="small" 
              />
              <Chip 
                icon={<Science />} 
                label={`${demoResults.exon_count} exons`} 
                color="secondary" 
                size="small" 
              />
              <Chip 
                icon={<CheckCircle />} 
                label="Processing Complete" 
                color="success" 
                size="small" 
              />
            </Box>
          </Grid>
        </Grid>
      </BaseCard>

      {/* mRNA Sequence Display */}
      <BaseCard title="📝 Canonical mRNA Sequence" sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          <strong>RUNX1-001:</strong> Full-length coding sequence with 5' and 3' UTRs
        </Typography>
        
        <Box sx={{ 
          backgroundColor: '#f5f5f5', 
          p: 2, 
          borderRadius: 1,
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          maxHeight: '200px',
          overflow: 'auto',
          border: '1px solid #ddd'
        }}>
          <Typography component="span" sx={{ color: '#2196f3' }}>
            {/* 5' UTR */}
            GCAGCCGGAACUGCAACUGGGCCGUGGAGAGCUACGUGCCCCCUCGGCUGACCGUCCCGCCGUGCCGCCCAGGCUGCCAGCCUCGGCUACGCC
          </Typography>
          <Typography component="span" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
            {/* Start codon */}
            AUG
          </Typography>
          <Typography component="span" sx={{ color: '#000' }}>
            {/* Coding sequence */}
            AGCAGCCGGAACUGCAACUGGGCCGUGGAGAGCUACGUGCCCCCUCGGCUGACCGUCCCGCCGUGCCGCCCAGGCUGCCAGCCUCGGCUACGCCUCCCGACCCCGCCGGCCGCGCCCCUCCUCUGCCCAGCUCGGAGCCGAGCUGCUCUGCGAGAAGCGCCGGGAGCGGCUCGGCGAGGCCCUCACGCCGCUCGCCACCCGCCCCUCCCCGCCGUGCCUGGGCGCCCCCGUGCACGUCAAGGACGCGAACCCGCCCUCCGCCACCCUCGCCUCCGCUCCCCUCCGCCACCCGCCUCCCGAGCAGGAGCUCGAGCCCCGAGAGCGCCAGGCGGAGAAGCGGCGGAGCCCGCGCGCGCUCGCCGCCCCGCUCGGAGAGCCGAGAGGAGAGCGCCGGCGAGAGCGCCGCC
          </Typography>
          <Typography component="span" sx={{ color: '#f44336', fontWeight: 'bold' }}>
            {/* Stop codon */}
            UAG
          </Typography>
          <Typography component="span" sx={{ color: '#ff9800' }}>
            {/* 3' UTR */}
            GCUGACCGUCCCGCCGUGCCGCCCAGGCUGCCAGCCUCGGCUACGCCUCCCGACCCCGCCGGCCGCGCCCCUCCUCUGCCCAGCUC
          </Typography>
        </Box>
        
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Chip label="5' UTR" sx={{ backgroundColor: '#2196f3', color: 'white' }} size="small" />
          <Chip label="Start (AUG)" sx={{ backgroundColor: '#4caf50', color: 'white' }} size="small" />
          <Chip label="Coding Sequence" sx={{ backgroundColor: '#000', color: 'white' }} size="small" />
          <Chip label="Stop (UAG)" sx={{ backgroundColor: '#f44336', color: 'white' }} size="small" />
          <Chip label="3' UTR" sx={{ backgroundColor: '#ff9800', color: 'white' }} size="small" />
        </Box>
      </BaseCard>

      {/* Splice Variants */}
      <BaseCard title="🔀 Alternative Splice Variants" sx={{ mb: 3 }}>
        {demoResults.splice_variants.map((variant, index) => (
          <Accordion key={variant.id} sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Typography variant="h6">{variant.id}</Typography>
                <Chip label={variant.type} color={index === 0 ? "primary" : "default"} size="small" />
                <Typography variant="body2" color="text.secondary">
                  {variant.length} nt
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {variant.description}
              </Typography>
              <Typography variant="body2">
                <strong>Exons included:</strong> {variant.exons.join(", ")}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </BaseCard>

      {/* Quality Metrics */}
      <BaseCard title="📊 Transcription Quality Metrics">
        <Grid container spacing={2}>
          {Object.entries(demoResults.quality_metrics).map(([metric, score]) => (
            <Grid item xs={12} sm={6} md={4} key={metric}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {metric.replace(/_/g, ' ').toUpperCase()}
                </Typography>
                <Chip 
                  label={`${score}%`}
                  color={getQualityColor(score)}
                  sx={{ mt: 1, fontWeight: 'bold' }}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </BaseCard>
    </Box>
  );
};

export default TranscriptionResults; 