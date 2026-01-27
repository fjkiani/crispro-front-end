import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
  Divider,
  Alert,
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PersonIcon from '@mui/icons-material/Person';
import ScienceIcon from '@mui/icons-material/Science';
import SettingsIcon from '@mui/icons-material/Settings';
import AssignmentIcon from '@mui/icons-material/Assignment';
import InfoIcon from '@mui/icons-material/Info';
import { usePatient } from '../context/PatientContext';

/**
 * PatientDashboard - Main landing page for patients
 * 
 * Provides navigation to key patient features:
 * - Complete Care Plan
 * - Trial Explorer
 * - Profile Management
 * - Settings
 */
const PatientDashboard = () => {
  const navigate = useNavigate();
  const { currentPatient, patientProfile } = usePatient();

  const patient = currentPatient || patientProfile;

  const dashboardCards = [
    {
      title: 'Complete Care Plan',
      description: 'View your personalized treatment recommendations, drug rankings, and food/supplement guidance',
      icon: <LocalHospitalIcon sx={{ fontSize: 40 }} />,
      path: '/ayesha-complete-care',
      color: 'primary',
    },
    {
      title: 'Clinical Trials',
      description: 'Explore clinical trials matched to your profile with mechanism-fit scores and eligibility',
      icon: <ScienceIcon sx={{ fontSize: 40 }} />,
      path: '/ayesha-trials',
      color: 'secondary',
    },
    {
      title: 'Profile',
      description: 'View and manage your patient profile, treatment history, and biomarkers',
      icon: <PersonIcon sx={{ fontSize: 40 }} />,
      path: '/patient/profile',
      color: 'success',
    },
    {
      title: 'Settings',
      description: 'Manage your account settings, notifications, and preferences',
      icon: <SettingsIcon sx={{ fontSize: 40 }} />,
      path: '/patient/settings',
      color: 'info',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 4, backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <PersonIcon sx={{ fontSize: 48 }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Welcome back{patient?.name ? `, ${patient.name.split(' ')[0]}` : ''}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Access your personalized care plan, clinical trials, and health information
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Quick Info Alert */}
      <Alert severity="info" sx={{ mb: 4 }} icon={<InfoIcon />}>
        <Typography variant="body2">
          <strong>Research Use Only:</strong> The information provided on this platform is for research and educational purposes only. 
          Consult with your healthcare provider for clinical decision-making.
        </Typography>
      </Alert>

      {/* Dashboard Cards */}
      <Grid container spacing={3}>
        {dashboardCards.map((card) => (
          <Grid item xs={12} sm={6} md={6} key={card.title}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ color: `${card.color}.main` }}>
                    {card.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="bold">
                    {card.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {card.description}
                </Typography>
              </CardContent>
              <Divider />
              <CardActions sx={{ p: 2 }}>
                <Button
                  size="small"
                  variant="contained"
                  color={card.color}
                  fullWidth
                  onClick={() => navigate(card.path)}
                  startIcon={<AssignmentIcon />}
                >
                  Open
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Patient Summary Section */}
      {patient && (
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Quick Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Name
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {patient.name || patient.full_name || 'Not provided'}
              </Typography>
            </Grid>
            {patient.disease && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Condition
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {patient.disease}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Paper>
      )}
    </Container>
  );
};

export default PatientDashboard;
