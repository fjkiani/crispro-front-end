import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Card, 
  Typography, 
  Chip, 
  LinearProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ScienceIcon from '@mui/icons-material/Science';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import WarningIcon from '@mui/icons-material/Warning';
import { Switch, FormControlLabel, Link, AlertTitle } from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import MedicationIcon from '@mui/icons-material/Medication';
import { useNavigate } from 'react-router-dom';

// Import new components
import ProvenancePanel from '../components/food/ProvenancePanel';
import SAEFeatureCards from '../components/food/SAEFeatureCards';
import PatientContextEditor from '../components/food/PatientContextEditor';

// Phase 4: Research Intelligence Components
import ResearchIntelligenceResults from '../components/research/ResearchIntelligenceResults';

export default function FoodValidatorAB() {
  const navigate = useNavigate();
  const [compound, setCompound] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useLLM, setUseLLM] = useState(true); // Default: LLM enabled
  const [useResearchIntelligence, setUseResearchIntelligence] = useState(false); // Phase 4: Research Intelligence toggle
  
  // Patient context state
  const [patientContext, setPatientContext] = useState({
    disease: 'ovarian_cancer_hgs',
    treatment_line: 3,
    prior_therapies: ['carboplatin', 'paclitaxel'],
    biomarkers: {
      brca1_mutant: false,
      brca2_mutant: false,
      hrd_positive: false,
      tp53_mutant: false,
      high_tmb: false
    }
  });

  const handleContextUpdate = async (newContext) => {
    setPatientContext(newContext);
    // Re-run analysis with new context
    if (compound.trim()) {
      await handleValidateWithContext(newContext);
    }
  };

  const handleValidate = async () => {
    await handleValidateWithContext(patientContext);
  };

  const handleValidateWithContext = async (context) => {
    setLoading(true);
    setError(null);
    
    try {
      // Use enhanced endpoint if LLM is enabled
      const endpoint = useLLM 
        ? '/api/hypothesis/validate_food_ab_enhanced'
        : '/api/hypothesis/validate_food_ab';
      
      const response = await fetch(`${import.meta.env.VITE_API_ROOT}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compound: compound.trim(),
          disease: context.disease,
          germline_status: 'negative',
          treatment_line: context.treatment_line,
          prior_therapies: context.prior_therapies,
          use_llm: useLLM,
          use_research_intelligence: useResearchIntelligence // Phase 4: Research Intelligence
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getVerdictColor = (verdict) => {
    if (verdict === 'SUPPORTED') return 'success';
    if (verdict === 'WEAK_SUPPORT') return 'warning';
    return 'default';
  };

  const getMatchStrengthColor = (strength) => {
    if (strength === 'STRONG') return 'success';
    if (strength === 'MODERATE') return 'info';
    return 'default';
  };

  const quickSuggestions = [
    'Vitamin D',
    'Omega-3',
    'Curcumin',
    'Green Tea',
    'NAC',
    'Folate'
  ];

  return (
    <Box sx={{ p: 4, maxWidth: 1100, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScienceIcon color="primary" fontSize="large" />
          A→B Food Validator (Ayesha's Case)
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          <strong>Strategy:</strong> Without tumor NGS, we use <strong>disease biology</strong> (ovarian cancer HGS, germline negative) 
          to infer likely A alterations (TP53, HRD, inflammation) → predict B dependencies → check if food targets B.
        </Typography>
        <Alert severity="info" icon={<LocalHospitalIcon />} sx={{ mb: 2 }}>
          <strong>Research Use Only</strong> - This analysis supports, not replaces, clinical judgment. 
          Always consult oncologist before adding supplements.
        </Alert>
      </Box>

      {/* Patient Context Editor */}
      <PatientContextEditor
        initialContext={patientContext}
        onUpdate={handleContextUpdate}
        onReset={(defaultContext) => setPatientContext(defaultContext)}
      />

      {/* Input Section */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Enter Food/Supplement:
        </Typography>
        
        <TextField
          fullWidth
          placeholder="e.g., Vitamin D, Omega-3, Curcumin, Green tea, NAC, Folate"
          value={compound}
          onChange={(e) => setCompound(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && compound) {
              handleValidate();
            }
          }}
          sx={{ mb: 2 }}
        />

        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Quick suggestions:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {quickSuggestions.map(sug => (
              <Chip 
                key={sug}
                label={sug}
                onClick={() => setCompound(sug)}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>

        <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={useLLM}
                onChange={(e) => setUseLLM(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="body2">
                <strong>Enable LLM Literature Search</strong>
                <Typography variant="caption" display="block" color="text.secondary">
                  Search PubMed for recent evidence (slower but more comprehensive)
                </Typography>
              </Typography>
            }
          />
          
          {/* Phase 4: Research Intelligence Toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={useResearchIntelligence}
                onChange={(e) => setUseResearchIntelligence(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="body2">
                <strong>🔬 Enable Research Intelligence</strong>
                <Typography variant="caption" display="block" color="text.secondary">
                  Full-text parsing, LLM synthesis, and MOAT analysis for complex questions
                </Typography>
              </Typography>
            }
          />
        </Box>

        <Button 
          variant="contained" 
          onClick={handleValidate} 
          disabled={!compound.trim() || loading}
          fullWidth
          size="large"
        >
          {loading 
            ? (useResearchIntelligence 
                ? 'Running Research Intelligence...' 
                : useLLM 
                  ? 'Analyzing A→B + Searching Literature...' 
                  : 'Analyzing A→B Dependencies...')
            : 'Validate'}
        </Button>
      </Card>

      {/* Loading */}
      {loading && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
            Mapping A (tumor alterations) → B (dependencies) → Food targets...
          </Typography>
        </Box>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Results */}
      {result?.status === 'SUCCESS' && (
        <Box>
          {/* Research Intelligence Badge */}
          {result.provenance?.sources?.includes('research_intelligence') && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <AlertTitle>🔬 Enhanced with Research Intelligence</AlertTitle>
              <Typography variant="body2">
                This result was enhanced using full-text parsing and LLM synthesis.
                {result.provenance?.research_intelligence?.mechanisms_added && (
                  <> Added {result.provenance.research_intelligence.mechanisms_added} mechanisms from research.</>
                )}
                {result.provenance?.research_intelligence?.pathways_added && (
                  <> Added {result.provenance.research_intelligence.pathways_added} pathways from research.</>
                )}
              </Typography>
            </Alert>
          )}

          {/* Provenance Panel - Top of Results */}
          {result.provenance && (
            <ProvenancePanel provenance={result.provenance} />
          )}

          {/* SAE Feature Cards */}
          {result.sae_features && (
            <SAEFeatureCards saeFeatures={result.sae_features} />
          )}

          {/* View Drug Recommendations Button */}
          <Card sx={{ p: 2, mb: 2, bgcolor: 'info.light' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  Want to see drug efficacy recommendations?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  View complementary drug therapies for {patientContext.disease.replace(/_/g, ' ')}
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="primary"
                startIcon={<MedicationIcon />}
                onClick={() => navigate('/ayesha-twin-demo')}
                size="large"
              >
                View Drug Recommendations
              </Button>
            </Box>
          </Card>

          {/* Header Card */}
          <Card sx={{ p: 3, mb: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  {result.compound}
                </Typography>
                {result.aliases && result.aliases.length > 0 && (
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Also known as: {result.aliases.slice(0, 3).join(', ')}
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip 
                  label={result.verdict_explanation} 
                  color={getVerdictColor(result.verdict)}
                  sx={{ fontWeight: 'bold' }}
                />
                <Chip 
                  label={`Score: ${result.overall_score}`} 
                  variant="outlined"
                  sx={{ color: 'white', borderColor: 'white' }}
                />
                <Chip 
                  label={`Confidence: ${result.confidence}`} 
                  variant="outlined"
                  sx={{ color: 'white', borderColor: 'white' }}
                />
              </Box>
            </Box>
          </Card>

          {/* A→B Mechanistic Matches */}
          {result.ab_dependencies && result.ab_dependencies.length > 0 && (
            <Card sx={{ p: 3, mb: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScienceIcon color="primary" />
                A→B Mechanistic Matches ({result.ab_dependencies.length})
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                How this food targets dependencies created by tumor alterations:
              </Typography>
              
              {result.ab_dependencies.map((match, i) => (
                <Accordion key={i} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Chip 
                        label={match.match_strength} 
                        color={getMatchStrengthColor(match.match_strength)}
                        size="small"
                      />
                      <Typography variant="body2" sx={{ fontWeight: 'bold', flex: 1 }}>
                        {match.A} → {match.B}
                      </Typography>
                      <Chip 
                        label={`${(match.A_prevalence * 100).toFixed(0)}% prevalence`} 
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>A (Tumor Alteration):</strong> {match.A}
                      </Typography>
                      <Typography variant="caption" display="block" sx={{ mb: 1, ml: 2 }}>
                        Prevalence: {(match.A_prevalence * 100).toFixed(0)}% of high-grade serous ovarian cancers
                      </Typography>
                      <Typography variant="caption" display="block" sx={{ mb: 2, ml: 2 }}>
                        Disrupted pathways: {match.A_pathways.join(', ')}
                      </Typography>
                      
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>B (Compensatory Dependency):</strong> {match.B}
                      </Typography>
                      <Typography variant="caption" display="block" sx={{ mb: 2, ml: 2, fontStyle: 'italic' }}>
                        Why B becomes critical: {match.B_rationale}
                      </Typography>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Typography variant="body2" sx={{ mb: 1, color: 'primary.main' }}>
                        <strong>How {result.compound} targets B:</strong>
                      </Typography>
                      <Typography variant="caption" display="block" sx={{ ml: 2 }}>
                        {match.food_mechanism}
                      </Typography>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Card>
          )}

          {/* Mechanisms Summary */}
          <Card sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Mechanisms of Action:
            </Typography>
            <List dense>
              {result.mechanisms.map((mech, i) => (
                <ListItem key={i}>
                  <ListItemText 
                    primary={`• ${mech}`}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Card>

          {/* Evidence */}
          <Card sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Evidence:
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Chip 
                label={`Grade: ${result.evidence.grade}`} 
                color={result.evidence.grade === 'MODERATE' ? 'success' : 'warning'}
                sx={{ mr: 1 }}
              />
              <Typography variant="body2" sx={{ mt: 1 }}>
                {result.evidence.summary}
              </Typography>
            </Box>
            
            {result.evidence.ovarian_data && Object.keys(result.evidence.ovarian_data).length > 0 && (
              <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Ovarian Cancer-Specific Data:
                </Typography>
                {Object.entries(result.evidence.ovarian_data).map(([key, value]) => (
                  <Typography key={key} variant="caption" display="block">
                    <strong>{key.replace(/_/g, ' ')}:</strong> {typeof value === 'number' ? value.toFixed(2) : value}
                  </Typography>
                ))}
              </Box>
            )}
          </Card>

          {/* Bioavailability */}
          <Card sx={{ p: 3, mb: 2, bgcolor: result.bioavailability.status === 'POOR' ? 'warning.light' : 'success.light' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {result.bioavailability.status === 'POOR' && <WarningIcon />}
              Bioavailability: {result.bioavailability.status}
            </Typography>
            <Typography variant="body2">
              {result.bioavailability.notes}
            </Typography>
          </Card>

          {/* Recommendations */}
          <Card sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recommendations:
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                Dosage:
              </Typography>
              <Typography variant="body2">{result.recommendation.dosage}</Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                Safety ({result.recommendation.safety}):
              </Typography>
              <Typography variant="body2">{result.recommendation.safety_notes}</Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                Cost:
              </Typography>
              <Typography variant="body2">{result.recommendation.cost}</Typography>
            </Box>
            
            {result.recommendation.food_sources && result.recommendation.food_sources.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  Food Sources:
                </Typography>
                <Typography variant="body2">{result.recommendation.food_sources.join(', ')}</Typography>
              </Box>
            )}
            
            {result.recommendation.line_context && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                {result.recommendation.line_context}
              </Alert>
            )}
          </Card>

          {/* Ovarian Relevance */}
          {result.ovarian_relevance && Object.keys(result.ovarian_relevance).length > 0 && (
            <Card sx={{ p: 3, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Ovarian Cancer Context:
              </Typography>
              {Object.entries(result.ovarian_relevance).map(([key, value]) => (
                <Typography key={key} variant="body2" sx={{ mb: 1 }}>
                  <strong>{key.replace(/_/g, ' ').replace('context', '')}:</strong> {value}
                </Typography>
              ))}
            </Card>
          )}

          {/* LLM Evidence Section */}
          {result.llm_evidence && result.llm_evidence.enabled && result.llm_evidence.paper_count > 0 && (
            <Card sx={{ p: 3, mb: 2, bgcolor: 'info.light' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ArticleIcon color="primary" />
                📚 Recent Literature Evidence (LLM-Enhanced)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Found {result.llm_evidence.paper_count} relevant papers. Confidence boost: +{(result.llm_evidence.confidence_boost * 100).toFixed(0)}%
              </Typography>
              
              {result.llm_evidence.summary && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.875rem' }}>
                    {result.llm_evidence.summary}
                  </Typography>
                </Alert>
              )}
              
              {result.llm_evidence.papers && result.llm_evidence.papers.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Top Papers:
                  </Typography>
                  <List dense>
                    {result.llm_evidence.papers.map((paper, idx) => (
                      <ListItem key={idx} sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 1 }}>
                        <Box sx={{ width: '100%' }}>
                          <Link 
                            href={`https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}
                          >
                            {paper.title}
                          </Link>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                            <Chip 
                              label={`PMID: ${paper.pmid}`} 
                              size="small" 
                              variant="outlined"
                              onClick={() => window.open(`https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}`, '_blank')}
                              clickable
                            />
                            {paper.year && (
                              <Chip label={`Year: ${paper.year}`} size="small" variant="outlined" />
                            )}
                            {paper.similarity_score && (
                              <Chip 
                                label={`Relevance: ${(paper.similarity_score * 100).toFixed(0)}%`} 
                                size="small" 
                                color="primary"
                              />
                            )}
                          </Box>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Card>
          )}

          {/* LLM Unavailable Message */}
          {result.llm_evidence && result.llm_evidence.enabled && (!result.llm_evidence.available || result.llm_evidence.paper_count === 0) && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                {result.llm_evidence.message || 'LLM literature search unavailable or no papers found. Showing base recommendations only.'}
              </Typography>
            </Alert>
          )}

          {/* Phase 4: Research Intelligence Section */}
          {result.provenance?.research_intelligence && (
            <Accordion sx={{ mt: 2, mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">
                  🔬 Research Intelligence Details
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <ResearchIntelligenceResults
                  result={result.provenance.research_intelligence}
                  context={{
                    disease: patientContext.disease || '',
                    treatment_line: patientContext.treatment_line?.toString() || '',
                    biomarkers: patientContext.biomarkers || {}
                  }}
                  compact={true}
                />
                <Button
                  variant="outlined"
                  sx={{ mt: 2 }}
                  onClick={() => {
                    const question = result.provenance.research_intelligence.question || 
                                   `How does ${result.compound} help with ${patientContext.disease.replace(/_/g, ' ')}?`;
                    navigate(`/research-intelligence?question=${encodeURIComponent(question)}`);
                  }}
                >
                  View Full Research Intelligence
                </Button>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Note: Provenance now displayed at top via ProvenancePanel component */}
        </Box>
      )}

      {/* Unknown Compound */}
      {result?.status === 'UNKNOWN' && (
        <Card sx={{ p: 3 }}>
          <Alert severity="info">
            <Typography variant="body2">{result.message}</Typography>
            {result.available_compounds && result.available_compounds.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                  Available compounds:
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {result.available_compounds.map(comp => (
                    <Chip 
                      key={comp}
                      label={comp}
                      size="small"
                      onClick={() => setCompound(comp)}
                      clickable
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Alert>
        </Card>
      )}
    </Box>
  );
}

