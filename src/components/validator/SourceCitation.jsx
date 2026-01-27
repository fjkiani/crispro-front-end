import React, { useState } from 'react';
import { Box, Typography, Link, Chip, IconButton, Collapse, Rating } from '@mui/material';
import { ExpandMore, ExpandLess, Link as LinkIcon, School, Science, Business } from '@mui/icons-material';
import BaseCard from '../common/BaseCard';

const SourceCitation = ({ results = [] }) => {
    const [expandedSources, setExpandedSources] = useState({});

    const toggleSource = (index) => {
        setExpandedSources(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const getSourceTypeIcon = (url) => {
        if (url.includes('pubmed') || url.includes('ncbi') || url.includes('.edu')) {
            return <School color="primary" />;
        } else if (url.includes('nature') || url.includes('science') || url.includes('cell')) {
            return <Science color="success" />;
        } else {
            return <Business color="info" />;
        }
    };

    const getCredibilityScore = (url, score) => {
        // Academic sources get higher credibility
        if (url.includes('pubmed') || url.includes('ncbi')) return 5;
        if (url.includes('.edu')) return 4;
        if (url.includes('nature') || url.includes('science')) return 5;
        
        // Use provided score as fallback, normalized to 1-5 scale
        return score ? Math.min(5, Math.max(1, Math.round(score * 5))) : 3;
    };

    const formatSourceTitle = (title, url) => {
        if (title && title.length > 0) return title;
        // Extract domain name as fallback
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return 'Source Document';
        }
    };

    return (
        <BaseCard
            title="Scientific Literature Review"
            subtitle={`${results.length} primary sources identified and analyzed`}
            statusColor="#e3f2fd"
        >
            {results.map((source, index) => (
                <Box key={index} sx={{ mb: 3, pb: 2, borderBottom: index < results.length - 1 ? '1px solid #eee' : 'none' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                        {getSourceTypeIcon(source.url)}
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" gutterBottom>
                                <Link 
                                    href={source.url} 
                                    target="_blank" 
                                    rel="noopener" 
                                    sx={{ color: '#1976d2', textDecoration: 'none' }}
                                >
                                    {formatSourceTitle(source.title, source.url)}
                                    <LinkIcon sx={{ ml: 1, fontSize: '1rem', verticalAlign: 'middle' }} />
                                </Link>
                            </Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                <Rating 
                                    value={getCredibilityScore(source.url, source.score)} 
                                    readOnly 
                                    size="small" 
                                />
                                <Typography variant="caption" color="text.secondary">
                                    Credibility Score
                                </Typography>
                                {source.score && (
                                    <Chip 
                                        label={`Relevance: ${source.score.toFixed(2)}`} 
                                        size="small" 
                                        variant="outlined" 
                                    />
                                )}
                            </Box>

                            <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
                                {source.content ? 
                                    source.content.substring(0, 200) + (source.content.length > 200 ? '...' : '') 
                                    : 'Source content available for review.'
                                }
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <IconButton 
                                    size="small" 
                                    onClick={() => toggleSource(index)}
                                    sx={{ color: 'primary.main' }}
                                >
                                    {expandedSources[index] ? <ExpandLess /> : <ExpandMore />}
                                </IconButton>
                                <Typography variant="caption" color="primary">
                                    {expandedSources[index] ? 'Hide' : 'Show'} Full Content
                                </Typography>
                            </Box>

                            <Collapse in={expandedSources[index]}>
                                <Box sx={{ mt: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 1, borderLeft: '3px solid #1976d2' }}>
                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                        {source.content}
                                    </Typography>
                                </Box>
                            </Collapse>
                        </Box>
                    </Box>
                </Box>
            ))}
        </BaseCard>
    );
};

export default SourceCitation; 