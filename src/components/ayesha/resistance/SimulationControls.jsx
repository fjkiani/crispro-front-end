import React from 'react';
import {
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Slider,
    Chip,
    FormHelperText,
    Switch,
    FormControlLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';

const SetupSection = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(4),
}));

const Label = styled(Typography)({
    color: '#a0aec0',
    fontSize: '0.8rem',
    fontWeight: 600,
    marginBottom: '8px',
    textTransform: 'uppercase',
});

const SimulationControls = ({ params, setParams }) => {

    const handleChange = (field, value) => {
        setParams(prev => ({ ...prev, [field]: value }));
    };

    const handleTreatmentToggle = (drug) => {
        const current = params.simulate_treatment || [];
        if (current.includes(drug)) {
            handleChange('simulate_treatment', current.filter(d => d !== drug));
        } else {
            handleChange('simulate_treatment', [...current, drug]);
        }
    };

    return (
        <Box>
            {/* 1. GERMLINE STATUS */}
            <SetupSection>
                <Label>Germline Context</Label>
                <FormControl fullWidth variant="filled" sx={{ bgcolor: '#2d3748', borderRadius: 1 }}>
                    <InputLabel sx={{ color: '#a0aec0' }}>Germline Mutation Status</InputLabel>
                    <Select
                        value={params.simulate_germline}
                        onChange={(e) => handleChange('simulate_germline', e.target.value)}
                        sx={{ color: '#fff' }}
                    >
                        <MenuItem value="negative">Negative / Wild Type</MenuItem>
                        <MenuItem value="positive">Positive (e.g., MBD4, BRCA)</MenuItem>
                        <MenuItem value="unknown">Unknown</MenuItem>
                    </Select>
                </FormControl>
                {params.simulate_germline === 'positive' && (
                    <FormHelperText sx={{ color: '#f6e05e' }}>
                        ⚠️ Simulates MBD4+ Baseline (High Deficiency)
                    </FormHelperText>
                )}
            </SetupSection>

            {/* 2. HRD SCORE */}
            <SetupSection>
                <Label>
                    Genomic HRD Score: <span style={{ color: '#fff' }}>{params.simulate_hrd}</span>
                </Label>
                <Slider
                    value={params.simulate_hrd}
                    onChange={(_, val) => handleChange('simulate_hrd', val)}
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                    sx={{
                        color: '#4fd1c5',
                        '& .MuiSlider-thumb': {
                            boxShadow: '0 0 10px rgba(79, 209, 197, 0.5)',
                        }
                    }}
                />
                <FormHelperText sx={{ color: '#718096' }}>
                    {params.simulate_hrd >= 42 ? 'Diagnostic Positive (≥42)' : 'Diagnostic Negative (<42)'}
                </FormHelperText>
            </SetupSection>

            {/* 3. TREATMENT HISTORY */}
            <SetupSection>
                <Label>Treatment History Simulator</Label>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {['carboplatin', 'paclitaxel', 'olaparib', 'bevacizumab', 'doxorubicin'].map((drug) => {
                        const active = (params.simulate_treatment || []).includes(drug);
                        return (
                            <Chip
                                key={drug}
                                label={drug}
                                onClick={() => handleTreatmentToggle(drug)}
                                sx={{
                                    bgcolor: active ? 'rgba(79, 209, 197, 0.2)' : 'rgba(255,255,255,0.05)',
                                    color: active ? '#4fd1c5' : '#a0aec0',
                                    border: active ? '1px solid #4fd1c5' : '1px solid transparent',
                                    '&:hover': {
                                        bgcolor: active ? 'rgba(79, 209, 197, 0.3)' : 'rgba(255,255,255,0.1)',
                                    }
                                }}
                            />
                        );
                    })}
                </Box>
                <FormHelperText sx={{ color: '#718096', mt: 1 }}>
                    Select drugs to simulate prior exposure pressure.
                </FormHelperText>
            </SetupSection>

            {/* 4. ADVANCED: REPAIR CAPACITY */}
            <SetupSection>
                <FormControlLabel
                    control={
                        <Switch
                            checked={!!params.simulate_repair_capacity}
                            onChange={(e) => handleChange('simulate_repair_capacity', e.target.checked ? 0.3 : null)}
                            color="secondary"
                        />
                    }
                    label={<Typography sx={{ color: '#a0aec0', fontSize: '0.9rem' }}>Manual SAE Override</Typography>}
                />

                {params.simulate_repair_capacity !== undefined && params.simulate_repair_capacity !== null && (
                    <Box sx={{ mt: 2 }}>
                        <Label>
                            Functional Repair Capacity: <span style={{ color: '#fff' }}>{(params.simulate_repair_capacity * 100).toFixed(0)}%</span>
                        </Label>
                        <Slider
                            value={params.simulate_repair_capacity}
                            onChange={(_, val) => handleChange('simulate_repair_capacity', val)}
                            min={0.0}
                            max={1.0}
                            step={0.05}
                            valueLabelDisplay="auto"
                            marks={[
                                { value: 0.0, label: '0%' },
                                { value: 0.5, label: '50%' },
                                { value: 1.0, label: '100%' },
                            ]}
                            sx={{ color: '#f6ad55' }}
                        />
                        <FormHelperText sx={{ color: '#f6ad55' }}>
                            0% = Dead Repair (Sens), 100% = Full Repair (Resist)
                        </FormHelperText>
                    </Box>
                )}
            </SetupSection>

        </Box>
    );
};

export default SimulationControls;
