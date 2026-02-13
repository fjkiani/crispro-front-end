import React from 'react';
import { Box, Typography, Card, Chip, Button } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { AccessTime as TimeIcon, ShoppingCart as OrderIcon } from '@mui/icons-material';

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(255, 99, 132, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(255, 99, 132, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 99, 132, 0); }
`;

const TestCard = styled(Card)(({ priority }) => ({
    background: '#1a202c',
    border: priority === 'IMMEDIATE' ? '1px solid #ff6384' : '1px solid #4a5568',
    borderRadius: '8px',
    marginBottom: '16px',
    overflow: 'visible',
    animation: priority === 'IMMEDIATE' ? `${pulse} 2s infinite` : 'none',
}));

const CardHeader = styled(Box)({
    padding: '12px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
});

const PriorityBadge = styled(Chip)(({ priority }) => ({
    backgroundColor: priority === 'IMMEDIATE' ? '#ff6384' : '#4fd1c5',
    color: priority === 'IMMEDIATE' ? '#000' : '#000',
    fontWeight: 800,
    fontSize: '0.7rem',
    height: '24px',
}));

const CardBody = styled(Box)({
    padding: '16px',
});

const RationaleText = styled(Typography)({
    color: '#cbd5e0',
    fontSize: '0.9rem',
    marginBottom: '12px',
    lineHeight: 1.5,
});

const MetaRow = styled(Box)({
    display: 'flex',
    gap: '16px',
    fontSize: '0.8rem',
    color: '#a0aec0',
    alignItems: 'center',
});

const NextTestDisplay = ({ tests }) => {
    if (!tests || tests.length === 0) {
        return (
            <Box sx={{ p: 4, textAlign: 'center', color: '#4a5568' }}>
                <Typography>No active test orders.</Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Typography sx={{ color: '#718096', mb: 2, fontSize: '0.8rem', fontWeight: 600 }}>
                RECOMMENDED ACTIONS ({tests.length})
            </Typography>

            {tests.map((test, idx) => (
                <TestCard key={idx} priority={test.priority}>
                    <CardHeader>
                        <Typography sx={{ fontWeight: 700, color: '#fff' }}>
                            {test.test_id.replace(/_/g, ' ')}
                        </Typography>
                        <PriorityBadge label={test.priority} priority={test.priority} />
                    </CardHeader>
                    <CardBody>
                        <RationaleText>
                            {test.why}
                        </RationaleText>

                        <MetaRow>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <TimeIcon fontSize="small" />
                                <span>{test.frequency} {test.duration}</span>
                            </Box>
                            {test.enables_signals && (
                                <Chip
                                    size="small"
                                    label={`Enables Signal ${test.enables_signals[0].split('_')[0]}`}
                                    sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#a0aec0', fontSize: '0.65rem' }}
                                />
                            )}
                        </MetaRow>

                        {/* EXPECTED EFFECT / ACTION */}
                        {test.expected_effect && (
                            <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(79, 209, 197, 0.1)', border: '1px dashed #4fd1c5', borderRadius: 1 }}>
                                <Typography sx={{ fontSize: '0.75rem', color: '#4fd1c5', fontWeight: 700, mb: 0.5 }}>
                                    CLINICAL IMPACT
                                </Typography>
                                {Object.entries(test.expected_effect).map(([key, val]) => (
                                    <Typography key={key} sx={{ fontSize: '0.8rem', color: '#e0e0e0' }}>
                                        • {val}
                                    </Typography>
                                ))}
                            </Box>
                        )}

                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<OrderIcon />}
                            sx={{
                                mt: 2,
                                borderColor: '#4a5568',
                                color: test.priority === 'IMMEDIATE' ? '#ff6384' : '#4fd1c5',
                                '&:hover': { borderColor: '#fff' }
                            }}
                        >
                            ADD TO CHART
                        </Button>
                    </CardBody>
                </TestCard>
            ))}
        </Box>
    );
};

export default NextTestDisplay;
