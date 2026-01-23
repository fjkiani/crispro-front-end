/**
 * Navbar - Top Navigation Bar (Desktop)
 * 
 * Mobile navigation is handled by MobileNavbar (bottom bar)
 * This component handles desktop top bar with search and user actions
 */

import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  AppBar, 
  Toolbar, 
  Box, 
  InputBase, 
  IconButton, 
  Button,
  useTheme,
  useMediaQuery,
  Typography,
} from '@mui/material';
import {
  Search as SearchIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';

const Navbar = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [signOut, navigate]);

  // Hide on mobile (MobileNavbar handles navigation)
  if (isMobile) {
    return null;
  }

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ gap: 2, px: 2 }}>
        {/* Search Bar */}
        <Box
          sx={{
            position: 'relative',
            borderRadius: 2,
            bgcolor: 'grey.100',
            '&:hover': {
              bgcolor: 'grey.200',
            },
            width: '100%',
            maxWidth: 400,
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center',
          }}
        >
          <IconButton
            type="button"
            sx={{ p: '10px', color: 'text.secondary' }}
            aria-label="search"
          >
            <SearchIcon />
          </IconButton>
          <InputBase
            placeholder="Search MOAT tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              color: 'text.primary',
              width: '100%',
              '& .MuiInputBase-input': {
                p: 1,
                pl: 0,
              },
            }}
          />
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* User Actions */}
        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {user.email || 'User'}
            </Typography>
            <IconButton
              onClick={handleLogout}
              size="small"
              sx={{ color: 'text.secondary' }}
            >
              <LogoutIcon />
            </IconButton>
          </Box>
        ) : (
          <Button
            variant="contained"
            onClick={() => navigate('/login')}
            startIcon={<AccountIcon />}
          >
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
