/**
 * Patient Context Banner
 * 
 * Displays patient information to show research is personalized
 */

import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Avatar,
} from '@mui/material';
import { formatPatientContext } from '../../utils/patientProfileHelpers';

const PatientContextBanner = ({ patientProfile }) => {
  if (!patientProfile) return null;
  
  const context = formatPatientContext(patientProfile);
  if (!context) return null;
  
  return (
    <Card sx={{ mb: 3, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
            {context.displayName[0].toUpperCase()}
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              Research Personalized for {context.displayName}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
              <Chip 
                label={`${context.disease}`} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
              {context.treatmentLine && (
                <Chip 
                  label={`Line ${context.treatmentLine}`} 
                  size="small" 
                  variant="outlined"
                />
              )}
              {context.biomarkers && context.biomarkers.map((bm, idx) => (
                <Chip 
                  key={idx}
                  label={bm} 
                  size="small" 
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PatientContextBanner;
