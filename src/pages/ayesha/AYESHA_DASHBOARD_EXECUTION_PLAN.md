# AYESHA DASHBOARD - EXECUTION PLAN

**Date:** January 27, 2026  
**Status:** ✅ **DASHBOARD EXISTS - NEEDS ROUTING**  
**Discovery:** `AyeshaPatientDashboard.jsx` already built (484 lines)  

---

## ✅ DISCOVERY: DASHBOARD ALREADY EXISTS!

### **What We Found:**

**File:** `/pages/ayesha/AyeshaPatientDashboard.jsx` (484 lines)

**Features Already Built:**
- ✅ Beautiful gradient header
- ✅ Biomarker chips (Stage, CA-125, Germline, PD-L1, p53, etc.)
- ✅ Quick Actions (4 buttons: Trials, Complete Care, Dossiers, Journey)
- ✅ Key Insights (collapsible cards):
  - DDR Status & PARP Eligibility
  - Standard of Care
  - Recommended Next Steps
  - CA-125 Monitoring
- ✅ Patient Journey Timeline (`PatientJourneyEnhanced`)
- ✅ Loads data from `/api/ayesha/complete_care_v2`
- ✅ Uses `AYESHA_11_17_25_PROFILE` constant

**Styled Components:**
- ✅ `DashboardHeader` - Beautiful gradient header
- ✅ `InsightCard` - Hover effects, borders
- ✅ `QuickActionButton` - Gradient buttons

---

## 🎯 THE PROBLEM

### **Current State:**
- ✅ Dashboard exists and is beautiful
- ❌ **NOT BEING USED** - `/ayesha-trials` loads instead
- ❌ No route to `/ayesha` or `/ayesha/dashboard`
- ❌ Users land on `AyeshaTrialExplorer` (dumping ground)

### **What Needs to Happen:**
1. **Route `/ayesha` to `AyeshaPatientDashboard`** (5 min)
2. **Update Quick Actions to point to new modular pages** (15 min)
3. **Refactor `AyeshaTrialExplorer` to remove duplicates** (2 hours)

---

## 🚀 EXECUTION PLAN

### **Sprint 1: Wire Dashboard Routing** (30 min)

**Goal:** Make `/ayesha` load the beautiful dashboard

**Tasks:**
1. Add route `/ayesha` → `AyeshaPatientDashboard` (5 min)
2. Update Quick Actions navigation (15 min):
   - "Clinical Trials" → `/ayesha/trials`
   - "Complete Care Plan" → `/ayesha/complete-care`
   - "Trial Dossiers" → `/ayesha/dossiers`
   - "View Journey" → Scroll to timeline (already done)
3. Test navigation (10 min)

**Deliverable:** Dashboard loads at `/ayesha`

---

### **Sprint 2: Add Digital Twin to Quick Actions** (15 min)

**Goal:** Add Digital Twin button to Quick Actions

**Tasks:**
1. Add 5th Quick Action button (10 min):
   ```jsx
   <QuickActionButton
     fullWidth
     startIcon={<ScienceIcon />}
     onClick={() => navigate('/ayesha/digital-twin')}
   >
     Digital Twin
   </QuickActionButton>
   ```
2. Test navigation (5 min)

**Deliverable:** Digital Twin accessible from dashboard

---

### **Sprint 3: Refactor Trials Page** (2 hours)

**Goal:** Remove duplicates from `AyeshaTrialExplorer.jsx`

**Tasks:**
1. Remove patient profile section (30 min)
   - Already on dashboard
2. Remove mechanism intelligence (30 min)
   - Move to Digital Twin
3. Remove SOC recommendation (15 min)
   - Already on dashboard
4. Remove next steps (15 min)
   - Already on dashboard
5. Focus ONLY on trial matching (30 min)

**Deliverable:** Clean trials page at `/ayesha/trials`

---

### **Sprint 4: Create Sidebar Navigation** (2 hours)

**Goal:** Add sidebar with module links

**Tasks:**
1. Create `AyeshaSidebar.jsx` component (1 hour)
2. Wire into all Ayesha pages (30 min)
3. Remove nested tabs (30 min)

**Deliverable:** Clean sidebar navigation

---

## 📋 IMMEDIATE ACTION (30 MIN)

### **Step 1: Add Route** (5 min)

**File:** `/routes/index.jsx` or wherever routes are defined

```jsx
import AyeshaPatientDashboard from '../pages/ayesha/AyeshaPatientDashboard';

// Add route
<Route path="/ayesha" element={<AyeshaPatientDashboard />} />
<Route path="/ayesha/dashboard" element={<AyeshaPatientDashboard />} />
```

---

### **Step 2: Update Quick Actions** (15 min)

**File:** `/pages/ayesha/AyeshaPatientDashboard.jsx`

**Current:**
```jsx
onClick={() => navigate('/ayesha-trials/explore')}  // OLD
onClick={() => navigate('/ayesha-complete-care')}   // OLD
onClick={() => navigate('/ayesha-dossiers')}        // OLD
```

**Update to:**
```jsx
onClick={() => navigate('/ayesha/trials')}          // NEW
onClick={() => navigate('/ayesha/complete-care')}   // NEW
onClick={() => navigate('/ayesha/dossiers')}        // NEW
```

---

### **Step 3: Add Digital Twin Button** (10 min)

**Add 5th Quick Action:**
```jsx
<Grid item xs={12} sm={6} md={2.4}>
  <QuickActionButton
    fullWidth
    startIcon={<ScienceIcon />}
    onClick={() => navigate('/ayesha/digital-twin')}
  >
    Digital Twin
  </QuickActionButton>
</Grid>
```

---

## 🎯 SUCCESS CRITERIA

**Sprint 1 Complete When:**
- ✅ `/ayesha` loads `AyeshaPatientDashboard`
- ✅ Quick Actions navigate to correct pages
- ✅ Digital Twin button added
- ✅ No console errors

**Sprint 2 Complete When:**
- ✅ Trials page cleaned (no duplicates)
- ✅ Focuses ONLY on trial matching
- ✅ No patient profile (on dashboard)
- ✅ No mechanism intelligence (on digital twin)

**Sprint 3 Complete When:**
- ✅ Sidebar navigation added
- ✅ No nested tabs
- ✅ Clean hierarchy

---

## 📊 BEFORE vs AFTER

### **Before:**
```
/ayesha-trials (dumping ground)
├── Patient Profile (hardcoded)
├── Mechanism Intelligence
├── Essential Pathways
├── DDR Status
├── SOC Recommendation
├── Next Steps
├── Clinical Hints
├── SAE Features
└── Nested tabs (Treatment, SL, etc.)
```

### **After:**
```
/ayesha (Dashboard)
├── Patient Hero Card
├── Quick Actions (5 buttons)
├── Key Insights (collapsible)
└── Journey Timeline

/ayesha/digital-twin
├── Mutation Scoring Pipeline
├── Pathway Disruption Map
└── Synthetic Lethality Flow

/ayesha/trials
└── Trial Matching ONLY

/ayesha/complete-care
└── Full care plan

/ayesha/dossiers
└── Trial dossiers
```

---

**Status:** ✅ **READY TO EXECUTE**  
**Next Step:** Execute Sprint 1 (Wire Dashboard Routing)  
**Time to Ship:** 30 minutes (Sprint 1 only)
