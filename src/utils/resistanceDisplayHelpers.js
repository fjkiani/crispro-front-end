/**
 * resistanceDisplayHelpers
 *
 * Pure transform functions: metadata + patient data → component-ready props.
 *
 * These functions are the ONLY place where resistance metadata is joined with
 * patient data. Components receive pre-computed props — they never import or
 * manipulate metadata directly.
 *
 * Consumers:
 *   - Phase5Resistance.jsx orchestrator
 *   - Any future page that needs resistance class display
 *
 * Rules:
 *   - No API calls. Pure data transforms only.
 *   - No hardcoded class names, gene lists, or vector weights.
 *   - All values come from the metadata object returned by useResistanceMetadata().
 */

// ── Severity Derivation ──────────────────────────────────────────────────────
// Maps priority array index to severity label.
// priority[] is ordered lowest → highest severity.
// 12 classes → split into 4 tiers of 3.

const SEVERITY_THRESHOLDS = [
    { label: 'low', minIndex: 0 },
    { label: 'moderate', minIndex: 3 },
    { label: 'high', minIndex: 6 },
    { label: 'critical', minIndex: 9 },
];

function deriveSeverity(classId, priority) {
    const idx = priority.indexOf(classId);
    if (idx === -1) return 'moderate'; // fallback
    let severity = 'low';
    for (const tier of SEVERITY_THRESHOLDS) {
        if (idx >= tier.minIndex) severity = tier.label;
    }
    return severity;
}

// ── 1. buildResistanceClassProps ─────────────────────────────────────────────
/**
 * Produces props for MultiMechanismPanel.
 *
 * @param {string[]} somaticGenes - Patient somatic/germline gene names (uppercased)
 * @param {object}   metadata     - Return value from useResistanceMetadata()
 * @returns {Array<{ class_name, severity, signals, description }>}
 */
export function buildResistanceClassProps(somaticGenes = [], metadata = {}) {
    const { classes = {}, priority = [], geneMap = {} } = metadata;
    if (!somaticGenes.length || !Object.keys(geneMap).length) return [];

    // Map patient genes to their resistance classes
    const classToGenes = {};
    for (const gene of somaticGenes) {
        const classId = geneMap[gene.toUpperCase()];
        if (!classId) continue;
        if (!classToGenes[classId]) classToGenes[classId] = [];
        classToGenes[classId].push(gene);
    }

    if (!Object.keys(classToGenes).length) return [];

    // Build display objects, sorted by severity (highest first)
    const sorted = Object.keys(classToGenes).sort((a, b) => {
        const ai = priority.indexOf(a);
        const bi = priority.indexOf(b);
        return bi - ai; // descending — highest severity first
    });

    return sorted.map(classId => {
        const meta = classes[classId] || {};
        return {
            class_id: classId,                    // canonical ID — used for vector/axis lookups
            class_name: meta.name || classId,
            icon: meta.icon || '🔬',
            severity: deriveSeverity(classId, priority),
            signals: classToGenes[classId],      // patient genes that triggered this class
            description: meta.whatHappens || '',
            treatment_shift: meta.treatmentShift || '',
            compound_rule: meta.compound_rule || null,  // non-null only for compound-rule classes
        };
    });
}

// ── 2. buildActiveAxes ───────────────────────────────────────────────────────
/**
 * Produces props for KillChainAxisMap.
 * Picks axes where the delta > threshold for the detected class(es).
 *
 * @param {string[]} detectedClassIds - Resistance class IDs detected for this patient
 * @param {object}   metadata         - Return value from useResistanceMetadata()
 * @param {number}   threshold        - Min delta weight to count as "active" (default 0.2)
 * @returns {string[]} - Axis names that are active (union across all detected classes)
 */
export function buildActiveAxes(detectedClassIds = [], metadata = {}, threshold = 0.2) {
    const { vectors = {} } = metadata;
    const deltas = vectors.deltas || {};

    const activeSet = new Set();
    for (const classId of detectedClassIds) {
        const vec = deltas[classId];
        if (!vec) continue;
        for (const [axis, weight] of Object.entries(vec)) {
            if (weight >= threshold) activeSet.add(axis);
        }
    }

    return Array.from(activeSet);
}

// ── 3. buildConcordanceStatus ────────────────────────────────────────────────
/**
 * Produces props for ConcordanceStatusBanner.
 * Compares vector deltas between detected classes.
 * If any axis disagrees by more than the conflict threshold → DISCORDANT.
 *
 * NOTE: This is a DISPLAY approximation. The authoritative resolution runs
 * server-side via policy.py _resolve_conflicts(). Use this for preview only.
 *
 * @param {string[]} detectedClassIds  - Resistance class IDs detected
 * @param {object}   metadata          - Return value from useResistanceMetadata()
 * @param {number}   conflictThreshold - Weight difference to call a conflict (default 0.3)
 * @returns {{ concordanceStatus: string, conflictDetails: Array }}
 */
export function buildConcordanceStatus(
    detectedClassIds = [],
    metadata = {},
    conflictThreshold = 0.3
) {
    const { vectors = {} } = metadata;
    const deltas = vectors.deltas || {};
    const axes = vectors.axes || [];

    if (detectedClassIds.length < 2) {
        // Single class → always concordant
        return { concordanceStatus: detectedClassIds.length === 1 ? 'CONCORDANT' : null, conflictDetails: [] };
    }

    const conflictDetails = [];

    for (const axis of axes) {
        const weights = detectedClassIds
            .map(id => ({ id, w: deltas[id]?.[axis] ?? 0 }))
            .filter(x => x.w > 0);

        if (weights.length < 2) continue;

        const min = Math.min(...weights.map(x => x.w));
        const max = Math.max(...weights.map(x => x.w));

        if (max - min >= conflictThreshold) {
            const sorted = [...weights].sort((a, b) => b.w - a.w);
            const top = sorted[0];
            const bottom = sorted[sorted.length - 1];
            conflictDetails.push({
                axis,
                disagreement: `${top.id} pushes ${axis.toUpperCase()} to ${top.w.toFixed(2)} vs ${bottom.id} at ${bottom.w.toFixed(2)} — conflict Δ${(max - min).toFixed(2)}`,
            });
        }
    }

    return {
        concordanceStatus: conflictDetails.length === 0 ? 'CONCORDANT' : 'DISCORDANT',
        conflictDetails,
    };
}
