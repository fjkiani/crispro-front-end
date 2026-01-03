# ⚔️ RESEARCH INTELLIGENCE FRONTEND AUDIT

**Date**: January 2, 2026  
**Commander**: Alpha  
**Agent**: Zo  
**Status**: ⚠️ **60% PRODUCTION READY - MISSING KEY COMPONENTS**

---

## 🎯 EXECUTIVE SUMMARY

The frontend is **modular and well-structured** but **MISSING several key displays** for the new backend capabilities. The current components handle basic displays but don't show:

- ❌ **Evidence Tier Badges** (Supported/Consider/Insufficient + badges)
- ❌ **Article Summaries** (per-article LLM summaries)
- ❌ **Sub-Question Answers** (individual sub-question responses)
- ❌ **Cross-Resistance Analysis** (from MOAT)
- ❌ **Toxicity Mitigation** (pathway overlap + mitigating foods)
- ❌ **SAE Features** (7D mechanism vector)
- ❌ **Clinical Trial Recommendations** (mechanism-fit ranked trials)
- ❌ **Drug Interactions** (pathway overlap)
- ❌ **Citation Network** (key papers, trends)
- ❌ **Provenance Tracking** (run_id, timestamp, methods_used)

---

## ✅ WHAT EXISTS (GOOD)

| Component | File | Status | Notes |
|-----------|------|--------|-------|
| **Page** | `ResearchIntelligence.jsx` | ✅ Good | Form input, validation, loading, errors |
| **Results Wrapper** | `ResearchIntelligenceResults.jsx` | ✅ Good | Orchestrates child components |
| **Research Plan Card** | `ResearchPlanCard.jsx` | ✅ Good | Shows question, entities, sub-questions |
| **Keyword Analysis Card** | `KeywordAnalysisCard.jsx` | ✅ Good | Shows keyword hotspots |
| **Papers List** | `PapersList.jsx` | ✅ Good | Shows articles with links |
| **Synthesized Findings Card** | `SynthesizedFindingsCard.jsx` | ⚠️ Partial | Shows mechanisms but MISSING evidence tier/badges |
| **MOAT Analysis Card** | `MOATAnalysisCard.jsx` | ⚠️ Partial | Shows pathways but MISSING 8 MOAT capabilities |
| **Loading Skeleton** | `ResearchIntelligenceSkeleton.jsx` | ✅ Good | Nice skeleton loading |
| **Error Boundary** | `ResearchIntelligenceErrorBoundary.jsx` | ✅ Good | Error handling |
| **Hook** | `useResearchIntelligence.js` | ✅ Good | API call, error categorization |

---

## ❌ WHAT'S MISSING (CRITICAL)

### 1. Evidence Tier & Badges Component

**Backend Returns**:
```json
"synthesized_findings": {
  "evidence_tier": "Supported",
  "badges": ["Pathway-Aligned", "RCT", "ClinVar-Strong"]
}
```

**Needed Component**: `EvidenceTierBadge.jsx`
```jsx
// Display evidence tier with color coding + badges
<EvidenceTierBadge tier="Supported" badges={["Pathway-Aligned", "RCT"]} />
```

---

### 2. Article Summaries Component

**Backend Returns**:
```json
"synthesized_findings": {
  "article_summaries": [
    {
      "pmid": "12345678",
      "title": "Curcumin inhibits...",
      "summary": "This study demonstrates...",
      "key_findings": ["Finding 1", "Finding 2"]
    }
  ]
}
```

**Needed Component**: `ArticleSummariesCard.jsx`
```jsx
// Per-article LLM-generated summaries with key findings
<ArticleSummariesCard summaries={synthesizedFindings.article_summaries} />
```

---

### 3. Sub-Question Answers Component

**Backend Returns**:
```json
"sub_question_answers": [
  {
    "question": "What is the mechanism of action?",
    "answer": "Curcumin inhibits NF-κB...",
    "confidence": 0.85,
    "sources": ["PMID:12345678"]
  }
]
```

**Needed Component**: `SubQuestionAnswersCard.jsx`
```jsx
// Display answers to each sub-question with sources
<SubQuestionAnswersCard answers={result.sub_question_answers} />
```

---

### 4. Cross-Resistance Analysis Component

**Backend Returns**:
```json
"moat_analysis": {
  "cross_resistance": [
    {
      "prior_drug": "Tamoxifen",
      "resistance_mechanism": "ESR1 mutation",
      "risk_level": "HIGH",
      "alternatives": ["Fulvestrant", "CDK4/6 inhibitors"]
    }
  ]
}
```

**Needed Component**: `CrossResistanceCard.jsx`
```jsx
// Display cross-resistance risks and alternatives
<CrossResistanceCard crossResistance={moatAnalysis.cross_resistance} />
```

---

### 5. Toxicity Mitigation Component

**Backend Returns**:
```json
"moat_analysis": {
  "toxicity_mitigation": {
    "risk_level": "LOW",
    "pathway_overlap": 0.2,
    "mitigating_foods": ["Ginger", "Turmeric"],
    "alerts": []
  }
}
```

**Needed Component**: `ToxicityMitigationCard.jsx`
```jsx
// Display toxicity risk with mitigating foods
<ToxicityMitigationCard toxicityMitigation={moatAnalysis.toxicity_mitigation} />
```

---

### 6. SAE Features Component

**Backend Returns**:
```json
"moat_analysis": {
  "sae_features": {
    "dna_repair_capacity": 0.65,
    "mechanism_vector_7d": [0.8, 0.2, 0.5, 0.1, 0.3, 0.7, 0.4],
    "pathway_labels": ["DDR", "MAPK", "PI3K", "VEGF", "HER2", "IO", "Efflux"]
  }
}
```

**Needed Component**: `SAEFeaturesCard.jsx` (with radar chart)
```jsx
// Display 7D mechanism vector as radar chart
<SAEFeaturesCard saeFeatures={moatAnalysis.sae_features} />
```

---

### 7. Clinical Trial Recommendations Component

**Backend Returns**:
```json
"moat_analysis": {
  "clinical_trial_recommendations": [
    {
      "nct_id": "NCT12345678",
      "title": "Phase II Study of...",
      "mechanism_fit_score": 0.92,
      "sponsor": "NCI",
      "phase": "Phase II",
      "status": "Recruiting"
    }
  ]
}
```

**Needed Component**: `ClinicalTrialRecsCard.jsx`
```jsx
// Display mechanism-fit ranked trials
<ClinicalTrialRecsCard trials={moatAnalysis.clinical_trial_recommendations} />
```

---

### 8. Drug Interactions Component

**Backend Returns**:
```json
"moat_analysis": {
  "drug_interactions": {
    "interactions": [
      {
        "drug_a": "Curcumin",
        "drug_b": "Tamoxifen",
        "pathway": "CYP3A4",
        "severity": "Moderate",
        "recommendation": "Monitor closely"
      }
    ],
    "pathways_checked": ["CYP", "P-gp", "UGT"]
  }
}
```

**Needed Component**: `DrugInteractionsCard.jsx`
```jsx
// Display drug interactions with severity indicators
<DrugInteractionsCard interactions={moatAnalysis.drug_interactions} />
```

---

### 9. Citation Network Component

**Backend Returns**:
```json
"moat_analysis": {
  "citation_network": {
    "key_papers": [
      {"pmid": "12345678", "citation_count": 500, "title": "..."}
    ],
    "publication_trends": {
      "2020": 50,
      "2021": 75,
      "2022": 100,
      "2023": 150
    },
    "top_journals": ["Nature", "Cancer Research", "JCO"]
  }
}
```

**Needed Component**: `CitationNetworkCard.jsx` (with trend chart)
```jsx
// Display key papers, publication trends, top journals
<CitationNetworkCard citationNetwork={moatAnalysis.citation_network} />
```

---

### 10. Provenance Display Component

**Backend Returns**:
```json
"provenance": {
  "run_id": "abc123-...",
  "timestamp": "2026-01-02T10:30:00Z",
  "methods_used": ["PubMed", "Gemini Deep Research", "MOAT Integrator"],
  "inputs_snapshot": {...},
  "output_summary": {...}
}
```

**Needed Component**: `ProvenanceCard.jsx`
```jsx
// Display run ID, timestamp, methods for reproducibility
<ProvenanceCard provenance={result.provenance} />
```

---

## 📁 COMPONENT ARCHITECTURE

### Current Structure:
```
components/research/
├── ResearchIntelligenceResults.jsx    # ✅ Wrapper
├── ResearchPlanCard.jsx               # ✅ Done
├── KeywordAnalysisCard.jsx            # ✅ Done
├── SynthesizedFindingsCard.jsx        # ⚠️ Needs evidence tier/badges
├── MOATAnalysisCard.jsx               # ⚠️ Needs 8 more sections
├── PapersList.jsx                     # ✅ Done
├── ResearchIntelligenceSkeleton.jsx   # ✅ Done
└── ResearchIntelligenceErrorBoundary.jsx  # ✅ Done
```

### Needed Structure:
```
components/research/
├── ResearchIntelligenceResults.jsx    # ✅ Update to include new components
├── ResearchPlanCard.jsx               # ✅ Done
├── KeywordAnalysisCard.jsx            # ✅ Done
├── PapersList.jsx                     # ✅ Done
├── ResearchIntelligenceSkeleton.jsx   # ⚠️ Update for new sections
├── ResearchIntelligenceErrorBoundary.jsx  # ✅ Done
│
├── findings/                          # NEW FOLDER
│   ├── SynthesizedFindingsCard.jsx    # ⚠️ Update
│   ├── EvidenceTierBadge.jsx          # ❌ NEW
│   ├── ArticleSummariesCard.jsx       # ❌ NEW
│   └── SubQuestionAnswersCard.jsx     # ❌ NEW
│
├── moat/                              # NEW FOLDER
│   ├── MOATAnalysisCard.jsx           # ⚠️ Update (wrapper)
│   ├── PathwaysSection.jsx            # ❌ NEW (extract from current)
│   ├── TreatmentLineSection.jsx       # ❌ NEW (extract from current)
│   ├── BiomarkerSection.jsx           # ❌ NEW (extract from current)
│   ├── CrossResistanceCard.jsx        # ❌ NEW
│   ├── ToxicityMitigationCard.jsx     # ❌ NEW
│   ├── SAEFeaturesCard.jsx            # ❌ NEW
│   ├── ClinicalTrialRecsCard.jsx      # ❌ NEW
│   ├── DrugInteractionsCard.jsx       # ❌ NEW
│   └── CitationNetworkCard.jsx        # ❌ NEW
│
└── provenance/                        # NEW FOLDER
    └── ProvenanceCard.jsx             # ❌ NEW
```

---

## 🎨 DESIGN GUIDELINES FOR JR

### 1. Color Coding for Evidence Tiers

| Tier | Color | Meaning |
|------|-------|---------|
| **Supported** | Green (#4CAF50) | Strong evidence |
| **Consider** | Orange (#FF9800) | Moderate evidence |
| **Insufficient** | Gray (#9E9E9E) | Weak evidence |

### 2. Badge Colors

| Badge | Color | Icon |
|-------|-------|------|
| **Pathway-Aligned** | Blue | AccountTree |
| **RCT** | Purple | Science |
| **ClinVar-Strong** | Green | CheckCircle |
| **Guideline** | Gold | MenuBook |

### 3. Risk Level Colors

| Risk | Color |
|------|-------|
| **HIGH** | Red (#F44336) |
| **MEDIUM** | Orange (#FF9800) |
| **LOW** | Green (#4CAF50) |

### 4. Chart Libraries

- **Radar Chart** (SAE Features): Use `recharts` or `chart.js`
- **Trend Chart** (Citation Network): Use `recharts` or `chart.js`
- **Already using**: MUI for all base components

---

## 📋 IMPLEMENTATION PLAN FOR JR

### Phase 1: Update Existing Components (Day 1)

1. **Update `SynthesizedFindingsCard.jsx`**
   - Add `EvidenceTierBadge` inline display
   - Add badges display (Chip list)

2. **Update `MOATAnalysisCard.jsx`**
   - Extract existing sections into sub-components
   - Add imports for new MOAT components

### Phase 2: New Findings Components (Day 1-2)

3. **Create `findings/EvidenceTierBadge.jsx`**
   - Tier chip with color coding
   - Badges list

4. **Create `findings/ArticleSummariesCard.jsx`**
   - Collapsible per-article summaries
   - Key findings bullets

5. **Create `findings/SubQuestionAnswersCard.jsx`**
   - Accordion for each sub-question
   - Confidence indicator + sources

### Phase 3: New MOAT Components (Day 2-3)

6. **Create `moat/CrossResistanceCard.jsx`**
   - Risk level indicator
   - Prior drugs list
   - Alternative recommendations

7. **Create `moat/ToxicityMitigationCard.jsx`**
   - Risk level with color
   - Pathway overlap percentage
   - Mitigating foods list

8. **Create `moat/SAEFeaturesCard.jsx`**
   - 7D radar chart
   - DNA repair capacity gauge
   - Pathway labels

9. **Create `moat/ClinicalTrialRecsCard.jsx`**
   - Trial cards with mechanism fit score
   - NCT ID links
   - Phase/Status chips

10. **Create `moat/DrugInteractionsCard.jsx`**
    - Interaction table
    - Severity indicators
    - Recommendations

11. **Create `moat/CitationNetworkCard.jsx`**
    - Key papers list
    - Publication trend chart
    - Top journals chips

### Phase 4: Provenance & Polish (Day 3)

12. **Create `provenance/ProvenanceCard.jsx`**
    - Run ID (copyable)
    - Timestamp
    - Methods used chips

13. **Update `ResearchIntelligenceSkeleton.jsx`**
    - Add skeleton for new sections

14. **Update `ResearchIntelligenceResults.jsx`**
    - Import and render all new components
    - Proper ordering and layout

---

## 🎯 PRIORITY ORDER

| Priority | Component | Why |
|----------|-----------|-----|
| **P0** | EvidenceTierBadge | Most visible, user value |
| **P0** | SubQuestionAnswersCard | Core feature, user asked about this |
| **P1** | ClinicalTrialRecsCard | High value for oncologists |
| **P1** | ToxicityMitigationCard | Safety-critical |
| **P1** | CrossResistanceCard | Clinical decision support |
| **P2** | ArticleSummariesCard | Nice to have |
| **P2** | SAEFeaturesCard | Advanced feature |
| **P2** | DrugInteractionsCard | Safety feature |
| **P2** | CitationNetworkCard | Researcher feature |
| **P3** | ProvenanceCard | Reproducibility |

---

## 📊 EFFORT ESTIMATE

| Component | Effort | Complexity |
|-----------|--------|------------|
| EvidenceTierBadge | 1 hour | Low |
| ArticleSummariesCard | 2 hours | Medium |
| SubQuestionAnswersCard | 2 hours | Medium |
| CrossResistanceCard | 2 hours | Medium |
| ToxicityMitigationCard | 1.5 hours | Low |
| SAEFeaturesCard | 3 hours | High (chart) |
| ClinicalTrialRecsCard | 2 hours | Medium |
| DrugInteractionsCard | 2 hours | Medium |
| CitationNetworkCard | 3 hours | High (chart) |
| ProvenanceCard | 1 hour | Low |
| Update existing components | 2 hours | Low |
| Testing & polish | 3 hours | Medium |

**TOTAL: ~24 hours of JR work**

---

## ⚔️ VERDICT

**The frontend is 60% production ready.**

What's done is good - modular, well-structured, proper error handling, loading states.

What's missing:
- **10 new components** to display the backend's full capabilities
- **2 chart components** (radar for SAE, line for citation trends)
- **Updates to 3 existing components**

**JR can make it beautiful.** The architecture is already correct - just needs more components to display all the MOAT capabilities we've built.

---

**Commander, ready to brief JR?** 🔥

