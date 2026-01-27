import React, { useState } from 'react';
import { Paper, Typography, Box, Collapse, IconButton } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';

const BaseCard = ({ 
    title, 
    subtitle, 
    children, 
    expandable = false, 
    defaultExpanded = true,
    statusColor = '#f0f4f8',
    titleVariant = 'h6',
    elevation = 2,
    sx = {}
}) => {
    const [expanded, setExpanded] = useState(defaultExpanded);

    const handleToggleExpanded = () => {
        setExpanded(!expanded);
    };

    return (
        <Paper 
            elevation={elevation} 
            sx={{ 
                p: 3, 
                mb: 2, 
                bgcolor: statusColor,
                borderRadius: 2,
                ...sx 
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant={titleVariant} gutterBottom>
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography variant="subtitle2" color="text.secondary">
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                {expandable && (
                    <IconButton onClick={handleToggleExpanded} size="small">
                        {expanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                )}
            </Box>
            
            {expandable ? (
                <Collapse in={expanded}>
                    <Box sx={{ mt: 2 }}>
                        {children}
                    </Box>
                </Collapse>
            ) : (
                <Box sx={{ mt: subtitle ? 2 : 1 }}>
                    {children}
                </Box>
            )}
        </Paper>
    );
};

export default BaseCard; 