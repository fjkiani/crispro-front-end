/**
 * HospitalOnboarding - captures institution + NPI + cancer types.
 * POSTs to /api/onboarding/hospital → redirects to /hospital/tumor-board.
 */
import React, { useState } from 'react';
import {
  Alert, Box, Button, Checkbox, CircularProgress, Container,
  FormControl, FormControlLabel, FormGroup, InputLabel, MenuItem,
  Paper, Select, Stack, TextField, Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_ROOT } from '../../lib/apiConfig';

const CANCER_TYPES = [
  'Colorectal (MSS)',
  'Colorectal (MSI-H)',
  'Ovarian (HGS)',
  'Breast',
  'Lung (NSCLC)',
  'Lung (SCLC)',
  'Prostate',
  'Pancreatic',
  'Melanoma',
  'GI other',
  'Hematologic',
  'Rare',
];

const TEAM_SIZES = [
  { v: 1, label: '1 (solo practice)' },
  { v: 5, label: '2–5' },
  { v: 15, label: '6–15' },
  { v: 30, label: '16–30' },
  { v: 100, label: '30+' },
];

export default function HospitalOnboarding() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [form, setForm] = useState({
    institution: '',
    npi_number: '',
    cancer_types: [],
    team_size: 5,
    research_interests: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const toggleCancer = (v) => {
    setForm((prev) => {
      const s = new Set(prev.cancer_types);
      s.has(v) ? s.delete(v) : s.add(v);
      return { ...prev, cancer_types: Array.from(s) };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.institution.trim()) {
      setError('Institution name is required.');
      return;
    }
    setSubmitting(true);
    try {
      const token = await getToken?.();
      const res = await fetch(`${API_ROOT}/api/onboarding/hospital`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`Onboarding failed (${res.status})`);
      const data = await res.json();
      navigate(data.redirect || '/hospital/tumor-board');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper sx={{ p: 4 }} elevation={2}>
        <Typography variant="h5" gutterBottom>Hospital / clinic onboarding</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Set up your tumor-board workspace. Cancer-type selections tune the
          trial matcher and dossier generator.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label="Institution name"
              required
              value={form.institution}
              onChange={(e) => setForm({ ...form, institution: e.target.value })}
              fullWidth
            />
            <TextField
              label="NPI number (optional)"
              value={form.npi_number}
              onChange={(e) => setForm({ ...form, npi_number: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Team size</InputLabel>
              <Select
                value={form.team_size}
                label="Team size"
                onChange={(e) => setForm({ ...form, team_size: e.target.value })}
              >
                {TEAM_SIZES.map((t) => (
                  <MenuItem key={t.v} value={t.v}>{t.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box>
              <Typography variant="subtitle2" gutterBottom>Cancer types treated</Typography>
              <FormGroup row>
                {CANCER_TYPES.map((c) => (
                  <FormControlLabel
                    key={c}
                    control={
                      <Checkbox
                        checked={form.cancer_types.includes(c)}
                        onChange={() => toggleCancer(c)}
                      />
                    }
                    label={c}
                  />
                ))}
              </FormGroup>
            </Box>
            <TextField
              label="Research interests (optional)"
              multiline
              rows={3}
              value={form.research_interests}
              onChange={(e) => setForm({ ...form, research_interests: e.target.value })}
              fullWidth
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} /> : null}
            >
              {submitting ? 'Submitting…' : 'Continue to tumor board'}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}
