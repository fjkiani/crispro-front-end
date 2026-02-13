import React, { useRef, useEffect } from 'react';
import { Box, Typography, Chip, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';

const StreamContainer = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingBottom: '20px',
});

const LogRow = styled(Box)(({ severity }) => ({
    display: 'flex',
    alignItems: 'baseline',
    gap: '12px',
    padding: '6px 8px',
    borderRadius: '4px',
    background: severity === 'CRITICAL' ? 'rgba(255, 99, 132, 0.1)'
        : severity === 'WARNING' ? 'rgba(236, 201, 75, 0.1)'
            : 'transparent',
    borderLeft: severity === 'CRITICAL' ? '3px solid #ff6384'
        : severity === 'WARNING' ? '3px solid #ecc94b'
            : '3px solid #4a5568',
    fontFamily: '"Fira Code", monospace',
    fontSize: '0.85rem',
    transition: 'all 0.2s',
    '&:hover': {
        background: 'rgba(255, 255, 255, 0.05)',
    }
}));

const TimeStamp = styled(Typography)({
    color: '#718096',
    fontSize: '0.75rem',
    minWidth: '70px',
});

const EventName = styled(Typography)(({ severity }) => ({
    fontWeight: 700,
    color: severity === 'CRITICAL' ? '#ff6384'
        : severity === 'WARNING' ? '#ecc94b'
            : '#63b3ed', // Blue for INFO
}));

const EventReason = styled(Typography)({
    color: '#e2e8f0',
    flex: 1,
});

const ProvenanceTag = styled(Chip)({
    height: '18px',
    fontSize: '0.65rem',
    background: '#2d3748',
    color: '#a0aec0',
    border: '1px solid #4a5568',
});

const ResistanceLogicStream = ({ steps }) => {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [steps]);

    return (
        <StreamContainer>
            {steps.map((step, index) => {
                // Parse ISO timestamp to HH:mm:ss
                const time = new Date(step.ts).toLocaleTimeString([], {
                    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
                });

                // Extract provenance string
                let provStr = "System";
                if (step.provenance) {
                    if (typeof step.provenance === 'string') provStr = step.provenance;
                    else if (step.provenance.module) provStr = step.provenance.module;
                }

                return (
                    <LogRow key={index} severity={step.severity}>
                        <TimeStamp>[{time}]</TimeStamp>
                        <EventName severity={step.severity}>{step.event}</EventName>
                        <Typography sx={{ color: '#4a5568' }}>::</Typography>
                        <EventReason>{step.because}</EventReason>

                        <Tooltip title={JSON.stringify(step.provenance, null, 2)}>
                            <ProvenanceTag label={provStr} size="small" />
                        </Tooltip>
                    </LogRow>
                );
            })}
            <div ref={bottomRef} />
        </StreamContainer>
    );
};

export default ResistanceLogicStream;
