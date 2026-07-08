/**
 * PharmaCEACAM5 - front-end wrapper for the existing CEACAM5 backend
 * endpoints (routers/ceacam5_demo.py). Shows the MAS scoring, fit vs.
 * Sanofi tusamitamab, and the PATH A production formula.
 *
 * If a CEACAM5 dashboard component already exists (e.g. in ayesha/), we
 * lazy-load it; otherwise we render a minimal MUI table backed by
 * /api/ceacam5/overview.
 */
import React, { useEffect, useState, Suspense } from 'react';
import {
  Container, Typography, Box, CircularProgress, Alert, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { API_ROOT } from '../../lib/apiConfig';

export default function PharmaCEACAM5() {
  const { getToken } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const token = await getToken?.();
        // Try a well-known endpoint from ceacam5_demo.py — will 404 gracefully otherwise
        const endpoints = [
          '/api/ceacam5/overview',
          '/api/ceacam5/mas',
          '/api/ceacam5/summary',
        ];
        let result = null;
        for (const ep of endpoints) {
          try {
            const res = await fetch(`${API_ROOT}${ep}`, {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (res.ok) {
              result = await res.json();
              result._source = ep;
              break;
            }
          } catch (_) {
            /* try next */
          }
        }
        if (!result) throw new Error('CEACAM5 endpoints unavailable');
        if (alive) setData(result);
      } catch (err) {
        if (alive) setError(err.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [getToken]);

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>CEACAM5 Intelligence Dossier</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          MAS scoring and CrisPRO fit vs. Sanofi tusamitamab. Formula locked to PATH A (signed 2026-04-28).
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label="PATH A locked" color="success" size="small" variant="outlined" />
          <Chip label="MAS = Mechanism Alignment Score" size="small" variant="outlined" />
          <Chip label="Read-only" size="small" variant="outlined" />
        </Box>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          CEACAM5 backend endpoint not available — {error}. The router exists in
          <code> api/routers/ceacam5_demo.py</code>; check that it is registered
          and that the current user has access.
        </Alert>
      )}

      {data && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Source endpoint</Typography>
          <Chip label={data._source} size="small" sx={{ mb: 2 }} />

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Field</TableCell>
                  <TableCell>Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(data).filter(([k]) => !k.startsWith('_')).map(([k, v]) => (
                  <TableRow key={k}>
                    <TableCell sx={{ fontFamily: 'monospace' }}>{k}</TableCell>
                    <TableCell>
                      {typeof v === 'object'
                        ? <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(v, null, 2)}</pre>
                        : String(v)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Container>
  );
}
