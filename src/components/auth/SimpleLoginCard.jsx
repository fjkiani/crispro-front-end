import React from 'react';
import {
    Card,
    CardContent,
    Box,
    Typography,
    TextField,
    Button,
    Link,
    Alert,
    CircularProgress,
    Container,
    Paper
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

/**
 * SimpleLoginCard - A minimal, clean authentication component.
 * 
 * "Start with a single sharp knife, not a Swiss Army knife." - Zeta Doctrine
 */
export default function SimpleLoginCard({
    email,
    password,
    error,
    loading,
    onEmailChange,
    onPasswordChange,
    onSubmit,
    onSignupClick,
    onForgotPasswordClick,
}) {
    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                {/* Minimal Logo / Icon */}
                <Box
                    sx={{
                        m: 1,
                        bgcolor: 'secondary.main',
                        borderRadius: '50%',
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <LockOutlinedIcon sx={{ color: 'white' }} />
                </Box>

                <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                    Sign in to CrisPRO
                </Typography>

                <Paper
                    elevation={0}
                    variant="outlined"
                    sx={{
                        p: 4,
                        width: '100%',
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        borderColor: 'divider'
                    }}
                >
                    {error && (
                        <Alert severity="error" sx={{ width: '100%' }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={(e) => onEmailChange(e.target.value)}
                            disabled={loading}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => onPasswordChange(e.target.value)}
                            disabled={loading}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold' }}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Sign In'}
                        </Button>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                            <Link
                                component="button"
                                variant="body2"
                                onClick={onForgotPasswordClick}
                                underline="hover"
                            >
                                Forgot password?
                            </Link>
                            <Link
                                component="button"
                                variant="body2"
                                onClick={onSignupClick}
                                underline="hover"
                            >
                                {"Don't have an account? Sign Up"}
                            </Link>
                        </Box>
                    </Box>
                </Paper>

                <Box sx={{ mt: 5 }}>
                    <Typography variant="body2" color="text.secondary" align="center">
                        {'Copyright © CrisPRO '}
                        {new Date().getFullYear()}
                        {'.'}
                    </Typography>
                </Box>
            </Box>
        </Container>
    );
}
