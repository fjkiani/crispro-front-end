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
  AccordionDetails,
  LinearProgress
} from '@mui/material';
import { 
  Science,
  Timeline,
  Speed,
  CheckCircle,
  ExpandMore,
  Psychology,
  Biotech,
  Assessment,
  Fingerprint
} from '@mui/icons-material';
import BaseCard from '../common/BaseCard';

const ProteinSynthesisResults = ({ results }) => {
  if (!results) {
    return (
      <BaseCard title="Awaiting Translation...">
        <Typography>Submit mRNA sequence to simulate protein synthesis.</Typography>
      </BaseCard>
    );
  }

  // RUNX1 Protein Demo Data
  const demoResults = {
    gene_symbol: results.inputs?.gene_symbol || "RUNX1",
    protein_name: "Runt-related transcription factor 1",
    uniprot_id: "Q01196",
    protein_length: 453, // amino acids
    molecular_weight: 50.2, // kDa
    isoelectric_point: 8.47,
    amino_acid_sequence: "MASPGNCNWPWRSYCLPLDPPCCPQAQPRLAPLPTPPGTRCSHGGNRPQSTTKGSRTSGSRPPLSGSGTSSSSSSSSRERSEDGSTSGVSLPNTPKTIQDMHRDYDDDDDDDDDERKRPRKQKLTDAAIIDKVAKMSEALRDDLRQERAIHAERVIQLLPPEDLELPLKPLPHRVDIIDNTSIEPPRKLRRSKHLDKKKQHQEKRRLDNMEAIEALEDSMSQLEPDGSSKSGTSSYKRRLGSKEKSGKKPQAAIMSRYVSKLRRQNNVNYQVIAQNPRKPNLKISSLRPGRQVHLEEWEQRIYSVSSGSAVSQCYDGCCAGSKSQFVSYSNQVEEQRTQMPGDLGGPTSSSLRGCAIPQIKGASPQVKSKRSRTQKTTSFLPDGYLKTLSRQGYGGTQYSPKHGKHSRRGRNGTGTHSWEPNGSAEPKIMFKKRKKDKEAAYRSIKKSGKRTPQ",
    domains: [
      {
        name: "Runt domain",
        start: 50,
        end: 177,
        function: "DNA binding and protein-protein interactions",
        conservation: 98.5
      },
      {
        name: "Transactivation domain",
        start: 291,
        end: 371,
        function: "Transcriptional activation",
        conservation: 76.2
      },
      {
        name: "Nuclear localization signal",
        start: 390,
        end: 396,
        function: "Nuclear import",
        conservation: 89.1
      }
    ],
    post_translational_modifications: [
      {
        type: "Phosphorylation",
        position: "Ser249",
        function: "Regulates transcriptional activity",
        confidence: 0.92,
        kinase: "CDK1"
      },
      {
        type: "Phosphorylation", 
        position: "Thr161",
        function: "DNA binding regulation",
        confidence: 0.87,
        kinase: "CK2"
      },
      {
        type: "Acetylation",
        position: "Lys43",
        function: "Chromatin interaction",
        confidence: 0.78,
        enzyme: "p300"
      },
      {
        type: "Ubiquitination",
        position: "Lys298",
        function: "Protein degradation",
        confidence: 0.85,
        enzyme: "SKP2"
      }
    ],
    translation_metrics: {
      codon_adaptation_index: 0.847,
      translation_efficiency: 91.3,
      ribosome_binding_strength: 88.7,
      folding_probability: 94.2,
      aggregation_propensity: 12.8,
      solubility_score: 87.4
    },
    secondary_structure: {
      alpha_helix: 32.4,
      beta_sheet: 18.7,
      random_coil: 48.9
    }
  };

  const getModificationColor = (type) => {
    const colors = {
      'Phosphorylation': '#2196f3',
      'Acetylation': '#4caf50', 
      'Ubiquitination': '#ff9800',
      'Methylation': '#9c27b0'
    };
    return colors[type] || '#757575';
  };

  const getQualityColor = (score) => {
    if (score >= 90) return "success";
    if (score >= 80) return "warning";
    return "error";
  };

  const formatSequence = (sequence, lineLength = 60) => {
    const lines = [];
    for (let i = 0; i < sequence.length; i += lineLength) {
      const line = sequence.slice(i, i + lineLength);
      const lineNumber = String(i + 1).padStart(4, ' ');
      lines.push({ number: lineNumber, sequence: line });
    }
    return lines;
  };

  const sequenceLines = formatSequence(demoResults.amino_acid_sequence);

  return (
    <Box>
      {/* Demo Warning Banner */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>🎭 DEMO MODE:</strong> Simulated protein synthesis based on RUNX1 reference data. 
          Live Evo2 protein modeling integration coming soon!
        </Typography>
      </Alert>

      {/* Protein Summary */}
      <BaseCard title="🧬 Protein Synthesis Complete" sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" color="primary">
              {demoResults.protein_name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Gene: {demoResults.gene_symbol} | UniProt: {demoResults.uniprot_id}
            </Typography>
            <Typography variant="body2">
              {demoResults.protein_length} amino acids | {demoResults.molecular_weight} kDa | pI: {demoResults.isoelectric_point}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip 
                icon={<Biotech />} 
                label={`${demoResults.protein_length} AA`} 
                color="primary" 
                size="small" 
              />
              <Chip 
                icon={<Science />} 
                label={`${demoResults.domains.length} Domains`} 
                color="secondary" 
                size="small" 
              />
              <Chip 
                icon={<CheckCircle />} 
                label="Translation Complete" 
                color="success" 
                size="small" 
              />
            </Box>
          </Grid>
        </Grid>
      </BaseCard>

      {/* Amino Acid Sequence */}
      <BaseCard title="🔤 Amino Acid Sequence" sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          <strong>RUNX1 Protein:</strong> Complete amino acid sequence with domain highlighting
        </Typography>
        
        <Box sx={{ 
          backgroundColor: '#f5f5f5', 
          p: 2, 
          borderRadius: 1,
          fontFamily: 'monospace',
          fontSize: '0.8rem',
          maxHeight: '300px',
          overflow: 'auto',
          border: '1px solid #ddd'
        }}>
          {sequenceLines.map((line, index) => (
            <Box key={index} sx={{ mb: 0.5 }}>
              <Typography component="span" sx={{ color: '#666', mr: 1 }}>
                {line.number}
              </Typography>
              <Typography component="span">
                {line.sequence}
              </Typography>
            </Box>
          ))}
        </Box>
        
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label="Runt Domain (50-177)" sx={{ backgroundColor: '#2196f3', color: 'white' }} size="small" />
          <Chip label="Transactivation (291-371)" sx={{ backgroundColor: '#4caf50', color: 'white' }} size="small" />
          <Chip label="Nuclear Localization (390-396)" sx={{ backgroundColor: '#ff9800', color: 'white' }} size="small" />
        </Box>
      </BaseCard>

      {/* Functional Domains */}
      <BaseCard title="🎯 Functional Domains" sx={{ mb: 3 }}>
        {demoResults.domains.map((domain, index) => (
          <Card key={index} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" color="primary">
                    {domain.name}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Position: {domain.start}-{domain.end} | Function: {domain.function}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={domain.conservation} 
                    sx={{ height: 8, borderRadius: 4 }}
                    color={domain.conservation > 90 ? "success" : "warning"}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    Conservation
                  </Typography>
                  <Typography variant="h6" color={domain.conservation > 90 ? "success.main" : "warning.main"}>
                    {domain.conservation}%
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </BaseCard>

      {/* Post-translational Modifications */}
      <BaseCard title="⚙️ Post-translational Modifications" sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Predicted modifications affecting protein function and regulation
        </Typography>
        
        <Grid container spacing={2}>
          {demoResults.post_translational_modifications.map((mod, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Paper sx={{ p: 2, border: `2px solid ${getModificationColor(mod.type)}` }}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Fingerprint sx={{ color: getModificationColor(mod.type) }} />
                  <Typography variant="h6" sx={{ color: getModificationColor(mod.type) }}>
                    {mod.type}
                  </Typography>
                </Box>
                <Typography variant="body2"><strong>Position:</strong> {mod.position}</Typography>
                <Typography variant="body2"><strong>Function:</strong> {mod.function}</Typography>
                <Typography variant="body2"><strong>Enzyme:</strong> {mod.kinase || mod.enzyme}</Typography>
                <Chip 
                  label={`${(mod.confidence * 100).toFixed(0)}% confidence`}
                  size="small"
                  color={mod.confidence > 0.8 ? "success" : "warning"}
                  sx={{ mt: 1 }}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </BaseCard>

      {/* Translation Quality Metrics */}
      <BaseCard title="📊 Translation & Folding Metrics">
        <Grid container spacing={2}>
          {Object.entries(demoResults.translation_metrics).map(([metric, score]) => (
            <Grid item xs={12} sm={6} md={4} key={metric}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {metric.replace(/_/g, ' ').toUpperCase()}
                </Typography>
                <Chip 
                  label={`${score}${metric.includes('propensity') ? '%' : metric.includes('index') ? '' : '%'}`}
                  color={metric === 'aggregation_propensity' ? 
                    (score < 20 ? "success" : "warning") : 
                    getQualityColor(score)}
                  sx={{ mt: 1, fontWeight: 'bold' }}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Secondary Structure Prediction */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>Secondary Structure Prediction</Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2">α-Helix</Typography>
                <Typography variant="h6" color="primary">{demoResults.secondary_structure.alpha_helix}%</Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2">β-Sheet</Typography>
                <Typography variant="h6" color="secondary">{demoResults.secondary_structure.beta_sheet}%</Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2">Random Coil</Typography>
                <Typography variant="h6" color="text.secondary">{demoResults.secondary_structure.random_coil}%</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </BaseCard>
    </Box>
  );
};

export default ProteinSynthesisResults; 