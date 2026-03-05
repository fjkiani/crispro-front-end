/**
 * MOAT Navigation Configuration
 * 
 * Mobile-first navigation with clear labels and proper color contrast
 * Only includes MOAT production routes
 */

import {
  apps,      // Dashboard/Orchestrator
  screening, // Medical/Care
  research,  // Research/Trials
  dna,       // Genomics/SL
  records    // Dossiers
} from "../assets";

/**
 * MOAT Navigation Items
 * 
 * These are the core production-ready capabilities
 * Each item includes:
 * - name: Unique identifier
 * - label: Display text (shown on mobile)
 * - shortLabel: Abbreviated label for compact views
 * - icon: Image URL or icon component
 * - link: Route path
 * - description: Tooltip/help text
 * - color: Theme color for active state
 */
export const moatNavigationItems = [
  {
    name: "orchestrator",
    label: "Orchestrator",
    shortLabel: "Pipeline",
    imgUrl: apps,
    link: '/orchestrator',
    description: 'Full pipeline dashboard - upload and analyze',
    color: '#6366f1', // Indigo
    tier: 'functional',
    personas: ['researcher']
  },
  {
    name: "universal-complete-care",
    label: "Complete Care",
    shortLabel: "Care",
    imgUrl: screening,
    link: '/universal-complete-care',
    description: 'Unified care orchestration',
    color: '#10b981', // Green
    tier: 'production',
    personas: ['oncologist', 'researcher']
  },
  {
    name: "universal-trial-intelligence",
    label: "Trial Intelligence",
    shortLabel: "Trials",
    imgUrl: research,
    link: '/universal-trial-intelligence',
    description: 'Clinical trial matching',
    color: '#3b82f6', // Blue
    tier: 'production',
    personas: ['oncologist', 'researcher']
  },
  {
    name: "universal-dossiers",
    label: "Dossiers",
    shortLabel: "Dossiers",
    imgUrl: records,
    link: '/universal-dossiers',
    description: 'Dossier management',
    color: '#8b5cf6', // Purple
    tier: 'production',
    personas: ['oncologist', 'researcher']
  },
  {
    name: "research-intelligence",
    label: "Research",
    shortLabel: "Research",
    imgUrl: research,
    link: '/research-intelligence',
    description: 'Research orchestration',
    color: '#ec4899', // Pink
    tier: 'functional',
    personas: ['researcher']
  },
  {
    name: "clinical-genomics",
    label: "Genomics",
    shortLabel: "Genomics",
    imgUrl: dna,
    link: '/clinical-genomics',
    description: 'VCF/genomic analysis',
    color: '#f59e0b', // Amber
    tier: 'functional',
    personas: ['researcher']
  },
  {
    name: "synthetic-lethality",
    label: "Synthetic Lethality",
    shortLabel: "SL",
    imgUrl: dna,
    link: '/synthetic-lethality',
    description: 'SL analysis',
    color: '#ef4444', // Red
    tier: 'functional',
    personas: ['researcher']
  },
  {
    name: "dosing-guidance",
    label: "Dosing",
    shortLabel: "Dosing",
    imgUrl: screening,
    link: '/dosing-guidance',
    description: 'Drug dosing guidance',
    color: '#06b6d4', // Cyan
    tier: 'production',
    personas: ['oncologist', 'researcher']
  },
  {
    name: "metastasis",
    label: "Metastasis",
    shortLabel: "Metastasis",
    imgUrl: dna,
    link: '/metastasis',
    description: 'Metastasis analysis',
    color: '#84cc16', // Lime
    tier: 'functional',
    personas: ['researcher']
  },
  {
    name: "mutation-explorer",
    label: "Mutation Explorer",
    shortLabel: "Explorer",
    imgUrl: dna,
    link: '/mutation-explorer',
    description: 'Legacy Mutation Analysis (Audit)',
    color: '#f43f5e', // Rose
    tier: 'legacy',
    personas: ['researcher']
  },
  // ══════════════════════════════════════════════════════════════════════
  // Ayesha Patient Journey — 6 Phases (patient-facing)
  // ══════════════════════════════════════════════════════════════════════
  {
    name: "journey-snapshot",
    label: "① Snapshot",
    shortLabel: "Snapshot",
    imgUrl: screening,
    link: '/ayesha/journey/profile',
    description: 'Phase 1: What do we know about you?',
    color: '#10b981', // Green
    personas: ['patient', 'oncologist', 'researcher']
  },
  {
    name: "journey-tests",
    label: "② Tests & Unlocks",
    shortLabel: "Tests",
    imgUrl: research,
    link: '/ayesha/journey/tests',
    description: 'Phase 2: What should we test next?',
    color: '#3b82f6', // Blue
    personas: ['patient', 'oncologist', 'researcher']
  },
  {
    name: "journey-treatment",
    label: "③ Treatment Fit",
    shortLabel: "Treatment",
    imgUrl: dna,
    link: '/ayesha/journey/treatment',
    description: 'Phase 3: What treatments fit me today?',
    color: '#8b5cf6', // Purple
    personas: ['patient', 'oncologist', 'researcher']
  },
  {
    name: "journey-monitoring",
    label: "④ Monitoring",
    shortLabel: "Monitor",
    imgUrl: screening,
    link: '/ayesha/journey/monitoring',
    description: 'Phase 4: How will we know if it\'s working?',
    color: '#0ea5e9', // Sky
    personas: ['patient', 'oncologist', 'researcher']
  },
  {
    name: "journey-resistance",
    label: "⑤ Resistance",
    shortLabel: "Resistance",
    imgUrl: dna,
    link: '/ayesha/journey/resistance',
    description: 'Phase 5: If it stops working, what\'s next?',
    color: '#f59e0b', // Amber
    personas: ['patient', 'oncologist', 'researcher']
  },
  {
    name: "journey-board",
    label: "⑥ Tumor Board",
    shortLabel: "Board",
    imgUrl: records,
    link: '/ayesha/journey/board',
    description: 'Phase 6: Bring it to your doctor',
    color: '#ec4899', // Pink
    personas: ['patient', 'oncologist', 'researcher']
  },
  // ══════════════════════════════════════════════════════════════════════
  // Legacy Ayesha Pages (advanced / oncologist views)
  // All original routes still work — these provide direct access
  // ══════════════════════════════════════════════════════════════════════
  {
    name: "ayesha-complete-care",
    label: "Care (Legacy)",
    shortLabel: "Care",
    imgUrl: screening,
    link: '/ayesha-complete-care',
    description: 'Complete care plan — legacy view',
    color: '#10b981',
    personas: ['oncologist', 'researcher']
  },
  {
    name: "ayesha-trials",
    label: "360° (Legacy)",
    shortLabel: "360°",
    imgUrl: apps,
    link: '/ayesha-trials',
    description: '360° dashboard — legacy view',
    color: '#3b82f6',
    personas: ['oncologist', 'researcher']
  },
  {
    name: "ayesha-resistance-lab",
    label: "Lab (Legacy)",
    shortLabel: "Lab",
    imgUrl: dna,
    link: '/resistance-lab',
    description: 'Resistance Lab — legacy standalone',
    color: '#4fd1c5',
    personas: ['oncologist', 'researcher']
  },
  {
    name: "ayesha-therapy-fit",
    label: "Therapy Fit (Legacy)",
    shortLabel: "Therapy",
    imgUrl: dna,
    link: '/ayesha/therapy-fit',
    description: 'Therapy matching — legacy view',
    color: '#84cc16',
    personas: ['oncologist', 'researcher']
  },
  {
    name: "ayesha-tumor-board",
    label: "Board (Legacy)",
    shortLabel: "Board",
    imgUrl: records,
    link: '/ayesha/tumor-board',
    description: 'Strategy board — legacy view',
    color: '#0ea5e9',
    personas: ['oncologist', 'researcher']
  },
  {
    name: "ayesha-sandbox",
    label: "Sandbox (Proof)",
    shortLabel: "Sandbox",
    imgUrl: dna,
    link: '/ayesha/sandbox',
    description: 'Agentic Trial Failure Proof Sandbox',
    color: '#eab308',
    personas: ['oncologist', 'researcher', 'patient']
  },
  {
    name: "medical-records",
    label: "Patient Records",
    shortLabel: "Records",
    imgUrl: records,
    link: '/medical-records',
    description: 'Electronic Health Records',
    color: '#64748b', // Slate
    personas: ['oncologist', 'researcher']
  },
  {
    name: "outreach",
    label: "Outreach",
    shortLabel: "Outreach",
    imgUrl: research,
    link: '/outreach',
    description: 'Personalized email generation for doctors',
    color: '#8b5cf6', // Purple
    personas: ['oncologist', 'researcher']
  },
];

/**
 * Get navigation items filtered by persona
 */
export const getNavigationForPersona = (persona) => {
  // Default to 'patient' persona — patients only see the 6 journey phases
  const effectivePersona = persona || 'patient';
  return moatNavigationItems.filter(item =>
    !item.personas || item.personas.includes(effectivePersona)
  );
};

/**
 * Navigation item labels mapping (for backward compatibility)
 */
export const getNavigationLabel = (name) => {
  const item = moatNavigationItems.find(nav => nav.name === name);
  return item?.label || name.charAt(0).toUpperCase() + name.slice(1);
};
