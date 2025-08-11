import React from 'react';
import { Paper, Typography, IconButton, Tooltip } from '@mui/material';
import { ContentCopy } from '@mui/icons-material';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const SequenceViewer = ({ sequence, title }) => {
  
  const handleCopy = () => {
    navigator.clipboard.writeText(sequence);
  };

  return (
    <Paper sx={{ p: 2, backgroundColor: '#282c34', borderRadius: 2, position: 'relative' }}>
      <Typography variant="overline" sx={{ color: 'white' }}>{title}</Typography>
      <Tooltip title="Copy Sequence">
        <IconButton
          size="small"
          onClick={handleCopy}
          sx={{ position: 'absolute', top: 8, right: 8, color: 'white' }}
        >
          <ContentCopy fontSize="inherit" />
        </IconButton>
      </Tooltip>
      <SyntaxHighlighter language="plaintext" style={atomOneDark} customStyle={{ background: 'transparent', padding: 0 }}>
        {sequence}
      </SyntaxHighlighter>
    </Paper>
  );
};

export default SequenceViewer; 