import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, TextField, Typography, Paper, IconButton, CircularProgress, Collapse } from '@mui/material';
import { SmartToy, Close, Send, AutoAwesome } from '@mui/icons-material';

const ContextGuide = ({ levelData, level, activeScenarioId, testsNeeded }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    // Construct System Context for the LLM
    const buildSystemContext = () => {
        if (!levelData) return "Context not loaded.";

        const { completeness, inputs_used, is_preview } = levelData;
        const missing = completeness.missing || [];
        const mutations = inputs_used.mutations.map(m => `${m.gene} (${m.hgvs_p || m.consequence})`).join(', ');

        return `
You are the oncology-coPilot Agent. 
Strictly keep track of the current clinical context:
- View Level: ${level} (${is_preview ? "SIMULATION MODE" : "ACTUAL PATIENT DATA"})
- Scenario: ${activeScenarioId || "None (Baseline)"}
- Completeness: ${Math.round(completeness.completeness_score * 100)}%
- Missing Data: ${missing.join(', ') || "None"}
- Known Mutations: ${mutations || "None"}
- Recommended Tests: ${testsNeeded.map(t => t.test).join(', ')}

Explain things clearly and clinically. Avoid ambiguity. If asked "what to do", refer to the Recommended Tests.
        `.trim();
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Combine system context with user prompt
            const fullPrompt = `${buildSystemContext()}\n\nUser Question: ${input}`;

            const res = await fetch('/api/llm/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: fullPrompt,
                    provider: 'gemini'
                })
            });
            const data = await res.json();

            setMessages(prev => [...prev, { role: 'agent', content: data.response }]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'agent', content: "Connection to Neural Core failed." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>

            {/* Chat Window */}
            <Collapse in={isOpen}>
                <Paper sx={{
                    width: 350,
                    height: 500,
                    mb: 2,
                    bgcolor: '#1a202c',
                    border: '1px solid #4a5568',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
                }}>
                    {/* Header */}
                    <Box sx={{ p: 2, bgcolor: '#2d3748', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#fff' }}>
                            <SmartToy sx={{ color: '#4fd1c5' }} /> AYESHA GUIDE
                        </Typography>
                        <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: '#a0aec0' }}>
                            <Close fontSize="small" />
                        </IconButton>
                    </Box>

                    {/* Messages */}
                    <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {messages.length === 0 && (
                            <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ mt: 4 }}>
                                I am tracking the {level} context.<br />Ask me anything about the data.
                            </Typography>
                        )}
                        {messages.map((m, i) => (
                            <Box key={i} sx={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                                <Paper sx={{
                                    p: 1.5,
                                    bgcolor: m.role === 'user' ? '#3182ce' : '#2d3748',
                                    color: '#fff',
                                    borderRadius: 2
                                }}>
                                    <Typography variant="body2">{m.content}</Typography>
                                </Paper>
                            </Box>
                        ))}
                        {loading && (
                            <Box sx={{ alignSelf: 'flex-start' }}>
                                <CircularProgress size={20} sx={{ color: '#4fd1c5' }} />
                            </Box>
                        )}
                        <div ref={messagesEndRef} />
                    </Box>

                    {/* Input */}
                    <Box sx={{ p: 2, borderTop: '1px solid #2d3748', display: 'flex', gap: 1 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Ask Ayesha..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            sx={{ '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: '#4a5568' } } }}
                        />
                        <IconButton onClick={handleSend} color="primary" disabled={!input.trim() || loading}>
                            <Send />
                        </IconButton>
                    </Box>
                </Paper>
            </Collapse>

            {/* Toggle Button */}
            <Button
                variant="contained"
                onClick={() => setIsOpen(!isOpen)}
                startIcon={isOpen ? <Close /> : <AutoAwesome />}
                sx={{
                    bgcolor: '#4fd1c5',
                    color: '#000',
                    fontWeight: 700,
                    borderRadius: 28,
                    px: 3,
                    py: 1.5,
                    boxShadow: '0 4px 14px rgba(79, 209, 197, 0.4)',
                    '&:hover': { bgcolor: '#38b2ac' }
                }}
            >
                {isOpen ? 'CLOSE GUIDE' : 'ASK AYESHA'}
            </Button>
        </Box>
    );
};

export default ContextGuide;
