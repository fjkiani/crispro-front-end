# Mobile Navigation Improvements

## Summary

Improved mobile navigation experience with clear labels, proper color contrast, and MOAT-only routes.

## Changes Made

### 1. **MOAT Navigation Configuration** (`constants/moatNavigation.js`)
   - Created dedicated navigation config with labels and descriptions
   - Each item includes:
     - `label`: Full display text
     - `shortLabel`: Abbreviated for mobile
     - `color`: Theme color for active state
     - `personas`: Access control
   - Only includes MOAT production routes

### 2. **Mobile Bottom Navigation** (`components/MobileNavbar.jsx`)
   - **Features:**
     - Always visible at bottom on mobile (< md breakpoint)
     - Clear labels with icons
     - Proper color contrast (no white on white)
     - Smooth animations
     - Only shows when user is authenticated
     - Filters by persona for access control
   - **Implementation:**
     - Uses MUI BottomNavigation component
     - Shows labels: "Pipeline", "Care", "Trials", "Dossiers", etc.
     - Active state highlighted with route-specific colors

### 3. **Desktop Sidebar** (`components/ImprovedSidebar.jsx`)
   - **Features:**
     - Vertical sidebar with icons + full labels
     - Tooltips on hover
     - Color-coded active states
     - Only shows on desktop (≥ md breakpoint)
     - Proper spacing and typography
   - **Implementation:**
     - Uses MUI List components
     - Full label text visible
     - Active item highlighted with background color

### 4. **Desktop Top Navbar** (`components/Navbar.jsx`)
   - **Features:**
     - Search bar for MOAT tools
     - User actions (login/logout)
     - Only shows on desktop
     - Clean, minimal design
   - **Implementation:**
     - Uses MUI AppBar
     - Responsive search bar
     - User profile/logout actions

### 5. **App Layout Updates** (`App.jsx`)
   - Responsive layout:
     - Mobile: Full-width content + bottom nav
     - Desktop: Sidebar + main content + top nav
   - Proper padding for mobile navbar (pb: 8)
   - Navigation only shows when authenticated

## Navigation Items (MOAT Only)

1. **Orchestrator** - Full pipeline dashboard (Researcher only)
2. **Complete Care** - Unified care orchestration
3. **Trial Intelligence** - Clinical trial matching
4. **Dossiers** - Dossier management
5. **Research** - Research orchestration
6. **Genomics** - VCF/genomic analysis
7. **Synthetic Lethality** - SL analysis
8. **Dosing** - Drug dosing guidance
9. **Metastasis** - Metastasis analysis

## Color Theme

Each navigation item has a distinct color:
- Orchestrator: Indigo (#6366f1)
- Complete Care: Green (#10b981)
- Trial Intelligence: Blue (#3b82f6)
- Dossiers: Purple (#8b5cf6)
- Research: Pink (#ec4899)
- Genomics: Amber (#f59e0b)
- Synthetic Lethality: Red (#ef4444)
- Dosing: Cyan (#06b6d4)
- Metastasis: Lime (#84cc16)

## Mobile UX Improvements

### Before:
- ❌ Icon-only navigation (unclear)
- ❌ White on white color issues
- ❌ Tabs don't fit well on mobile
- ❌ No labels, hard to understand
- ❌ All routes shown (too many)

### After:
- ✅ Clear labels with icons
- ✅ Proper color contrast
- ✅ Bottom navigation fits mobile screen
- ✅ Easy to understand what each item does
- ✅ MOAT routes only (focused)

## Testing Checklist

- [x] Navigation only shows when authenticated
- [x] Login page doesn't show navigation
- [x] Mobile bottom nav works correctly
- [x] Desktop sidebar works correctly
- [x] Labels are clear and readable
- [x] Colors have proper contrast
- [x] Persona filtering works
- [ ] Test on actual mobile device
- [ ] Test all navigation routes

## Next Steps

1. Test on real mobile devices
2. Add analytics tracking for navigation usage
3. Consider adding search functionality to mobile nav
4. Add keyboard navigation support
5. Add accessibility labels (ARIA)

## Files Modified

- `src/constants/moatNavigation.js` (new)
- `src/constants/index.js` (updated)
- `src/components/MobileNavbar.jsx` (new)
- `src/components/ImprovedSidebar.jsx` (new)
- `src/components/Sidebar.jsx` (updated to use ImprovedSidebar)
- `src/components/Navbar.jsx` (completely rewritten)
- `src/components/index.js` (exports updated)
- `src/App.jsx` (layout updated)
