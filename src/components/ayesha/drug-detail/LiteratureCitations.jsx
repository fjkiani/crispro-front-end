/**
 * LiteratureCitations — Direct PubMed integration display.
 *
 * Renders the actual papers found during the literature search.
 */
import React from 'react';
import { Box, Typography, Paper, Link, Chip, Skeleton, Button } from '@mui/material';
import { MenuBook, OpenInNew, Block } from '@mui/icons-material';

export default function LiteratureCitations({ citations, loading, noCacheAction }) {
    // Determine status
    if (loading) {
        return (
            <Box sx={{ mt: 3, p: 3, border: '1px solid #e2e8f0', borderRadius: 3, bgcolor: '#f8fafc' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <MenuBook sx={{ color: '#94a3b8' }} />
                    <Typography sx={{ fontWeight: 700, color: '#475569' }}>Scanning PubMed...</Typography>
                </Box>
                <Skeleton variant="rectangular" height={80} sx={{ mb: 1.5, borderRadius: 2 }} />
                <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
            </Box>
        );
    }

    if (!citations || citations.length === 0) {
        return (
            <Box sx={{ mt: 3, p: 3, border: '1px dashed #cbd5e1', borderRadius: 3, bgcolor: '#f8fafc' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Block sx={{ color: '#94a3b8', fontSize: 20 }} />
                    <Typography sx={{ fontWeight: 700, color: '#64748b' }}>
                        No direct PubMed citations found
                    </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                    No citations were found in this API response for this drug–mutation pairing.
                </Typography>
                {noCacheAction && (
                    <Button variant="outlined" size="small" color="inherit" onClick={noCacheAction}>
                        Force Deep Search
                    </Button>
                )}
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <MenuBook sx={{ color: '#0ea5e9', fontSize: 22 }} />
                <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.2rem' }}>
                    Supporting Literature
                </Typography>
                <Chip 
                    label="NCBI PubMed Source" 
                    size="small" 
                    sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 600, fontSize: '0.7rem' }} 
                />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {citations.map((cit, i) => (
                    <Paper 
                        key={cit.pmid || i}
                        sx={{
                            p: 2.5,
                            borderRadius: 3,
                            border: '1px solid #e2e8f0',
                            bgcolor: '#ffffff',
                            transition: 'all 0.2s',
                            '&:hover': {
                                borderColor: '#cbd5e1',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                            }
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                                <Typography sx={{ fontWeight: 700, color: '#1e293b', lineHeight: 1.4, mb: 1, fontSize: '1rem' }}>
                                    {cit.title}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#64748b', mb: 1.5 }}>
                                    {cit.journal} • {cit.year}
                                </Typography>
                                
                                {cit.publication_types && cit.publication_types.length > 0 && (
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {cit.publication_types.slice(0, 3).map((pt, ptIdx) => (
                                            <Chip 
                                                key={ptIdx} 
                                                label={pt} 
                                                size="small"
                                                variant="outlined"
                                                sx={{ fontSize: '0.7rem', color: '#64748b', borderColor: '#e2e8f0' }} 
                                            />
                                        ))}
                                    </Box>
                                )}
                            </Box>
                            
                            {cit.pmid && (
                                <Button 
                                    href={`https://pubmed.ncbi.nlm.nih.gov/${cit.pmid}`} 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    endIcon={<OpenInNew sx={{ fontSize: 16 }} />}
                                    size="small"
                                    sx={{ 
                                        whiteSpace: 'nowrap', 
                                        color: '#0ea5e9',
                                        textTransform: 'none',
                                        fontWeight: 600
                                    }}
                                >
                                    PMID: {cit.pmid}
                                </Button>
                            )}
                        </Box>
                    </Paper>
                ))}
            </Box>
        </Box>
    );
}
