/**
 * theme.js — Central MUI Theme for CrisPRO
 *
 * Single source of truth for colors, typography, and component overrides.
 * Light mode, high-contrast, patient-friendly design.
 */
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#2563eb',       // Blue-600
            light: '#60a5fa',
            dark: '#1d4ed8',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#7c3aed',       // Violet-600
            light: '#a78bfa',
            dark: '#5b21b6',
        },
        success: {
            main: '#16a34a',
            light: '#bbf7d0',
            dark: '#15803d',
        },
        warning: {
            main: '#d97706',
            light: '#fef3c7',
            dark: '#b45309',
        },
        error: {
            main: '#dc2626',
            light: '#fecaca',
            dark: '#b91c1c',
        },
        background: {
            default: '#f8fafc',    // Slate-50 (warm off-white)
            paper: '#ffffff',
        },
        text: {
            primary: '#0f172a',    // Slate-900 (high contrast)
            secondary: '#475569',  // Slate-600
            disabled: '#94a3b8',   // Slate-400
        },
        divider: '#e2e8f0',      // Slate-200
        action: {
            hover: 'rgba(37, 99, 235, 0.04)',
            selected: 'rgba(37, 99, 235, 0.08)',
        },
    },
    typography: {
        fontFamily: '"Inter", "Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: 15,            // MUI base (rem calculations)
        h1: {
            fontSize: '2.25rem',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            lineHeight: 1.2,
            color: '#0f172a',
        },
        h2: {
            fontSize: '1.75rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.3,
            color: '#0f172a',
        },
        h3: {
            fontSize: '1.375rem',
            fontWeight: 700,
            lineHeight: 1.35,
            color: '#0f172a',
        },
        h4: {
            fontSize: '1.25rem',
            fontWeight: 600,
            lineHeight: 1.4,
            color: '#0f172a',
        },
        h5: {
            fontSize: '1.125rem',
            fontWeight: 600,
            lineHeight: 1.4,
        },
        h6: {
            fontSize: '1rem',
            fontWeight: 600,
            lineHeight: 1.5,
        },
        body1: {
            fontSize: '1rem',
            lineHeight: 1.65,
            color: '#334155',      // Slate-700
        },
        body2: {
            fontSize: '0.9375rem',
            lineHeight: 1.6,
            color: '#475569',
        },
        caption: {
            fontSize: '0.85rem',
            lineHeight: 1.5,
            color: '#475569',        // was #64748b — too light on white
        },
        overline: {
            fontSize: '0.8rem',
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: '#475569',        // was #64748b
        },
        button: {
            textTransform: 'none',
            fontWeight: 600,
        },
    },
    shape: {
        borderRadius: 12,
    },
    shadows: [
        'none',
        '0 1px 2px rgba(0,0,0,0.04)',
        '0 1px 3px rgba(0,0,0,0.06)',
        '0 2px 4px rgba(0,0,0,0.06)',
        '0 4px 6px rgba(0,0,0,0.05)',
        '0 6px 10px rgba(0,0,0,0.06)',
        '0 8px 16px rgba(0,0,0,0.06)',
        '0 12px 24px rgba(0,0,0,0.08)',
        '0 16px 32px rgba(0,0,0,0.08)',
        '0 20px 40px rgba(0,0,0,0.10)',
        ...Array(15).fill('0 20px 40px rgba(0,0,0,0.10)'),
    ],
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                html: {
                    fontSize: '16px',
                    scrollBehavior: 'smooth',
                },
                body: {
                    backgroundColor: '#f8fafc',
                    color: '#0f172a',
                },
                '*::-webkit-scrollbar': {
                    width: '8px',
                    height: '8px',
                },
                '*::-webkit-scrollbar-track': {
                    background: '#f1f5f9',
                },
                '*::-webkit-scrollbar-thumb': {
                    background: '#cbd5e1',
                    borderRadius: '4px',
                },
                '*::-webkit-scrollbar-thumb:hover': {
                    background: '#94a3b8',
                },
            },
        },
        MuiPaper: {
            defaultProps: {
                elevation: 0,
            },
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    border: '1px solid #e2e8f0',
                    borderRadius: 12,
                },
            },
        },
        MuiCard: {
            defaultProps: {
                elevation: 0,
            },
            styleOverrides: {
                root: {
                    border: '1px solid #e2e8f0',
                    borderRadius: 12,
                    transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                    '&:hover': {
                        borderColor: '#cbd5e1',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontWeight: 600,
                    padding: '8px 20px',
                    textTransform: 'none',
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                    },
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    fontSize: '0.9375rem',
                },
                standardInfo: {
                    backgroundColor: '#eff6ff',
                    color: '#1e40af',
                    border: '1px solid #bfdbfe',
                },
                standardWarning: {
                    backgroundColor: '#fffbeb',
                    color: '#92400e',
                    border: '1px solid #fde68a',
                },
                standardError: {
                    backgroundColor: '#fef2f2',
                    color: '#991b1b',
                    border: '1px solid #fecaca',
                },
                standardSuccess: {
                    backgroundColor: '#f0fdf4',
                    color: '#166534',
                    border: '1px solid #bbf7d0',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 500,
                    borderRadius: 8,
                    fontSize: '0.78rem',      // floor: nothing below 12.5px
                },
                sizeSmall: {
                    fontSize: '0.75rem',      // small chips slightly smaller, still readable
                    height: 22,
                },
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#e2e8f0',
                },
                bar: {
                    borderRadius: 4,
                },
            },
        },
        MuiDivider: {
            styleOverrides: {
                root: {
                    borderColor: '#e2e8f0',
                },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    fontSize: '0.85rem',
                    backgroundColor: '#1e293b',
                    borderRadius: 8,
                    padding: '10px 14px',
                    lineHeight: 1.5,
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },
    },
});

export default theme;
