/**
 * Research Plan Card Component
 * 
 * Displays the research plan from Research Intelligence:
 * - Primary question
 * - Entities (compound, disease, mechanisms)
 * - Sub-questions
 * - Portal queries
 * 
 * Research Use Only - Not for Clinical Diagnosis
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
  ListItemText,
  Divider
} from '@mui/material';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import ScienceIcon from '@mui/icons-material/Science';

export default function ResearchPlanCard({ researchPlan }) {
  if (!researchPlan) {
    return null;
  }

  const primaryQuestion = researchPlan.primary_question || researchPlan.question || 'N/A';
  const entities = researchPlan.entities || {};
  const subQuestions = researchPlan.sub_questions || [];
  const portalQueries = researchPlan.portal_queries || {};

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <QuestionAnswerIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">Research Plan</Typography>
        </Box>

        {/* Primary Question */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Primary Question
          </Typography>
          <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
            {primaryQuestion}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Entities */}
        {Object.keys(entities).length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Entities
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Object.entries(entities).map(([key, value]) => (
                <Chip
                  key={key}
                  label={`${key}: ${value}`}
                  size="small"
                  icon={<ScienceIcon />}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Sub-Questions */}
        {subQuestions.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Sub-Questions ({subQuestions.length})
            </Typography>
            <List dense>
              {subQuestions.map((q, idx) => (
                <ListItem key={idx} sx={{ pl: 0 }}>
                  <ListItemText
                    primary={q}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Portal Queries */}
        {Object.keys(portalQueries).length > 0 && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Portal Queries
            </Typography>
            {Object.entries(portalQueries).map(([portal, queries]) => (
              <Box key={portal} sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {portal.toUpperCase()}:
                </Typography>
                {Array.isArray(queries) ? (
                  <List dense>
                    {queries.map((query, idx) => (
                      <ListItem key={idx} sx={{ pl: 0 }}>
                        <ListItemText
                          primary={query}
                          primaryTypographyProps={{ variant: 'body2', sx: { fontFamily: 'monospace' } }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', ml: 1 }}>
                    {queries}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}




