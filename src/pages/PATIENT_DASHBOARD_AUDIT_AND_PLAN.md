# 🏠 PATIENT DASHBOARD AUDIT & PLAN

**Date**: January 2026  
**Focus**: Patient persona landing page (`/home`) after login  
**Goal**: Show MOAT benefits, patient profile, and actionable insights instead of legacy metrics

---

## 🔴 CURRENT STATE AUDIT

### **What `/home` Currently Shows:**

1. **DisplayInfo Component** - Legacy dashboard with:
   - ❌ Hardcoded `dummy@example.com` (not real user)
   - ❌ Metrics about folders, screenings, kanban records
   - ❌ Links to `/appointments/pending`, `/treatment/progress`, `/folders`, `/screenings`
   - ❌ **NO patient profile information**
   - ❌ **NO MOAT capabilities shown**
   - ❌ **NO personalized insights**

2. **Static Navigation:**
   - ❌ Users must click through pages to find MOAT features
   - ❌ No quick access to clinical trials, care plans, biomarkers
   - ❌ No personalized "what to do next" guidance

3. **Missing Patient Context:**
   - ❌ No disease type/stage displayed
   - ❌ No mutations/biomarkers shown
   - ❌ No current treatment status
   - ❌ No recent MOAT activity (care plans, trials, etc.)

---

## ✅ WHAT SHOULD BE SHOWN (MOAT-FIRST)

### **Section 1: Patient Profile Summary (Top)**

**Purpose**: At-a-glance patient information

**Display**:
```
┌─────────────────────────────────────────────────┐
│ 🧬 Ayesha (or Patient Name)                     │
│ Ovarian Cancer HGS | Stage IVB | Age 40         │
├─────────────────────────────────────────────────┤
│ Key Mutations: MBD4, TP53,               │
│ Biomarkers: HRD+ | PD-L1+ (CPS 10)              │
│ Current Treatment: First-line (Active)          │
│ Last Updated: Jan 10, 2026                      │
└─────────────────────────────────────────────────┘
```

**Data Sources**:
- `AuthContext.profile` (from `/api/auth/profile`)
- `PatientContext.patientProfile` (if loaded)
- `PatientContext.currentPatient` (if set)

**Action**: "Edit Profile" button → `/patient/profile`

---

### **Section 2: Quick Actions / Next Steps (Prominent)**

**Purpose**: Guide patient to most valuable MOAT capabilities

**Display**:
```
┌─────────────────────────────────────────────────┐
│ 🎯 Your Next Steps                              │
├─────────────────────────────────────────────────┤
│ [Generate Complete Care Plan]  → /ayesha-complete-care
│ [Find Clinical Trials]          → /ayesha-trials
│ [View Trial Dossiers]           → /ayesha-dossiers
│ [Update Biomarkers]             → /patient/profile#biomarkers
└─────────────────────────────────────────────────┘
```

**Logic**:
- If no care plan exists → Show "Generate Care Plan" as primary CTA
- If care plan exists but >30 days old → Show "Refresh Care Plan"
- If trials exist but <5 matches → Show "Explore More Trials"
- If new biomarkers available → Show "Update Biomarkers"

---

### **Section 3: Recent MOAT Activity (Cards)**

**Purpose**: Show value from past MOAT usage

**Display**:
```
┌─────────────────────────────────────────────────┐
│ 📊 Your MOAT Activity                           │
├─────────────────────────────────────────────────┤
│ [Recent Care Plans]                             │
│   • Complete Care Plan (Dec 15, 2025)           │
│     └─ 8 trials matched | SOC recommended       │
│                                 [View Details →]│
│                                                 │
│ [Matched Trials]                                │
│   • 12 trials currently recruiting              │
│   • Top match: NCT04284969 (Olaparib + ATR)     │
│                                 [Explore →]      │
│                                                 │
│ [Biomarker Updates]                             │
│   • CA-125: 2842 U/mL (Nov 17, 2025)            │
│   • HRD Score: 42 (High)                        │
│                                 [View History →] │
└─────────────────────────────────────────────────┘
```

**Data Sources**:
- Query `/api/patients/{patient_id}/care-plans` (if exists)
- Query `/api/patients/{patient_id}/trials` (if exists)
- Query `/api/patients/{patient_id}/biomarkers` (if exists)
- Or load from PatientContext/localStorage

---

### **Section 4: Personalized Insights (AI-Generated)**

**Purpose**: Actionable insights based on patient profile

**Display**:
```
┌─────────────────────────────────────────────────┐
│ 💡 Insights for You                             │
├─────────────────────────────────────────────────┤
│ 🔬 Based on your MBD4+TP53 profile:             │
│   • High DDR pathway activity detected          │
│   • PARP inhibitors likely effective            │
│   • Consider: Olaparib, Niraparib trials        │
│                                 [Learn More →]  │
│                                                 │
│ 📈 Treatment Options:                           │
│   • 3 trials match your mechanism profile       │
│   • 2 trials within 50 miles                    │
│   • 1 trial has no waiting list                 │
│                                 [View Trials →]  │
└─────────────────────────────────────────────────┘
```

**Data Sources**:
- Compute SAE vector from patient profile
- Query trials with mechanism fit
- Call `/api/ayesha/complete_care_v2` (cached) for insights
- Or generate insights from patient profile alone

---

### **Section 5: Key Metrics (MOAT-Specific)**

**Purpose**: Replace legacy metrics with MOAT value metrics

**Display**:
```
┌─────────────────────────────────────────────────┐
│ [8]  Matched Trials    → /ayesha-trials          │
│ [3]  Active Care Plans → /ayesha-complete-care   │
│ [12] Trial Dossiers    → /ayesha-dossiers        │
│ [2]  Pending Updates   → /patient/profile        │
└─────────────────────────────────────────────────┘
```

**Replaces**:
- ❌ "Total Folders"
- ❌ "Total Screenings"
- ❌ "Appointments Pending"

---

## 🔄 USER FLOW (PATIENT-FIRST)

### **Flow 1: New Patient (No Profile)**
```
Login → /home
  ↓
Show: "Welcome! Let's set up your profile"
  ↓
Primary CTA: "Complete Profile Setup" → /patient/onboarding
  ↓
After onboarding → Show full dashboard
```

### **Flow 2: Existing Patient (Has Profile, No Care Plan)**
```
Login → /home
  ↓
Show: Patient profile summary + "Generate Your First Care Plan"
  ↓
Primary CTA: "Generate Complete Care Plan" → /ayesha-complete-care
  ↓
After generation → Show dashboard with recent activity
```

### **Flow 3: Existing Patient (Has Care Plan)**
```
Login → /home
  ↓
Show: 
  - Patient profile summary
  - Recent care plan (last generated date)
  - Matched trials count
  - Personalized insights
  ↓
Quick Actions: "Refresh Care Plan" | "Explore Trials" | "View Dossiers"
```

---

## 🎨 DESIGN PRINCIPLES

1. **MOAT-First**: Show MOAT capabilities prominently, not legacy metrics
2. **Personalized**: Every element should reference patient's actual profile
3. **Actionable**: Clear CTAs to guide next steps
4. **Progressive Disclosure**: Show summary first, details on click
5. **Value-Focused**: Highlight what MOAT provides (trials, care plans, insights)

---

## 📊 DATA REQUIREMENTS

### **What We Need to Load:**

1. **Patient Profile** (from `AuthContext` or `PatientContext`):
   ```javascript
   {
     patient_id: "Ayesha",
     name: "Ayesha",
     disease: { type: "ovarian_cancer_hgs", stage: "IVB" },
     demographics: { age: 40, sex: "F" },
     tumor_context: { somatic_mutations: [...], hrd_score: 42 },
     biomarkers: { ca125_value: 2842, pd_l1: { cps: 10 } },
     treatment: { line: "first-line", status: "active" }
   }
   ```

2. **Recent Care Plans** (from backend or localStorage):
   ```javascript
   {
     care_plans: [
       { id: "...", generated_at: "2025-12-15", trial_count: 8, ... }
     ]
   }
   ```

3. **Matched Trials Count** (quick query or cached):
   ```javascript
   {
     trial_count: 12,
     top_match: { nct_id: "NCT04284969", title: "..." }
   }
   ```

4. **Biomarker History** (from profile or backend):
   ```javascript
   {
     ca125_history: [{ date: "2025-11-17", value: 2842 }],
     latest_hrd_score: 42
   }
   ```

---

## 🔧 IMPLEMENTATION PLAN

### **Phase 1: Replace DisplayInfo with Patient Dashboard**

**File**: `oncology-coPilot/oncology-frontend/src/pages/Home.jsx`

**Changes**:
1. Create new `PatientDashboard.jsx` component (or rename existing)
2. Remove legacy `DisplayInfo` component
3. Load patient profile from `AuthContext` and `PatientContext`
4. Display patient profile summary at top

**Dependencies**:
- ✅ `AuthContext` - Already exists, provides `profile` and `user`
- ✅ `PatientContext` - Already exists, provides `patientProfile` and `currentPatient`
- ❌ Need to load patient profile on mount if not already loaded

---

### **Phase 2: Add Quick Actions Section**

**Component**: `PatientDashboardQuickActions.jsx`

**Features**:
- Detect if patient has profile
- Detect if care plan exists (check localStorage or backend)
- Show contextual CTAs based on state
- Link to appropriate MOAT pages

---

### **Phase 3: Add Recent Activity Cards**

**Component**: `PatientDashboardActivity.jsx`

**Features**:
- Query recent care plans (from backend or localStorage)
- Query matched trials (quick count query)
- Display biomarker history
- Link to detail pages

**Backend Endpoints Needed** (if not exist):
- `GET /api/patients/{patient_id}/care-plans` - List recent care plans
- `GET /api/patients/{patient_id}/trials` - List matched trials
- `GET /api/patients/{patient_id}/biomarkers` - Biomarker history

**Fallback**: Use localStorage or show empty state with CTAs

---

### **Phase 4: Add Personalized Insights**

**Component**: `PatientDashboardInsights.jsx`

**Features**:
- Compute SAE vector from patient profile
- Generate insights based on mutations/biomarkers
- Show mechanism-based recommendations
- Link to relevant MOAT pages

**Data Sources**:
- Patient profile (mutations, biomarkers)
- Pre-computed insights (from cached care plan if available)
- Or generate simple insights client-side

---

### **Phase 5: Replace Legacy Metrics**

**Component**: `PatientDashboardMetrics.jsx`

**Features**:
- Show MOAT-specific metrics (trials, care plans, dossiers)
- Remove legacy metrics (folders, screenings)
- Make metrics clickable → navigate to detail pages

---

## 🚀 PRIORITY IMPLEMENTATION ORDER

1. **P0: Patient Profile Summary** (Top Section)
   - Load profile from AuthContext/PatientContext
   - Display key info (disease, stage, mutations, biomarkers)
   - Link to profile edit page

2. **P0: Quick Actions** (Primary CTAs)
   - "Generate Care Plan" → `/ayesha-complete-care`
   - "Find Trials" → `/ayesha-trials`
   - "View Dossiers" → `/ayesha-dossiers`

3. **P1: Recent Activity** (Show Value)
   - Recent care plans (from localStorage or backend)
   - Matched trials count
   - Biomarker updates

4. **P2: Personalized Insights** (AI-Generated)
   - Mechanism-based recommendations
   - Treatment suggestions
   - Trial highlights

5. **P3: MOAT Metrics** (Replace Legacy)
   - Trial counts, care plan counts, etc.

---

## 📝 COMPONENT STRUCTURE

```
Home.jsx (or PatientDashboard.jsx)
├── PatientProfileSummary.jsx      (P0)
├── PatientDashboardQuickActions.jsx (P0)
├── PatientDashboardActivity.jsx   (P1)
├── PatientDashboardInsights.jsx   (P2)
└── PatientDashboardMetrics.jsx    (P3)
```

---

## ✅ SUCCESS CRITERIA

1. ✅ Patient sees their profile info immediately on login
2. ✅ Patient sees clear CTAs to MOAT capabilities
3. ✅ Patient sees value from past MOAT usage (care plans, trials)
4. ✅ Patient gets personalized insights based on their profile
5. ✅ No legacy metrics (folders, screenings, kanban)
6. ✅ Navigation is dynamic (shows relevant actions based on state)

---

## 🔗 RELATED ROUTES

**Patient-Accessible MOAT Routes**:
- `/ayesha-complete-care` - Complete care plan (patient view)
- `/ayesha-trials` - Trial matching (patient view)
- `/ayesha-dossiers` - Trial dossiers (patient view)
- `/patient/profile` - Profile management
- `/patient/onboarding` - Initial profile setup

**Backend Endpoints** (if needed):
- `GET /api/auth/profile` - Current user profile (exists)
- `GET /api/patients/{id}` - Patient details (exists)
- `GET /api/patients/{id}/care-plans` - Recent care plans (may need to create)
- `GET /api/patients/{id}/trials` - Matched trials (may need to create)

---

**Next Steps**: Implement P0 components (Profile Summary + Quick Actions) first, then iterate based on user feedback.
