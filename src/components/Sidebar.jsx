/**
 * Sidebar - Desktop Navigation
 * 
 * Uses ImprovedSidebar for better UX with labels and proper colors
 * Falls back to legacy version if ImprovedSidebar not available
 */

import React from 'react';
import { ImprovedSidebar } from './ImprovedSidebar';

// Export ImprovedSidebar as default Sidebar
const Sidebar = ImprovedSidebar;

export default Sidebar;

// Legacy export for backward compatibility
export { ImprovedSidebar };
