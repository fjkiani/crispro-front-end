import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import { threatAssessorConfig, radOncConfig, myelomaTwinConfig, crisprDesignerConfig } from '../config/toolconfigs';

// In a real app, this might be a more dynamic import
const allTools = [
  threatAssessorConfig, 
  crisprDesignerConfig,
  // We only add the assessment part of RadOnc as a "tool"
  {...radOncConfig, toolId: 'radonc-assessment', path: '/radonc-co-pilot'}, // Link to the dashboard
  myelomaTwinConfig,
];

const ToolCard = ({ tool }) => {
  const toolPath = tool.path || `/${tool.toolId}`;
  
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Link to={toolPath} style={{ textDecoration: 'none' }}>
        <Box sx={{
          border: '1px solid #444',
          borderRadius: 2,
          p: 2,
          height: '100%',
          '&:hover': {
            borderColor: '#8e44ad',
            boxShadow: '0 0 15px rgba(142, 68, 173, 0.5)',
          }
        }}>
          <Typography variant="h6">{tool.title}</Typography>
          <Typography variant="body2" color="text.secondary">{tool.subtitle}</Typography>
        </Box>
      </Link>
    </Grid>
  );
};

const Armory = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h3" gutterBottom>
        🛠️ The Armory
      </Typography>
      <Typography paragraph>
        A centralized inventory of all tactical weapons and decision-support tools. Select a tool to begin.
      </Typography>
      <Grid container spacing={3}>
        {allTools.map(tool => (
          <ToolCard key={tool.toolId} tool={tool} />
        ))}
      </Grid>
    </Box>
  );
};

export default Armory; 