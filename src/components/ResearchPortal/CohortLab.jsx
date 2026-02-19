import React, { useMemo, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ScienceIcon from '@mui/icons-material/Science';
import { API_ROOT } from '../../lib/apiConfig';


const defaultStudiesByDisease = {
  'ovarian cancer': [
    { id: 'ov_tcga', label: 'TCGA Ovarian (OV)' },
    { id: 'ov_tcga_pan_can_atlas_2018', label: 'TCGA Ovarian (PanCan Atlas)' },
  ],
  'multiple myeloma': [
    { id: 'mm_broad', label: 'MM Broad' },
    { id: 'mmrf_commpass_ia14', label: 'MMRF CoMMpass IA14' },
    { id: 'myeloma_msk_2018', label: 'MSK 2018' },
  ],
};

function MetricsCard({ metrics }) {
  if (!metrics) return null;
  return (
    <Box sx={{ p: 2, border: '1px solid #333', borderRadius: 1 }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>Benchmark Metrics</Typography>
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        <Chip label={`Total: ${metrics.count ?? 0}`} size="small" />
        {typeof metrics.positives === 'number' && (
          <Chip label={`Positives: ${metrics.positives}`} size="small" />
        )}
        {typeof metrics.prevalence === 'number' && (
          <Chip label={`Prevalence: ${((metrics.prevalence || 0) * 100).toFixed(1)}%`} size="small" />
        )}
        {typeof metrics.auprc_proxy === 'number' && (
          <Chip label={`AUPRC (proxy): ${metrics.auprc_proxy}`} size="small" />
        )}
        {metrics.profile && <Chip label={`Profile: ${metrics.profile}`} size="small" />}
      </Stack>
    </Box>
  );
}

function GeneBreakdownTable({ genes }) {
  if (!genes || genes.length === 0) return null;
  return (
    <TableContainer sx={{ border: '1px solid #333', borderRadius: 1 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Gene</TableCell>
            <TableCell>Count</TableCell>
            <TableCell>Prevalence</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {genes.map((g) => (
            <TableRow key={g.gene}>
              <TableCell>{g.gene}</TableCell>
              <TableCell>{g.n}</TableCell>
              <TableCell>{typeof g.prevalence === 'number' ? `${(g.prevalence * 100).toFixed(1)}%` : '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function LabelPreviewCard({ preview }) {
  if (!preview) return null;
  const pos = preview.positives || 0;
  const total = preview.total || 0;
  const prevalence = total > 0 ? (pos / total) * 100 : 0;
  const isBalanced = prevalence >= 20 && prevalence <= 80;

  return (
    <Paper sx={{ p: 2, border: '1px solid', borderColor: isBalanced ? 'success.main' : 'warning.main' }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <ScienceIcon fontSize="small" />
        <Typography variant="subtitle2">Label Preview</Typography>
        {!isBalanced && (
          <Tooltip title="Class imbalance may affect metrics. Consider adjusting label criteria.">
            <InfoOutlinedIcon fontSize="small" color="warning" />
          </Tooltip>
        )}
      </Stack>
      <Stack direction="row" spacing={2} flexWrap="wrap">
        <Chip label={`Total: ${total}`} size="small" />
        <Chip 
          label={`Positive: ${pos} (${prevalence.toFixed(1)}%)`} 
          size="small" 
          color={pos > 0 ? "success" : "default"}
        />
        <Chip 
          label={`Negative: ${total - pos} (${(100 - prevalence).toFixed(1)}%)`} 
          size="small" 
          color={total - pos > 0 ? "info" : "default"}
        />
        <Chip 
          label={isBalanced ? "✓ Balanced" : "⚠ Imbalanced"} 
          size="small" 
          color={isBalanced ? "success" : "warning"}
          variant="outlined"
        />
      </Stack>
      {preview.distribution && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Label distribution: {JSON.stringify(preview.distribution)}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

function ClinicalAttributesExplorer({ study, disease, onAttributesFound }) {
  const [loading, setLoading] = useState(false);
  const [attributes, setAttributes] = useState([]);
  const [error, setError] = useState('');

  const fetchAttributes = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`https://www.cbioportal.org/api/studies/${study}/clinical-attributes`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const relevant = json.filter(attr => {
        const id = attr.clinicalAttributeId?.toLowerCase() || '';
        const desc = attr.description?.toLowerCase() || '';
        return id.includes('treatment') || id.includes('drug') || id.includes('outcome') || 
               id.includes('survival') || id.includes('progression') || id.includes('response') ||
               desc.includes('treatment') || desc.includes('outcome') || desc.includes('survival');
      });
      setAttributes(relevant);
      if (onAttributesFound) onAttributesFound(relevant);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction="row" spacing={1} alignItems="center">
          <InfoOutlinedIcon fontSize="small" />
          <Typography variant="body2">Explore Clinical Attributes (Optional)</Typography>
          {attributes.length > 0 && (
            <Chip label={`${attributes.length} relevant`} size="small" />
          )}
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
            Preview available clinical outcomes before extraction. Use this to understand what labels are available in the study.
          </Alert>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={fetchAttributes} 
            disabled={loading}
          >
            {loading ? 'Fetching...' : 'Fetch Available Attributes'}
          </Button>
          {error && <Alert severity="error">{error}</Alert>}
          {attributes.length > 0 && (
            <TableContainer sx={{ maxHeight: 300, border: '1px solid #333' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Attribute ID</TableCell>
                    <TableCell>Display Name</TableCell>
                    <TableCell>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attributes.map(attr => (
                    <TableRow key={attr.clinicalAttributeId}>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {attr.clinicalAttributeId}
                      </TableCell>
                      <TableCell>{attr.displayName}</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem' }}>{attr.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

function ArtifactsPanel({ rows }) {
  const downloadCSV = () => {
    const header = ['disease', 'gene', 'hgvs_p', 'chrom', 'pos', 'ref', 'alt', 'outcome_platinum', 'dfs_status', 'os_status', 'sample_id', 'patient_id'];
    const csv = [
      header.join(','),
      ...(rows || []).map((r) => [
        r.disease ?? '',
        r.gene ?? '',
        r.hgvs_p ?? '',
        r.chrom ?? '',
        r.pos ?? '',
        r.ref ?? '',
        r.alt ?? '',
        r.outcome_platinum ?? '',
        r.dfs_status ?? '',
        r.os_status ?? '',
        r.sample_id ?? '',
        r.patient_id ?? '',
      ].join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cohort_${Date.now()}.csv`;
    a.click();
  };

  const downloadJSON = () => {
    const json = JSON.stringify(rows || [], null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cohort_${Date.now()}.json`;
    a.click();
  };

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Button variant="outlined" size="small" onClick={downloadCSV} disabled={!rows || rows.length === 0}>Download CSV</Button>
      <Button variant="outlined" size="small" onClick={downloadJSON} disabled={!rows || rows.length === 0}>Download JSON</Button>
      <Typography variant="caption">{rows?.length || 0} variants</Typography>
    </Stack>
  );
}

export default function CohortLab() {
  const [disease, setDisease] = useState('ovarian cancer');
  const [studyId, setStudyId] = useState('ov_tcga');
  const [genesInput, setGenesInput] = useState('');
  const [limit, setLimit] = useState(500);
  const [mode, setMode] = useState('both');
  const [profile, setProfile] = useState('baseline');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [labelPreview, setLabelPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const studies = useMemo(() => defaultStudiesByDisease[disease] || [], [disease]);

  const handlePreview = async () => {
    setPreviewLoading(true);
    setError('');
    setLabelPreview(null);
    try {
      const genes = genesInput
        .split(',')
        .map((g) => g.trim())
        .filter((g) => g.length > 0);

      const payload = {
        mode: 'extract_only',
        disease,
        study_id: studyId,
        genes,
        limit: 100, // Small sample for preview
        profile: 'baseline',
      };

      const res = await fetch(`${API_ROOT}/api/datasets/extract_and_benchmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.detail || `HTTP ${res.status}`);
      
      // Compute label distribution from sample
      const rows = json.rows || [];
      const positives = rows.filter(r => r.outcome_platinum === 1).length;
      const distribution = {};
      rows.forEach(r => {
        const status = r.dfs_status || r.os_status || 'unknown';
        distribution[status] = (distribution[status] || 0) + 1;
      });
      
      setLabelPreview({
        total: rows.length,
        positives,
        distribution,
      });
    } catch (e) {
      setError(e?.message || 'Preview failed');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleExtract = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const genes = genesInput
        .split(',')
        .map((g) => g.trim())
        .filter((g) => g.length > 0);

      const payload = {
        mode,
        disease,
        study_id: studyId,
        genes,
        limit: Number(limit) || 100,
        profile,
      };

      const res = await fetch(`${API_ROOT}/api/datasets/extract_and_benchmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.detail || `HTTP ${res.status}`);
      setResult(json);
    } catch (e) {
      setError(e?.message || 'Extraction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="h6">Cohort Lab</Typography>
        <Chip 
          label="Data Explorer" 
          size="small" 
          icon={<ScienceIcon />} 
          variant="outlined"
        />
      </Stack>

      <Alert severity="info" icon={<InfoOutlinedIcon />}>
        Extract real-world cancer cohorts with clinical outcomes. Preview labels, check class balance, and run benchmarks.
      </Alert>

      <ClinicalAttributesExplorer study={studyId} disease={disease} />

      <Divider />
      <Typography variant="subtitle2">Cohort Configuration</Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="disease-label">Disease</InputLabel>
          <Select labelId="disease-label" label="Disease" value={disease} onChange={(e) => {
            setDisease(e.target.value);
            const first = (defaultStudiesByDisease[e.target.value] || [])[0]?.id;
            if (first) setStudyId(first);
            setLabelPreview(null);
          }}>
            <MenuItem value="ovarian cancer">Ovarian Cancer</MenuItem>
            <MenuItem value="multiple myeloma">Multiple Myeloma</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 240 }}>
          <InputLabel id="study-label">Study</InputLabel>
          <Select labelId="study-label" label="Study" value={studyId} onChange={(e) => {
            setStudyId(e.target.value);
            setLabelPreview(null);
          }}>
            {studies.map((s) => (
              <MenuItem key={s.id} value={s.id}>{s.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField size="small" label="Genes (comma-separated; empty = all)" value={genesInput} onChange={(e) => setGenesInput(e.target.value)} sx={{ minWidth: 320 }} />

        <TextField size="small" type="number" label="Limit" value={limit} onChange={(e) => setLimit(e.target.value)} sx={{ width: 120 }} />
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="mode-label">Mode</InputLabel>
          <Select labelId="mode-label" label="Mode" value={mode} onChange={(e) => setMode(e.target.value)}>
            <MenuItem value="both">Extract + Benchmark</MenuItem>
            <MenuItem value="extract_only">Extract Only</MenuItem>
            <MenuItem value="run_only">Run Only</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="profile-label">Profile</InputLabel>
          <Select labelId="profile-label" label="Profile" value={profile} onChange={(e) => setProfile(e.target.value)}>
            <MenuItem value="baseline">Baseline</MenuItem>
            <MenuItem value="richer_s">Richer S</MenuItem>
            <MenuItem value="fusion">Fusion</MenuItem>
          </Select>
        </FormControl>

        <Button variant="outlined" onClick={handlePreview} disabled={previewLoading || loading}>
          {previewLoading ? 'Previewing…' : 'Preview Labels (100 samples)'}
        </Button>

        <Button variant="contained" onClick={handleExtract} disabled={loading || previewLoading}>
          {loading ? 'Extracting…' : 'Extract & Benchmark'}
        </Button>
      </Stack>

      {labelPreview && (
        <>
          <Divider />
          <LabelPreviewCard preview={labelPreview} />
          <Alert severity="success" sx={{ fontSize: '0.875rem' }}>
            Preview successful! Based on this 100-sample preview, the full extraction will use <strong>DFS_STATUS</strong> (disease-free survival) as the primary outcome label. Variants with recurrence/progression = positive class (1).
          </Alert>
        </>
      )}

      {error && (
        <Alert severity="error">{error}</Alert>
      )}

      {result && (
        <>
          <Divider />
          <MetricsCard metrics={result.metrics} />
          <GeneBreakdownTable genes={result.metrics?.by_gene || []} />
          <ArtifactsPanel rows={result.rows || []} />
        </>
      )}
    </Box>
  );
}








