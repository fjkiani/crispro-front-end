/**
 * Login - Clerk-backed sign-in page.
 *
 * The heavy lifting (SSO buttons, email/password, MFA, magic link) is
 * handled by Clerk's <SignIn> component. AuthRedirect (used at "/")
 * takes care of routing the user to the right persona landing page
 * once Clerk emits a valid session.
 *
 * The legacy Supabase-backed sign-in code lived at ~185 lines with a
 * hard-coded "ak@ak.com" bypass. That bypass has been REMOVED per the
 * approved plan (Clerk is now authoritative).
 */
import React, { useEffect } from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { SignIn, useAuth as useClerkAuth } from '@clerk/clerk-react';

const Login = () => {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useClerkAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // Let AuthRedirect (mounted on "/") handle persona-aware routing.
      navigate('/', { replace: true });
    }
  }, [isSignedIn, isLoaded, navigate]);

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper sx={{ p: 4 }} elevation={2}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom>Welcome to CrisPRO</Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to access your dossiers, tumor board, or Brenus Intelligence.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <SignIn
            path="/login"
            routing="path"
            signUpUrl="/signup"
            afterSignInUrl="/"
            appearance={{
              elements: {
                rootBox: { width: '100%' },
                card: { boxShadow: 'none', border: '1px solid #E0E0E0' },
              },
            }}
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
