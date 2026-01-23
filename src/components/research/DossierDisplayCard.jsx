/**
 * Dossier Display Card
 *
 * Displays backend-generated markdown dossier with download/print options
 */

import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import ReactMarkdown from 'react-markdown';

const DossierDisplayCard = ({ dossier, persona }) => {
  if (!dossier || !dossier.markdown) return null;

  const handleDownload = () => {
    const blob = new Blob([dossier.markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `research-dossier-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Research Dossier</title>
          <style>
            body { font-family: sans-serif; margin: 20px; }
            pre { white-space: pre-wrap; word-wrap: break-word; }
          </style>
        </head>
        <body>
          <pre>${dossier.markdown}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleShare = () => {
    // Implement sharing functionality (e.g., copy to clipboard, email)
    navigator.clipboard.writeText(dossier.markdown)
      .then(() => alert('Dossier copied to clipboard!'))
      .catch(err => console.error('Failed to copy dossier: ', err));
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Research Dossier
          </Typography>
          <Box>
            <Tooltip title="Download Markdown">
              <IconButton onClick={handleDownload} color="primary">
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Print Dossier">
              <IconButton onClick={handlePrint} color="primary">
                <PrintIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share Dossier">
              <IconButton onClick={handleShare} color="primary">
                <ShareIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Box sx={{
          maxHeight: 600,
          overflowY: 'auto',
          p: 2,
          bgcolor: 'grey.50',
          border: '1px solid',
          borderColor: 'grey.200',
          borderRadius: 1,
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          <ReactMarkdown>{dossier.markdown}</ReactMarkdown>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DossierDisplayCard;
