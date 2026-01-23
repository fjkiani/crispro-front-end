import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';

function formatPct(x) {
  const n = Number(x);
  if (!Number.isFinite(n)) return 'N/A';
  return `${Math.round(n * 100)}%`;
}

export default function IOSafestSelectionCard({ ioSelection }) {
  if (!ioSelection) return null;

  const selected = ioSelection.selected_safest;
  const eligible = ioSelection.eligible;
  const quality = ioSelection.eligibility_quality;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Immunotherapy (IO) — Safest Option (RUO)
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          This module selects the safest IO option among candidates (irAE profiles + paent risk factors). It does not claim efficacy.
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Chip
            label={eligible ? 'Eligible: YES' : 'Eligible: NO'}
            color={eligible ? 'success' : 'default'}
            variant={eligible ? 'filled' : 'outlined'}
            size="small"
          />
          {quality && (
            <Chip
              label={`Eligibility quality: ${quality}`}
              color={quality === 'measured' ? 'success' : (quality === 'inferred' ? 'warning' : 'default')}
              variant="outlined"
              size="small"
            />
          )}
          {Array.isArray(ioSelection.eligibility_signals) && ioSelection.eligibility_signals.length > 0 && (
            <Chip
              label={`Signals: ${ioSelection.eligibility_signals.join(', ')}`}
              variant="outlined"
              size="small"
            />
          )}
        </Box>

        {ioSelection.evidence_gap && (
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Evidence note:</strong> {ioSelection.evidence_gap}
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        {eligible && selected?.selected ? (
          <>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Safest IO: {selected.selected}
            </Typography>

            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Grade 3+ irAE risk:</strong> {formatPct(selected.irae_risk_adjusted)} (raw {formatPct(selected.irae_risk_raw)})
            </Typography>

            {Array.isArray(selected.risk_factors) && selected.risk_factors.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Risk adjustments
                </Typography>
                <List dense>
                  {selected.risk_factors.map((rf, idx) => (
                    <ListItem key={idx} sx={{ py: 0 }}>
                      <ListItemText primary={rf} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {Array.isArray(selected.monitoring_priority) && selected.monitoring_priority.length > 0 && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Monitoring priority:</strong> {selected.monitoring_priority.join(', ')}
              </Typography>
            )}

            {Array.isArray(selected.avoid) && selected.avoid.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Higher-risk options to avoid (if possible)
                </Typography>
                <List dense>
                  {selected.avoid.slice(0, 5).map((d, idx) => (
                    <ListItem key={idx} sx={{ py: 0 }}>
                      <ListItemText
                        primary={d.drug}
                        secondary={`Grade 3+ irAE: ${formatPct(d.adjusted_risk)} | Target: ${d.target || 'N/A'}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Not enough eligibility evidence to recommend an IO regimen yet.
          </Typography>
        )}

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
          {ioSelection.ruo_disclaimer}
        </Typography>
      </CardContent>
    </Card>
  );
}
