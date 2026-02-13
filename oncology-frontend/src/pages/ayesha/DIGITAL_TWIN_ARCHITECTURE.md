# AYESHA DIGITAL TWIN - MECHANISTIC BIOLOGY MOAT

**Date:** January 27, 2026  
**Purpose:** Transform Digital Twin from text Q&A → Mechanistic Biology Visualization  
**MOAT:** Show HOW and WHY - the computational pipeline, biological mechanisms, Crispro's unique value  

---

## 🎯 VISION: What is the Digital Twin?

### ❌ NOT This (ChatGPT-style text dump):
```
Q: "Will olaparib work for me?"
A: "Olaparib has 71% confidence because your MBD4 mutation creates synthetic lethality..."
```

### ✅ THIS (Mechanistic Biology Visualization):
```
┌─────────────────────────────────────────────────────────────┐
│ YOUR MUTATIONS → BIOLOGICAL MECHANISM → DRUG PREDICTION     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  MBD4 p.K431Nfs*54                                          │
│      ↓                                                      │
│  [Evo2 Scoring Pipeline]                                    │
│      ↓                                                      │
│  BER Pathway DISABLED                                       │
│      ↓                                                      │
│  [Synthetic Lethality Detection]                            │
│      ↓                                                      │
│  HR Dependency Created                                      │
│      ↓                                                      │
│  [S/P/E Framework]                                          │
│      ↓                                                      │
│  Olaparib 71% Confidence                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧬 DIGITAL TWIN ARCHITECTURE

### Core Principle:
**"Show the biology, not just the answer"**

Every prediction must show:
1. **Input:** Your mutation (genomic coordinates, protein change)
2. **Pipeline:** How we scored it (Evo2, Insights, Fusion)
3. **Biology:** What pathway is disrupted
4. **Mechanism:** Why this creates drug opportunity
5. **Output:** Confidence score with S/P/E breakdown

---

## 📊 MODULAR COMPONENTS

### 1. **Mutation → Evo2 Scoring Visualizer**

**Component:** `MutationScoringPipeline.jsx`

**What it shows:**
```
┌─────────────────────────────────────────────────────────────┐
│ MBD4 p.K431Nfs*54 → Evo2 Scoring                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 1. GENOMIC COORDINATES                                      │
│    chr3:129149435 A>del                                     │
│                                                             │
│ 2. SEQUENCE CONTEXT                                         │
│    [Show 100bp window with mutation highlighted]           │
│                                                             │
│ 3. EVO2 DELTA SCORE                                         │
│    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░ -0.85 (90th percentile)            │
│    Interpretation: SEVERE disruption                        │
│                                                             │
│ 4. PROTEIN IMPACT                                           │
│    Frameshift → Premature stop                              │
│    Loss of DNA glycosylase domain                           │
│                                                             │
│ 5. PATHWAY ASSIGNMENT                                       │
│    MBD4 → BER (Base Excision Repair)                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Data Flow:**
```jsx
<MutationScoringPipeline
  mutation={{
    gene: "MBD4",
    hgvs_p: "p.K431Nfs*54",
    chrom: "3",
    pos: 129149435,
    ref: "A",
    alt: "del"
  }}
  evo2Result={{
    delta: -0.85,
    percentile: 0.90,
    window: "ATCG...ATCG", // 100bp context
    interpretation: "SEVERE"
  }}
  proteinImpact={{
    type: "frameshift",
    domain_lost: "DNA glycosylase",
    functional_consequence: "Complete loss of BER activity"
  }}
/>
```

---

### 2. **Pathway Disruption Visualizer**

**Component:** `PathwayDisruptionMap.jsx`

**What it shows:**
```
┌─────────────────────────────────────────────────────────────┐
│ DNA REPAIR PATHWAYS - Ayesha's Profile                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ BER (Base Excision Repair)                                  │
│ ├─ MBD4 ❌ LOST (frameshift)                                │
│ ├─ OGG1 ✓ INTACT                                            │
│ └─ MUTYH ✓ INTACT                                           │
│ Status: ❌ PATHWAY DISABLED (1/3 genes lost, critical)      │
│                                                             │
│ HR (Homologous Recombination)                               │
│ ├─ BRCA1 ✓ INTACT                                           │
│ ├─ BRCA2 ✓ INTACT                                           │
│ ├─ RAD51C ✓ INTACT                                          │
│ └─ PALB2 ✓ INTACT                                           │
│ Status: ✓ PATHWAY INTACT (tumor depends on this!)          │
│                                                             │
│ TP53 Checkpoint                                             │
│ └─ TP53 ❌ MUTANT (p.R273H)                                 │
│ Status: ❌ CHECKPOINT DISABLED                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Data Flow:**
```jsx
<PathwayDisruptionMap
  pathways={{
    BER: {
      genes: [
        { name: "MBD4", status: "LOST", mutation: "p.K431Nfs*54" },
        { name: "OGG1", status: "INTACT" },
        { name: "MUTYH", status: "INTACT" }
      ],
      pathway_status: "DISABLED",
      critical: true
    },
    HR: {
      genes: [
        { name: "BRCA1", status: "INTACT" },
        { name: "BRCA2", status: "INTACT" }
      ],
      pathway_status: "INTACT",
      dependency: "HIGH" // Tumor depends on this!
    }
  }}
/>
```

---

### 3. **Synthetic Lethality Mechanism Visualizer**

**Component:** `SyntheticLethalityFlow.jsx`

**What it shows:**
```
┌─────────────────────────────────────────────────────────────┐
│ SYNTHETIC LETHALITY DETECTED                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ NORMAL CELL:                                                │
│ ┌─────────┐     ┌─────────┐                                │
│ │   BER   │  +  │   HR    │  =  ✓ DNA REPAIRED             │
│ │ (MBD4)  │     │ (BRCA)  │                                │
│ └─────────┘     └─────────┘                                │
│                                                             │
│ AYESHA'S TUMOR:                                             │
│ ┌─────────┐     ┌─────────┐                                │
│ │   BER   │  +  │   HR    │  =  ⚠️ SURVIVES ON HR          │
│ │  ❌ LOST │     │ ✓ INTACT│                                │
│ └─────────┘     └─────────┘                                │
│                                                             │
│ ADD PARP INHIBITOR:                                         │
│ ┌─────────┐     ┌─────────┐                                │
│ │   BER   │  +  │   HR    │  =  💀 CELL DEATH              │
│ │  ❌ LOST │     │❌BLOCKED│                                │
│ └─────────┘     └─────────┘                                │
│                                                             │
│ MECHANISM:                                                  │
│ • BER loss (MBD4) → Tumor depends on HR                     │
│ • PARP inhibitor → Blocks HR                                │
│ • No BER + No HR → Synthetic Lethality                      │
│                                                             │
│ CONFIDENCE: 71%                                             │
│ ├─ Sequence (S): 90% (severe MBD4 disruption)              │
│ ├─ Pathway (P): 100% (BER→HR dependency confirmed)         │
│ └─ Evidence (E): 0% (MBD4 rare, limited literature)        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Data Flow:**
```jsx
<SyntheticLethalityFlow
  slDetection={{
    detected: true,
    mechanism: "BER_HR_dependency",
    genes_detected: ["MBD4", "TP53"],
    pathway_disruption: {
      BER: 0.0,  // Completely lost
      HR: 1.0    // Intact (tumor depends on this)
    },
    suggested_therapy: "PARP inhibitor",
    confidence_breakdown: {
      sequence: 0.90,
      pathway: 1.00,
      evidence: 0.00
    }
  }}
  drug="olaparib"
  finalConfidence={0.71}
/>
```

---

### 4. **S/P/E Framework Visualizer**

**Component:** `SPEBreakdownCard.jsx`

**What it shows:**
```
┌─────────────────────────────────────────────────────────────┐
│ OLAPARIB - Confidence Breakdown                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ FINAL CONFIDENCE: 71%                                       │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░                                        │
│                                                             │
│ HOW WE CALCULATED THIS:                                     │
│                                                             │
│ 1. SEQUENCE (S) - 35% weight                                │
│    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░ 90%                                 │
│    • MBD4 Evo2 delta: -0.85 (90th percentile)              │
│    • TP53 Evo2 delta: -0.95 (95th percentile)              │
│    • Average: 92.5% → Normalized to 90%                     │
│                                                             │
│ 2. PATHWAY (P) - 35% weight                                 │
│    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100%                                │
│    • MBD4 → BER pathway (weight: 1.0)                       │
│    • BER loss → HR dependency (SL detected)                 │
│    • PARP targets HR → Perfect alignment                    │
│                                                             │
│ 3. EVIDENCE (E) - 30% weight                                │
│    ░░░░░░░░░░░░░░░░░░░░ 0%                                  │
│    • ClinVar: VUS (no strong prior)                         │
│    • Literature: Limited (MBD4 rare)                        │
│    • Clinical trials: None (MBD4 too rare)                  │
│                                                             │
│ CALCULATION:                                                │
│ (0.35 × 0.90) + (0.35 × 1.00) + (0.30 × 0.00)              │
│ = 0.315 + 0.350 + 0.000                                     │
│ = 0.665                                                     │
│                                                             │
│ BOOSTS APPLIED:                                             │
│ + SL Boost: +0.15 (synthetic lethality detected)           │
│ + PathwayAligned badge                                      │
│                                                             │
│ FINAL: 0.665 + 0.15 = 0.815 → Capped at 0.71               │
│ (Confidence cap due to L1 data completeness)               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Data Flow:**
```jsx
<SPEBreakdownCard
  drug="olaparib"
  spe={{
    sequence: {
      score: 0.90,
      weight: 0.35,
      contribution: 0.315,
      details: [
        { gene: "MBD4", delta: -0.85, percentile: 0.90 },
        { gene: "TP53", delta: -0.95, percentile: 0.95 }
      ]
    },
    pathway: {
      score: 1.00,
      weight: 0.35,
      contribution: 0.350,
      details: {
        pathway: "BER",
        alignment: "PERFECT",
        sl_detected: true
      }
    },
    evidence: {
      score: 0.00,
      weight: 0.30,
      contribution: 0.000,
      details: {
        clinvar: "VUS",
        literature: "LIMITED",
        trials: "NONE"
      }
    }
  }}
  boosts={[
    { type: "SL", value: 0.15, reason: "Synthetic lethality detected" }
  ]}
  finalConfidence={0.71}
  confidenceCap={0.71}
  capReason="L1 data completeness"
/>
```

---

### 5. **Treatment Line Integration Visualizer**

**Component:** `TreatmentLineImpact.jsx`

**What it shows:**
```
┌─────────────────────────────────────────────────────────────┐
│ TREATMENT LINE IMPACT - Olaparib                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ FIRST-LINE (Current):                                       │
│ Confidence: 71%                                             │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░                                        │
│ No resistance penalty (treatment-naive)                     │
│                                                             │
│ SECOND-LINE (If platinum fails):                            │
│ Confidence: 63% (-8% penalty)                               │
│ ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░                                        │
│ Penalty: DNA repair pathway cross-resistance                │
│ Reason: Platinum → PARP cross-resistance via DDR            │
│                                                             │
│ THIRD-LINE (If platinum + PARP fail):                       │
│ Confidence: 55% (-16% penalty)                              │
│ ▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░                                        │
│ Penalty: Cumulative resistance                              │
│ Reason: DDR pathway exhausted                               │
│                                                             │
│ MECHANISM:                                                  │
│ • Platinum damages DNA → Selects for DDR upregulation      │
│ • PARP inhibitor targets DDR → Cross-resistance            │
│ • Each line reduces PARP sensitivity                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 6. **Holistic Score Integration**

**Component:** `HolisticMechanismCard.jsx`

**What it shows:**
```
┌─────────────────────────────────────────────────────────────┐
│ HOLISTIC FEASIBILITY - Trial NCT12345678                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ OVERALL SCORE: 78%                                          │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░                                        │
│                                                             │
│ BREAKDOWN:                                                  │
│                                                             │
│ 1. MECHANISM FIT (50% weight): 85%                          │
│    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░                                     │
│    • Drug: Olaparib (PARP inhibitor)                        │
│    • Your biology: MBD4 loss → HR dependency                │
│    • Alignment: PERFECT (SL mechanism)                      │
│                                                             │
│ 2. ELIGIBILITY (30% weight): 70%                            │
│    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░                                     │
│    • Stage IVB: ✓ Eligible                                  │
│    • PD-L1 CPS≥1: ✓ Met (CPS=10)                            │
│    • Prior lines: ✓ Treatment-naive                         │
│                                                             │
│ 3. PGX SAFETY (20% weight): 65%                             │
│    ▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░                                     │
│    • No DPYD variants: ✓ Safe                               │
│    • No UGT1A1 variants: ✓ Safe                             │
│    • TPMT: ⚠️ Intermediate metabolizer                      │
│                                                             │
│ CALCULATION:                                                │
│ (0.50 × 0.85) + (0.30 × 0.70) + (0.20 × 0.65)              │
│ = 0.425 + 0.210 + 0.130                                     │
│ = 0.765 → 78%                                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 DIGITAL TWIN PAGE STRUCTURE

### Main Page: `AyeshaDigitalTwin.jsx`

```jsx
<Container>
  {/* Hero Section */}
  <Box>
    <Typography variant="h3">Your Digital Twin</Typography>
    <Typography variant="body1">
      See the biology behind every prediction
    </Typography>
  </Box>
  
  {/* Section 1: Your Mutations */}
  <MutationScoringPipeline mutations={ayeshaMutations} />
  
  {/* Section 2: Pathway Disruption */}
  <PathwayDisruptionMap pathways={pathwayAnalysis} />
  
  {/* Section 3: Synthetic Lethality */}
  <SyntheticLethalityFlow slDetection={slResult} />
  
  {/* Section 4: Drug Predictions */}
  <Grid container spacing={3}>
    {drugs.map(drug => (
      <Grid item xs={12} md={6}>
        <SPEBreakdownCard drug={drug} />
      </Grid>
    ))}
  </Grid>
  
  {/* Section 5: Treatment Line Impact */}
  <TreatmentLineImpact drugs={drugs} />
  
  {/* Section 6: Trial Matching */}
  <Grid container spacing={3}>
    {trials.map(trial => (
      <Grid item xs={12}>
        <HolisticMechanismCard trial={trial} />
      </Grid>
    ))}
  </Grid>
</Container>
```

---

## 📋 COMPONENT REUSE STRATEGY

### Existing Components to Integrate:

| Component | Location | Use In Digital Twin |
|-----------|----------|---------------------|
| `HolisticScoreCard.jsx` | `components/trials/` | Trial mechanism fit |
| `SyntheticLethalityCard.jsx` | `components/SyntheticLethality/` | SL mechanism flow |
| `TreatmentLineProvenance.jsx` | `components/` | Treatment line impact |
| `SAETreatmentLineChips.jsx` | `components/` | Resistance visualization |
| `PathwayAlignmentCard.jsx` | `components/ddr/` | Pathway disruption |
| `Evo2ScoringCard.jsx` | `components/genomic-analysis/` | Mutation scoring |

---

## 🚀 IMPLEMENTATION PLAN

### Phase 1: Core Mechanism Visualizers (4 hours)
1. Create `MutationScoringPipeline.jsx` (1.5 hours)
2. Create `PathwayDisruptionMap.jsx` (1 hour)
3. Create `SyntheticLethalityFlow.jsx` (1.5 hours)

### Phase 2: S/P/E Integration (3 hours)
1. Create `SPEBreakdownCard.jsx` (2 hours)
2. Integrate with existing drug cards (1 hour)

### Phase 3: Treatment Line + Holistic (3 hours)
1. Create `TreatmentLineImpact.jsx` (1.5 hours)
2. Create `HolisticMechanismCard.jsx` (1.5 hours)

### Phase 4: Main Page Assembly (2 hours)
1. Create `AyeshaDigitalTwin.jsx` (1 hour)
2. Wire all components together (1 hour)

**Total Time:** 12 hours

---

## 🎯 SUCCESS CRITERIA

**Digital Twin is successful when:**
1. ✅ Every prediction shows HOW (computational pipeline)
2. ✅ Every prediction shows WHY (biological mechanism)
3. ✅ User can trace: Mutation → Evo2 → Pathway → SL → Drug
4. ✅ S/P/E breakdown visible for every drug
5. ✅ Treatment line impact shown mechanistically
6. ✅ Trial matching shows mechanism fit, not just eligibility

---

**Status:** 🎯 **READY TO BUILD**  
**Next Step:** Create Phase 1 components (Mutation Scoring, Pathway Disruption, SL Flow)
