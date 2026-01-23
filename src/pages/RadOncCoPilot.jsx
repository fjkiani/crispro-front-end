import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress } from '@mui/material';
import ToolRunner from '../components/common/ToolRunner';
import { radOncConfig } from '../config/toolconfigs';

// We will fetch these assets
const SURVIVAL_PLOT_URL = '/assets/survival_plot.png'; 

const RadOncCoPilot = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data/radonc_analysis');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAnalysisData(data);
        console.log("Fetched RadOnc analysis data:", data); // For verification
      } catch (err) {
        setError('Failed to load analysis data.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h3" gutterBottom>
        ☢️ RadOnc Co-Pilot
      </Typography>
      <Typography variant="h5" gutterBottom>
        Predicting Radiotherapy Response in Lung Cancer
      </Typography>
      <Typography paragraph>
        This page presents the findings from our deep-dive analysis into the TCGA dataset, exploring how a patient's <strong>TP53 mutation status</strong> correlates with their survival outcome after receiving <strong>radiation therapy</strong>.
      </Typography>

      <Paper elevation={3} sx={{ my: 4, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Key Finding: TP53 Pathogenicity Predicts Poor Radiotherapy Response
        </Typography>
        <Box
          component="img"
          sx={{
            width: '100%',
            maxWidth: '800px',
            my: 2,
            mx: 'auto',
            display: 'block',
          }}
          alt="Kaplan-Meier survival curves for four patient cohorts."
          src={SURVIVAL_PLOT_URL}
        />
        <Typography paragraph>
          <strong>Interpretation:</strong> The orange line represents patients with a pathogenic (harmful) TP53 mutation who received radiation. Their dramatically lower survival probability demonstrates that for this patient group, radiation therapy is not only ineffective but potentially detrimental. This is a powerful, data-driven biomarker that could help personalize cancer treatment.
        </Typography>
      </Paper>
      
      <Paper elevation={3} sx={{ my: 4, p: 2 }}>
          <Typography variant="h6" gutterBottom>Explore the Full Patient Dataset</Typography>
          {isLoading ? (
            <CircularProgress />
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <Typography>
              Data loaded successfully! Check the console. We will render a table here soon.
            </Typography>
          )}
      </Paper>

      <ToolRunner toolConfig={radOncConfig} />
    </Box>
  );
};

export default RadOncCoPilot; 