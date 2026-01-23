# Persona-Based Access Control - Quick Start Guide

**Last Updated:** 2025-01-XX  
**Status:** ✅ **MOAT-ALIGNED** - Finalized based on MOAT Frontend Integration Guide

## Overview

The platform now supports **3 personas** with different access levels aligned with MOAT Orchestration System capabilities:

1. **Patient** - Limited access to personal data and patient-facing features (no MOAT orchestrator access)
2. **Oncologist** - Clinical tools, patient management, treatment planning, MOAT complete care access
3. **R&D / Researcher** - Full access to all research tools, features, and MOAT orchestrator dashboard

## Implementation Status

✅ **Completed:**
- PersonaContext with access matrix
- PersonaRoute component for route protection
- usePersonaAccess hook for component-level checks
- Database migration script
- Integration into App.jsx

## Usage Examples

### 1. Protecting Routes

```jsx
import PersonaRoute from './components/auth/PersonaRoute';

// Only researchers can access
<Route 
  path="/tools" 
  element={
    <PersonaRoute allowedPersonas={['researcher']}>
      <Armory />
    </PersonaRoute>
  } 
/>

// Patients and oncologists can access
<Route 
  path="/patient/profile" 
  element={
    <PersonaRoute allowedPersonas={['patient', 'oncologist']}>
      <PatientProfile />
    </PersonaRoute>
  } 
/>
```

### 2. Component-Level Access Control

```jsx
import { usePersonaAccess } from '../hooks/usePersonaAccess';

function MyComponent() {
  const { canAccess, persona, isResearcher } = usePersonaAccess();
  
  // Check page access
  if (!canAccess('/tools')) {
    return <AccessDenied />;
  }
  
  // Check feature access
  if (!canAccessFeature('crispr_design')) {
    return <UpgradePrompt />;
  }
  
  // Use persona flags
  if (isResearcher) {
    return <AdvancedFeatures />;
  }
  
  return <BasicFeatures />;
}
```

### 3. Conditional Rendering

```jsx
import { usePersona } from '../context/PersonaContext';

function Navigation() {
  const { persona, hasFeatureAccess } = usePersona();
  
  return (
    <nav>
      <Link to="/home">Home</Link>
      
      {hasFeatureAccess('clinical_tools') && (
        <Link to="/clinical-genomics">Clinical Genomics</Link>
      )}
      
      {persona === 'researcher' && (
        <Link to="/tools">Research Tools</Link>
      )}
    </nav>
  );
}
```

## Database Setup

Run the migration script to add persona field:

```bash
# Connect to your Supabase database and run:
psql -h your-db-host -U your-user -d your-database -f scripts/migrations/add_persona_field.sql
```

Or via Supabase SQL Editor:
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `add_persona_field.sql`
3. Run the migration

## Access Matrix (MOAT-Aligned)

### Research Intelligence Routes & Features (NEW!)

> **Recently Implemented:** Full Research Intelligence framework with persona-specific views, dossier generation, query persistence, and value synthesis.

#### **Patient** 👤
**Research Intelligence:**
- ✅ `/research-intelligence` - Research queries with **patient-friendly language**
- ✅ `query_history` - View own past research queries
- ✅ `dossier_view` - View dossiers generated for them
- ✅ `patient_language` - Technical terms translated to friendly language
- ❌ `dossier_generation` - Cannot generate new dossiers (oncologist/researcher)
- ❌ `raw_research_data` - Cannot see raw technical research data

#### **Oncologist** 🏥
**Research Intelligence:**
- ✅ `/research-intelligence` - Full research orchestration
- ✅ `query_history` - View/reload past queries
- ✅ `dossier_generation` - Generate patient dossiers
- ✅ `dossier_export` - Export dossiers as PDF/Markdown
- ✅ `value_synthesis` - LLM-synthesized insights
- ✅ `multi_portal_research` - Deep research across portals (PubMed, ClinicalTrials, etc.)

#### **Researcher** 🔬
**Research Intelligence:**
- ✅ `*` - All research intelligence features
- ✅ `raw_research_data` - Access to raw API responses
- ✅ `debug_mode` - Research pipeline debugging

---

### MOAT-Specific Routes & Features

#### **Patient** 👤
**Pages:**
- ✅ `/ayesha-complete-care` - Patient-specific care plan (Ayesha project)
- ✅ `/ayesha-trials` - Patient-specific trial matching
- ✅ `/research-intelligence` - Research queries (patient-friendly view)
- ❌ `/universal-complete-care` - MOAT complete care (oncologist/researcher only)
- ❌ `/universal-trial-intelligence` - MOAT trial matching (oncologist/researcher only)
- ❌ `/orchestrator` - Orchestrator dashboard (researcher only)

**Features:**
- ✅ `view_own_care_plan` - View own care plan output (Ayesha pages)
- ✅ `view_own_trials` - View matched trials (Ayesha pages)
- ✅ `basic_drug_efficacy` - Basic drug efficacy viewing
- ✅ `query_history` - View own research queries
- ❌ `orchestrator_pipeline` - Cannot run MOAT orchestrator
- ❌ `file_upload` - Cannot upload patient files
- ❌ `status_polling` - Cannot poll orchestrator status
- ❌ `mechanism_fit` - Cannot access mechanism fit ranking

#### **Oncologist** 🏥
**Pages:**
- ✅ `/universal-complete-care` - Complete care plan (full clinical access)
- ✅ `/universal-trial-intelligence` - Trial matching (full clinical access)
- ✅ `/research-intelligence` - Research orchestration (full clinical access)
- ❌ `/orchestrator` - Orchestrator dashboard (researcher only)

**Features:**
- ✅ `view_patient_profiles` - Access all patient profiles
- ✅ `orchestrator_pipeline` - Run orchestrator via complete care page
- ✅ `file_upload` - Upload patient NGS reports
- ✅ `status_polling` - Poll orchestrator status
- ✅ `resistance_playbook` - View resistance playbook recommendations
- ✅ `sae_features` - View SAE features (DNA repair capacity, mechanism vectors)
- ✅ `mechanism_fit` - View mechanism fit ranking for trials
- ✅ `trial_matching` - Full trial matching capabilities (Cohere embeddings)
- ✅ `nutrition_planning` - View nutrition recommendations
- ✅ `synthetic_lethality` - View synthetic lethality analysis
- ✅ `dossier_generation` - Generate research dossiers
- ✅ `value_synthesis` - LLM-synthesized actionable insights
- ❌ `orchestrator_dashboard` - Cannot access researcher dashboard
- ❌ `advanced_analysis` - Limited advanced research features

#### **Researcher** 🔬
**Pages:**
- ✅ `/universal-complete-care` - Complete care plan (full access)
- ✅ `/universal-trial-intelligence` - Trial matching (full access)
- ✅ `/orchestrator` - Orchestrator dashboard (full researcher access)
- ✅ `/research-intelligence` - Research orchestration (full access + debug)

**Features:**
- ✅ `*` - All features and pages
- ✅ `orchestrator_dashboard` - Full orchestrator dashboard access
- ✅ `orchestrator_pipeline` - Run orchestrator with full configuration
- ✅ `file_upload` - Upload patient files
- ✅ `status_polling` - Poll orchestrator status
- ✅ `advanced_analysis` - All advanced research features
- ✅ `mechanism_fit` - Mechanism fit ranking
- ✅ `sae_features` - SAE feature analysis
- ✅ `resistance_playbook` - Resistance playbook
- ✅ `synthetic_lethality` - Synthetic lethality analysis
- ✅ `agent_configuration` - Configure orchestrator agents
- ✅ `skip_agents` - Skip specific agents in pipeline
- ✅ `raw_research_data` - Access raw API responses
- ✅ `debug_mode` - Research pipeline debugging

### Quick Reference:

**Patient:**
- ✅ Own profile, care plans, trials, resistance, nutrition (read-only)
- ✅ MOAT complete care page (read-only view)
- ❌ Orchestrator dashboard, file upload, advanced analysis

**Oncologist:**
- ✅ Patient management, clinical tools, treatment planning
- ✅ MOAT complete care page (full clinical access)
- ✅ Trial matching, resistance playbook, SAE features
- ❌ Orchestrator dashboard (research tools)

**Researcher:**
- ✅ All features and pages
- ✅ MOAT orchestrator dashboard (full access)
- ✅ All advanced research and analysis tools

## MOAT Integration Status

✅ **Completed:**
- MOAT routes added to `PERSONA_ACCESS` matrix
- MOAT-specific features defined (orchestrator_pipeline, file_upload, status_polling, etc.)
- `/universal-complete-care` route added to App.jsx with persona protection
- `/universal-trial-intelligence` route protected with persona access
- `/orchestrator` route protected (researcher only)

## Next Steps

1. **Run Database Migration** - Add persona field to user_profiles
2. **Update User Profiles** - Set persona for existing users
3. **Backend Validation** - Add persona checks to `/api/orchestrate/full` endpoint
4. **Component-Level Guards** - Add persona checks to MOAT-specific components
5. **UI Updates** - Show/hide MOAT features based on persona (file upload, orchestrator controls)

---

## 🔧 PLUMBER AGENT: Modularization Tasks

### Task 1: Split App.jsx Routes into Modules

**Goal:** Create modular route files for maintainability

```
/src/routes/
  ├── index.js              # Main route aggregator
  ├── authRoutes.js         # /login, /signup, /admin/*
  ├── patientRoutes.js      # /patient/*, /ayesha-*
  ├── moatRoutes.js         # /universal-*, /orchestrator, /research-intelligence
  ├── researchRoutes.js     # /clinical-genomics, /synthetic-lethality, etc.
  └── devRoutes.js          # DEV-only routes
```

**Pattern:**
```jsx
// routes/moatRoutes.js
import PersonaRoute from '../components/auth/PersonaRoute';

export const moatRoutes = [
  { 
    path: '/universal-complete-care', 
    element: <PersonaRoute allowedPersonas={['oncologist', 'researcher']}><UniversalCompleteCare /></PersonaRoute>
  },
  { 
    path: '/orchestrator', 
    element: <PersonaRoute allowedPersonas={['researcher']}><OrchestratorDashboard /></PersonaRoute>
  },
  // ...
];

// Usage in App.jsx:
{moatRoutes.map(route => (
  <Route key={route.path} path={route.path} element={route.element} />
))}
```

### Task 2: DEV-Gate These Routes

Wrap in `{import.meta.env.DEV && ...}`:
- `/investor-slideshow`
- `/demo-summarizer`
- `/food-validator`
- `/batch-food-validator`
- `/runx-conquest`
- `/campaigns/pik3ca-de-risking`

### Task 3: Add Persona Protection to These Routes

| Route | Personas |
|-------|----------|
| `/protein-synthesis` | researcher |
| `/structure-predictor` | researcher |
| `/metastasis` | oncologist, researcher |
| `/clinical-genomics` | oncologist, researcher |
| `/sporadic-cancer` | oncologist, researcher |
| `/myeloma-digital-twin` | oncologist, researcher |

### Task 4: Evaluate for Consolidation

| Route Pair | Question |
|------------|----------|
| `/research` vs `/research-intelligence` | Same purpose? Consolidate? |
| `/agent-dashboard` vs `/orchestrator` | Legacy duplicate? |
| `/ayesha-dossiers` vs `/universal-dossiers` | Patient vs Clinical view? |

---

## 🤖 CoPilot Status

**Current State:** PLACEHOLDER ONLY

The CoPilot component shows "Modular Architecture Test - Success!" but has no actual functionality.

**What Exists:**
- Q2C Router with 12 intent patterns (`Q2CRouter/intents.js`)
- Hooks for integration (`useAnalysisCoPilot`, `useCoPilotIntegration`, etc.)
- Integration components for Myeloma, RadOnc, Chemo guidance

**What's Missing:**
- Chat interface not connected to Q2C Router
- No natural language navigation
- No proactive insights display

**Recommendation:** Wire up CoPilot to Q2C Router for conversational navigation across all MOAT capabilities.

## Testing

Test each persona:
1. Create test users with different personas
2. Verify access to allowed pages
3. Verify denial of restricted pages
4. Check feature flags work correctly

## Support

For questions or issues, refer to:
- `.cursor/rules/PERSONA_ACCESS_CONTROL.md` - Full documentation
- `src/context/PersonaContext.jsx` - Implementation details
- `src/components/auth/PersonaRoute.jsx` - Route guard component


---

## 💊 PGx SAFETY GATE - PERSONA ACCESS

### NEW: PGx Features Access Matrix

#### **Patient** 👤
**PGx Features:**
- ✅ `view_pgx_results` - View own PGx screening results (read-only)
- ✅ `view_pgx_alerts` - View HIGH/MODERATE risk alerts for drugs
- ❌ `upload_germline_vcf` - Cannot upload germline VCF files (oncologist/researcher only)
- ❌ `configure_pgx_screening` - Cannot configure PGx screening parameters

#### **Oncologist** 🏥
**PGx Features:**
- ✅ `view_pgx_results` - View PGx screening for any patient
- ✅ `view_pgx_alerts` - View and act on HIGH/MODERATE risk alerts
- ✅ `upload_germline_vcf` - Upload patient germline VCF files
- ✅ `pgx_dose_adjustments` - View CPIC-based dose recommendations
- ✅ `trial_pgx_safety` - View trial-level PGx safety status
- ❌ `configure_pgx_screening` - Cannot modify PGx screening rules
PGx Features:**
- ✅ All PGx features and pages
- ✅ `configure_pgx_screening` - Modify PGx screening parameters
- ✅ `pgx_validation_reports` - Access validation reports and receipts
- ✅ `pgx_cohort_analysis` - Analyze PGx across patient cohorts

### PGx Routes Added

| Route | Patient | Oncologist | Researcher |
|-------|---------|------------|------------|
| `/pgx/screen` | ❌ | ✅ | ✅ |
| `/pgx/dose-guidance` | ✅ (own) | ✅ | ✅ |
| `/pgx/validation` | ❌ | ❌ | ✅ |

### PGx UI Components Access

| Component | Patient | Oncologist | Researcher |
|-----------|---------|------------|------------|
| SafetyGateCard | ✅ (view only) | ✅ | ✅ |
| TrialSafetyGate | ✅ (view only) | ✅ | ✅ |
| DosingGuidanceCard | ✅ (view only) | ✅ | ✅ |
| PGx Toggle (Sporadic) | ❌ | ✅ | ✅ |
| VCF Upload Button | ❌ | ✅ | ✅ |

### Implementation Notes

**SporadicContext.jsx** now includes:
- `pgxEnabled` state - Toggle PGx screening on/off
- `germlineVariants` state - Store extracted PGgle PGx

**EfficacyModal.jsx** now includes:
- Conditional rendering of SafetyGateCard based on PGx data
- Composite score display when PGx is applied
- Drug ranking by composite score when PGx enabled

### Example Persona Check for PGx

```jsx
import { usePersonaAccess } from '../hooks/usePersonaAccess';

function PGxControls() {
  const { canAccessFeature, isOncologist, isResearcher } = usePersonaAccess();
  
  // Only show PGx toggle for oncologist/researcher
  if (!canAccessFeature('upload_germline_vcf')) {
    return null;
  }
  
  return (
    <FormControlLabel
      control={<Switch checked={pgxEnabled} onChange={togglePgx} />}
      label="Enable PGx Screening"
    />
  );
}
```
