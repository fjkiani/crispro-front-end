import React, { useState } from 'react';
import { Button, Tooltip, CircularProgress, Box, Typography } from '@mui/material';
import { CheckCircle, Error } from '@mui/icons-material';

const InteractiveButton = ({
    children,
    onClick,
    helpText,
    loadingText = "Processing...",
    successText = "Complete!",
    errorText = "Failed",
    isLoading = false,
    isSuccess = false,
    isError = false,
    disabled = false,
    variant = "contained",
    color = "primary",
    size = "medium",
    sx = {},
    ...props
}) => {
    const [showFeedback, setShowFeedback] = useState(false);

    const handleClick = async (event) => {
        if (onClick && !isLoading && !disabled) {
            setShowFeedback(true);
            await onClick(event);
            // Auto-hide feedback after 3 seconds
            setTimeout(() => setShowFeedback(false), 3000);
        }
    };

    const getButtonContent = () => {
        if (isLoading) {
            return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} color="inherit" />
                    <Typography variant="button">{loadingText}</Typography>
                </Box>
            );
        }
        
        if (showFeedback && isSuccess) {
            return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle size={16} />
                    <Typography variant="button">{successText}</Typography>
                </Box>
            );
        }
        
        if (showFeedback && isError) {
            return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Error size={16} />
                    <Typography variant="button">{errorText}</Typography>
                </Box>
            );
        }
        
        return children;
    };

    const buttonElement = (
        <Button
            variant={variant}
            color={isError ? "error" : isSuccess ? "success" : color}
            size={size}
            onClick={handleClick}
            disabled={disabled || isLoading}
            sx={{
                textTransform: 'none',
                minWidth: 120,
                ...sx
            }}
            {...props}
        >
            {getButtonContent()}
        </Button>
    );

    return helpText ? (
        <Tooltip title={helpText} arrow>
            {buttonElement}
        </Tooltip>
    ) : buttonElement;
};

export default InteractiveButton; 