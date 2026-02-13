# AYESHA DASHBOARD - COMPREHENSIVE AUDIT & REDESIGN PLAN

**Date:** January 27, 2026  
**Status:** 🔍 **AUDIT IN PROGRESS**  
**Current URL:** `http://localhost:5173/ayesha-trials`  

---

## 🔍 CURRENT STATE AUDIT

### **What Loads Now:**
- **URL:** `/ayesha-trials`
- **Component:** `AyeshaTrialExplorer.jsx` (948 lines)
- **Problem:** Everything dumped on one page with nested tabs

### **Current Issues:**

1. **❌ No Hierarchy**
   - Everything on one page
   - Nested tabs (easily skipped)
   - No clear entry point

2. **❌ Information Overload**
   - Patient profile hardcoded
   - 7D Pathway Vector
   - Mechanism Intelligence
   - Essential Backup Pathways
   - DDR Status
   - Standard of Care
   - Next Steps
   - Clinical Hints
   - SAE Features
   - All dumped simultaneously

3. **❌ Disconnected Components**
   - Treatment Resistance tab broken
   - SL tab disconnected
   - Duplicate information
   - No modular approach

4. **❌ No Beautiful Dashboard**
   - Not utilizing existing dashboard components
   - Not showing PatientJourneyTimeline
   - Not using PatientJourneyEnhanced

---

## 📋 AVAILABLE RESOURCES

### **Existing Pages:**
```
/pages/ayesha/
├── AyeshaCompleteCare.jsx
├── AyeshaDossierBrowser.jsx
├── AyeshaDossierDetail.jsx
├── AyeshaPatientDashboard.jsx ← EXISTS!
├── AyeshaTherapyFit.jsx
├── AyeshaTrialExplorer.jsx ← CURRENT (dumping ground)
├── AyeshaTrialsOnly.jsx
└── AyeshaTwinDemo.jsx ← NEW (Digital Twin)
```

### **Existing Dashboard Components:**
```
/components/dashboard/
├── command/
├── hallmarks/
├── intelligence/
├── longitudinal/
├── priorities/
└── timeline/
    ├── PatientJourneyTimeline.css
    └── (timeline components)
```

### **Patient Data:**
```
/constants/patients/ayesha_11_17_25.js ← PATIENT PROFILE
```

### **Existing Patient Components:**
```
/components/patient/
└── PatientJourneyEnhanced.css
```

---

## 🎯 REDESIGN STRATEGY

### **Hierarchy:**

```
1. DASHBOARD (Main Entry Point)
   ├── Patient Overview Card
   ├── Journey Timeline
   ├── Quick Stats
   └── Navigation to Modules

2. MODULES (Separate Pages/Tabs)
   ├── Digital Twin (Mechanistic Biology)
   ├── Therapy Fit (Drug Recommendations)
   ├── Clinical Trials (Trial Matching)
   ├── Treatment Plan (SOC + Resistance)
   └── Monitoring (CA-125, Labs)
```

---

## 📊 PROPOSED ARCHITECTURE

### **Phase 1: Create Beautiful Dashboard** (4 hours)

**Goal:** Make `/ayesha` the main entry point with a beautiful dashboard

**Components to Build:**

1. **`AyeshaDashboard.jsx`** (Main Entry Point)
   ```jsx
   <Container>
     {/* Hero Section */}
     <PatientHeroCard patient={AYESHA_11_17_25_PROFILE} />
     
     {/* Journey Timeline */}
     <PatientJourneyTimeline patient={AYESHA_11_17_25_PROFILE} />
     
     {/* Quick Stats Grid */}
     <Grid container spacing={3}>
       <Grid item xs={12} md={3}>
         <StageCard stage="IVB" />
       </Grid>
       <Grid item xs={12} md={3}>
         <CA125Card value={2842} />
       </Grid>
       <Grid item xs={12} md={3}>
         <GermlineCard status="Positive (MBD4)" />
       </Grid>
       <Grid item xs={12} md={3}>
         <PDL1Card cps={10} />
       </Grid>
     </Grid>
     
     {/* Module Navigation Cards */}
     <Grid container spacing={3}>
       <Grid item xs={12} md={6}>
         <ModuleCard
           title="Digital Twin"
           description="See the biology behind every prediction"
           icon={<ScienceIcon />}
           link="/ayesha/digital-twin"
         />
       </Grid>
       <Grid item xs={12} md={6}>
         <ModuleCard
           title="Therapy Fit"
           description="Personalized drug recommendations"
           icon={<LocalHospitalIcon />}
           link="/ayesha/therapy-fit"
         />
       </Grid>
       <Grid item xs={12} md={6}>
         <ModuleCard
           title="Clinical Trials"
           description="Precision trial matching"
           icon={<ArticleIcon />}
           link="/ayesha/trials"
         />
       </Grid>
       <Grid item xs={12} md={6}>
         <ModuleCard
           title="Treatment Plan"
           description="Standard of care + resistance playbook"
           icon={<TimelineIcon />}
           link="/ayesha/treatment-plan"
         />
       </Grid>
     </Grid>
   </Container>
   ```

2. **`PatientHeroCard.jsx`** (Patient Overview)
   ```jsx
   <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
     <CardContent>
       <Typography variant="h4" color="white">
         Ayesha's Care Dashboard
       </Typography>
       <Typography variant="body1" color="rgba(255,255,255,0.9)">
         Stage IVB HGSOC • Germline MBD4 • PD-L1+ (CPS 10)
       </Typography>
       <Box display="flex" gap={1} mt={2}>
         <Chip label="First-Line" color="primary" />
         <Chip label="PARP Eligible" color="success" />
         <Chip label="IO Candidate" color="info" />
       </Box>
     </CardContent>
   </Card>
   ```

3. **`ModuleCard.jsx`** (Navigation Cards)
   ```jsx
   <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }} onClick={() => navigate(link)}>
     <CardContent>
       <Box display="flex" alignItems="center" gap={2}>
         {icon}
         <Box>
           <Typography variant="h6">{title}</Typography>
           <Typography variant="body2" color="text.secondary">{description}</Typography>
         </Box>
       </Box>
     </CardContent>
   </Card>
   ```

---

### **Phase 2: Modularize Existing Content** (6 hours)

**Goal:** Break down `AyeshaTrialExplorer.jsx` into focused modules

**Modules to Create:**

1. **`/ayesha/digital-twin`** ✅ DONE
   - Mutation Scoring Pipeline
   - Pathway Disruption Map
   - Synthetic Lethality Flow

2. **`/ayesha/therapy-fit`** ✅ EXISTS
   - Drug recommendations with S/P/E
   - Confidence scores
   - Pathway alignment

3. **`/ayesha/trials`** (Refactor existing)
   - Remove patient profile (on dashboard)
   - Remove mechanism intelligence (move to digital twin)
   - Focus ONLY on trial matching
   - Show top 10 trials with reasoning

4. **`/ayesha/treatment-plan`** (NEW)
   - Standard of Care recommendation
   - Resistance playbook
   - Next test recommendations
   - Treatment timeline

5. **`/ayesha/monitoring`** (NEW)
   - CA-125 tracking
   - Lab values
   - Response monitoring

---

### **Phase 3: Sidebar Navigation** (2 hours)

**Goal:** Create clean sidebar navigation (no nested tabs)

**Sidebar Structure:**
```
Ayesha's Dashboard
├── 🏠 Dashboard (Main)
├── 🧬 Digital Twin
├── 💊 Therapy Fit
├── 🔬 Clinical Trials
├── 📋 Treatment Plan
└── 📊 Monitoring
```

---

## 🚀 IMPLEMENTATION PLAN

### **Sprint 1: Dashboard Foundation** (4 hours)

**Tasks:**
1. Create `AyeshaDashboard.jsx` (2 hours)
2. Create `PatientHeroCard.jsx` (30 min)
3. Create `ModuleCard.jsx` (30 min)
4. Wire patient data from `ayesha_11_17_25.js` (1 hour)

**Deliverable:** Beautiful dashboard at `/ayesha`

---

### **Sprint 2: Refactor Trials Page** (3 hours)

**Tasks:**
1. Remove patient profile from `AyeshaTrialExplorer.jsx` (30 min)
2. Remove mechanism intelligence (move to digital twin) (1 hour)
3. Remove SOC recommendation (move to treatment plan) (30 min)
4. Focus on trial matching ONLY (1 hour)

**Deliverable:** Clean trials page at `/ayesha/trials`

---

### **Sprint 3: Treatment Plan Module** (3 hours)

**Tasks:**
1. Create `AyeshaTreatmentPlan.jsx` (1.5 hours)
2. Move SOC recommendation (30 min)
3. Move resistance playbook (30 min)
4. Move next test recommendations (30 min)

**Deliverable:** Treatment plan page at `/ayesha/treatment-plan`

---

### **Sprint 4: Sidebar Navigation** (2 hours)

**Tasks:**
1. Create sidebar component (1 hour)
2. Wire navigation (30 min)
3. Remove nested tabs (30 min)

**Deliverable:** Clean sidebar navigation

---

## 📋 ACCEPTANCE CRITERIA

**Dashboard Complete When:**
- ✅ `/ayesha` loads beautiful dashboard
- ✅ Patient hero card displays
- ✅ Journey timeline displays
- ✅ Quick stats grid displays
- ✅ Module navigation cards display
- ✅ No information overload

**Trials Page Complete When:**
- ✅ Patient profile removed (on dashboard)
- ✅ Mechanism intelligence removed (on digital twin)
- ✅ SOC removed (on treatment plan)
- ✅ Focuses ONLY on trial matching
- ✅ Clean, focused UI

**Navigation Complete When:**
- ✅ Sidebar shows all modules
- ✅ No nested tabs
- ✅ Clear hierarchy
- ✅ Easy to navigate

---

## 🎯 SUCCESS METRICS

**Before:**
- 1 page with everything dumped
- Nested tabs
- Information overload
- No clear entry point

**After:**
- Beautiful dashboard entry point
- 6 focused modules
- Clean sidebar navigation
- Clear hierarchy
- Modular, component-based approach

---

**Status:** 🎯 **AUDIT COMPLETE - READY TO EXECUTE**  
**Next Step:** Execute Sprint 1 (Dashboard Foundation)  
**Time to Ship:** 12 hours total (4 sprints × 3 hours avg)
