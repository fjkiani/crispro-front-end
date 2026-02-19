import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, LinearProgress, Alert } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { API_ROOT as API_BASE_URL } from '../../lib/apiConfig';


const SupabaseDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/analytics/dashboard`);
      if (!response.ok) {
        throw new Error(`Dashboard fetch failed: ${response.status}`);
      }
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Analytics Dashboard</Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Analytics Dashboard</Typography>
        <Alert severity="error">Failed to load dashboard: {error}</Alert>
      </Box>
    );
  }

  const { summary, time_series, model_comparison } = metrics || {};

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        🧬 Myeloma Digital Twin Analytics
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Total Runs
              </Typography>
              <Typography variant="h4">
                {summary?.total_runs || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Avg AUROC
              </Typography>
              <Typography variant="h4">
                {summary?.avg_auroc?.toFixed(3) || 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Avg Latency
              </Typography>
              <Typography variant="h4">
                {summary?.avg_latency_ms ? `${Math.round(summary.avg_latency_ms)}ms` : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Agreement Rate
              </Typography>
              <Typography variant="h4">
                {summary?.avg_agree_rate ? `${(summary.avg_agree_rate * 100).toFixed(1)}%` : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Time Series Charts */}
      <Grid container spacing={3}>
        {time_series && time_series.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                AUROC Over Time
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={time_series}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 1]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="auroc" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {model_comparison && model_comparison.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Model Comparison
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={model_comparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="model" />
                  <YAxis domain={[0, 1]} />
                  <Tooltip />
                  <Bar dataKey="auroc" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Recent Runs Table */}
      {metrics?.recent_runs && (
        <Paper sx={{ p: 2, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recent Runs
          </Typography>
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #ddd' }}>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Run</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Model</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Variants</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>AUROC</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Agreement</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recent_runs.map((run, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px' }}>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                        {run.run_signature?.slice(0, 8)}
                      </Typography>
                    </td>
                    <td style={{ padding: '8px' }}>{run.model_id}</td>
                    <td style={{ padding: '8px' }}>{run.variant_count}</td>
                    <td style={{ padding: '8px' }}>
                      {run.auroc ? run.auroc.toFixed(3) : 'N/A'}
                    </td>
                    <td style={{ padding: '8px' }}>
                      {run.agree_rate ? `${(run.agree_rate * 100).toFixed(1)}%` : 'N/A'}
                    </td>
                    <td style={{ padding: '8px' }}>
                      <Typography variant="caption">
                        {new Date(run.created_at).toLocaleString()}
                      </Typography>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default SupabaseDashboard; 