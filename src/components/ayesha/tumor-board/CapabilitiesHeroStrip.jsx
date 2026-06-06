/**
 * CapabilitiesHeroStrip — Summary of modules used in the tumor board packet.
 */
import React from 'react';
import { Box, Typography } from '@mui/material';
import {
    Science as ScienceIcon,
    Shield as ShieldIcon,
    LocalPharmacy as PharmacyIcon,
    Biotech as BiotechIcon,
    MedicalServices as MedicalIcon,
} from '@mui/icons-material';

const ENGINE_DEFS = [
    {
        key: 'spe',
        label: 'Feasibility checks',
        icon: ScienceIcon,
        color: '#2563eb',
        getStatus: ({ drugs }) => {
            if (!drugs?.length) return { text: 'Awaiting data', active: false };
            const pass = drugs.filter(d => d.feasibility_status === 'PASS').length;
            const cond = drugs.filter(d => d.feasibility_status === 'CONDITIONAL').length;
            const fail = drugs.filter(d => d.feasibility_status === 'FAIL' || d.feasibility_status === 'QUARANTINE').length;
            return { text: `${pass} Pass · ${cond} Conditional · ${fail} Fail`, active: true };
        },
    },
    {
        key: 'killchain',
        label: 'Resistance monitoring',
        icon: ShieldIcon,
        color: '#b45309',
        getStatus: ({ resistanceGate }) => {
            if (!resistanceGate) return { text: 'Not evaluated', active: false };
            const count = resistanceGate.active_signals ?? resistanceGate.signals_detected ?? 0;
            const policy = resistanceGate.policy || '2-of-N';
            const policyRan = resistanceGate.policy_ran ?? resistanceGate.policy_active ?? false;
            if (count > 0) return { text: `${count} signal${count > 1 ? 's' : ''} · ${policy}`, active: true, alert: true };
            if (policyRan) return { text: `${policy} monitoring active`, active: true };
            return { text: `${policy} policy set · no signals`, active: true };
        },
    },
    {
        key: 'io',
        label: 'IO safety gate',
        icon: BiotechIcon,
        color: '#047857',
        getStatus: ({ ioHarm }) => {
            if (!ioHarm?.decision_result) return { text: 'Pending IO assessment', active: false };
            const d = ioHarm.decision_result;
            const pResp = d.p_resp != null ? `${Math.round(d.p_resp * 100)}%` : '—';
            return { text: `${d.decision} · p(resp) = ${pResp}`, active: true, alert: d.decision === 'RULE_OUT' };
        },
    },
    {
        key: 'efficacy',
        label: 'Treatment ranking',
        icon: PharmacyIcon,
        color: '#c2410c',
        getStatus: ({ drugs }) => {
            if (!drugs?.length) return { text: 'Analyzing...', active: false };
            return { text: `${drugs.length} drugs ranked`, active: true };
        },
    },
    {
        key: 'trials',
        label: 'Clinical trials',
        icon: MedicalIcon,
        color: '#1d4ed8',
        getStatus: ({ trials, trialsLoading }) => {
            if (trialsLoading) return { text: 'Searching...', active: false };
            if (!trials?.length) return { text: 'No matches yet', active: false };
            return { text: `${trials.length} matched`, active: true };
        },
    },
];

export default function CapabilitiesHeroStrip({ drugs, resistanceGate, ioHarm, trials, trialsLoading }) {
    return (
        <Box
            sx={{
                mb: 3,
                p: 2.5,
                borderRadius: 2,
                bgcolor: 'grey.50',
                border: '1px solid',
                borderColor: 'divider',
                '@media print': { display: 'none' },
            }}
        >
            <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1, fontSize: '0.65rem', mb: 2, display: 'block' }}>
                What this packet uses
            </Typography>

            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' },
                gap: 1.5,
            }}>
                {ENGINE_DEFS.map(eng => {
                    const status = eng.getStatus({ drugs, resistanceGate, ioHarm, trials, trialsLoading });
                    const Icon = eng.icon;
                    return (
                        <Box
                            key={eng.key}
                            sx={{
                                p: 2,
                                borderRadius: 1,
                                bgcolor: 'background.paper',
                                border: '1px solid',
                                borderColor: 'divider',
                                cursor: 'default',
                                transition: 'box-shadow 0.15s ease',
                                '&:hover': { boxShadow: 1 },
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                                <Icon sx={{ fontSize: 18, color: eng.color }} />
                                <Typography variant="caption" sx={{
                                    color: 'text.primary', fontWeight: 700, fontSize: '0.68rem',
                                    lineHeight: 1.2,
                                }}>
                                    {eng.label}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Box sx={{
                                    width: 5, height: 5, borderRadius: '50%',
                                    bgcolor: status.alert ? 'error.main' : status.active ? 'success.main' : 'grey.400',
                                    flexShrink: 0,
                                }} />
                                <Typography variant="caption" sx={{
                                    color: status.active ? 'text.secondary' : 'text.disabled',
                                    fontSize: '0.62rem',
                                    fontWeight: 600,
                                    lineHeight: 1.3,
                                }}>
                                    {status.text}
                                </Typography>
                            </Box>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
}
