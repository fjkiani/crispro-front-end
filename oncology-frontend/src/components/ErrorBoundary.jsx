import React from 'react';
import { Alert, AlertTitle, Button, Box, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null
    });
    // Optionally reload the page
    if (this.props.resetOnError) {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            padding: 4
          }}
        >
          <Alert 
            severity="error" 
            sx={{ 
              maxWidth: '600px',
              width: '100%',
              mb: 2
            }}
            icon={<ErrorOutlineIcon fontSize="large" />}
          >
            <AlertTitle sx={{ fontSize: '1.2rem', fontWeight: 600 }}>
              Something went wrong
            </AlertTitle>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </Typography>
            
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: 'rgba(0,0,0,0.05)',
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  maxHeight: '200px',
                  overflow: 'auto'
                }}
              >
                <pre>{this.state.errorInfo.componentStack}</pre>
              </Box>
            )}
          </Alert>

          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={this.handleReset}
            sx={{ mt: 2 }}
          >
            Try Again
          </Button>

          {this.props.showReloadOption && (
            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
              sx={{ mt: 1 }}
            >
              Reload Page
            </Button>
          )}
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;






