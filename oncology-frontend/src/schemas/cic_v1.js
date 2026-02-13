import { z } from 'zod';

/**
 * CIC v1: Clinical Intelligence Contract Schemas
 * Defines strict contracts for "Honest UI" data representation.
 */

// --- Mechanism Map Schemas ---

export const MechanismAxisSchema = z.object({
    name: z.string(),
    status: z.enum(['computed', 'awaiting_ngs', 'error']),
    value: z.number().nullable().optional(), // Float or null
    missing_inputs: z.array(z.string()).optional().default([]),
    details: z.record(z.any()).optional()
});

// Manager C9: Chips List Schema
// Manager C9: Chips List Schema (Aligned with backend 2026-02-09)
export const MechanismMapSchema = z.object({
    chips: z.array(z.object({
        pathway: z.string(),
        burden: z.number(), // 0.0 - 1.0
        color: z.enum(['success', 'warning', 'default', 'error']),
        label: z.string(),
        tooltip: z.string(),
        status: z.enum(['computed', 'awaiting_ngs']),
    })),
    status: z.enum(['computed', 'awaiting_ngs', 'error']).optional(),
    message: z.string().optional(),
    provenance: z.record(z.any()).optional()
});

// --- Resistance Alert Schemas ---

export const ResistanceSignalSchema = z.object({
    name: z.string(),
    met: z.boolean().nullable(), // True | False | Null (missing data)
    missing_inputs: z.array(z.string()).default([]),
    details: z.record(z.any()).optional()
});

export const ResistanceAlertSchema = z.object({
    status: z.enum(['active', 'clear', 'awaiting_baseline', 'awaiting_ngs']),
    signals: z.array(ResistanceSignalSchema),
    rule: z.string().optional(),
    trigger_count: z.number().optional(),
    missing_inputs: z.array(z.string()).optional(),
    detection_time: z.string().optional(),
    provenance: z.record(z.any()).optional()
});

// --- Complete Response Validation ---

export const CompleteCareV2ResponseSchema = z.object({
    mechanism_map: MechanismMapSchema.optional().nullable(),
    resistance_alert: ResistanceAlertSchema.optional().nullable(),
    // Add other schemas as needed
});
