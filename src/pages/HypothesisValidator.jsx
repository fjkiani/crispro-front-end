import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Stack,
  Chip,
  Divider,
} from '@mui/material';
import { useSporadic } from '../context/SporadicContext';
import { BiomarkerSummaryWidget, SporadicProvenanceCard } from '../components/sporadic';
import { API_ROOT as API_BASE_URL } from '../lib/apiConfig';


/**
 * HypothesisValidator (WIWFM) - Agent Jr Mission 4
 * 
 * Will It Work For Me (WIWFM) component with sporadic cancer integration.
 * 
 * Features:
 * - Uses SporadicContext to inject tumor context into efficacy predictions
 * - Displays biomarker summary widget at top
 * - Shows drug results with sporadic provenance cards
 * - Full transparency on PARP penalties, IO boosts, confidence capping
 */
const HypothesisValidator = () => {
  // SporadicContext integration
  const {
    germlineStatus,
    tumorContext,
    dataLevel,
    getEfficacyPayload,
    hasTumorContext,
  } = useSporadic();

  // Component state
  const [mutations, setMutations] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  // Parse mutations from text input (simple format: gene:hgvs_p or JSON)
  const parsedMutations = useMemo(() => {
    if (!mutations.trim()) return [];

    try {
      // Try parsing as JSON first
      const parsed = JSON.parse(mutations);
      if (Array.isArray(parsed)) {
        return parsed.map(m => ({
          gene: m.gene || m.hugo_gene_symbol,
          hgvs_p: m.hgvs_p || m.protein_change,
          chrom: m.chrom || m.chromosome,
          pos: m.pos || m.position,
          ref: m.ref || m.ref_allele,
          alt: m.alt || m.alt_allele,
        }));
      }
    } catch (e) {
      // Not JSON, try simple format: "BRAF:V600E" or "BRAF V600E"
      const lines = mutations.trim().split('\n').filter(l => l.trim());
      return lines.map(line => {
        const parts = line.split(/[: ]/).filter(p => p.trim());
        if (parts.length >= 2) {
          return {
            gene: parts[0].trim(),
            hgvs_p: parts[1].trim(),
          };
        }
        return null;
      }).filter(Boolean);
    }
    return [];
  }, [mutations]);

  const handlePredict = async () => {
    if (parsedMutations.length === 0) {
      setError('Please enter at least one mutation (format: GENE:VARIANT or JSON array)');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      // Base payload
      const basePayload = {
        model_id: 'evo2_1b',
        mutations: parsedMutations,
        options: {
          adaptive: true,
          ensemble: false,
        },
      };

      // Inject tumor context using SporadicContext helper
      const payload = getEfficacyPayload(basePayload);

      console.log('🔬 WIWFM Request:', {
        mutations: parsedMutations.length,
        hasTumorContext: hasTumorContext,
        germlineStatus,
        dataLevel,
        payload,
      });

      const response = await fetch(`${API_BASE_URL}/api/efficacy/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `API error: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);

      console.log('✅ WIWFM Response:', {
        drugs: data.drugs?.length || 0,
        hasSporadicProvenance: data.drugs?.some(d => d.sporadic_gates_provenance) || false,
      });
    } catch (err) {
      setError(err.message || 'Failed to predict efficacy');
      console.error('❌ WIWFM Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 1 }}>
        🔬 Will It Work For Me? (WIWFM)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        AI-Powered Drug Efficacy Prediction with Sporadic Cancer Scoring
      </Typography>

      {/* Biomarker Summary Widget (Top) */}
      {hasTumorContext && (
        <BiomarkerSummaryWidget
          tumorContext={tumorContext}
          dataLevel={dataLevel}
          germlineStatus={germlineStatus}
        />
      )}

      {/* Mutation Input */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Enter Mutations
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            Format: One per line as "GENE:VARIANT" (e.g., "BRAF:V600E") or JSON array
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            value={mutations}
            onChange={(e) => setMutations(e.target.value)}
            placeholder="BRAF:V600E&#10;TP53:R175H&#10;KRAS:G12D"
            disabled={isLoading}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={handlePredict}
            disabled={isLoading || parsedMutations.length === 0}
            sx={{ minWidth: 150 }}
          >
            {isLoading ? <CircularProgress size={20} /> : 'Predict Efficacy'}
          </Button>
          {parsedMutations.length > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              {parsedMutations.length} mutation{parsedMutations.length > 1 ? 's' : ''} parsed
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Results Display */}
      {results && results.drugs && (
        <Card>
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ flex: 1 }}>
                Drug Efficacy Predictions
              </Typography>
              {results.provenance?.run_id && (
                <Chip
                  label={`Run: ${results.provenance.run_id.slice(0, 8)}...`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Stack>

            <Divider sx={{ mb: 3 }} />

            <Stack spacing={3}>
              {results.drugs.map((drug, idx) => (
                <Box key={`${drug.name || drug.therapy || idx}`}>
                  {/* Drug Card */}
                  <Card variant="outlined" sx={{ backgroundColor: '#1e1e1e' }}>
                    <CardContent>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                        <Chip label={`#${idx + 1}`} color="primary" size="small" />
                        <Typography variant="h6" sx={{ flex: 1 }}>
                          {drug.name || drug.therapy || 'Unknown Drug'}
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
                        {drug.evidence_tier && (
                          <Chip
                            label={drug.evidence_tier}
                            color={drug.evidence_tier === 'supported' ? 'success' : drug.evidence_tier === 'consider' ? 'warning' : 'default'}
                            size="small"
                          />
                        )}
                      </Stack>

                      {/* MOA */}
                      {drug.moa && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {drug.moa}
                        </Typography>
                      )}

                      {/* Badges */}
                      {drug.badges && drug.badges.length > 0 && (
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                          {drug.badges.map((badge, i) => (
                            <Chip
                              key={i}
                              label={badge}
                              size="small"
                              variant="outlined"
                              color={badge === 'PathwayAligned' ? 'success' : 'default'}
                            />
                          ))}
                        </Stack>
                      )}

                      {/* Insights Chips */}
                      {drug.insights && (
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
                          {typeof drug.insights.functionality === 'number' && (
                            <Chip
                              label={`Function: ${drug.insights.functionality.toFixed(2)}`}
                              size="small"
                              sx={{ backgroundColor: '#1a237e', color: '#90caf9' }}
                            />
                          )}
                          {typeof drug.insights.chromatin === 'number' && (
                            <Chip
                              label={`Chromatin: ${drug.insights.chromatin.toFixed(2)}`}
                              size="small"
                              sx={{ backgroundColor: '#1b5e20', color: '#a5d6a7' }}
                            />
                          )}
                          {typeof drug.insights.essentiality === 'number' && (
                            <Chip
                              label={`Essentiality: ${drug.insights.essentiality.toFixed(2)}`}
                              size="small"
                              sx={{ backgroundColor: '#4a148c', color: '#ce93d8' }}
                            />
                          )}
                          {typeof drug.insights.regulatory === 'number' && (
                            <Chip
                              label={`Regulatory: ${drug.insights.regulatory.toFixed(2)}`}
                              size="small"
                              sx={{ backgroundColor: '#e65100', color: '#ffb74d' }}
                            />
                          )}
                        </Stack>
                      )}
                    </CardContent>
                  </Card>

                  {/* Sporadic Provenance Card (Below each drug) */}
                  {drug.sporadic_gates_provenance && (
                    <SporadicProvenanceCard
                      drugName={drug.name || drug.therapy || 'Unknown'}
                      provenance={drug.sporadic_gates_provenance}
                    />
                  )}
                </Box>
              ))}
            </Stack>

            {/* Provenance Footer */}
            {results.provenance && (
              <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #444' }}>
                <Typography variant="caption" color="text.secondary">
                  Run ID: {results.provenance.run_id || 'N/A'} | 
                  Profile: {results.provenance.profile || 'baseline'} | 
                  Model: {results.provenance.model_id || 'evo2_1b'}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* No Tumor Context Warning */}
      {!hasTumorContext && (
        <Alert severity="info" sx={{ mt: 3 }}>
          No tumor context available. Navigate to Sporadic Cancer page to set up tumor context for sporadic-aware scoring.
        </Alert>
      )}
    </Box>
  );
};

export default HypothesisValidator;
