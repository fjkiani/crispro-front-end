/**
 * Research Intelligence Error Boundary
 * 
 * Catches React errors in Research Intelligence components
 * and displays a fallback UI instead of crashing the app.
 * 
 * Production Quality: Error Recovery
 */

import React from 'react';
import { Box, Alert, AlertTitle, Button, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

class ResearchIntelligenceErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ResearchIntelligenceErrorBoundary] Error caught:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert 
            severity="error" 
            icon={<ErrorOutlineIcon />}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={this.handleReset}
                startIcon={<RefreshIcon />}
              >
                Reset
              </Button>
            }
          >
            <AlertTitle>Something went wrong</AlertTitle>
            <Typography variant="body2" sx={{ mb: 1 }}>
              The Research Intelligence component encountered an error. This has been logged.
            </Typography>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Typography variant="caption" component="pre" sx={{ mt: 1, fontSize: '0.7rem', overflow: 'auto' }}>
                {this.state.error.toString()}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </Typography>
            )}
            <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
              <strong>What to do:</strong> Try refreshing the page or resetting the form. If the problem persists, contact support.
            </Typography>
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ResearchIntelligenceErrorBoundary;


