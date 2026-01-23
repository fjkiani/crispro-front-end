import React from 'react';
import {
  Box,
  Alert,
  Typography,
  Button,
  Paper
} from '@mui/material';
import { ErrorOutline, Refresh } from '@mui/icons-material';

/**
 * Error Boundary Component for Clinical Dossier
 * Catches JavaScript errors anywhere in the dossier component tree
 */
class DossierErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to error tracking service (e.g., Sentry, LogRocket)
    console.error('Dossier component error:', error, errorInfo);
    
    this.setState({
      errorInfo: errorInfo
    });
    
    // TODO: Send to error tracking service
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Paper elevation={3} sx={{ p: 4, m: 2 }}>
          <Alert 
            severity="error" 
            icon={<ErrorOutline />}
            sx={{ mb: 2 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Something went wrong
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              The clinical dossier analysis could not be displayed. This may be due to:
            </Typography>
            <Box component="ul" sx={{ pl: 3, mb: 2 }}>
              <li>Invalid or missing data from the API</li>
              <li>Network connectivity issues</li>
              <li>An unexpected error in the component</li>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Please try refreshing the page or contact support if the problem persists.
            </Typography>
          </Alert>
          
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
            <Button
              variant="outlined"
              onClick={this.handleReset}
            >
              Try Again
            </Button>
          </Box>

          {/* Development mode: Show error details */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                Error Details (Development Only):
              </Typography>
              <Typography variant="caption" component="pre" sx={{ fontSize: '0.75rem', overflow: 'auto' }}>
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </Typography>
            </Box>
          )}
        </Paper>
      );
    }

    return this.props.children;
  }
}

export default DossierErrorBoundary;


