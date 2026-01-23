import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/material';

// --- Service URLs ---
const ORACLE_URL = "https://crispro--zeta-oracle-v2-zetaoracle-api.modal.run";

const Stage1_TestEnemyWeapon = ({ geneData, onComplete }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRunSimulation = async () => {
        if (!geneData || !geneData.sequence) {
            setError("Gene data or sequence not available.");
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${ORACLE_URL}/invoke`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: "score",
                    params: {
                        // Simulate a weak competitor by slightly perturbing the sequence
                        reference_sequence: geneData.sequence,
                        alternate_sequence: geneData.sequence.substring(0, geneData.sequence.length - 10) + "GATTACA".repeat(2)
                    }
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Enemy weapon test failed: ${errorText}`);
            }
            const data = await response.json();
            onComplete(data);
        } catch (err) {
            setError(err.message);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: '4px' }}>
            <Typography variant="h6" gutterBottom>Act I: Test the Enemy's Weapon</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                First, we establish a baseline by testing a hypothetical, conventional inhibitor. This demonstrates the ineffectiveness of existing solutions.
            </Typography>
            <Button variant="contained" onClick={handleRunSimulation} disabled={isLoading}>
                {isLoading ? <CircularProgress size={24} /> : "Run Simulation"}
            </Button>
            {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
        </Box>
    );
};

export default Stage1_TestEnemyWeapon; 