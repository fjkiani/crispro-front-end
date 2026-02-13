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
    personas: ['oncologist', 'researcher', 'patient']
  },
  {
    name: "research-intelligence",
    label: "Research",
    shortLabel: "Research",
    imgUrl: research,
    link: '/research-intelligence',
    description: 'Research orchestration',
    color: '#ec4899', // Pink
    personas: ['oncologist', 'researcher']
  },
  {
    name: "clinical-genomics",
    label: "Genomics",
    shortLabel: "Genomics",
    imgUrl: dna,
    link: '/clinical-genomics',
    description: 'VCF/genomic analysis',
    color: '#f59e0b', // Amber
    personas: ['oncologist', 'researcher']
  },
  {
    name: "synthetic-lethality",
    label: "Synthetic Lethality",
    shortLabel: "SL",
    imgUrl: dna,
    link: '/synthetic-lethality',
    description: 'SL analysis',
    color: '#ef4444', // Red
    personas: ['oncologist', 'researcher']
  },
  {
    name: "dosing-guidance",
    label: "Dosing",
    shortLabel: "Dosing",
    imgUrl: screening,
    link: '/dosing-guidance',
    description: 'Drug dosing guidance',
    color: '#06b6d4', // Cyan
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
    personas: ['oncologist', 'researcher']
  },
  {
    name: "mutation-explorer",
    label: "Mutation Explorer",
    shortLabel: "Explorer",
    imgUrl: dna,
    link: '/mutation-explorer',
    description: 'Legacy Mutation Analysis (Audit)',
    color: '#f43f5e', // Rose
    personas: ['oncologist', 'researcher', 'patient']
  },
  // Ayesha Patient Pages
  {
    name: "ayesha-dashboard",
    label: "Ayesha Dashboard",
    shortLabel: "Dashboard",
    imgUrl: apps,
    link: '/ayesha',
    description: 'Ayesha patient dashboard - main landing page',
    color: '#6366f1', // Indigo
    personas: ['patient', 'oncologist', 'researcher']
  },
  {
    name: "ayesha-complete-care",
    label: "Ayesha Care",
    shortLabel: "Care",
    imgUrl: screening,
    link: '/ayesha-complete-care',
    description: 'Complete care plan for Ayesha',
    color: '#10b981', // Green
    personas: ['patient', 'oncologist', 'researcher']
  },
  {
    name: "ayesha-trials",
    label: "Ayesha Trials",
    shortLabel: "Trials",
    imgUrl: research,
    link: '/ayesha-trials',
    description: 'Clinical trial matching for Ayesha',
    color: '#3b82f6', // Blue
    personas: ['patient', 'oncologist', 'researcher']
  },
  {
    name: "ayesha-dossiers",
    label: "Ayesha Dossiers",
    shortLabel: "Dossiers",
    imgUrl: records,
    link: '/ayesha-dossiers',
    description: 'Trial dossiers for Ayesha',
    color: '#8b5cf6', // Purple
    personas: ['patient', 'oncologist', 'researcher']
  },
  {
    name: "ayesha-digital-twin",
    label: "Ayesha Digital Twin",
    shortLabel: "Digital Twin",
    imgUrl: dna,
    link: '/ayesha-digital-twin',
    description: 'Mechanistic biology analysis for Ayesha',
    color: '#ec4899', // Pink
    personas: ['patient', 'oncologist', 'researcher']
  },
  {
    name: "ayesha-resistance-lab",
    label: "Resistance Lab",
    shortLabel: "Lab",
    imgUrl: dna,
    link: '/resistance-lab',
    description: 'Glass Box Simulation Engine',
    color: '#4fd1c5', // Teal
    personas: ['patient', 'oncologist', 'researcher']
  },
  {
    name: "ayesha-therapy-fit",
    label: "Therapy Fit",
    shortLabel: "Therapy",
    imgUrl: dna,
    link: '/ayesha/therapy-fit',
    description: 'Personalized therapy matching (RUO)',
    color: '#84cc16', // Lime
    personas: ['patient', 'oncologist', 'researcher']
  },
  {
    name: "ayesha-holistic-scoring",
    label: "Holistic Scoring",
    shortLabel: "Holistic",
    imgUrl: research,
    link: '/ayesha/holistic-scoring',
    description: 'Patient ↔ Trial feasibility scoring (RUO)',
    color: '#3b82f6', // Blue
    personas: ['patient', 'oncologist', 'researcher']
  },
  {
    name: "ayesha-tests",
    label: "Tests & Unlocks",
    shortLabel: "Tests",
    imgUrl: screening,
    link: '/ayesha/tests',
    description: 'What to order next and what it unlocks (RUO)',
    color: '#0ea5e9', // Sky
    personas: ['patient', 'oncologist', 'researcher']
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
  if (!persona) return moatNavigationItems;
  return moatNavigationItems.filter(item =>
    !item.personas || item.personas.includes(persona)
  );
};

/**
 * Navigation item labels mapping (for backward compatibility)
 */
export const getNavigationLabel = (name) => {
  const item = moatNavigationItems.find(nav => nav.name === name);
  return item?.label || name.charAt(0).toUpperCase() + name.slice(1);
};
