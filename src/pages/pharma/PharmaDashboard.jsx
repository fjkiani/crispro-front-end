/**
 * PharmaDashboard - Landing page for the pharma persona (Brenus / partners).
 *
 * Shows three primary entry points:
 *   1. Brenus RAG chat      → /pharma/rag-chat
 *   2. CEACAM5 dossier      → /pharma/ceacam5
 *   3. Fit-Gap analysis     → /pharma/fit-gap
 *
 * Pulls the pharma profile from GET /api/onboarding/pharma/profile
 * so we can show the company name in the header.
 */
import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Grid,
  Typography,
  Chip,
  Skeleton,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import BiotechIcon from '@mui/icons-material/Biotech';
import InsightsIcon from '@mui/icons-material/Insights';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_ROOT } from '../../lib/apiConfig';

const cards = [
  {
    title: 'Brenus Intelligence RAG',
    subtitle: 'Ask Brenus about STC-1010, MoA, competitive positioning',
    icon: ChatIcon,
    color: '#0279EE',
    to: '/pharma/rag-chat',
    tag: 'RAG · Guardrailed · PATH A locked',
  },
  {
    title: 'CEACAM5 Intelligence Dossier',
    subtitle: 'ATR / DDR / MSS-CRC — MAS scoring & fit vs. Sanofi',
    icon: BiotechIcon,
    color: '#75A025',
    to: '/pharma/ceacam5',
    tag: 'MAS · Path A · Read-only',
  },
  {
    title: 'CrisPRO Fit-Gap',
    subtitle: 'Where CrisPRO differentiates for your asset',
    icon: InsightsIcon,
    color: '#FF9400',
    to: '/pharma/fit-gap',
    tag: 'Preview',
  },
];

export default function PharmaDashboard() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const token = await getToken?.();
        const res = await fetch(`${API_ROOT}/api/onboarding/pharma/profile`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          if (alive) setProfile(data);
        }
      } catch (err) {
        console.warn('pharma profile fetch failed', err.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [getToken]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {loading ? (
            <Skeleton width={320} />
          ) : profile?.company_name ? (
            `${profile.company_name} — Pharma Console`
          ) : (
            'Pharma Console'
          )}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Brenus intelligence, dossier explorers, and CrisPRO fit-gap analysis.
          All numeric outputs pass the governance guardrails
          (PATH A formula locked 2026-04-28).
        </Typography>
        {profile?.asset_of_interest && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip label={`Asset: ${profile.asset_of_interest}`} color="primary" size="small" />
            {profile.therapeutic_area && (
              <Chip label={`TA: ${profile.therapeutic_area}`} size="small" />
            )}
            {profile.use_case && (
              <Chip label={`Use: ${profile.use_case}`} size="small" />
            )}
          </Box>
        )}
      </Box>

      <Grid container spacing={3}>
        {cards.map((c) => (
          <Grid item xs={12} md={4} key={c.title}>
            <Card
              elevation={2}
              sx={{
                height: '100%',
                borderTop: `4px solid ${c.color}`,
                transition: 'transform .12s ease, box-shadow .12s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: 6 },
              }}
            >
              <CardActionArea sx={{ height: '100%' }} onClick={() => navigate(c.to)}>
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <c.icon sx={{ fontSize: 40, color: c.color, mb: 1 }} />
                  <Typography variant="h6" gutterBottom>{c.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                    {c.subtitle}
                  </Typography>
                  <Chip
                    label={c.tag}
                    size="small"
                    variant="outlined"
                    sx={{ mt: 2, alignSelf: 'flex-start' }}
                  />
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
