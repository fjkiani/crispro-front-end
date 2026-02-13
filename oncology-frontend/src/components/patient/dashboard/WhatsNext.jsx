import React from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Chip,
    Alert,
    Button,
} from '@mui/material';
import {
    Science as TestIcon,
} from '@mui/icons-material';

const WhatsNext = ({ missingTests = [], onUploadTest }) => {
    if (missingTests.length === 0) {
        return (
            <Card sx={{ height: '100%' }}>
                <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        What's Next?
                    </Typography>
                    <Alert severity="success">
                        You are fully up to date! No pending tests recommended.
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    What's Next?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Recommended tests that unlock additional capabilities:
                </Typography>

                {missingTests.map((test, idx) => (
                    <Alert
                        key={idx}
                        severity={test.urgency === 'high' ? 'warning' : 'info'}
                        icon={<TestIcon />}
                        sx={{ mb: 2 }}
                        action={
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={() => onUploadTest?.(test.name)}
                            >
                                Upload
                            </Button>
                        }
                    >
                        <Box>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                {test.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                {test.value}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                                <Typography variant="caption" fontWeight="bold" display="block" gutterBottom>
                                    Unlocks:
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {test.unlocks.map((unlock, uIdx) => (
                                        <Chip
                                            key={uIdx}
                                            label={unlock}
                                            size="small"
                                            variant="outlined"
                                            color="primary"
                                        />
                                    ))}
                                </Box>
                            </Box>
                        </Box>
                    </Alert>
                ))}
            </CardContent>
        </Card>
    );
};

export default WhatsNext;
