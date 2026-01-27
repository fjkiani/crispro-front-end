/**
 * Value Synthesis Card Component
 * 
 * Displays "What This Means" insights from value synthesis service.
 * Persona-specific display (patient, doctor, r&d).
 */

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';

export default function ValueSynthesisCard({ insights, persona }) {
  if (!insights) {
    return null;
  }
  
  return (
    <Card sx={{ 
      mb: 2, 
      bgcolor: persona === 'patient' ? 'primary.50' : 'background.paper',
      border: persona === 'patient' ? '1px solid #e3f2fd' : '1px solid #e0e0e0'
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <InfoIcon color="primary" />
          <Typography variant="h6">What This Means</Typography>
          {insights.confidence && (
            <Chip
              label={`${(insights.confidence * 100).toFixed(0)}% confidence`}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
        
        {insights.executive_summary && (
          <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
            {insights.executive_summary}
          </Typography>
        )}
        
        {persona === 'patient' && (
          <>
            {insights.will_this_help && (
              <Box sx={{ mb: 2, p: 1.5, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  Will this help me?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {insights.will_this_help}
                </Typography>
              </Box>
            )}
            
            {insights.is_it_safe && (
              <Box sx={{ mb: 2, p: 1.5, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  Is it safe?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {insights.is_it_safe}
                </Typography>
              </Box>
            )}
          </>
        )}
        
        {persona === 'doctor' && (
          <>
            {insights.clinical_recommendation && (
              <Box sx={{ mb: 2, p: 1.5, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  Clinical Recommendation
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {insights.clinical_recommendation}
                </Typography>
              </Box>
            )}
            
            {insights.evidence_quality && (
              <Box sx={{ mb: 2, p: 1.5, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  Evidence Quality
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {insights.evidence_quality}
                </Typography>
              </Box>
            )}
            
            {insights.safety_considerations && (
              <Box sx={{ mb: 2, p: 1.5, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  Safety Considerations
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {insights.safety_considerations}
                </Typography>
              </Box>
            )}
          </>
        )}
        
        {persona === 'r&d' && (
          <>
            {insights.whats_known && (
              <Box sx={{ mb: 2, p: 1.5, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  What's Known
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {insights.whats_known}
                </Typography>
              </Box>
            )}
            
            {insights.knowledge_gaps && insights.knowledge_gaps.length > 0 && (
              <Box sx={{ mb: 2, p: 1.5, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  Knowledge Gaps
                </Typography>
                <List dense>
                  {insights.knowledge_gaps.map((gap, idx) => (
                    <ListItem key={idx} sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Typography variant="body2" color="text.secondary">•</Typography>
                      </ListItemIcon>
                      <ListItemText primary={gap} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </>
        )}
        
        {(insights.action_items || insights.next_steps) && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              {persona === 'patient' ? 'What should I do?' : persona === 'doctor' ? 'Next Steps' : 'Research Next Steps'}
            </Typography>
            <List dense>
              {(insights.action_items || insights.next_steps || []).map((item, idx) => (
                <ListItem key={idx} sx={{ py: 0.5 }}>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

