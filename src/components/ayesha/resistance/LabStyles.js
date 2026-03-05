/**
 * LabStyles.js — Shared styled components for Resistance Intelligence Lab.
 * Light mode — uses theme tokens for all colors.
 */
import { Box, Grid, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

export const PageWrapper = styled(Box)(({ theme }) => ({
    minHeight: '100vh',
    background: theme.palette.background.default,
    color: theme.palette.text.primary,
    padding: theme.spacing(4, 2),
}));

export const HeaderPanel = styled(Paper)(({ theme }) => ({
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 12,
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
}));

export const LabGrid = styled(Grid)(() => ({
    minHeight: '70vh',
}));

export const PanelWrapper = styled(Paper)(({ theme }) => ({
    height: '100%',
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 12,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
        borderColor: theme.palette.primary.light,
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
    },
}));

export const PanelHeader = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    background: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    '& .MuiTypography-root': {
        fontWeight: 700,
        fontSize: '0.875rem',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        color: theme.palette.text.secondary,
    },
    '& .MuiSvgIcon-root': {
        color: theme.palette.primary.main,
        fontSize: '1.2rem',
    },
}));

export const PanelContent = styled(Box)(({ theme }) => ({
    flex: 1,
    padding: theme.spacing(2),
    overflowY: 'auto',
    '&::-webkit-scrollbar': {
        width: '6px',
    },
    '&::-webkit-scrollbar-thumb': {
        backgroundColor: '#cbd5e1',
        borderRadius: '3px',
    },
}));
