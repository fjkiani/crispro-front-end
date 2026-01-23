/**
 * ImprovedSidebar - Mobile-First Sidebar with Labels
 * 
 * Features:
 * - Desktop: Vertical sidebar with icons + labels
 * - Mobile: Hidden (use MobileNavbar instead)
 * - Clear labels for all items
 * - Proper color contrast
 * - MOAT routes only
 */

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePersona } from "../context/PersonaContext";
import { moatNavigationItems, getNavigationForPersona } from "../constants/moatNavigation";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Paper,
  Divider,
  Typography,
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
  Brightness4 as ThemeIcon,
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

export const ImprovedSidebar = () => {
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
  const [activeItem, setActiveItem] = useState('');

  // Get filtered navigation based on persona (default to all items if no persona)
  const navItems = user ? getNavigationForPersona(persona) : [];

  // Determine active route
  useEffect(() => {
    const path = location.pathname;
    const active = navItems.find(item => path === item.link || path.startsWith(item.link + '/'));
    if (active) {
      setActiveItem(active.name);
    } else {
      setActiveItem('');
    }
  }, [location.pathname, navItems]);

  // Hide on mobile (MobileNavbar handles mobile)
  if (isMobile) {
    return null;
  }

  const handleNavClick = (item) => {
    setActiveItem(item.name);
    navigate(item.link);
  };

  return (
    <Box
      sx={{
        width: 240,
        height: '100vh',
        position: 'sticky',
        top: 0,
        bgcolor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
      }}
    >
      {/* Logo/Brand */}
      <Box
        component={Link}
        to="/"
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          textDecoration: 'none',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            fontSize: '2rem',
            lineHeight: 1,
          }}
        >
          🧬
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.2 }}>
            CrisPRO
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            MOAT
          </Typography>
        </Box>
      </Box>

      {/* Navigation List */}
      <List sx={{ flex: 1, py: 1, overflowY: 'auto' }}>
        {navItems.map((item) => {
          const IconComponent = iconMap[item.name] || DashboardIcon;
          const isActive = activeItem === item.name;
          
          return (
            <ListItem key={item.name} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip title={item.description || item.label} placement="right" arrow>
                <ListItemButton
                  onClick={() => handleNavClick(item)}
                  selected={isActive}
                  sx={{
                    mx: 1,
                    borderRadius: 2,
                    py: 1.5,
                    '&.Mui-selected': {
                      bgcolor: `${item.color || theme.palette.primary.main}15`,
                      color: item.color || theme.palette.primary.main,
                      '&:hover': {
                        bgcolor: `${item.color || theme.palette.primary.main}25`,
                      },
                      '& .MuiListItemIcon-root': {
                        color: item.color || theme.palette.primary.main,
                      },
                    },
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: isActive 
                        ? (item.color || theme.palette.primary.main)
                        : 'text.secondary',
                    }}
                  >
                    <IconComponent />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* Theme Toggle / Footer */}
      <Box sx={{ p: 2 }}>
        <ListItemButton
          sx={{
            borderRadius: 2,
            py: 1,
          }}
        >
          <ListItemIcon>
            <ThemeIcon />
          </ListItemIcon>
          <ListItemText
            primary="Theme"
            primaryTypographyProps={{ fontSize: '0.875rem' }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );
};

export default ImprovedSidebar;
