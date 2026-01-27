/**
 * Query History Sidebar Component
 * 
 * IMPROVED: Shows query summaries from value_synthesis.executive_summary
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Chip,
  CircularProgress
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
import { useAuth } from '../../context/AuthContext';

const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:8000';

export default function QueryHistorySidebar({ onSelectQuery, selectedQueryId, refreshTrigger }) {
  const { user, authenticated } = useAuth();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    if (authenticated && user) {
      loadQueryHistory();
    }
  }, [authenticated, user, refreshTrigger]);
  
  const loadQueryHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      const response = await fetch(`${API_ROOT}/api/research/intelligence/history?limit=20`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setQueries([]);
          return;
        }
        throw new Error(`Failed to load query history: ${response.statusText}`);
      }
      
      const data = await response.json();
      setQueries(data.queries || []);
    } catch (err) {
      console.error('Failed to load query history:', err);
      setQueries([]);
    } finally {
      setLoading(false);
    }
  };
  
  const filteredQueries = queries.filter(q => 
    q.question.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Extract summary from query result
  const getQuerySummary = (query) => {
    if (query.result?.value_synthesis?.executive_summary) {
      return query.result.value_synthesis.executive_summary;
    }
    if (query.result?.synthesized_findings?.evidence_summary) {
      return query.result.synthesized_findings.evidence_summary;
    }
    return null;
  };
  
  if (!authenticated) {
    return null;
  }
  
  return (
    <Box sx={{ 
      width: 320, 
      p: 2, 
      borderRight: '1px solid #e0e0e0', 
      height: '100vh', 
      overflow: 'auto',
      bgcolor: 'background.paper'
    }}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <HistoryIcon color="primary" />
        <Typography variant="h6">Recent Research</Typography>
      </Box>
      
      <TextField
        fullWidth
        size="small"
        placeholder="Search queries..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
        }}
        sx={{ mb: 2 }}
      />
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : filteredQueries.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
          {searchTerm ? 'No queries match your search' : 'No queries yet. Start researching!'}
        </Typography>
      ) : (
        <Box>
          {filteredQueries.map(query => {
            const summary = getQuerySummary(query);
            return (
              <Card
                key={query.id}
                sx={{
                  mb: 1,
                  cursor: 'pointer',
                  border: selectedQueryId === query.id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                  '&:hover': { 
                    bgcolor: 'action.hover',
                    borderColor: selectedQueryId === query.id ? '#1976d2' : 'primary.main'
                  },
                  transition: 'all 0.2s'
                }}
                onClick={() => onSelectQuery(query)}
              >
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mb: 0.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      fontWeight: 'medium'
                    }}
                  >
                    {query.question}
                  </Typography>
                  
                  {/* Query Summary - NEW */}
                  {summary && (
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{
                        mb: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        fontStyle: 'italic'
                      }}
                    >
                      {summary}
                    </Typography>
                  )}
                  
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label={query.persona || 'patient'}
                      size="small" 
                      color="primary"
                      variant="outlined"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(query.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
