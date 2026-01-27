/**
 * Data Subject Request (DSR) Page
 * 
 * Purpose: Allow users to request GDPR data rights (access, deletion, portability).
 * 
 * GDPR Requirements:
 * - Right to access: Export all user data
 * - Right to deletion: Delete all user data (with exceptions)
 * - Right to portability: Export data in machine-readable format
 */

import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const DSRRequest = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [exportData, setExportData] = useState(null);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError(null);
    setSuccess(null);
    setExportData(null);
  };

  // Export user data (Right to Access)
  const handleExportData = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/dsr/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          format: 'json',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to export user data');
      }

      setExportData(data);
      setSuccess('User data exported successfully. Download link will be available shortly.');
    } catch (err) {
      setError(err.message || 'Failed to export user data');
    } finally {
      setLoading(false);
    }
  };

  // Export portable data (Right to Portability)
  const handleExportPortable = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/dsr/portable', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to export portable data');
      }

      // Download the JSON file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user_data_${user?.id}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess('Portable data exported and downloaded successfully.');
    } catch (err) {
      setError(err.message || 'Failed to export portable data');
    } finally {
      setLoading(false);
    }
  };

  // Delete user data (Right to Deletion)
  const handleDeleteData = async (preserveAudit = true) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/dsr/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          preserve_audit: preserveAudit,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to delete user data');
      }

      setSuccess('User data deleted successfully. You will be logged out shortly.');
      
      // Logout user after deletion
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete user data');
    } finally {
      setLoading(false);
      setConfirmDialogOpen(false);
    }
  };

  const handleDeleteClick = () => {
    setPendingAction('delete');
    setConfirmDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    handleDeleteData(true); // Preserve audit logs
  };

  const handleDownloadExport = () => {
    if (!exportData) return;

    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user_data_export_${user?.id}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Data Subject Request (GDPR)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Exercise your GDPR rights to access, export, or delete your personal data.
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Right to Access" />
          <Tab label="Right to Portability" />
          <Tab label="Right to Deletion" />
        </Tabs>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Tab 1: Right to Access */}
      {activeTab === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Right to Access
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Request a copy of all your personal data stored in our system.
            </Typography>

            {exportData ? (
              <Box>
                <Alert severity="success" sx={{ mb: 2 }}>
                  Your data has been exported successfully.
                </Alert>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Export Date: {exportData.export_date}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Tables included: {Object.keys(exportData.tables || {}).length}
                </Typography>
                <List>
                  {Object.keys(exportData.tables || {}).map((table) => (
                    <ListItem key={table}>
                      <ListItemText
                        primary={table}
                        secondary={`${exportData.tables[table]?.length || 0} records`}
                      />
                    </ListItem>
                  ))}
                </List>
                <Button
                  variant="contained"
                  onClick={handleDownloadExport}
                  sx={{ mt: 2 }}
                >
                  Download Export
                </Button>
              </Box>
            ) : (
              <Button
                variant="contained"
                onClick={handleExportData}
                disabled={loading}
                fullWidth
              >
                {loading ? <CircularProgress size={24} /> : 'Export My Data'}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Right to Portability */}
      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Right to Data Portability
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Export your data in a machine-readable format (JSON) for transfer to another service.
            </Typography>

            <Button
              variant="contained"
              onClick={handleExportPortable}
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Export Portable Data (JSON)'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Right to Deletion */}
      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Right to Deletion
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Request deletion of all your personal data. This action is irreversible.
            </Typography>

            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Warning: This action cannot be undone.
              </Typography>
              <Typography variant="body2">
                All your personal data, including:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="• Patient profiles and medical data" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Saved analyses and reports" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Session history" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• User preferences" />
                </ListItem>
              </List>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Note: Audit logs may be preserved for compliance purposes.
              </Typography>
            </Alert>

            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteClick}
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Delete All My Data'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirm Data Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete all your personal data? This action is irreversible
            and will permanently remove:
          </DialogContentText>
          <List dense>
            <ListItem>
              <ListItemText primary="• All patient profiles and medical data" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• All saved analyses and reports" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• All session history" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• All user preferences" />
            </ListItem>
          </List>
          <DialogContentText sx={{ mt: 2 }}>
            You will be logged out immediately after deletion.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete All Data
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DSRRequest;
