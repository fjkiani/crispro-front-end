/**
 * MobileNavbar - Mobile-First Bottom Navigation Bar
 * 
 * Features:
 * - Always visible at bottom on mobile
 * - Clear labels with icons
 * - Proper color contrast
 * - MOAT routes only
 * - Smooth animations
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePersona } from '../context/PersonaContext';
import { moatNavigationItems, getNavigationForPersona } from '../constants/moatNavigation';
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  LocalHospital as CareIcon,
  Science as TrialIcon,
  Description as DossierIcon,
  Biotech as ResearchIcon,
  Biotech as GenomicsIcon,
  TrendingUp as SLIcon,
  Medication as DosingIcon,
  Assessment as MetastasisIcon,
} from '@mui/icons-material';

const iconMap = {
  'orchestrator': DashboardIcon,
  'universal-complete-care': CareIcon,
  'universal-trial-intelligence': TrialIcon,
  'universal-dossiers': DossierIcon,
  'research-intelligence': ResearchIcon,
  'clinical-genomics': GenomicsIcon,
  'synthetic-lethality': SLIcon,
  'dosing-guidance': DosingIcon,
  'metastasis': MetastasisIcon,
};

export const MobileNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  let persona = null;
  try {
    const personaContext = usePersona();
    persona = personaContext?.persona || null;
  } catch (e) {
    // PersonaContext not available, continue without filtering
  }
  const [value, setValue] = useState('');

  // Get filtered navigation based on persona (default to all items if no persona)
  const navItems = user ? getNavigationForPersona(persona) : [];

  // Determine active route
  useEffect(() => {
    const path = location.pathname;
    const activeItem = navItems.find(item => path === item.link || path.startsWith(item.link + '/'));
    if (activeItem) {
      setValue(activeItem.name);
    } else {
      setValue('');
    }
  }, [location.pathname, navItems]);

  if (!isMobile || !user) {
    return null; // Only show on mobile when authenticated
  }

  const handleChange = (event, newValue) => {
    if (newValue) {
      const item = navItems.find(nav => nav.name === newValue);
      if (item) {
        setValue(newValue);
        navigate(item.link);
      }
    }
  };

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000,
        borderTop: '1px solid',
        borderColor: 'divider',
        display: { xs: 'block', md: 'none' }
      }} 
      elevation={3}
    >
      <BottomNavigation
        value={value}
        onChange={handleChange}
        showLabels
        sx={{
          bgcolor: 'background.paper',
          '& .MuiBottomNavigationAction-root': {
            color: 'text.secondary',
            minWidth: '60px',
            maxWidth: '120px',
            padding: '6px 4px',
            '&.Mui-selected': {
              color: 'primary.main',
              fontWeight: 600,
            },
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.7rem',
            fontWeight: 400,
            marginTop: '4px',
            '&.Mui-selected': {
              fontSize: '0.7rem',
              fontWeight: 600,
            },
          },
        }}
      >
        {navItems.map((item) => {
          const IconComponent = iconMap[item.name] || DashboardIcon;
          return (
            <BottomNavigationAction
              key={item.name}
              label={item.shortLabel || item.label}
              value={item.name}
              icon={<IconComponent />}
              sx={{
                color: value === item.name ? item.color || 'primary.main' : 'text.secondary',
              }}
            />
          );
        })}
      </BottomNavigation>
    </Paper>
  );
};

export default MobileNavbar;
