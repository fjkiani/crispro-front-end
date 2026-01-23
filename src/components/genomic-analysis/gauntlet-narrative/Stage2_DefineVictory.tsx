import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/material';

// --- Service URLs ---
const ORACLE_URL = "https://crispro--zeta-oracle-v2-zetaoracle-api.modal.run";

const Stage2_DefineVictory = ({ geneData, enemyScore, onComplete }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCalculateMaxImpact = async () => {
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
                        // A single-character alternate sequence simulates a catastrophic
                        // frameshift/nonsense mutation, representing a total knockout
                        // without violating the API's input validation.
                        reference_sequence: geneData.sequence,
                        alternate_sequence: "A"
                    }
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Max impact calculation failed: ${errorText}`);
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
        <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: '4px', mt: 2 }}>
            <Typography variant="h6" gutterBottom>Act II: Define True Victory</Typography>
             <Box sx={{ mb: 2 }}>
                <Typography variant="body1">Enemy Weapon Score:</Typography>
                <Typography variant="h5" color="error.main">{enemyScore?.zeta_score.toFixed(4)}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Now, we define what a 100% effective weapon looks like by simulating a complete gene knockout. This score is our benchmark for success.
            </Typography>
            <Button variant="contained" onClick={handleCalculateMaxImpact} disabled={isLoading}>
                {isLoading ? <CircularProgress size={24} /> : "Calculate Maximum Impact"}
            </Button>
            {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
        </Box>
    );
};

export default Stage2_DefineVictory; 