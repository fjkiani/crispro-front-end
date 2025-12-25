/**
 * ToxicityRiskAssessment - Standalone toxicity risk assessment page
 * 
 * Allows users to assess toxicity risk for drugs based on germline variants.
 * Supports single or multi-drug assessment with detailed results.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Grid,
  TextField,
  Alert,
  AlertTitle,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Stack
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Download as DownloadIcon,
  Assessment as AssessmentIcon,
  CompareArrows as CompareIcon
} from '@mui/icons-material';
import { ToxicityRiskCard } from '../components/ClinicalGenomicsCommandCenter/cards/ToxicityRiskCard';
import { useToxicity } from '../components/ClinicalGenomicsCommandCenter/hooks/useToxicity';
import { useToxicityLLM } from '../components/ClinicalGenomicsCommandCenter/hooks/useToxicityLLM';
// Drug MoA mapping handled locally

const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:8000';

// Drug MoA mapping (simplified - should come from backend)
const DRUG_MOA_MAP = {
  'carboplatin': 'platinum_agent',
  'cisplatin': 'platinum_agent',
  'oxaliplatin': 'platinum_agent',
  'doxorubicin': 'anthracycline',
  'adriamycin': 'anthracycline',
  'epirubicin': 'anthracycline',
  'olaparib': 'PARP_inhibitor',
  'niraparib': 'PARP_inhibitor',
  'rucaparib': 'PARP_inhibitor',
  'pembrolizumab': 'checkpoint_inhibitor',
  'nivolumab': 'checkpoint_inhibitor',
  'atezolizumab': 'checkpoint_inhibitor',
  'ipilimumab': 'checkpoint_inhibitor',
  'cyclophosphamide': 'alkylating_agent',
  'temozolomide': 'alkylating_agent',
  'paclitaxel': 'taxane',
  'docetaxel': 'taxane',
  '5-FU': 'antimetabolite',
  'fluorouracil': 'antimetabolite',
  'capecitabine': 'antimetabolite'
};

export default function ToxicityRiskAssessment() {
  const { patientId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Form state
  const [germlineVariants, setGermlineVariants] = useState([]);
  const [variantInput, setVariantInput] = useState('');
  const [selectedDrugs, setSelectedDrugs] = useState([]);
  const [drugInput, setDrugInput] = useState('');
  const [disease, setDisease] = useState('');
  const [treatmentLine, setTreatmentLine] = useState('');
  const [multiDrugMode, setMultiDrugMode] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  
  // Results state
  const [results, setResults] = useState({});
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { assessRisk, result, loading: apiLoading, error: apiError } = useToxicity();
  
  // Load from URL params or patient profile
  useEffect(() => {
    const drugParam = searchParams.get('drug');
    if (drugParam) {
      setSelectedDrugs([drugParam]);
      setDrugInput(drugParam);
    }
    
    // TODO: Load patient profile if patientId provided
    if (patientId) {
      // Load patient data
    }
  }, [patientId, searchParams]);
  
  // Parse variant input (simple format: gene,chrom,pos,ref,alt)
  const parseVariants = (input) => {
    if (!input.trim()) return [];
    
    const lines = input.trim().split('\n');
    return lines.map((line, idx) => {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length >= 5) {
        return {
          gene: parts[0] || '',
          chrom: parts[1] || '',
          pos: parseInt(parts[2]) || 0,
          ref: parts[3] || '',
          alt: parts[4] || ''
        };
      }
      // Try space-separated
      const spaceParts = line.split(/\s+/);
      if (spaceParts.length >= 2) {
        return {
          gene: spaceParts[0] || '',
          chrom: spaceParts[1] || '',
          pos: parseInt(spaceParts[2]) || 0,
          ref: spaceParts[3] || 'A',
          alt: spaceParts[4] || 'G'
        };
      }
      return null;
    }).filter(v => v !== null);
  };
  
  // Handle assessment
  const handleAssess = async () => {
    setError(null);
    setResults({});
    setComparisonData([]);
    
    if (!germlineVariants.length && !variantInput.trim()) {
      setError('Please provide germline variants');
      return;
    }
    
    if (!selectedDrugs.length && !drugInput.trim()) {
      setError('Please select at least one drug');
      return;
    }
    
    setLoading(true);
    
    try {
      const variants = germlineVariants.length > 0 
        ? germlineVariants 
        : parseVariants(variantInput);
      
      const drugs = selectedDrugs.length > 0 
        ? selectedDrugs 
        : drugInput.split(',').map(d => d.trim()).filter(d => d);
      
      if (multiDrugMode && drugs.length > 1) {
        // Multi-drug assessment
        const assessmentResults = {};
        const comparison = [];
        
        for (const drug of drugs) {
          const moa = DRUG_MOA_MAP[drug.toLowerCase()];
          if (!moa) {
            console.warn(`Unknown MoA for drug: ${drug}`);
            continue;
          }
          
          try {
            const result = await assessRisk(variants, [], moa, disease || 'cancer');
            assessmentResults[drug] = result;
            
            comparison.push({
              drug,
              moa,
              risk_score: result.risk_score,
              risk_level: result.risk_score >= 0.7 ? 'HIGH' : result.risk_score >= 0.4 ? 'MODERATE' : 'LOW',
              confidence: result.confidence,
              factors_count: result.factors?.length || 0,
              mitigating_foods_count: result.mitigating_foods?.length || 0
            });
          } catch (err) {
            console.error(`Assessment failed for ${drug}:`, err);
          }
        }
        
        // Sort by risk score (highest first)
        comparison.sort((a, b) => b.risk_score - a.risk_score);
        
        setResults(assessmentResults);
        setComparisonData(comparison);
        setTabValue(1); // Switch to comparison tab
      } else {
        // Single drug assessment
        const drug = drugs[0];
        const moa = DRUG_MOA_MAP[drug.toLowerCase()];
        
        if (!moa) {
          setError(`Unknown mechanism of action for drug: ${drug}. Please use a supported drug.`);
          setLoading(false);
          return;
        }
        
        await assessRisk(variants, [], moa, disease || 'cancer');
      }
    } catch (err) {
      setError(err.message || 'Assessment failed');
    } finally {
      setLoading(false);
    }
  };
  
  // Export functions
  const handleExportJSON = () => {
    const data = multiDrugMode ? results : { [selectedDrugs[0] || drugInput]: result };
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `toxicity-risk-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };
  
  const handleExportPDF = () => {
    window.print();
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssessmentIcon />
          Toxicity Risk Assessment (RUO)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Germline-based toxicity prediction for precision safety screening
        </Typography>
        <Chip 
          label="Research Use Only" 
          color="warning" 
          size="small" 
          sx={{ mt: 1 }}
        />
      </Box>
      
      {/* Input Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Input Parameters
        </Typography>
        
        <Grid container spacing={3}>
          {/* Germline Variants */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Germline Variants
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Enter variants (one per line):&#10;BRCA1,17,41276045,A,G&#10;DPYD,1,97915614,A,G"
              value={variantInput}
              onChange={(e) => setVariantInput(e.target.value)}
              helperText="Format: gene,chrom,pos,ref,alt (one per line) or space-separated"
            />
          </Grid>
          
          {/* Drug Selection */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={multiDrugMode}
                  onChange={(e) => setMultiDrugMode(e.target.checked)}
                />
              }
              label="Multi-Drug Comparison"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              {multiDrugMode ? 'Drugs (comma-separated)' : 'Drug'}
            </Typography>
            <TextField
              fullWidth
              placeholder={multiDrugMode ? "carboplatin, doxorubicin, olaparib" : "carboplatin"}
              value={drugInput}
              onChange={(e) => setDrugInput(e.target.value)}
              helperText="Supported drugs: carboplatin, doxorubicin, olaparib, pembrolizumab, etc."
            />
          </Grid>
          
          {/* Disease Context */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Disease Context (Optional)</InputLabel>
              <Select
                value={disease}
                onChange={(e) => setDisease(e.target.value)}
                label="Disease Context (Optional)"
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="ovarian_cancer">Ovarian Cancer</MenuItem>
                <MenuItem value="breast_cancer">Breast Cancer</MenuItem>
                <MenuItem value="colorectal_cancer">Colorectal Cancer</MenuItem>
                <MenuItem value="multiple_myeloma">Multiple Myeloma</MenuItem>
                <MenuItem value="lung_cancer">Lung Cancer</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {/* Assess Button */}
          <Grid item xs={12}>
            <Button
              variant="contained"
              size="large"
              onClick={handleAssess}
              disabled={loading || apiLoading}
              startIcon={loading || apiLoading ? <CircularProgress size={20} /> : <AssessmentIcon />}
              fullWidth
            >
              Assess Toxicity Risk
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Error Display */}
      {(error || apiError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Error</AlertTitle>
          {error || apiError}
        </Alert>
      )}
      
      {/* Results Section */}
      {(result || Object.keys(results).length > 0) && (
        <Paper sx={{ p: 3 }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
            {multiDrugMode && comparisonData.length > 0 && (
              <Tab 
                icon={<CompareIcon />} 
                label={`Comparison (${comparisonData.length})`} 
                iconPosition="start"
              />
            )}
            {!multiDrugMode && result && (
              <Tab label="Detailed Assessment" />
            )}
            {multiDrugMode && Object.keys(results).map((drug, idx) => (
              <Tab key={drug} label={drug} />
            ))}
          </Tabs>
          
          {/* Multi-Drug Comparison Table */}
          {multiDrugMode && tabValue === 0 && comparisonData.length > 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Drug</strong></TableCell>
                    <TableCell><strong>MoA</strong></TableCell>
                    <TableCell><strong>Risk Score</strong></TableCell>
                    <TableCell><strong>Risk Level</strong></TableCell>
                    <TableCell><strong>Confidence</strong></TableCell>
                    <TableCell><strong>Factors</strong></TableCell>
                    <TableCell><strong>Mitigating Foods</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {comparisonData.map((row, idx) => {
                    const riskColor = row.risk_level === 'HIGH' ? 'error' : 
                                    row.risk_level === 'MODERATE' ? 'warning' : 'success';
                    return (
                      <TableRow key={idx} hover>
                        <TableCell><strong>{row.drug}</strong></TableCell>
                        <TableCell>{row.moa}</TableCell>
                        <TableCell>{(row.risk_score * 100).toFixed(0)}%</TableCell>
                        <TableCell>
                          <Chip 
                            label={row.risk_level} 
                            color={riskColor} 
                            size="small"
                            icon={row.risk_level === 'HIGH' ? <WarningIcon /> : <CheckCircleIcon />}
                          />
                        </TableCell>
                        <TableCell>{(row.confidence * 100).toFixed(0)}%</TableCell>
                        <TableCell>{row.factors_count}</TableCell>
                        <TableCell>{row.mitigating_foods_count}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          {/* Single Drug or Individual Drug Details */}
          {(!multiDrugMode && result) && (
            <Box>
              <ToxicityRiskCard result={result} loading={apiLoading} error={apiError} />
            </Box>
          )}
          
          {multiDrugMode && tabValue > 0 && Object.keys(results).map((drug, idx) => {
            if (tabValue === idx + (comparisonData.length > 0 ? 1 : 0)) {
              return (
                <Box key={drug}>
                  <Typography variant="h6" gutterBottom>
                    {drug} - Detailed Assessment
                  </Typography>
                  <ToxicityRiskCard result={results[drug]} />
                </Box>
              );
            }
            return null;
          })}
          
          {/* Export Buttons */}
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportJSON}
            >
              Export JSON
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportPDF}
            >
              Export PDF
            </Button>
          </Box>
        </Paper>
      )}
    </Container>
  );
}
