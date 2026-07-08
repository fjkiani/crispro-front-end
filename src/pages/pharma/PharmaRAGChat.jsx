/**
 * PharmaRAGChat - full-page Brenus RAG chat for the pharma persona.
 * Streaming enabled by default; falls back to one-shot if the WebSocket
 * connection fails.
 */
import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import RAGChatInterface from '../../components/rag/RAGChatInterface';

export default function PharmaRAGChat() {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" gutterBottom>Brenus Intelligence</Typography>
        <Typography variant="body2" color="text.secondary">
          Ask questions about STC-1010, tusamitamab, CEACAM5, BreAK CRC-001,
          competitive positioning, and CrisPRO fit-gap. Answers are grounded
          in the Brenus data-room; numeric values are guarded by the current
          governance policy (PATH A formula locked 2026-04-28).
        </Typography>
      </Box>
      <RAGChatInterface persona="pharma" />
    </Container>
  );
}
