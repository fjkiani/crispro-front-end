/**
 * Signup - Clerk-backed sign-up page.
 *
 * After sign-up Clerk redirects to "/" which triggers AuthRedirect, which in
 * turn routes the user to the appropriate persona landing page. The backend
 * /api/auth/clerk-sync endpoint upserts a Supabase profile row on first login.
 *
 * Role selection happens in a separate step (persona onboarding page)
 * because Clerk's default flow does not include a role picker.
 */
import React, { useEffect } from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { SignUp, useAuth as useClerkAuth } from '@clerk/clerk-react';

const Signup = () => {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useClerkAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate('/', { replace: true });
    }
  }, [isSignedIn, isLoaded, navigate]);

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper sx={{ p: 4 }} elevation={2}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom>Create your account</Typography>
          <Typography variant="body2" color="text.secondary">
            Sign up to unlock patient dossiers, tumor board tools, or Brenus Intelligence.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <SignUp
            path="/signup"
            routing="path"
            signInUrl="/login"
            afterSignUpUrl="/"
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

export default Signup;
