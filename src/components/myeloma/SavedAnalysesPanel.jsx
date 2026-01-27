import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Stack,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Clear as ClearIcon,
  PlayArrow as LoadIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useAnalysisHistory } from '../../context/AnalysisHistoryContext';

const SavedAnalysesPanel = ({ onLoadAnalysis, onClose }) => {
  const {
    savedAnalyses,
    loadAnalysis,
    deleteAnalysis,
    clearAllAnalyses,
    currentAnalysis
  } = useAnalysisHistory();

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  const handleLoadAnalysis = async (analysis) => {
    try {
      const loaded = await loadAnalysis(analysis.key);
      if (loaded && onLoadAnalysis) {
        onLoadAnalysis(loaded);
      }
      if (onClose) onClose();
    } catch (error) {
      console.error('Error loading analysis:', error);
      alert(`Error loading analysis: ${error.message}`);
    }
  };

  const handleDeleteAnalysis = async (analysis) => {
    try {
      await deleteAnalysis(analysis.key);
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting analysis:', error);
      alert(`Error deleting analysis: ${error.message}`);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllAnalyses();
      setConfirmClearAll(false);
    } catch (error) {
      console.error('Error clearing analyses:', error);
      alert(`Error clearing analyses: ${error.message}`);
    }
  };

  const formatDate = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return 'Unknown';
    }
  };

  const getModelDisplayName = (modelId) => {
    const modelNames = {
      'evo2_7b': 'Evo2 7B',
      'evo2_40b': 'Evo2 40B',
      'deepmind': 'DeepMind',
      'oracle': 'Oracle'
    };
    return modelNames[modelId] || modelId;
  };

  if (savedAnalyses.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Saved Analyses
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your completed analyses will appear here for quick access.
        </Typography>
        <Button onClick={onClose} sx={{ mt: 2 }}>
          Close
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 600 }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Saved Analyses ({savedAnalyses.length})
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              color="error"
              onClick={() => setConfirmClearAll(true)}
              startIcon={<ClearIcon />}
            >
              Clear All
            </Button>
            <Button onClick={onClose}>
              Close
            </Button>
          </Stack>
        </Stack>
      </Box>

      <List sx={{ maxHeight: 400, overflow: 'auto' }}>
        {savedAnalyses.map((analysis) => {
          const isCurrent = currentAnalysis?.key === analysis.key;
          const hasResults = analysis.metadata?.hasResults;

          return (
            <ListItem
              key={analysis.key}
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <ListItemText
                primary={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="subtitle1">
                      {analysis.name}
                    </Typography>
                    {isCurrent && (
                      <Chip size="small" color="primary" label="Current" />
                    )}
                    {!hasResults && (
                      <Chip size="small" color="warning" label="No Results" />
                    )}
                  </Stack>
                }
                secondary={
                  <Stack spacing={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(analysis.timestamp)}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip
                        size="small"
                        variant="outlined"
                        label={getModelDisplayName(analysis.modelId)}
                      />
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`${analysis.metadata?.mutationCount || 0} mutations`}
                      />
                    </Stack>
                  </Stack>
                }
              />

              <ListItemSecondaryAction>
                <Stack direction="row" spacing={0.5}>
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={() => setSelectedAnalysis(analysis)}
                    >
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Load Analysis">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleLoadAnalysis(analysis)}
                      disabled={!hasResults}
                    >
                      <LoadIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete Analysis">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setConfirmDelete(analysis)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </ListItemSecondaryAction>
            </ListItem>
          );
        })}
      </List>

      {/* Analysis Details Dialog */}
      <Dialog
        open={!!selectedAnalysis}
        onClose={() => setSelectedAnalysis(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Analysis Details: {selectedAnalysis?.name}
        </DialogTitle>
        <DialogContent>
          {selectedAnalysis && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>Configuration</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip label={`Model: ${getModelDisplayName(selectedAnalysis.modelId)}`} />
                  <Chip label={`Mutations: ${selectedAnalysis.metadata?.mutationCount || 0}`} />
                  <Chip label={`Has Results: ${selectedAnalysis.metadata?.hasResults ? 'Yes' : 'No'}`} />
                </Stack>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" gutterBottom>Mutations</Typography>
                <List dense>
                  {selectedAnalysis.mutations.map((mutation, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemText
                        primary={mutation.variant_info || mutation.gene || `Mutation ${index + 1}`}
                        secondary={mutation.hgvs_p || mutation.build || ''}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>

              {selectedAnalysis.results && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Results Summary</Typography>
                    <Typography variant="body2">
                      Analysis completed successfully with {Object.keys(selectedAnalysis.results).length} result sections.
                    </Typography>
                  </Box>
                </>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedAnalysis(null)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              handleLoadAnalysis(selectedAnalysis);
              setSelectedAnalysis(null);
            }}
            disabled={!selectedAnalysis?.metadata?.hasResults}
          >
            Load Analysis
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Delete Analysis?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{confirmDelete?.name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button
            color="error"
            onClick={() => handleDeleteAnalysis(confirmDelete)}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clear All Confirmation Dialog */}
      <Dialog open={confirmClearAll} onClose={() => setConfirmClearAll(false)}>
        <DialogTitle>Clear All Saved Analyses?</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This will permanently delete all {savedAnalyses.length} saved analyses.
            This action cannot be undone.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmClearAll(false)}>Cancel</Button>
          <Button color="error" onClick={handleClearAll}>
            Clear All
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SavedAnalysesPanel;
