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
