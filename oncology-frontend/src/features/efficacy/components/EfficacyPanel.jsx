import React, { useEffect, useState } from 'react';
import { Box, Typography, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Alert, Chip, Stack } from '@mui/material';
import useEfficacy from '../useEfficacy';
import EfficacyCard from './EfficacyCard';
import EfficacyLegend from './EfficacyLegend';

export default function EfficacyPanel({ modelId, mutations, onEfficacyData }) {
  const { predict, explain, getConfig, getCalibrationStatus } = useEfficacy(modelId);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scoringMode, setScoringMode] = useState('standard'); // standard, massive_real, massive_impact
  const [config, setConfig] = useState(null);
  const [calib, setCalib] = useState(null);

  const toBackendMut = (m) => {
    // Accept already-structured objects
    if (m && m.gene && m.chrom && m.pos && m.ref && m.alt) return m;
    const vi = String(m?.variant_info || '').trim();
    if (!vi) return null;
    // Try to parse formats like: "BRAF chr7:140753336 A>T" or "7:140753336 A>T BRAF"
    const parts = vi.split(/\s+/);
    let gene = (m?.gene || '').toUpperCase();
    // pick token that looks like gene (letters, length 3-10)
    if (!gene) {
      const cand = parts.find(p => /^[A-Za-z]{3,10}$/.test(p));
      if (cand) gene = cand.toUpperCase();
    }
    const coordTok = parts.find(p => /chr?\w+:\d+/.test(p)) || parts.find(p => /\d+:\d+/.test(p));
    let chrom, pos;
    if (coordTok) {
      const m1 = coordTok.match(/chr?(\w+):(\d+)/i);
      if (m1) { chrom = m1[1]; pos = Number(m1[2]); }
    }
    const varTok = parts.find(p => /[ACGT]+>[ACGT]+/i.test(p));
    let ref, alt;
    if (varTok) {
      const [r, a] = varTok.split('>');
      ref = r?.toUpperCase(); alt = a?.toUpperCase();
    }
    if (chrom && pos && ref && alt && gene) {
      return { gene, chrom, pos, ref, alt };
    }
    return null;
  };

  useEffect(() => {
    // Load config & calibration status (cached by hook)
    (async () => {
      try {
        const cfg = await getConfig();
        setConfig(cfg);
        const cs = await getCalibrationStatus();
        setCalib(cs);
      } catch {}
    })();

    const run = async () => {
      if (!mutations?.length) return;
      try {
        setLoading(true);
        setError(null);
        const backendMuts = mutations.map(toBackendMut).filter(Boolean);
        if (!backendMuts.length) throw new Error('No valid mutations to analyze');
        
        // Add scoring mode options
        const options = {
          adaptive: true,
          ensemble: true
        };
        
        if (scoringMode === 'massive_real') {
          options.massive_real_context = true;
        } else if (scoringMode === 'massive_impact') {
          options.massive_impact = true;
        }
        
        const result = await predict({ model_id: modelId, mutations: backendMuts, options });
        setData(result);
      } catch (err) {
        setError(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [modelId, JSON.stringify(mutations), scoringMode]); // Added scoringMode dependency

  // Send efficacy data to parent when it changes
  useEffect(() => {
    if (onEfficacyData && data) {
      const efficacyData = {
        drugs: data.drugs || [],
        scoringMode: data.scoring_mode,
        sequenceDetails: data.sequence_details,
        pathwayScores: data.pathway_scores,
        drugSummary: {
          supported: (data.drugs || []).filter(d => d.evidence_tier === 'supported').length,
          consider: (data.drugs || []).filter(d => d.evidence_tier === 'consider').length,
          insufficient: (data.drugs || []).filter(d => d.evidence_tier === 'insufficient').length,
          sensitive: (data.drugs || []).filter(d => d.evidence_tier === 'supported' || d.meets_evidence_gate).length,
          lowBenefit: (data.drugs || []).filter(d => (d.evidence_tier === 'insufficient') || (typeof d.efficacy_score === 'number' && d.efficacy_score < 0.1)).length
        },
        timestamp: new Date().toISOString(),
        modelId
      };
      onEfficacyData(efficacyData);
    }
  }, [data, onEfficacyData, modelId]);

  const getModeDescription = (mode) => {
    switch (mode) {
      case 'standard':
        return 'Standard Evo2 scoring with adaptive windows and ensemble';
      case 'massive_real':
        return 'Real genomic context (±25kb) with old Oracle - for stress testing';
      case 'massive_impact':
        return 'Synthetic contrast sequences with old Oracle - for magnitude testing';
      default:
        return '';
    }
  };

  const getModeColor = (mode) => {
    switch (mode) {
      case 'standard':
        return 'primary';
      case 'massive_real':
        return 'warning';
      case 'massive_impact':
        return 'error';
      default:
        return 'default';
    }
  };

  if (!mutations || mutations.length === 0) return null;
  if (loading) return <Typography variant="body2">Evaluating drug efficacy…</Typography>;
  if (error) return <Typography variant="body2" color="error">{error}</Typography>;
  if (!data) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h6">Drug Efficacy</Typography>
        {config?.operational_mode && (
          <Chip size="small" label={`Mode: ${config.operational_mode}`} />
        )}
        {config?.feature_flags && (
          <Chip size="small" label={`Massive: ${config.feature_flags.enable_massive_modes ? 'on' : 'off'}`} color={config.feature_flags.enable_massive_modes ? 'warning' : 'default'} />
        )}
        {calib?.status && (
          <Chip size="small" label={`Calibration: ${calib.status}`} />
        )}
      </Stack>
      
      {/* Scoring Mode Toggle */}
      <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Scoring Mode</FormLabel>
          <RadioGroup
            row
            value={scoringMode}
            onChange={(e) => setScoringMode(e.target.value)}
            sx={{ mt: 1 }}
          >
            <FormControlLabel 
              value="standard" 
              control={<Radio />} 
              label="Standard" 
            />
            <FormControlLabel 
              value="massive_real" 
              control={<Radio />} 
              label="Massive Real" 
            />
            <FormControlLabel 
              value="massive_impact" 
              control={<Radio />} 
              label="Massive Impact" 
            />
          </RadioGroup>
        </FormControl>
        
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip 
            label={scoringMode.replace('_', ' ').toUpperCase()} 
            color={getModeColor(scoringMode)} 
            size="small" 
          />
          <Typography variant="caption" color="text.secondary">
            {getModeDescription(scoringMode)}
          </Typography>
        </Box>
        
        {(scoringMode === 'massive_real' || scoringMode === 'massive_impact') && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            <Typography variant="caption">
              Massive modes are for testing and validation. Do not use for clinical decisions.
            </Typography>
          </Alert>
        )}
      </Box>
   {/* Drug Cards */}
   {data.drugs?.map((d) => (
        <EfficacyCard
          key={d.name}
          drug={d}
          scoringMode={data.scoring_mode}
          seqDetail={(data.sequence_details||[])[0]}
          pathwayScores={data.pathway_scores}
          explainFn={explain}
          resultData={data}
        />
      ))}
      {/* Recommendation strip */}
      {(() => {
        const drugs = Array.isArray(data.drugs) ? data.drugs : [];
        if (drugs.length === 0) return null;
        const top = [...drugs].sort((a,b)=> (b.efficacy_score||0) - (a.efficacy_score||0))[0];
        const seq = (top?.rationale||[]).find(r=>r.type==='sequence')?.value;
        const path = (top?.rationale||[]).find(r=>r.type==='pathway');
        const evd = (top?.rationale||[]).find(r=>r.type==='evidence')?.strength;
        return (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Recommended to consider: <b>{top?.name}</b> — score {Number(top?.efficacy_score||0).toFixed(3)} (conf {Number(top?.confidence||0).toFixed(3)}). Seq {fmt(seq)}; Path RAS {fmt(path?.ras_mapk)} / TP53 {fmt(path?.tp53)}; Evidence {fmt(evd)}.
            </Typography>
          </Alert>
        );
      })()}

      {/* Summary */}
      <Box sx={{ mb: 2 }}>
        {(() => {
          const drugs = Array.isArray(data.drugs) ? data.drugs : [];
          const supported = drugs.filter(d => d.evidence_tier === 'supported').length;
          const consider = drugs.filter(d => d.evidence_tier === 'consider').length;
          const insufficient = drugs.filter(d => d.evidence_tier === 'insufficient').length;
          return (
            <Stack direction="row" spacing={1}>
              <Chip size="small" color="success" label={`Supported: ${supported}`} />
              <Chip size="small" label={`Consider: ${consider}`} />
              <Chip size="small" color="default" label={`Insufficient: ${insufficient}`} />
            </Stack>
          );
        })()}
      </Box>

      {/* Sensitive vs Low Benefit grouping */}
      {(() => {
        const drugs = Array.isArray(data.drugs) ? data.drugs : [];
        const sensitive = drugs.filter(d => d.evidence_tier === 'supported' || d.meets_evidence_gate);
        const low = drugs.filter(d => (d.evidence_tier === 'insufficient') || (typeof d.efficacy_score === 'number' && d.efficacy_score < 0.1));
        const middle = drugs.filter(d => !sensitive.includes(d) && !low.includes(d));
        return (
          <Stack spacing={2}>
            {sensitive.length > 0 && (
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Sensitive (higher likelihood of benefit)</Typography>
                {sensitive.map((d) => (
                  <EfficacyCard key={`sens-${d.name}`} drug={d} scoringMode={data.scoring_mode} seqDetail={(data.sequence_details||[])[0]} pathwayScores={data.pathway_scores} explainFn={explain} resultData={data} />
                ))}
              </Box>
            )}
            {middle.length > 0 && (
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Consider (needs more evidence)</Typography>
                {middle.map((d) => (
                  <EfficacyCard key={`mid-${d.name}`} drug={d} scoringMode={data.scoring_mode} seqDetail={(data.sequence_details||[])[0]} pathwayScores={data.pathway_scores} explainFn={explain} resultData={data} />
                ))}
              </Box>
            )}
            {low.length > 0 && (
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Resistant / Low Likelihood of Benefit</Typography>
                {low.map((d) => (
                  <EfficacyCard key={`low-${d.name}`} drug={d} scoringMode={data.scoring_mode} seqDetail={(data.sequence_details||[])[0]} pathwayScores={data.pathway_scores} explainFn={explain} resultData={data} />
                ))}
              </Box>
            )}
          </Stack>
        );
      })()}
      
      <EfficacyLegend />
    </Box>
  );
} 
            )}
            {low.length > 0 && (
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Resistant / Low Likelihood of Benefit</Typography>
                {low.map((d) => (
                  <EfficacyCard key={`low-${d.name}`} drug={d} scoringMode={data.scoring_mode} seqDetail={(data.sequence_details||[])[0]} pathwayScores={data.pathway_scores} explainFn={explain} resultData={data} />
                ))}
              </Box>
            )}
          </Stack>
        );
      })()}
      
      <EfficacyLegend />
    </Box>
  );
} 
            )}
            {low.length > 0 && (
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Resistant / Low Likelihood of Benefit</Typography>
                {low.map((d) => (
                  <EfficacyCard key={`low-${d.name}`} drug={d} scoringMode={data.scoring_mode} seqDetail={(data.sequence_details||[])[0]} pathwayScores={data.pathway_scores} explainFn={explain} resultData={data} />
                ))}
              </Box>
            )}
          </Stack>
        );
      })()}
      
      <EfficacyLegend />
    </Box>
  );
} 