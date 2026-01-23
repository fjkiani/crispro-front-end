import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

// We'll use a placeholder image for the demo.
// In a real application, this would be a library like Mol* or NGL.
const placeholder_3d_image = '/assets/protein_3d_placeholder.png'; 

const StructureViewer3D = ({ plddtScore }) => {
  return (
    <Paper sx={{ p: 2, textAlign: 'center', background: '#111' }}>
      <img 
        src={placeholder_3d_image} 
        alt="3D Protein Structure" 
        style={{ width: '100%', maxWidth: '300px', height: 'auto' }}
      />
      <Typography variant="h6" sx={{ color: 'white', mt: 1 }}>
        pLDDT Score: <span style={{ color: '#4caf50', fontWeight: 'bold' }}>{plddtScore}</span>
      </Typography>
      <Typography variant="caption" sx={{ color: '#aaa' }}>
        Predicted Structural Viability
      </Typography>
    </Paper>
  );
};

export default StructureViewer3D; 