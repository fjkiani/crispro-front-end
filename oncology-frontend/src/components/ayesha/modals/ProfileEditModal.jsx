import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Grid,
    Typography,
    Alert,
    Box,
    LinearProgress,
} from '@mui/material';

const ProfileEditModal = ({ isOpen, onClose, editor, onSave }) => {
    const { editState, updateField, isSaving, saveChanges } = editor;

    const handleSave = async () => {
        const changes = await saveChanges();
        if (onSave) onSave(changes);
    };

    const pfiColor =
        editState.pfi_status === 'Platinum Refractory' ? 'error' :
            editState.pfi_status === 'Platinum Resistant' ? 'warning' : 'success';

    return (
        <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold' }}>
                Update Clinical Context
            </DialogTitle>

            <DialogContent dividers>
                {isSaving && <LinearProgress sx={{ mb: 2 }} />}

                <Alert severity="info" sx={{ mb: 3 }}>
                    Updating these values will trigger a re-calculation of Resistance Logic and Therapy Options.
                </Alert>

                <Grid container spacing={3}>
                    {/* Platinum Free Interval */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            Platinum-Free Interval (PFI)
                        </Typography>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Months"
                                    type="number"
                                    value={editState.pfi_months}
                                    onChange={(e) => updateField('pfi_months', e.target.value)}
                                    inputProps={{ step: 0.1, min: 0 }}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <Box
                                    sx={{
                                        p: 1,
                                        borderRadius: 1,
                                        bgcolor: `${pfiColor}.light`,
                                        color: `${pfiColor}.contrastText`,
                                        textAlign: 'center',
                                        fontWeight: 'bold',
                                        typography: 'caption'
                                    }}
                                >
                                    {editState.pfi_status.toUpperCase()}
                                </Box>
                            </Grid>
                        </Grid>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            &lt; 1m: Refractory | 1-6m: Resistant | &gt; 6m: Sensitive
                        </Typography>
                    </Grid>

                    {/* Line of Therapy */}
                    <Grid item xs={6}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            Current Line
                        </Typography>
                        <TextField
                            select
                            fullWidth
                            value={editState.line_of_therapy}
                            onChange={(e) => updateField('line_of_therapy', e.target.value)}
                            size="small"
                        >
                            {[1, 2, 3, 4, 5, '6+'].map((line) => (
                                <MenuItem key={line} value={line}>
                                    Line {line}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Stage */}
                    <Grid item xs={6}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            Disease Stage
                        </Typography>
                        <TextField
                            select
                            fullWidth
                            value={editState.stage}
                            onChange={(e) => updateField('stage', e.target.value)}
                            size="small"
                        >
                            {['I', 'II', 'III', 'IV'].map((s) => (
                                <MenuItem key={s} value={s}>
                                    Stage {s}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} disabled={isSaving}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    color="primary"
                    disabled={isSaving}
                >
                    {isSaving ? 'Updating...' : 'Update Context'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProfileEditModal;
