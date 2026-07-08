/**
 * PharmaOnboarding - captures company + use-case for the pharma persona.
 * POSTs to /api/onboarding/pharma then redirects to /pharma/dashboard.
 */
import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_ROOT } from '../../lib/apiConfig';

const ROLES = ['Business Development', 'Medical', 'Commercial', 'Research', 'Executive'];
const TAS = [
  'Oncology - CRC',
  'Oncology - Ovarian',
  'Oncology - Lung',
  'Oncology - Breast',
  'Oncology - Prostate',
  'Oncology - Other',
  'Immunology',
  'Rare Disease',
  'Other',
];
const USE_CASES = [
  'Competitive intelligence',
  'Asset evaluation / diligence',
  'MoA differentiation',
  'BD outreach targeting',
  'Trial design support',
  'Regulatory intelligence',
  'Other',
];

export default function PharmaOnboarding() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [form, setForm] = useState({
    company_name: '',
    user_role: '',
    therapeutic_area: '',
    asset_of_interest: '',
    use_case: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.company_name.trim()) {
      setError('Company name is required.');
      return;
    }
    setSubmitting(true);
    try {
      const token = await getToken?.();
      const res = await fetch(`${API_ROOT}/api/onboarding/pharma`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Onboarding failed (${res.status}): ${body}`);
      }
      const data = await res.json();
      navigate(data.redirect || '/pharma/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper sx={{ p: 4 }} elevation={2}>
        <Typography variant="h5" gutterBottom>Pharma onboarding</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Tell us about your team so Brenus intelligence can prioritize the right
          dossiers, guardrails, and asset comparisons.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Company name"
              required
              value={form.company_name}
              onChange={handleChange('company_name')}
              fullWidth
            />
            <TextField
              select
              label="Your role"
              value={form.user_role}
              onChange={handleChange('user_role')}
              fullWidth
            >
              {ROLES.map((r) => (
                <MenuItem key={r} value={r}>{r}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Therapeutic area"
              value={form.therapeutic_area}
              onChange={handleChange('therapeutic_area')}
              fullWidth
            >
              {TAS.map((r) => (
                <MenuItem key={r} value={r}>{r}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Asset of interest (e.g. STC-1010, tusamitamab, CEACAM5)"
              value={form.asset_of_interest}
              onChange={handleChange('asset_of_interest')}
              fullWidth
            />
            <TextField
              select
              label="Primary use case"
              value={form.use_case}
              onChange={handleChange('use_case')}
              fullWidth
            >
              {USE_CASES.map((r) => (
                <MenuItem key={r} value={r}>{r}</MenuItem>
              ))}
            </TextField>

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} /> : null}
            >
              {submitting ? 'Submitting…' : 'Continue to dashboard'}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}
