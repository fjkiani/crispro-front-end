/**
 * Demo Configurations
 * 
 * Centralized configuration for all demos.
 * Supports route-based demo selection.
 * 
 * Structure:
 * - data: Demo data object (killChain, initialMutation, header, etc.)
 * - stageComponents: Object mapping stage IDs to React components
 * - title: Demo title
 * - description: Demo description
 */

import { PIK3CA_DEMO_DATA } from '../data/demos/pik3caDemoData';
import * as PIK3CA_STAGE_COMPONENTS from '../components/demo-stages';

export const DEMO_CONFIGS = {
  pik3ca: {
    data: PIK3CA_DEMO_DATA,
    stageComponents: {
      TargetAcquisitionCard: PIK3CA_STAGE_COMPONENTS.TargetAcquisitionCard,
      IntelligenceGatheringCard: PIK3CA_STAGE_COMPONENTS.IntelligenceGatheringCard,
      VulnerabilityAssessmentCard: PIK3CA_STAGE_COMPONENTS.VulnerabilityAssessmentCard,
      WeaponForgingCard: PIK3CA_STAGE_COMPONENTS.WeaponForgingCard,
      StructuralValidationCard: PIK3CA_STAGE_COMPONENTS.StructuralValidationCard,
      LethalityAssessmentCard: PIK3CA_STAGE_COMPONENTS.LethalityAssessmentCard,
      BattlePlanDeliveryCard: PIK3CA_STAGE_COMPONENTS.BattlePlanDeliveryCard,
    },
    title: 'PIK3CA E542K Target Validation & Lead Generation',
    description: 'A demo showcasing the R&D de-risking platform for PIK3CA E542K.'
  },
  // Future demos:
  // metastasis: {
  //   data: METASTASIS_DEMO_DATA,
  //   stageComponents: METASTASIS_STAGE_COMPONENTS,
  //   title: 'Metastasis Interception Demo',
  //   description: 'A demo showcasing metastasis interception strategies.'
  // }
};
