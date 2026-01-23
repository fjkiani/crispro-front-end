import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, Alert, Divider, Link as MuiLink, Button, Stack, LinearProgress, TextField, FormControlLabel, Switch, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Cache utilities
const getCacheKey = (gene, hgvs_p, runSignature) => {
  return `deep_analysis_${gene}_${hgvs_p}_${runSignature || 'default'}`;
};

const getCachedData = (cacheKey) => {
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Check if cache is still valid (24 hours)
      if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
        return parsed.data;
      }
    }
  } catch (e) {
    console.warn('Failed to read cache:', e);
  }
  return null;
};

const setCachedData = (cacheKey, data) => {
  try {
    localStorage.setItem(cacheKey, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.warn('Failed to write cache:', e);
  }
};

const DeepAnalysisPanel = ({ data, api, runSignature }) => {
  const [extracts, setExtracts] = useState({}); // url -> { loading, error, text, title }
  const [explain, setExplain] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ total: 0, done: 0 });
  
  // Agent controls
  const [maxArticles, setMaxArticles] = useState(5);
  const [autoResume, setAutoResume] = useState(true);
  const [jobState, setJobState] = useState(null); // { jobId, status, type }
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Cache key based on variant and run signature
  const cacheKey = getCacheKey(
    data?.meta?.gene || '',
    data?.meta?.hgvs_p || '',
    runSignature
  );

  // Load cached data on mount
  useEffect(() => {
    if (data && !data.error && !data.loading) {
      const cached = getCachedData(cacheKey);
      if (cached) {
        if (cached.extracts) setExtracts(cached.extracts);
        if (cached.explain) setExplain(cached.explain);
        if (cached.jobState && autoResume) setJobState(cached.jobState);
      }
    }
  }, [data, cacheKey, autoResume]);

  // Save to cache when extracts or explain changes
  useEffect(() => {
    if (data && !data.error && !data.loading && (Object.keys(extracts).length > 0 || explain || jobState)) {
      setCachedData(cacheKey, { extracts, explain, jobState });
    }
  }, [extracts, explain, jobState, cacheKey, data]);

  // Poll job status if we have an active job
  useEffect(() => {
    if (jobState?.jobId && jobState?.status === 'pending' && api) {
      const interval = setInterval(async () => {
        try {
          const status = await api.get(`/api/evidence/job/${jobState.jobId}`);
          setJobState(prev => ({ ...prev, ...status }));
          
          if (status.status === 'complete') {
            // Process completed job result
            if (status.result) {
              if (jobState.type === 'crawl' && status.result.extracted_texts) {
                const newExtracts = {};
                status.result.extracted_texts.forEach(item => {
                  if (item.url && item.text) {
                    newExtracts[item.url] = {
                      loading: false,
                      error: item.error || null,
                      text: item.text,
                      title: item.title
                    };
                  }
                });
                setExtracts(prev => ({ ...prev, ...newExtracts }));
              }
            }
            clearInterval(interval);
          } else if (status.status === 'error') {
            clearInterval(interval);
          }
        } catch (e) {
          console.warn('Failed to poll job status:', e);
        }
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [jobState, api]);

  if (!data) return null;
  if (data.error) return <Alert severity="error">{data.error}</Alert>;
  if (data.loading) return <Typography variant="body2">Loading…</Typography>;

  const handleExtract = async (url) => {
    if (!api || !url) return;
    setExtracts((e) => ({ ...e, [url]: { ...(e[url]||{}), loading: true, error: null } }));
    try {
      const res = await api.post('/api/evidence/extract', { url });
      setExtracts((e) => ({ ...e, [url]: { loading: false, error: null, text: res?.text, title: res?.title } }));
    } catch (err) {
      setExtracts((e) => ({ ...e, [url]: { loading: false, error: String(err?.message || err) } }));
    }
  };

  const handleRerunExplain = async () => {
    if (!api) return;
    setBusy(true);
    try {
      const res = await api.post('/api/evidence/explain', {
        gene: data?.meta?.gene,
        hgvs_p: data?.meta?.hgvs_p,
        evo2_result: data?.evo2_result || {},
        clinvar: data?.clinvar || {},
        literature: data?.literature || {},
      });
      setExplain(res?.explanation || null);
    } catch (err) {
      setExplain(String(err?.message || err));
    } finally {
      setBusy(false);
    }
  };

  const handleRunFullPipeline = async () => {
    if (!api) return;
    const tops = (data?.literature?.top_results || []).slice(0, 5);
    setProgress({ total: tops.length, done: 0 });
    setBusy(true);
    try {
      for (let i = 0; i < tops.length; i++) {
        const url = tops[i]?.url;
        if (url) {
          await handleExtract(url);
        }
        setProgress((p) => ({ ...p, done: i + 1 }));
      }
      await handleRerunExplain();
    } finally {
      setBusy(false);
    }
  };

  const tops = (data?.literature?.top_results || []).slice(0, 5);
  const trialsBadge = (r) => Array.isArray(r?.publication_types) && r.publication_types.some((t) => String(t).toLowerCase().includes('randomized'));
  const pmcBadge = (r) => !!r?.pmcid;

  return (
    <>
      {/* Agent Controls */}
      <Accordion expanded={showAdvanced} onChange={() => setShowAdvanced(!showAdvanced)} sx={{ mb: 1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">Agent Controls</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <TextField
              label="Max Articles"
              type="number"
              size="small"
              value={maxArticles}
              onChange={(e) => setMaxArticles(Math.max(1, Math.min(20, parseInt(e.target.value) || 5)))}
              inputProps={{ min: 1, max: 20 }}
              sx={{ width: 120 }}
            />
            <FormControlLabel
              control={<Switch checked={autoResume} onChange={(e) => setAutoResume(e.target.checked)} />}
              label="Auto-resume jobs"
            />
            {jobState && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Job: {jobState.jobId} • Status: {jobState.status} • Type: {jobState.type}
                </Typography>
                {jobState.progress && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Progress: {jobState.progress.done}/{jobState.progress.total}
                  </Typography>
                )}
              </Box>
            )}
          </Stack>
        </AccordionDetails>
      </Accordion>
      
      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
        <Button size="small" variant="outlined" onClick={handleRerunExplain} disabled={busy}>Run Synthesis</Button>
        <Button size="small" variant="contained" onClick={handleRunFullPipeline} disabled={busy || tops.length===0}>Run Full Pipeline</Button>
      </Stack>
      {busy && (
        <Box sx={{ mb: 1 }}>
          <LinearProgress />
          <Typography variant="caption" color="text.secondary">{progress.done}/{progress.total} extracted</Typography>
        </Box>
      )}
      
      {/* Agent Controls */}
      <Accordion expanded={showAdvanced} onChange={() => setShowAdvanced(!showAdvanced)} sx={{ mb: 1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">Agent Controls</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <TextField
              label="Max Articles"
              type="number"
              size="small"
              value={maxArticles}
              onChange={(e) => setMaxArticles(Math.max(1, Math.min(20, parseInt(e.target.value) || 5)))}
              inputProps={{ min: 1, max: 20 }}
              sx={{ width: 120 }}
            />
            <FormControlLabel
              control={<Switch checked={autoResume} onChange={(e) => setAutoResume(e.target.checked)} />}
              label="Auto-resume jobs"
            />
            {jobState && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Job: {jobState.jobId} • Status: {jobState.status} • Type: {jobState.type}
                </Typography>
                {jobState.progress && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Progress: {jobState.progress.done}/{jobState.progress.total}
                  </Typography>
                )}
              </Box>
            )}
          </Stack>
        </AccordionDetails>
      </Accordion>
      {typeof data?.discordant === 'boolean' && (
        <Chip size="small" color={data.discordant ? 'warning' : 'success'} label={data.discordant ? 'Discordant with ClinVar' : 'Consistent with ClinVar'} sx={{ mb: 1 }} />
      )}
      {(data?.discrepancy_reason || data?.confidence_gap !== undefined) && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          {data?.discrepancy_reason ? `Reason: ${data.discrepancy_reason}` : ''}
          {data?.confidence_gap !== undefined ? ` ${data?.discrepancy_reason ? '• ' : ''}Confidence gap: ${data.confidence_gap}` : ''}
        </Typography>
      )}
      {(explain || data?.ai_explanation) && (
        <Box sx={{ mb: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle2">AI Explanation</Typography>
            <Button
              size="small"
              variant="text"
              onClick={() => {
                const explanationText = explain || data.ai_explanation;
                const citations = (data?.literature?.top_results || [])
                  .map((r, i) => `[${i+1}] ${r.title || 'N/A'} (${r.journal || 'N/A'}, ${r.year || 'N/A'}) PMID: ${r.pmid || 'N/A'}`)
                  .join('\n');
                const fullText = `${explanationText}\n\nCitations:\n${citations}`;
                navigator.clipboard.writeText(fullText).then(() => {
                  // Could add a toast notification here
                }).catch(() => {
                  // Fallback for older browsers
                  const textArea = document.createElement('textarea');
                  textArea.value = fullText;
                  document.body.appendChild(textArea);
                  textArea.select();
                  document.execCommand('copy');
                  document.body.removeChild(textArea);
                });
              }}
            >
              Copy
            </Button>
          </Stack>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{explain || data.ai_explanation}</Typography>
        </Box>
      )}
      <Typography variant="subtitle2">ClinVar</Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        Classification: {data?.clinvar?.classification || 'n/a'}<br/>
        Review: {data?.clinvar?.review_status || 'n/a'}{data?.clinvar?.somatic_tier ? ` • ${data?.clinvar?.somatic_tier}` : ''}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
        {data?.clinvar?.url && (
          <MuiLink href={data?.clinvar?.url} target="_blank" rel="noopener noreferrer">Open ClinVar ↗</MuiLink>
        )}
      </Typography>
      <Typography variant="subtitle2">Our Call</Typography>
      <Typography variant="body2">
        Interpretation: {data?.our_interpretation || 'n/a'} • Confidence: {data?.our_confidence ?? 'n/a'}
      </Typography>
      <Divider sx={{ my: 1 }} />
      <Typography variant="subtitle2">PubMed Literature</Typography>
      {data?.literature?.error && (
        <Alert severity="warning" sx={{ mt: 1 }}>{data.literature.error}</Alert>
      )}
      {tops.length > 0 ? (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            Query: {data?.literature?.query || ''}
          </Typography>
          {tops.map((r, i) => {
            const url = r.url;
            const ex = extracts[url];
            return (
              <Box key={r.pmid || i} sx={{ mb: 1 }}>
                <MuiLink href={url} target="_blank" rel="noopener noreferrer" underline="hover">
                  {r.title || '(untitled)'}
                </MuiLink>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {r.journal || 'n/a'} • {r.year || 'n/a'} • PMID: {r.pmid || 'n/a'}
                  {trialsBadge(r) ? ' • RCT' : ''}{pmcBadge(r) ? ' • PMC' : ''}{r.license ? ` • ${r.license}` : ''}
                </Typography>
                {api && url && (
                  <Button size="small" variant="text" onClick={() => handleExtract(url)} disabled={ex?.loading} sx={{ mt: 0.5 }}>
                    {ex?.loading ? 'Extracting…' : 'Extract full text'}
                  </Button>
                )}
                {ex?.error && <Alert severity="warning" sx={{ mt: 0.5 }}>{ex.error}</Alert>}
                {ex?.text && (
                  <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                    {ex.text.slice(0, 1200)}{ex.text.length > 1200 ? '…' : ''}
                  </Typography>
                )}
              </Box>
            );
          })}
          {data?.literature?.evidence_synthesis && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2">Literature Synthesis</Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{data.literature.evidence_synthesis}</Typography>
            </Box>
          )}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>No literature found.</Typography>
      )}
    </>
  );
};

export default DeepAnalysisPanel; 
 



