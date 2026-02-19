# DIGITAL TWIN - QUICK INTEGRATION GUIDE

**Goal:** Wire Phase 1 components into existing `AyeshaTwinDemo.jsx`  
**Time:** 1-2 hours  
**Status:** 🎯 READY TO EXECUTE  

---

## 🎯 INTEGRATION STRATEGY

### Current State: `AyeshaTwinDemo.jsx`
- Shows text-based Q&A interface
- Calls `/api/ayesha/twin-demo` endpoint
- Returns food validator + drug efficacy results

### Target State: Digital Twin with MOAT Components
- Replace text with visual biology
- Show mutation scoring pipeline
- Show pathway disruption
- Show SL mechanism
- Keep existing API calls

---

## 📋 STEP-BY-STEP INTEGRATION

### Step 1: Import New Components (5 min)

**File:** `pages/ayesha/AyeshaTwinDemo.jsx`

```jsx
// Add these imports at the top
import MutationScoringPipeline from '../../components/ayesha/MutationScoringPipeline';
import PathwayDisruptionMap from '../../components/ayesha/PathwayDisruptionMap';
import SyntheticLethalityFlow from '../../components/ayesha/SyntheticLethalityFlow';
```

---

### Step 2: Transform API Response (15 min)

**Add data transformation function:**

```jsx
function transformToDigitalTwinData(apiResponse) {
  // Extract Ayesha's mutations
  const mbd4Mutation = {
    gene: "MBD4",
    hgvs_p: "p.K431Nfs*54",
    chrom: "3",
    pos: 129149435,
    ref: "A",
    alt: ""
  };
  
  // Mock Evo2 result (replace with actual API data when available)
  const evo2Result = {
    delta: -0.85,
    percentile: 0.90,
    interpretation: "SEVERE"
  };
  
  // Protein impact
  const proteinImpact = {
    type: "frameshift",
    domain_lost: "DNA glycosylase",
    functional_consequence: "Complete loss of BER activity"
  };
  
  // Pathway assignment
  const pathwayAssignment = {
    pathway: "BER",
    full_name: "Base Excision Repair",
    weight: 1.0,
    description: "Repairs G:T mismatches from cytosine deamination"
  };
  
  // Pathway disruption
  const pathways = {
    BER: {
      name: "BER",
      full_name: "Base Excision Repair",
      genes: [
        { name: "MBD4", status: "LOST", mutation: "p.K431Nfs*54" },
        { name: "OGG1", status: "INTACT" },
        { name: "MUTYH", status: "INTACT" }
      ],
      pathway_status: "DISABLED",
      critical: true
    },
    HR: {
      name: "HR",
      full_name: "Homologous Recombination",
      genes: [
        { name: "BRCA1", status: "INTACT" },
        { name: "BRCA2", status: "INTACT" },
        { name: "RAD51C", status: "INTACT" },
        { name: "PALB2", status: "INTACT" }
      ],
      pathway_status: "INTACT",
      dependency: "HIGH"
    },
    TP53: {
      name: "TP53 Checkpoint",
      genes: [
        { name: "TP53", status: "MUTANT", mutation: "p.R273H" }
      ],
      pathway_status: "DISABLED",
      critical: true
    }
  };
  
  // SL detection (extract from API response if available)
  const slDetection = {
    detected: true,
    mechanism: "BER_HR_dependency",
    genes_detected: ["MBD4", "TP53"],
    pathway_disruption: {
      BER: 0.0,
      HR: 1.0
    },
    suggested_therapy: "PARP inhibitor",
    confidence_breakdown: {
      sequence: 0.90,
      pathway: 1.00,
      evidence: 0.00
    }
  };
  
  return {
    mutation: mbd4Mutation,
    evo2Result,
    proteinImpact,
    pathwayAssignment,
    pathways,
    slDetection,
    finalConfidence: 0.71
  };
}
```

---

### Step 3: Add Components to Render (30 min)

**Replace text-based results with visual components:**

```jsx
function AyeshaTwinDemo() {
  const [demoData, setDemoData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const runDemo = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_ROOT}/api/ayesha/twin-demo`, {
        method: 'POST'
      });
      const data = await response.json();
      
      // Transform to Digital Twin format
      const twinData = transformToDigitalTwinData(data);
      setDemoData(twinData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h3" gutterBottom>
          Ayesha's Digital Twin
        </Typography>
        <Typography variant="body1" color="text.secondary">
          See the biology behind every prediction
        </Typography>
      </Box>
      
      {/* Run Demo Button */}
      <Button 
        variant="contained" 
        size="large" 
        onClick={runDemo}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} /> : <Science />}
      >
        {loading ? 'Running Analysis...' : 'Run Digital Twin Analysis'}
      </Button>
      
      {/* Results */}
      {demoData && (
        <Box mt={4}>
          {/* Section 1: Mutation Scoring */}
          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            1. How We Score Your Mutations
          </Typography>
          <MutationScoringPipeline
            mutation={demoData.mutation}
            evo2Result={demoData.evo2Result}
            proteinImpact={demoData.proteinImpact}
            pathwayAssignment={demoData.pathwayAssignment}
          />
          
          {/* Section 2: Pathway Disruption */}
          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            2. Your Pathway Disruption Map
          </Typography>
          <PathwayDisruptionMap
            pathways={demoData.pathways}
            patientName="Your"
          />
          
          {/* Section 3: Synthetic Lethality */}
          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            3. Why PARP Inhibitors Work For You
          </Typography>
          <SyntheticLethalityFlow
            slDetection={demoData.slDetection}
            drug="Olaparib"
            finalConfidence={demoData.finalConfidence}
          />
        </Box>
      )}
    </Container>
  );
}
```

---

### Step 4: Test Integration (15 min)

1. **Start frontend:**
   ```bash
   cd oncology-frontend
   npm run dev
   ```

2. **Navigate to:** `http://localhost:5173/ayesha/twin-demo`

3. **Click "Run Digital Twin Analysis"**

4. **Verify:**
   - ✅ Mutation Scoring Pipeline displays
   - ✅ Pathway Disruption Map displays
   - ✅ Synthetic Lethality Flow displays
   - ✅ All accordions expand/collapse
   - ✅ No console errors

---

## 🔧 BACKEND API ENHANCEMENT (Optional)

### If you want to wire real data from backend:

**Create endpoint:** `POST /api/ayesha/digital-twin`

```python
@router.post("/api/ayesha/digital-twin")
async def get_ayesha_digital_twin():
    """Get Digital Twin data with mutation scoring, pathway analysis, and SL detection"""
    
    # Call existing services
    efficacy_result = await call_efficacy_predict(...)
    sl_result = await call_synthetic_lethality(...)
    
    # Add Evo2 scoring (if not already included)
    evo2_result = await call_evo2_score(
        chrom="3",
        pos=129149435,
        ref="A",
        alt=""
    )
    
    return {
        "mutation": {
            "gene": "MBD4",
            "hgvs_p": "p.K431Nfs*54",
            "chrom": "3",
            "pos": 129149435,
            "ref": "A",
            "alt": ""
        },
        "evo2_result": {
            "delta": evo2_result.get("delta"),
            "percentile": evo2_result.get("percentile"),
            "interpretation": "SEVERE" if evo2_result.get("percentile", 0) >= 0.9 else "MODERATE"
        },
        "protein_impact": {
            "type": "frameshift",
            "domain_lost": "DNA glycosylase",
            "functional_consequence": "Complete loss of BER activity"
        },
        "pathway_assignment": {
            "pathway": "BER",
            "full_name": "Base Excision Repair",
            "weight": 1.0,
            "description": "Repairs G:T mismatches from cytosine deamination"
        },
        "pathways": {
            "BER": {...},
            "HR": {...},
            "TP53": {...}
        },
        "sl_detection": sl_result,
        "final_confidence": efficacy_result.get("drugs", [{}])[0].get("confidence", 0.71)
    }
```

---

## 📋 ACCEPTANCE CRITERIA

**Integration Complete When:**
- [ ] Components imported into AyeshaTwinDemo.jsx
- [ ] Data transformation function added
- [ ] Components render in correct order
- [ ] All 3 sections display (Mutation, Pathway, SL)
- [ ] No console errors
- [ ] Mobile responsive

---

## 🎯 NEXT STEPS

**After Integration:**
1. **Phase 2:** Add S/P/E Breakdown Card
2. **Phase 3:** Add Treatment Line Impact
3. **Phase 4:** Add Holistic Mechanism Card
4. **Phase 5:** Create full AyeshaDigitalTwin.jsx page

---

**Status:** 🎯 **READY TO INTEGRATE**  
**Time:** 1-2 hours  
**Blocker:** None - components are ready
