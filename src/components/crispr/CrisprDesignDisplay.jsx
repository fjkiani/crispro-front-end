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
  ListItemIcon
} from '@mui/material';
import { 
  Science,
  GpsFixed as Target,
  Security,
  Speed,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import BaseCard from '../common/BaseCard';

const CrisprDesignDisplay = ({ results }) => {
  if (!results) {
    return (
      <BaseCard title="Awaiting CRISPR Design...">
        <Typography>Submit target details to generate precision guide RNAs.</Typography>
      </BaseCard>
    );
  }

  // Demo data structure
  const demoResults = {
    status: "success",
    target_gene: results.inputs?.target_gene || "BRAF",
    mutation: results.inputs?.mutation_details || "V600E",
    strategy: results.inputs?.strategy || "knockout",
    guide_rnas: [
      {
        id: "gRNA_001",
        sequence: "GTAGCCTACTGGATCCGTAA",
        pam_site: "CGG",
        efficiency_score: 92.4,
        specificity_score: 88.7,
        chromosome: "chr7",
        position: "140753336",
        strand: "+",
        off_targets: 2
      },
      {
        id: "gRNA_002", 
        sequence: "CTGTGAATGGATCCAAGTCC",
        pam_site: "TGG",
        efficiency_score: 87.1,
        specificity_score: 91.2,
        chromosome: "chr7",
        position: "140753298",
        strand: "-",
        off_targets: 1
      },
      {
        id: "gRNA_003",
        sequence: "GGACTTATCGATCCTGGTAA",
        pam_site: "AGG", 
        efficiency_score: 78.9,
        specificity_score: 94.1,
        chromosome: "chr7",
        position: "140753412",
        strand: "+",
        off_targets: 0
      }
    ],
    delivery_recommendations: [
      "Lentiviral vector for ex vivo T-cell editing",
      "Lipid nanoparticles for in vivo delivery",
      "Electroporation for high-efficiency cell lines"
    ]
  };

  const getEfficiencyColor = (score) => {
    if (score >= 90) return "success";
    if (score >= 80) return "warning"; 
    return "error";
  };

  const getSpecificityColor = (score) => {
    if (score >= 90) return "success";
    if (score >= 85) return "warning";
    return "error";
  };

  return (
    <Box>
      {/* Demo Warning Banner */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>🎭 DEMO MODE:</strong> This is simulated Evo2 AI output for demonstration purposes. 
          Live integration with our Evo2 sequence generation service coming soon!
        </Typography>
      </Alert>

      {/* Design Summary */}
      <BaseCard title="🎯 CRISPR Design Complete" sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" color="primary">
              Target: {demoResults.target_gene} {demoResults.mutation}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Strategy: {demoResults.strategy.replace('_', ' ').toUpperCase()}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box display="flex" gap={1}>
              <Chip 
                icon={<Science />} 
                label={`${demoResults.guide_rnas.length} Guide RNAs`} 
                color="primary" 
                size="small" 
              />
              <Chip 
                icon={<CheckCircle />} 
                label="Ready for Synthesis" 
                color="success" 
                size="small" 
              />
            </Box>
          </Grid>
        </Grid>
      </BaseCard>

      {/* Guide RNA Arsenal */}
      <BaseCard title="🧬 Generated Guide RNA Arsenal">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          <strong>Simulated Evo2 Output:</strong> AI-designed guide RNAs optimized for efficiency and specificity
        </Typography>
        
        {demoResults.guide_rnas.map((grna, index) => (
          <Card key={grna.id} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" color="primary">
                    {grna.id} - Rank #{index + 1}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontFamily: 'monospace', 
                      backgroundColor: '#f5f5f5', 
                      padding: 1,
                      borderRadius: 1,
                      mt: 1
                    }}
                  >
                    5'-{grna.sequence}-{grna.pam_site}-3'
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Location: {grna.chromosome}:{grna.position} ({grna.strand})
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <List dense>
                    <ListItem disablePadding>
                      <ListItemIcon><Speed /></ListItemIcon>
                      <ListItemText 
                        primary={
                          <Chip 
                            label={`${grna.efficiency_score}% Efficiency`}
                            color={getEfficiencyColor(grna.efficiency_score)}
                            size="small"
                          />
                        }
                      />
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemIcon><Target /></ListItemIcon>
                      <ListItemText 
                        primary={
                          <Chip 
                            label={`${grna.specificity_score}% Specificity`}
                            color={getSpecificityColor(grna.specificity_score)}
                            size="small"
                          />
                        }
                      />
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemIcon>
                        {grna.off_targets === 0 ? <CheckCircle /> : <Warning />}
                      </ListItemIcon>
                      <ListItemText 
                        primary={
                          <Typography variant="body2">
                            {grna.off_targets} Off-targets
                          </Typography>
                        }
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </BaseCard>

      {/* Delivery Recommendations */}
      <BaseCard title="🚀 Delivery Strategy Recommendations" sx={{ mt: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          <strong>AI-Optimized Delivery:</strong> Based on target cell type and therapeutic context
        </Typography>
        <List>
          {demoResults.delivery_recommendations.map((rec, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                <Security color="primary" />
              </ListItemIcon>
              <ListItemText primary={rec} />
            </ListItem>
          ))}
        </List>
      </BaseCard>
    </Box>
  );
};

export default CrisprDesignDisplay; 