import React, { useState } from 'react';
import { Box, Grid, TextField, IconButton, Button, Stack, Typography, Chip, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { API_ROOT as API_BASE_URL } from '../../lib/apiConfig';


const presets = [
  { gene: 'KRAS', hgvs_p: 'p.Gly12Asp', variant_info: 'chr12:25245350 C>T', build: 'hg38' },
  { gene: 'NRAS', hgvs_p: 'p.Gln61Lys', variant_info: 'chr1:115258747 A>C', build: 'hg38' },
  { gene: 'BRAF', hgvs_p: 'p.Val600Glu', variant_info: 'chr7:140753336 A>T', build: 'hg38' },
  { gene: 'TP53', hgvs_p: 'p.Arg248Gln', variant_info: 'chr17:7673802 G>A', build: 'hg38' },
];

const validateVariant = (v) => {
  const re = /^chr?([0-9XYM]+):([0-9]+)\s+([ACGT])>([ACGT])$/i;
  return re.test((v || '').trim());
};

const VariantInputList = ({ value = presets.slice(0,1), onChange }) => {
  const [rows, setRows] = useState(value);
  const [refStatuses, setRefStatuses] = useState({}); // key: index -> { state: 'ok'|'mismatch'|'error'|'idle', detail }

  const update = (next) => {
    setRows(next);
    onChange && onChange(next);
    try { window.__mdt_mutations = next; } catch (_) {}
  };

  const setField = async (i, field, val) => {
    const next = rows.map((r, idx) => idx === i ? { ...r, [field]: val } : r);
    update(next);
    // Trigger refcheck when variant_info changes and format is valid
    if (field === 'variant_info') {
      const vi = String(val || '').trim();
      if (!validateVariant(vi)) {
        setRefStatuses(prev => ({ ...prev, [i]: { state: 'idle' } }));
        return;
      }
      try {
        const parts = vi.replace(/^chr/i,'').split(/[:\s]+/);
        const chrom = parts[0];
        const pos = parseInt(parts[1], 10);
        const alleles = parts[2] || '';
        const ref = alleles.split('>')[0].toUpperCase();
        setRefStatuses(prev => ({ ...prev, [i]: { state: 'checking' } }));
        const res = await fetch(`${API_BASE_URL}/api/evo/refcheck`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assembly: 'GRCh38', chrom: String(chrom), pos: Number(pos), ref })
        });
        const j = await res.json();
        if (!res.ok) throw new Error(j?.detail || 'refcheck failed');
        setRefStatuses(prev => ({ ...prev, [i]: { state: j.ok ? 'ok' : 'mismatch', detail: j } }));
      } catch (e) {
        setRefStatuses(prev => ({ ...prev, [i]: { state: 'error', detail: String(e?.message || e) } }));
      }
    }
  };

  const addRow = () => update([...rows, { gene: '', hgvs_p: '', variant_info: '', build: 'hg38' }]);
  const removeRow = (i) => update(rows.filter((_, idx) => idx !== i));
  const addPreset = (p) => update([...rows, p]);

  const statusChip = (st) => {
    if (!st || st.state === 'idle') return null;
    if (st.state === 'checking') return <Chip size="small" label="Checking..." />;
    if (st.state === 'ok') return <Chip size="small" color="success" label="REF✔" />;
    if (st.state === 'mismatch') return (
      <Tooltip title={`Fetched ${st.detail?.fetched}, expected ${st.detail?.expected}`}><Chip size="small" color="warning" label="REF≠" /></Tooltip>
    );
    return <Chip size="small" color="error" label="REF!" />;
  };

  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
        {presets.map((p) => (
          <Button key={p.gene} variant="outlined" size="small" onClick={() => addPreset(p)}>
            {p.gene}
          </Button>
        ))}
        <Button variant="contained" size="small" onClick={addRow}>+ Add</Button>
      </Stack>
      {rows.map((row, i) => {
        const invalid = !validateVariant(row.variant_info);
        const st = refStatuses[i];
        return (
          <Grid container spacing={1} alignItems="center" key={i} sx={{ mb: 1 }}>
            <Grid item xs={12} sm={2}>
              <TextField label="Gene" value={row.gene} onChange={(e) => setField(i,'gene', e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField label="Protein Change (HGVS_p)" value={row.hgvs_p} onChange={(e) => setField(i,'hgvs_p', e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField label="Genomic (chr:pos REF>ALT)" value={row.variant_info}
                onChange={(e) => setField(i,'variant_info', e.target.value)}
                fullWidth error={Boolean(row.variant_info) && invalid}
                helperText={invalid ? 'Format: chr12:25245350 C>T' : ' '}/>
            </Grid>
            <Grid item xs={12} sm={1}>
              <TextField label="Build" value={row.build} onChange={(e) => setField(i,'build', e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={12} sm={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                {statusChip(st)}
                <IconButton onClick={() => removeRow(i)} aria-label="delete">
                  <DeleteIcon />
                </IconButton>
              </Stack>
            </Grid>
          </Grid>
        );
      })}
    </Box>
  );
};

export default VariantInputList; 