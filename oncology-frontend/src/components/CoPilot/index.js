/**
 * CoPilot Components - Main exports
 *
 * This module contains all CoPilot-related components, organized in a modular structure:
 *
 * - Q2CRouter: Question-to-Capability routing system
 * - Evidence: Components for displaying clinical evidence
 * - Actions: Action handling and status components
 * - hooks: Custom React hooks for CoPilot functionality
 * - utils: Utility functions and helpers
 * - context: React context for state management
 * - integrations: Components for integrating with other parts of the app
 */

// Main CoPilot component (will be created next)
export { default as CoPilot } from './CoPilot';

// Q2C Router
export * from './Q2CRouter';

// Evidence Components
export * from './Evidence';

// Action Components
export * from './Actions';

// Context and hooks
export * from './context';
export * from './hooks';

// Utilities
export * from './utils';

// Integration components
export * from './integrations';

// New modular components
export { CoPilotDrawer } from './CoPilotDrawer';
export { CoPilotHeader } from './CoPilotHeader';
export { CoPilotTabs } from './CoPilotTabs';
export { ChatInterface } from './ChatInterface';
export { ChatInput } from './ChatInput';
export { MessageRenderer } from './MessageRenderer';
export { InsightsPanel } from './InsightsPanel';
export { HelpPanel } from './HelpPanel';

// Logic and utilities
export { useCoPilotLogic } from './CoPilotLogic';

// Test components
export { Q2CRouterTest } from './Q2CRouter/Q2CRouterTest';
