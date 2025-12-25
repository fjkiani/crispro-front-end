/**
 * Synthetic Lethality Module
 * 
 * Export all components and hooks for synthetic lethality analysis
 */

// Main page component
export { default as SyntheticLethalityAnalyzer } from './SyntheticLethalityAnalyzer';

// Sub-components
export { default as EssentialityScoreCard } from './components/EssentialityScoreCard';
export { default as PathwayDependencyDiagram } from './components/PathwayDependencyDiagram';
export { default as TherapyRecommendationList } from './components/TherapyRecommendationList';
export { default as MutationInputForm } from './components/MutationInputForm';
export { default as ClinicalDossierModal } from './components/ClinicalDossierModal';
export { default as AIExplanationPanel } from './components/AIExplanationPanel';

// Hooks
export { useSyntheticLethality } from './hooks/useSyntheticLethality';
export { useLLMExplanation } from './hooks/useLLMExplanation';

