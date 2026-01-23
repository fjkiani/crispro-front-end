import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Stack,
  List,
  ListItem,
  ListItemText,
  Link,
  Grid
} from '@mui/material';
import {
  Science,
  LocalHospital,
  Article,
  CheckCircle,
  Warning
} from '@mui/icons-material';

const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://127.0.0.1:8000';

/**
 * Ayesha Twin Demo - Public Case Study
 * 
 * Demonstrates the complete A→B Food Validator + Drug Efficacy workflow
 * using PUBLIC TCGA-OV data (no PHI, ethical demo).
 * 
 * This shows Ayesha the platform capabilities WITHOUT using her private data.
 */
export default function AyeshaTwinDemo() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useLLM, setUseLLM] = useState(true);

  const runDemo = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch(`${API_ROOT}/api/demo/ayesha_twin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          use_llm: useLLM
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      // Silently handle 404s (endpoint not implemented yet)
      if (!err.message?.includes('404') && !err.message?.includes('Not Found')) {
        setError(`Error: ${err.message}`);
      } else {
        setError('Demo endpoint not available yet');
      }
    } finally {
      setLoading(false);
    }
  };

  const getVerdictColor = (verdict) => {
    if (verdict === 'SUPPORTED') return 'success';
    if (verdict === 'WEAK_SUPPORT') return 'warning';
    return 'default';
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Card sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Science sx={{ fontSize: 48, color: 'white' }} />
          <Box>
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
              🔬 Ayesha Twin Demo (Public Case Study)
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Complete analysis workflow using public TCGA-OV data - mirrors Ayesha's profile
            </Typography>
          </Box>
        </Stack>
      </Card>

      {/* Critical Disclaimer */}
      <Alert severity="warning" icon={<Warning />} sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          ⚠️ PUBLIC CASE STUDY - NOT AYESHA'S DATA
        </Typography>
        <Typography variant="body2">
          This demo uses TCGA-13-1481 (public TCGA-OV case) with similar profile to Ayesha's situation. 
          This is <strong>NOT</strong> Ayesha's private data - it's an ethical demo to show platform capabilities.
        </Typography>
      </Alert>

      {/* Controls */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Run Complete Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Analyzes food/supplement recommendations + drug efficacy using public case profile
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            onClick={runDemo}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Science />}
          >
            {loading ? 'Analyzing...' : 'Run Demo Analysis'}
          </Button>
        </Box>
      </Card>

      {/* Loading */}
      {loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={60} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Running A→B Food Validator + Drug Efficacy analysis...
          </Typography>
        </Box>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Analysis Failed:</strong> {error}
          </Typography>
        </Alert>
      )}

      {/* Results */}
      {results && (
        <Box>
          {/* Patient Profile Card */}
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalHospital color="primary" />
              Public Case Profile
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Case ID:</strong> {results.case_data.patient_id}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Disease:</strong> {results.case_data.disease}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Stage:</strong> {results.case_data.stage}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>HRD Status:</strong> {results.case_data.biomarkers.hrd}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Mutations:</strong>
                </Typography>
                {results.case_data.mutations.map((mut, idx) => (
                  <Chip
                    key={idx}
                    label={`${mut.gene} ${mut.hgvs_p}`}
                    color="error"
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
                <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
                  <strong>Treatment Line:</strong> {results.case_data.treatment_history.current_line}
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary">
                  Prior: {results.case_data.treatment_history.prior_therapies.join(', ')}
                </Typography>
              </Grid>
            </Grid>
          </Card>

          {/* Food Recommendations */}
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Science color="primary" />
              🥗 Food/Supplement Recommendations (A→B Validated)
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              {results.food_recommendations.map((food, idx) => (
                <Grid item xs={12} md={6} key={idx}>
                  <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {food.compound || 'Unknown'}
                      </Typography>
                      {food.verdict && (
                        <Chip
                          label={food.verdict_explanation || food.verdict}
                          color={getVerdictColor(food.verdict)}
                          size="small"
                        />
                      )}
                    </Box>
                    
                    {food.status === 'ERROR' ? (
                      <Alert severity="error" sx={{ mt: 1 }}>
                        {food.error || 'Analysis failed'}
                      </Alert>
                    ) : (
                      <>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Score: {food.overall_score || 'N/A'} | Confidence: {food.confidence || 'N/A'}
                        </Typography>
                        {food.llm_evidence && food.llm_evidence.paper_count > 0 && (
                          <Chip
                            label={`📚 ${food.llm_evidence.paper_count} papers`}
                            size="small"
                            color="info"
                            sx={{ mb: 1 }}
                          />
                        )}
                        {food.recommendation && (
                          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                            <strong>Dosage:</strong> {food.recommendation.dosage}
                          </Typography>
                        )}
                      </>
                    )}
                  </Card>
                </Grid>
              ))}
            </Grid>

            {results.analysis_summary && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Summary:</strong> {results.analysis_summary.supported_foods} supported,{' '}
                  {results.analysis_summary.weak_support_foods} weak support out of{' '}
                  {results.analysis_summary.total_foods_analyzed} analyzed
                </Typography>
              </Box>
            )}
          </Card>

          {/* Drug Recommendations */}
          {results.drug_recommendations && !results.drug_recommendations.error && (
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalHospital color="primary" />
                💊 Drug Recommendations (WIWFM)
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              {results.drug_recommendations.drugs && results.drug_recommendations.drugs.length > 0 ? (
                <List>
                  {results.drug_recommendations.drugs.slice(0, 5).map((drug, idx) => (
                    <ListItem key={idx} sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', mb: 1 }}>
                        <Chip label={`#${idx + 1}`} color="primary" size="small" />
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', flex: 1 }}>
                          {drug.drug_name || drug.drug || 'Unknown'}
                        </Typography>
                        <Chip
                          label={`Efficacy: ${((drug.efficacy_score || 0) * 100).toFixed(0)}%`}
                          color={drug.efficacy_score > 0.6 ? 'success' : drug.efficacy_score > 0.4 ? 'warning' : 'default'}
                          size="small"
                        />
                        <Chip
                          label={`Confidence: ${((drug.confidence || 0) * 100).toFixed(0)}%`}
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                      {drug.evidence_tier && (
                        <Typography variant="caption" color="text.secondary">
                          Evidence Tier: {drug.evidence_tier}
                        </Typography>
                      )}
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="info">
                  Drug efficacy analysis data structure differs from expected format.
                </Alert>
              )}
            </Card>
          )}

          {/* Provenance */}
          <Card sx={{ p: 2, bgcolor: 'grey.100' }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              <strong>Provenance:</strong> {results.provenance.method} | 
              Data Source: {results.provenance.data_source} | 
              Case: {results.provenance.case_id}
            </Typography>
            <Typography variant="caption" color="error.main" sx={{ fontStyle: 'italic', display: 'block', mt: 0.5 }}>
              {results.provenance.ruo_disclaimer}
            </Typography>
          </Card>
        </Box>
      )}
    </Box>
  );
}

