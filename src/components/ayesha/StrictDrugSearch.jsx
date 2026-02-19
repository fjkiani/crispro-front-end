import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Grid,
    Alert,
    Chip,
    Stack,
    CircularProgress,
    Paper
} from '@mui/material';
import { Search, SearchOff, CheckCircle } from '@mui/icons-material';
import { API_ROOT } from '../../lib/apiConfig';


export default function StrictDrugSearch() {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const url = new URL(`${API_ROOT}/api/ayesha/therapy-fit/drug/${encodeURIComponent(query)}`);
            url.searchParams.append('level', 'all');

            const res = await fetch(url.toString());
            if (!res.ok) throw new Error('Search failed');

            const data = await res.json();
            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card sx={{ mt: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Search color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Strict Panel Query
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Verify if a specific agent exists in the Ayesha evaluation panel. Returns strict "Found" / "Not Found" status per level.
                </Typography>

                <form onSubmit={handleSearch}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <TextField
                            size="small"
                            placeholder="Enter drug name (e.g. Olaparib)"
                            fullWidth
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            sx={{ bgcolor: 'white' }}
                        />
                        <Button
                            variant="contained"
                            type="submit"
                            disabled={loading || !query}
                            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Search />}
                        >
                            Verify
                        </Button>
                    </Stack>
                </form>

                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}

                {result && (
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                            Results for "{result.drug_query}":
                        </Typography>
                        <Grid container spacing={2}>
                            {['L1', 'L2', 'L3'].map(lvl => {
                                const payload = result[lvl];
                                if (!payload) return null;

                                return (
                                    <Grid item xs={12} md={4} key={lvl}>
                                        <Paper
                                            variant="outlined"
                                            sx={{
                                                p: 2,
                                                bgcolor: payload.found ? 'success.50' : 'grey.50',
                                                borderColor: payload.found ? 'success.200' : 'grey.200'
                                            }}
                                        >
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Typography variant="body2" fontWeight="bold">{lvl} Panel</Typography>
                                                {payload.found ? (
                                                    <Chip
                                                        icon={<CheckCircle sx={{ fontSize: '1rem !important' }} />}
                                                        label="FOUND"
                                                        color="success"
                                                        size="small"
                                                        variant="filled"
                                                    />
                                                ) : (
                                                    <Chip
                                                        icon={<SearchOff sx={{ fontSize: '1rem !important' }} />}
                                                        label="NOT FOUND"
                                                        color="default"
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                )}
                                            </Stack>

                                            {payload.found ? (
                                                <Box sx={{ mt: 1 }}>
                                                    <Typography variant="caption" display="block">
                                                        Tier: <strong>{payload.drug.evidence_tier}</strong>
                                                    </Typography>
                                                    <Typography variant="caption" display="block">
                                                        Status: {payload.drug.label_status}
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontStyle: 'italic' }}>
                                                    {payload.message}
                                                </Typography>
                                            )}
                                        </Paper>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}
