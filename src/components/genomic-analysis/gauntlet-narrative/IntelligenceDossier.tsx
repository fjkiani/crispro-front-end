import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, Chip, Divider, Grid } from '@mui/material';
import { Science, Biotech, Rule, Lightbulb, Insights } from '@mui/icons-material';

interface IntelligenceDossierData {
  summary: string;
  entities: { name: string; type: string; relevance: number }[];
  mechanisms: string[];
  conclusions: string[];
}

interface IntelligenceDossierProps {
  dossier: IntelligenceDossierData;
  target: string;
}

const getChipColor = (type: string) => {
    switch (type.toUpperCase()) {
        case 'GENE':
        case 'PROTEIN':
            return 'primary';
        case 'COMPOUND':
        case 'DRUG':
            return 'secondary';
        case 'DISEASE':
            return 'error';
        case 'MECHANISM':
            return 'warning';
        default:
            return 'default';
    }
}

const IntelligenceDossier = ({ dossier, target }: IntelligenceDossierProps) => {
  if (!dossier) {
    return null;
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3, mb: 2, border: '1px solid', borderColor: 'secondary.main' }}>
      <Typography variant="h5" gutterBottom component="div" sx={{ display: 'flex', alignItems: 'center' }}>
        <Insights sx={{ mr: 1, color: 'secondary.main' }} />
        Intelligence Dossier: {target}
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={3}>
        {/* Column 1: Summary and Entities */}
        <Grid item xs={12} md={6}>
          {/* Scientific Literature Review */}
          <Box mb={3}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Science sx={{ mr: 1 }} /> Scientific Literature Review
            </Typography>
            <Typography variant="body2" paragraph sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
              {dossier.summary}
            </Typography>
          </Box>

          {/* Biological Target Analysis */}
           <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Biotech sx={{ mr: 1 }} /> Biological Target Analysis (Key Entities)
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {dossier.entities?.map((entity, index) => (
                <Chip
                  key={index}
                  label={`${entity.name} (${entity.type})`}
                  color={getChipColor(entity.type)}
                  variant="outlined"
                  title={`Relevance Score: ${entity.relevance.toFixed(2)}`}
                />
              ))}
            </Box>
          </Box>
        </Grid>

        {/* Column 2: Mechanisms and Insights */}
        <Grid item xs={12} md={6}>
            {/* Actionable Scientific Insights */}
            <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Lightbulb sx={{ mr: 1, color: 'warning.main' }} /> Actionable Scientific Insights
                </Typography>
                <List dense>
                    {dossier.mechanisms?.map((mechanism, index) => (
                        <ListItem key={index}>
                        <ListItemIcon>
                            <Rule />
                        </ListItemIcon>
                        <ListItemText primary="Mechanism" secondary={mechanism} />
                        </ListItem>
                    ))}
                    {dossier.conclusions?.map((conclusion, index) => (
                        <ListItem key={index}>
                        <ListItemIcon>
                            <CheckCircleOutline color="success" />
                        </ListItemIcon>
                        <ListItemText primary="Conclusion" secondary={conclusion} />
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default IntelligenceDossier; 
import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, Chip, Divider, Grid } from '@mui/material';
import { Science, Biotech, Rule, Lightbulb, Insights } from '@mui/icons-material';

interface IntelligenceDossierData {
  summary: string;
  entities: { name: string; type: string; relevance: number }[];
  mechanisms: string[];
  conclusions: string[];
}

interface IntelligenceDossierProps {
  dossier: IntelligenceDossierData;
  target: string;
}

const getChipColor = (type: string) => {
    switch (type.toUpperCase()) {
        case 'GENE':
        case 'PROTEIN':
            return 'primary';
        case 'COMPOUND':
        case 'DRUG':
            return 'secondary';
        case 'DISEASE':
            return 'error';
        case 'MECHANISM':
            return 'warning';
        default:
            return 'default';
    }
}

const IntelligenceDossier = ({ dossier, target }: IntelligenceDossierProps) => {
  if (!dossier) {
    return null;
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3, mb: 2, border: '1px solid', borderColor: 'secondary.main' }}>
      <Typography variant="h5" gutterBottom component="div" sx={{ display: 'flex', alignItems: 'center' }}>
        <Insights sx={{ mr: 1, color: 'secondary.main' }} />
        Intelligence Dossier: {target}
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={3}>
        {/* Column 1: Summary and Entities */}
        <Grid item xs={12} md={6}>
          {/* Scientific Literature Review */}
          <Box mb={3}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Science sx={{ mr: 1 }} /> Scientific Literature Review
            </Typography>
            <Typography variant="body2" paragraph sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
              {dossier.summary}
            </Typography>
          </Box>

          {/* Biological Target Analysis */}
           <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Biotech sx={{ mr: 1 }} /> Biological Target Analysis (Key Entities)
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {dossier.entities?.map((entity, index) => (
                <Chip
                  key={index}
                  label={`${entity.name} (${entity.type})`}
                  color={getChipColor(entity.type)}
                  variant="outlined"
                  title={`Relevance Score: ${entity.relevance.toFixed(2)}`}
                />
              ))}
            </Box>
          </Box>
        </Grid>

        {/* Column 2: Mechanisms and Insights */}
        <Grid item xs={12} md={6}>
            {/* Actionable Scientific Insights */}
            <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Lightbulb sx={{ mr: 1, color: 'warning.main' }} /> Actionable Scientific Insights
                </Typography>
                <List dense>
                    {dossier.mechanisms?.map((mechanism, index) => (
                        <ListItem key={index}>
                        <ListItemIcon>
                            <Rule />
                        </ListItemIcon>
                        <ListItemText primary="Mechanism" secondary={mechanism} />
                        </ListItem>
                    ))}
                    {dossier.conclusions?.map((conclusion, index) => (
                        <ListItem key={index}>
                        <ListItemIcon>
                            <CheckCircleOutline color="success" />
                        </ListItemIcon>
                        <ListItemText primary="Conclusion" secondary={conclusion} />
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default IntelligenceDossier; 
import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, Chip, Divider, Grid } from '@mui/material';
import { Science, Biotech, Rule, Lightbulb, Insights } from '@mui/icons-material';

interface IntelligenceDossierData {
  summary: string;
  entities: { name: string; type: string; relevance: number }[];
  mechanisms: string[];
  conclusions: string[];
}

interface IntelligenceDossierProps {
  dossier: IntelligenceDossierData;
  target: string;
}

const getChipColor = (type: string) => {
    switch (type.toUpperCase()) {
        case 'GENE':
        case 'PROTEIN':
            return 'primary';
        case 'COMPOUND':
        case 'DRUG':
            return 'secondary';
        case 'DISEASE':
            return 'error';
        case 'MECHANISM':
            return 'warning';
        default:
            return 'default';
    }
}

const IntelligenceDossier = ({ dossier, target }: IntelligenceDossierProps) => {
  if (!dossier) {
    return null;
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3, mb: 2, border: '1px solid', borderColor: 'secondary.main' }}>
      <Typography variant="h5" gutterBottom component="div" sx={{ display: 'flex', alignItems: 'center' }}>
        <Insights sx={{ mr: 1, color: 'secondary.main' }} />
        Intelligence Dossier: {target}
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={3}>
        {/* Column 1: Summary and Entities */}
        <Grid item xs={12} md={6}>
          {/* Scientific Literature Review */}
          <Box mb={3}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Science sx={{ mr: 1 }} /> Scientific Literature Review
            </Typography>
            <Typography variant="body2" paragraph sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
              {dossier.summary}
            </Typography>
          </Box>

          {/* Biological Target Analysis */}
           <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Biotech sx={{ mr: 1 }} /> Biological Target Analysis (Key Entities)
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {dossier.entities?.map((entity, index) => (
                <Chip
                  key={index}
                  label={`${entity.name} (${entity.type})`}
                  color={getChipColor(entity.type)}
                  variant="outlined"
                  title={`Relevance Score: ${entity.relevance.toFixed(2)}`}
                />
              ))}
            </Box>
          </Box>
        </Grid>

        {/* Column 2: Mechanisms and Insights */}
        <Grid item xs={12} md={6}>
            {/* Actionable Scientific Insights */}
            <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Lightbulb sx={{ mr: 1, color: 'warning.main' }} /> Actionable Scientific Insights
                </Typography>
                <List dense>
                    {dossier.mechanisms?.map((mechanism, index) => (
                        <ListItem key={index}>
                        <ListItemIcon>
                            <Rule />
                        </ListItemIcon>
                        <ListItemText primary="Mechanism" secondary={mechanism} />
                        </ListItem>
                    ))}
                    {dossier.conclusions?.map((conclusion, index) => (
                        <ListItem key={index}>
                        <ListItemIcon>
                            <CheckCircleOutline color="success" />
                        </ListItemIcon>
                        <ListItemText primary="Conclusion" secondary={conclusion} />
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default IntelligenceDossier; 
import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, Chip, Divider, Grid } from '@mui/material';
import { Science, Biotech, Rule, Lightbulb, Insights } from '@mui/icons-material';

interface IntelligenceDossierData {
  summary: string;
  entities: { name: string; type: string; relevance: number }[];
  mechanisms: string[];
  conclusions: string[];
}

interface IntelligenceDossierProps {
  dossier: IntelligenceDossierData;
  target: string;
}

const getChipColor = (type: string) => {
    switch (type.toUpperCase()) {
        case 'GENE':
        case 'PROTEIN':
            return 'primary';
        case 'COMPOUND':
        case 'DRUG':
            return 'secondary';
        case 'DISEASE':
            return 'error';
        case 'MECHANISM':
            return 'warning';
        default:
            return 'default';
    }
}

const IntelligenceDossier = ({ dossier, target }: IntelligenceDossierProps) => {
  if (!dossier) {
    return null;
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3, mb: 2, border: '1px solid', borderColor: 'secondary.main' }}>
      <Typography variant="h5" gutterBottom component="div" sx={{ display: 'flex', alignItems: 'center' }}>
        <Insights sx={{ mr: 1, color: 'secondary.main' }} />
        Intelligence Dossier: {target}
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={3}>
        {/* Column 1: Summary and Entities */}
        <Grid item xs={12} md={6}>
          {/* Scientific Literature Review */}
          <Box mb={3}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Science sx={{ mr: 1 }} /> Scientific Literature Review
            </Typography>
            <Typography variant="body2" paragraph sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
              {dossier.summary}
            </Typography>
          </Box>

          {/* Biological Target Analysis */}
           <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Biotech sx={{ mr: 1 }} /> Biological Target Analysis (Key Entities)
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {dossier.entities?.map((entity, index) => (
                <Chip
                  key={index}
                  label={`${entity.name} (${entity.type})`}
                  color={getChipColor(entity.type)}
                  variant="outlined"
                  title={`Relevance Score: ${entity.relevance.toFixed(2)}`}
                />
              ))}
            </Box>
          </Box>
        </Grid>

        {/* Column 2: Mechanisms and Insights */}
        <Grid item xs={12} md={6}>
            {/* Actionable Scientific Insights */}
            <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Lightbulb sx={{ mr: 1, color: 'warning.main' }} /> Actionable Scientific Insights
                </Typography>
                <List dense>
                    {dossier.mechanisms?.map((mechanism, index) => (
                        <ListItem key={index}>
                        <ListItemIcon>
                            <Rule />
                        </ListItemIcon>
                        <ListItemText primary="Mechanism" secondary={mechanism} />
                        </ListItem>
                    ))}
                    {dossier.conclusions?.map((conclusion, index) => (
                        <ListItem key={index}>
                        <ListItemIcon>
                            <CheckCircleOutline color="success" />
                        </ListItemIcon>
                        <ListItemText primary="Conclusion" secondary={conclusion} />
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default IntelligenceDossier; 