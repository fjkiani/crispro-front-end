import React, { useState } from 'react';
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
  LinearProgress,
  Button,
  ButtonGroup,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { 
  Science,
  Timeline,
  Speed,
  CheckCircle,
  ExpandMore,
  ThreeDRotation,
  Biotech,
  Assessment,
  Visibility,
  Download,
  Share,
  ZoomIn
} from '@mui/icons-material';
import BaseCard from '../common/BaseCard';

const StructurePredictionResults = ({ results }) => {
  const [selectedView, setSelectedView] = useState('full');
  const [activeTab, setActiveTab] = useState(0);

  if (!results) {
    return (
      <BaseCard title="Awaiting Structure Prediction...">
        <Typography>Submit protein sequence to predict 3D structure.</Typography>
      </BaseCard>
    );
  }

  // RUNX1 AlphaFold 3 Demo Data
  const demoResults = {
    gene_symbol: results.inputs?.gene_symbol || "RUNX1",
    protein_name: "Runt-related transcription factor 1",
    alphafold_id: "AF-Q01196-F1",
    prediction_confidence: 87.3,
    global_plddt: 78.4,
    processing_time: "12.7 minutes",
    model_version: "AlphaFold 3.0",
    structure_summary: {
      total_residues: 453,
      high_confidence: 298, // pLDDT > 70
      medium_confidence: 112, // pLDDT 50-70
      low_confidence: 43  // pLDDT < 50
    },
    domains: [
      {
        name: "Runt Domain",
        start: 50,
        end: 177,
        avg_plddt: 92.1,
        confidence: "Very High",
        structure_type: "Beta-barrel with alpha-helices",
        function: "DNA binding and protein interactions"
      },
      {
        name: "Transactivation Domain", 
        start: 291,
        end: 371,
        avg_plddt: 45.8,
        confidence: "Low",
        structure_type: "Intrinsically disordered",
        function: "Transcriptional activation"
      },
      {
        name: "Nuclear Localization Signal",
        start: 390,
        end: 396,
        avg_plddt: 67.3,
        confidence: "Medium",
        structure_type: "Extended loop",
        function: "Nuclear import"
      }
    ],
    binding_sites: [
      {
        type: "DNA Binding",
        residues: "R80, K83, R85, N86, Y113, F115",
        location: "Runt domain major groove",
        confidence: 0.94,
        binding_affinity: "High (Kd ~10 nM)",
        target: "RUNX consensus sequence"
      },
      {
        type: "Protein-Protein Interaction",
        residues: "L144, I146, V148, L150",
        location: "Runt domain hydrophobic patch",
        confidence: 0.89,
        binding_affinity: "Medium (Kd ~500 nM)",
        target: "CBFβ subunit"
      },
      {
        type: "Chromatin Interaction",
        residues: "K305, R310, K315, K320",
        location: "Transactivation domain",
        confidence: 0.72,
        binding_affinity: "Variable",
        target: "Histone tails"
      }
    ],
    quality_metrics: {
      rama_favored: 96.8,
      rama_outliers: 0.4,
      clash_score: 2.1,
      molprobity_score: 1.23,
      side_chain_outliers: 1.2,
      bond_length_rmsd: 0.008,
      bond_angle_rmsd: 1.12
    },
    structural_features: [
      {
        type: "β-hairpin",
        position: "95-105",
        description: "Critical for DNA recognition"
      },
      {
        type: "α-helix",
        position: "120-135", 
        description: "Stabilizes DNA-binding interface"
      },
      {
        type: "Disordered region",
        position: "290-370",
        description: "Flexible transactivation domain"
      },
      {
        type: "Coiled coil",
        position: "200-220",
        description: "Potential dimerization interface"
      }
    ]
  };

  const getConfidenceColor = (plddt) => {
    if (plddt >= 90) return "#0066cc"; // Very high confidence - blue
    if (plddt >= 70) return "#66ccff"; // High confidence - light blue  
    if (plddt >= 50) return "#ffcc00"; // Medium confidence - yellow
    return "#ff6666"; // Low confidence - red
  };

  const getQualityColor = (score, metric) => {
    if (metric === 'clash_score' || metric === 'molprobity_score' || metric.includes('outliers') || metric.includes('rmsd')) {
      // Lower is better for these metrics
      if (score <= 1.0) return "success";
      if (score <= 2.0) return "warning";
      return "error";
    } else {
      // Higher is better for rama_favored
      if (score >= 95) return "success";
      if (score >= 90) return "warning";
      return "error";
    }
  };

  const mockStructureViewer = () => (
    <Box sx={{ 
      height: 400, 
      backgroundColor: '#000', 
      borderRadius: 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      border: '2px solid #333'
    }}>
      <Box sx={{ textAlign: 'center', color: 'white' }}>
        <ThreeDRotation sx={{ fontSize: 60, mb: 2, color: '#66ccff' }} />
        <Typography variant="h6" sx={{ mb: 1 }}>
          RUNX1 3D Structure
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Interactive molecular viewer would display here
        </Typography>
        <ButtonGroup variant="outlined" sx={{ 
          '& .MuiButton-root': { 
            color: 'white', 
            borderColor: '#66ccff'
          }
        }}>
          <Button startIcon={<ZoomIn />}>Zoom</Button>
          <Button startIcon={<ThreeDRotation />}>Rotate</Button>
          <Button startIcon={<Visibility />}>View</Button>
        </ButtonGroup>
      </Box>
      
      {/* Confidence color legend */}
      <Box sx={{ 
        position: 'absolute', 
        top: 10, 
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.7)',
        p: 1,
        borderRadius: 1
      }}>
        <Typography variant="caption" sx={{ color: 'white', display: 'block', mb: 1 }}>
          pLDDT Score
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 8, backgroundColor: '#0066cc' }} />
            <Typography variant="caption" sx={{ color: 'white' }}>90-100</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 8, backgroundColor: '#66ccff' }} />
            <Typography variant="caption" sx={{ color: 'white' }}>70-90</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 8, backgroundColor: '#ffcc00' }} />
            <Typography variant="caption" sx={{ color: 'white' }}>50-70</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 8, backgroundColor: '#ff6666' }} />
            <Typography variant="caption" sx={{ color: 'white' }}>&lt;50</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box>
      {/* Demo Warning Banner */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>🎭 DEMO MODE:</strong> Simulated AlphaFold 3 structure prediction based on RUNX1 reference data. 
          Live AlphaFold 3 API integration coming soon!
        </Typography>
      </Alert>

      {/* Structure Summary */}
      <BaseCard title="🏗️ 3D Structure Prediction Complete" sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" color="primary">
              {demoResults.protein_name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              AlphaFold ID: {demoResults.alphafold_id} | Model: {demoResults.model_version}
            </Typography>
            <Typography variant="body2">
              Processing time: {demoResults.processing_time} | Global pLDDT: {demoResults.global_plddt}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip 
                icon={<ThreeDRotation />} 
                label={`pLDDT ${demoResults.global_plddt}`} 
                color="primary" 
                size="small" 
              />
              <Chip 
                icon={<Science />} 
                label={`${demoResults.structure_summary.high_confidence} High Conf`} 
                color="success" 
                size="small" 
              />
              <Chip 
                icon={<CheckCircle />} 
                label="Structure Ready" 
                color="success" 
                size="small" 
              />
            </Box>
          </Grid>
        </Grid>
      </BaseCard>

      {/* 3D Structure Viewer */}
      <BaseCard title="🔮 Interactive 3D Structure" sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          <strong>AlphaFold 3 Prediction:</strong> High-confidence structure with binding sites highlighted
        </Typography>
        
        {mockStructureViewer()}
        
        <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Button variant="outlined" startIcon={<Download />}>Download PDB</Button>
          <Button variant="outlined" startIcon={<Share />}>Share Structure</Button>
          <Button variant="outlined" startIcon={<Assessment />}>View Metrics</Button>
        </Box>
      </BaseCard>

      {/* Confidence Analysis */}
      <BaseCard title="📊 Prediction Confidence Analysis" sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Confidence Distribution</Typography>
            {[
              { label: "Very High (>90)", count: demoResults.structure_summary.high_confidence, color: getConfidenceColor(95) },
              { label: "High (70-90)", count: demoResults.structure_summary.medium_confidence, color: getConfidenceColor(80) },
              { label: "Medium (50-70)", count: 87, color: getConfidenceColor(60) },
              { label: "Low (<50)", count: demoResults.structure_summary.low_confidence, color: getConfidenceColor(40) }
            ].map((item, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">{item.label}</Typography>
                  <Typography variant="body2">{item.count} residues</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(item.count / demoResults.structure_summary.total_residues) * 100}
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: '#f0f0f0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: item.color
                    }
                  }}
                />
              </Box>
            ))}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Quality Metrics</Typography>
            <Grid container spacing={1}>
              {Object.entries(demoResults.quality_metrics).map(([metric, score]) => (
                <Grid item xs={6} key={metric}>
                  <Paper sx={{ p: 1.5, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {metric.replace(/_/g, ' ').toUpperCase()}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" 
                      color={getQualityColor(score, metric) + '.main'}>
                      {score}{metric.includes('rmsd') ? ' Å' : metric.includes('score') ? '' : '%'}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </BaseCard>

      {/* Domain Analysis */}
      <BaseCard title="🎯 Structural Domain Analysis" sx={{ mb: 3 }}>
        {demoResults.domains.map((domain, index) => (
          <Card key={index} sx={{ mb: 2, border: `2px solid ${getConfidenceColor(domain.avg_plddt)}` }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" color="primary">
                    {domain.name}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Position:</strong> {domain.start}-{domain.end} | 
                    <strong> Structure:</strong> {domain.structure_type}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Function:</strong> {domain.function}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={domain.avg_plddt} 
                    sx={{ 
                      height: 10, 
                      borderRadius: 5,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getConfidenceColor(domain.avg_plddt)
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Average pLDDT
                  </Typography>
                  <Typography variant="h4" sx={{ color: getConfidenceColor(domain.avg_plddt) }}>
                    {domain.avg_plddt}
                  </Typography>
                  <Chip 
                    label={domain.confidence}
                    color={domain.avg_plddt >= 90 ? "success" : domain.avg_plddt >= 70 ? "warning" : "error"}
                    size="small"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </BaseCard>

      {/* Binding Sites */}
      <BaseCard title="🔗 Predicted Binding Sites">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          High-confidence binding sites identified through structural analysis
        </Typography>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Binding Type</strong></TableCell>
                <TableCell><strong>Key Residues</strong></TableCell>
                <TableCell><strong>Location</strong></TableCell>
                <TableCell><strong>Confidence</strong></TableCell>
                <TableCell><strong>Affinity</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {demoResults.binding_sites.map((site, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Chip 
                      label={site.type}
                      color={site.type.includes('DNA') ? "primary" : site.type.includes('Protein') ? "secondary" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                    {site.residues}
                  </TableCell>
                  <TableCell>{site.location}</TableCell>
                  <TableCell>
                    <Chip 
                      label={`${(site.confidence * 100).toFixed(0)}%`}
                      color={site.confidence > 0.8 ? "success" : "warning"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{site.binding_affinity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </BaseCard>
    </Box>
  );
};

export default StructurePredictionResults; 