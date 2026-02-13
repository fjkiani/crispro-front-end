import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    Tabs,
    Tab,
    Paper,
    Badge
} from '@mui/material';
import { TableChart, FactCheck } from '@mui/icons-material';

const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://127.0.0.1:8000';

function CatalogTable({ drugs }) {
    if (!drugs || drugs.length === 0) {
        return <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>No drugs in this panel view.</Typography>;
    }

    return (
        <TableContainer component={Paper} elevation={0} variant="outlined">
            <Table size="small">
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Drug Name</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Evidence Tier</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Label Status</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Badges</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Citations</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {drugs.map((d) => (
                        <TableRow key={d.name} hover>
                            <TableCell sx={{ fontWeight: 500 }}>{d.name}</TableCell>
                            <TableCell>
                                <Chip
                                    label={d.evidence_tier}
                                    size="small"
                                    color={d.evidence_tier === 'Tier 1' || d.evidence_tier === '1' ? 'success' : 'default'}
                                    variant="outlined"
                                />
                            </TableCell>
                            <TableCell>
                                <Chip
                                    label={d.label_status}
                                    size="small"
                                    color={d.label_status === 'ON_LABEL' ? 'primary' : 'default'}
                                    sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                            </TableCell>
                            <TableCell>
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                    {d.badges?.map((b, i) => (
                                        <Chip key={i} label={b} size="small" sx={{ fontSize: '0.65rem', height: 20 }} />
                                    ))}
                                </Box>
                            </TableCell>
                            <TableCell align="right">{d.citations_count}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default function PanelCatalog() {
    const [activeTab, setActiveTab] = useState(0);

    const { data: catalog, isLoading, error } = useQuery({
        queryKey: ['ayesha_panel_catalog'],
        queryFn: async () => {
            const res = await fetch(`${API_ROOT}/api/ayesha/therapy-fit/panel_catalog?level=all`);
            if (!res.ok) throw new Error('Failed to fetch catalog');
            return res.json();
        }
    });

    if (isLoading) return <CircularProgress size={24} />;
    if (error) return <Typography color="error">Catalog Error</Typography>;

    const levels = ['L1', 'L2', 'L3'];
    const currentLevel = levels[activeTab];
    const drugs = catalog?.[currentLevel]?.drugs || [];

    return (
        <Card sx={{ mt: 4, borderRadius: 3 }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <TableChart color="action" />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Reference Panel Catalog
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Full list of evaluated agents for this session. This is the ground truth boundary for the agent.
                </Typography>

                <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
                    {levels.map((lvl, idx) => {
                        const count = catalog?.[lvl]?.drugs?.length || 0;
                        return (
                            <Tab
                                key={lvl}
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {lvl} Panel
                                        <Chip label={count} size="small" sx={{ height: 16, fontSize: '0.65rem' }} />
                                    </Box>
                                }
                            />
                        );
                    })}
                </Tabs>

                <CatalogTable drugs={drugs} />
            </CardContent>
        </Card>
    );
}
