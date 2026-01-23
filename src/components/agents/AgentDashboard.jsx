/**
 * Agent Dashboard - Real-time agent status display
 * 
 * Shows:
 * - List of all agents with status
 * - Last run time and results count
 * - Quick actions (run, pause, resume, delete)
 * - Recent alerts
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Delete,
  Refresh,
  Notifications,
  CheckCircle,
  Error as ErrorIcon,
  Schedule,
} from '@mui/icons-material';
import { useAgents } from '../../context/AgentContext';
import { AgentWizard } from './AgentWizard';

const AGENT_TYPE_LABELS = {
  pubmed_sentinel: 'PubMed Sentinel',
  trial_scout: 'Trial Scout',
  genomic_forager: 'Genomic Forager',
};

const STATUS_COLORS = {
  active: 'success',
  paused: 'warning',
  completed: 'info',
  error: 'error',
};

export const AgentDashboard = () => {
  const {
    agents,
    alerts,
    unreadAlertsCount,
    loading,
    error,
    pauseAgent,
    resumeAgent,
    runAgent,
    deleteAgent,
    markAlertRead,
    fetchAgents,
  } = useAgents();

  const [wizardOpen, setWizardOpen] = useState(false);
  const [runningAgentId, setRunningAgentId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState(null);

  const handleRunAgent = async (agentId) => {
    setRunningAgentId(agentId);
    try {
      await runAgent(agentId);
    } catch (err) {
      console.error('Failed to run agent:', err);
    } finally {
      setRunningAgentId(null);
    }
  };

  const handlePauseAgent = async (agentId) => {
    try {
      await pauseAgent(agentId);
    } catch (err) {
      console.error('Failed to pause agent:', err);
    }
  };

  const handleResumeAgent = async (agentId) => {
    try {
      await resumeAgent(agentId);
    } catch (err) {
      console.error('Failed to resume agent:', err);
    }
  };

  const handleDeleteClick = (agentId) => {
    setAgentToDelete(agentId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (agentToDelete) {
      try {
        await deleteAgent(agentToDelete);
      } catch (err) {
        console.error('Failed to delete agent:', err);
      }
    }
    setDeleteConfirmOpen(false);
    setAgentToDelete(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getNextRunTime = (agent) => {
    if (!agent.next_run_at) return 'Not scheduled';
    const nextRun = new Date(agent.next_run_at);
    const now = new Date();
    if (nextRun < now) return 'Due now';
    const diff = nextRun - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `In ${hours}h ${minutes}m`;
    return `In ${minutes}m`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Agent Dashboard</Typography>
        <Button
          variant="contained"
          onClick={() => setWizardOpen(true)}
        >
          Create Agent
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => {}}>
          {error}
        </Alert>
      )}

      {unreadAlertsCount > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You have {unreadAlertsCount} unread alert{unreadAlertsCount !== 1 ? 's' : ''}
        </Alert>
      )}

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Grid container spacing={3}>
        {/* Agents List */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>
            Your Agents ({agents.length})
          </Typography>
          {agents.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                No agents yet. Create your first agent to get started!
              </Typography>
              <Button
                variant="contained"
                onClick={() => setWizardOpen(true)}
                sx={{ mt: 2 }}
              >
                Create Agent
              </Button>
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {agents.map((agent) => (
                <Card key={agent.id}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6">
                          {agent.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {AGENT_TYPE_LABELS[agent.agent_type] || agent.agent_type}
                        </Typography>
                      </Box>
                      <Chip
                        label={agent.status}
                        color={STATUS_COLORS[agent.status] || 'default'}
                        size="small"
                      />
                    </Box>

                    {agent.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {agent.description}
                      </Typography>
                    )}

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
                      <Chip
                        icon={<Schedule />}
                        label={`Runs ${agent.run_frequency}`}
                        size="small"
                        variant="outlined"
                      />
                      {agent.last_run_at && (
                        <Chip
                          icon={<CheckCircle />}
                          label={`Last run: ${formatDate(agent.last_run_at)}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      <Chip
                        label={`Next: ${getNextRunTime(agent)}`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </CardContent>
                  <CardActions>
                    {agent.status === 'active' ? (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => handlePauseAgent(agent.id)}
                          title="Pause agent"
                        >
                          <Pause />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleRunAgent(agent.id)}
                          disabled={runningAgentId === agent.id}
                          title="Run now"
                        >
                          <PlayArrow />
                        </IconButton>
                      </>
                    ) : (
                      <IconButton
                        size="small"
                        onClick={() => handleResumeAgent(agent.id)}
                        title="Resume agent"
                      >
                        <PlayArrow />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(agent.id)}
                      color="error"
                      title="Delete agent"
                    >
                      <Delete />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => fetchAgents()}
                      title="Refresh"
                    >
                      <Refresh />
                    </IconButton>
                  </CardActions>
                </Card>
              ))}
            </Box>
          )}
        </Grid>

        {/* Alerts Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Notifications />
              <Typography variant="h6">
                Recent Alerts ({alerts.length})
              </Typography>
            </Box>
            {alerts.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No alerts yet
              </Typography>
            ) : (
              <List>
                {alerts.slice(0, 10).map((alert, index) => (
                  <React.Fragment key={alert.id}>
                    <ListItem
                      sx={{
                        bgcolor: alert.is_read ? 'transparent' : 'action.hover',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.selected' },
                      }}
                      onClick={() => !alert.is_read && markAlertRead(alert.id)}
                    >
                      <ListItemIcon>
                        {alert.priority === 'high' || alert.priority === 'critical' ? (
                          <ErrorIcon color="error" />
                        ) : (
                          <Notifications color={alert.is_read ? 'disabled' : 'primary'} />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={alert.title}
                        secondary={alert.message}
                      />
                      {!alert.is_read && (
                        <Chip label="New" color="primary" size="small" />
                      )}
                    </ListItem>
                    {index < alerts.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Agent Wizard Dialog */}
      <Dialog
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Agent</DialogTitle>
        <DialogContent>
          <AgentWizard
            onClose={() => setWizardOpen(false)}
            onSuccess={() => {
              setWizardOpen(false);
              fetchAgents();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Delete Agent?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this agent? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};


