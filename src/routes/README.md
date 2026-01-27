# 🛣️ Modular Route Architecture

**Status:** ✅ Implemented  
**Purpose:** Scalable, maintainable route organization focused on MOAT capabilities

---

## 📁 Structure

```
/src/routes/
  ├── index.js              # Main route aggregator
  ├── authRoutes.js         # Authentication & admin routes
  ├── coreRoutes.js         # Essential navigation routes
  ├── moatRoutes.js         # MOAT Core (Primary Focus) ⭐
  ├── patientRoutes.js      # Patient persona routes
  ├── researchRoutes.js     # Advanced research tools
  ├── legacyRoutes.js       # Legacy/unclear routes (evaluation needed)
  ├── experimentalRoutes.js # Experimental routes (DEV-gated)
  ├── devRoutes.js          # DEV-only routes
  └── README.md             # This file
```

---

## 🎯 Route Categories (Tiers)

### **TIER 1: MOAT CORE** ⭐ (Primary Focus)
**File:** `moatRoutes.js`

Production-ready MOAT capabilities:
- `/universal-complete-care` - Complete care orchestration
- `/universal-trial-intelligence` - Trial matching
- `/universal-dossiers` - Dossier management
- `/research-intelligence` - Research orchestration
- `/orchestrator` - Full pipeline dashboard (Researcher-only)
- `/clinical-genomics` - VCF/genomic analysis
- `/synthetic-lethality` - SL analysis
- `/dosing-guidance` - Drug dosing
- `/metastasis` - Metastasis dashboard

**Personas:** Oncologist, Researcher (some Researcher-only)

### **TIER 2: PATIENT PERSONA**
**File:** `patientRoutes.js`

Patient-facing features:
- `/patient/dashboard` - Patient dashboard
- `/patient/profile` - Patient profile
- `/patient/settings` - Patient settings
- `/ayesha-complete-care` - Patient care view
- `/ayesha-trials` - Patient trial matching
- `/ayesha-dossiers` - Patient dossier view

**Personas:** Patient, Oncologist (for profile management)

### **TIER 3: CORE NAVIGATION**
**File:** `coreRoutes.js`

Essential application routes:
- `/home` - Home page
- `/profile` - User profile
- `/dashboard` - Doctor dashboard
- `/medical-records` - Patient records
- `/screening-schedules` - Screening schedules

### **TIER 4: EXPERIMENTAL** (DEV-Gated)
**File:** `experimentalRoutes.js`

Experimental routes gated behind `import.meta.env.DEV`:
- `/investor-slideshow` - Demo only
- `/demo-summarizer` - Demo only
- `/food-validator` - Experimental A/B test
- `/batch-food-validator` - Experimental
- `/runx-conquest` - Campaign demo
- `/campaigns/pik3ca-de-risking` - Campaign demo

**Note:** These routes are automatically excluded in production builds.

### **TIER 5: RESEARCH TOOLS**
**File:** `researchRoutes.js`

Advanced research tools with persona protection:
- `/tools` (Armory) - Research tools hub (Researcher-only)
- `/crispr-designer` - CRISPR design (Researcher-only)
- `/protein-synthesis` - Protein analysis (Researcher-only)
- `/structure-predictor` - Structure prediction (Researcher-only)
- `/myeloma-digital-twin` - Myeloma specialty tool
- `/radonc-co-pilot` - RadOnc specialty tool
- `/sporadic-cancer` - Sporadic cancer analysis
- `/threat-assessor` - Threat assessment

**Personas:** Researcher (most), Oncologist + Researcher (specialty tools)

### **TIER 6: LEGACY/UNCLEAR** (Evaluation Needed)
**File:** `legacyRoutes.js`

Routes that may be duplicates or have unclear status:
- `/research` - Legacy route (consider consolidating with `/research-intelligence`)
- `/agent-dashboard` - Legacy (may duplicate `/orchestrator`)
- `/agents` - Unclear vs `/orchestrator`
- `/mutation-explorer` - Legacy genomic analysis tool
- `/genomic-analysis` - Legacy (consider consolidating with `/clinical-genomics`)
- `/validate` - Legacy validation tool

**TODO:** Evaluate these routes and consolidate or remove.

### **DEV-ONLY ROUTES**
**File:** `devRoutes.js`

Routes only available in development mode:
- `/agent-demo/:agentId`
- `/agent-studio`
- `/ayesha-twin-demo`
- `/clinical-dossier-test`
- `/q2c-test`
- `/phase3-demo`
- `/copilot-smoke-test`
- `/copilot-gap-analysis`

---

## ➕ Adding New Routes

### Step 1: Determine Route Category

**Ask yourself:**
- Is this a MOAT core capability? → `moatRoutes.js`
- Is this patient-facing? → `patientRoutes.js`
- Is this a research tool? → `researchRoutes.js`
- Is this experimental? → `experimentalRoutes.js`
- Is this DEV-only? → `devRoutes.js`

### Step 2: Add Route to Appropriate File

**Example: Adding a new MOAT route**

```jsx
// routes/moatRoutes.js
import NewMOATComponent from '../pages/NewMOATComponent';

export const moatRoutes = [
  // ... existing routes ...
  
  <Route 
    key="new-moat-feature" 
    path="/new-moat-feature" 
    element={
      <PersonaRoute allowedPersonas={['oncologist', 'researcher']}>
        <NewMOATComponent />
      </PersonaRoute>
    } 
  />,
];
```

### Step 3: Add Persona Protection (if needed)

**Use `PersonaRoute` for persona-based access:**

```jsx
import PersonaRoute from '../components/auth/PersonaRoute';

<Route 
  path="/my-route" 
  element={
    <PersonaRoute allowedPersonas={['researcher']}>
      <MyComponent />
    </PersonaRoute>
  } 
/>
```

**Use `PatientRoute` for patient-only routes:**

```jsx
import PatientRoute from '../components/auth/PatientRoute';

<Route 
  path="/patient/my-route" 
  element={
    <PatientRoute>
      <MyPatientComponent />
    </PatientRoute>
  } 
/>
```

**Use `ProtectedRoute` for authenticated-only routes:**

```jsx
import ProtectedRoute from '../components/auth/ProtectedRoute';

<Route 
  path="/admin/my-route" 
  element={
    <ProtectedRoute>
      <MyAdminComponent />
    </ProtectedRoute>
  } 
/>
```

### Step 4: DEV-Gate Experimental Routes

**For experimental routes, use the `getExperimentalRoutes()` function:**

```jsx
// routes/experimentalRoutes.js
export const getExperimentalRoutes = () => {
  if (!import.meta.env.DEV) {
    return [];
  }
  
  return [
    // ... existing experimental routes ...
    <Route key="my-experimental-route" path="/my-experimental-route" element={<MyExperimentalComponent />} />,
  ];
};
```

---

## 🔍 Route Organization Best Practices

### 1. **MOAT Routes Come First**
MOAT routes are rendered first (after auth/core) to ensure they take precedence.

### 2. **Specific Routes Before Wildcards**
Routes with specific paths should come before parameterized routes:
```jsx
<Route path="/universal-complete-care" />  // Specific
<Route path="/universal-complete-care/:patientId" />  // Parameterized
```

### 3. **Use Descriptive Keys**
Route keys should be descriptive and unique:
```jsx
<Route key="universal-complete-care" path="/universal-complete-care" />
<Route key="universal-complete-care-patient" path="/universal-complete-care/:patientId" />
```

### 4. **Group Related Routes**
Keep related routes in the same file and group them with comments:
```jsx
// Universal Complete Care - Full orchestration
<Route key="universal-complete-care" ... />
<Route key="universal-complete-care-patient" ... />

// Universal Trial Intelligence - Trial matching
<Route key="universal-trial-intelligence" ... />
```

---

## 🚀 Benefits of This Architecture

1. **Scalable** - Easy to add new routes without cluttering App.jsx
2. **Maintainable** - Routes organized by category and purpose
3. **MOAT-Focused** - MOAT routes clearly separated and prioritized
4. **Type-Safe** - Clear structure makes it easy to find and modify routes
5. **DEV-Safe** - Experimental routes automatically excluded in production
6. **Persona-Protected** - Easy to see and manage persona access controls

---

## 📊 Route Statistics

| Category | Route Count | Status |
|----------|-------------|--------|
| **MOAT Core** | 9 routes | ✅ Production Ready |
| **Patient** | 7 routes | ✅ Production Ready |
| **Core** | 10 routes | ✅ Production Ready |
| **Research** | 8 routes | ✅ Production Ready |
| **Legacy** | 6 routes | ⚠️ Evaluation Needed |
| **Experimental** | 6 routes | 🧪 DEV-Gated |
| **DEV-Only** | 8 routes | 🔧 Development |

**Total:** ~54 routes (excluding DEV-only in production)

---

## 🔄 Migration Notes

**From:** Monolithic App.jsx with all routes inline  
**To:** Modular route files organized by category

**Changes:**
- ✅ All routes moved to modular files
- ✅ MOAT routes clearly identified and prioritized
- ✅ Legacy routes separated for evaluation
- ✅ Experimental routes DEV-gated
- ✅ Persona protection added where missing
- ✅ App.jsx simplified to route aggregation only

---

## 🐛 Troubleshooting

### Route Not Found
1. Check if route is in the correct category file
2. Verify route is exported in `index.js`
3. Check if route is DEV-gated (only available in development)

### Persona Access Denied
1. Check `PersonaRoute` wrapper is correct
2. Verify user has correct persona assigned
3. Check `allowedPersonas` array includes user's persona

### Route Conflicts
1. Ensure specific routes come before parameterized routes
2. Check for duplicate route paths
3. Verify route keys are unique

---

**Last Updated:** January 2025  
**Maintainer:** Development Team
