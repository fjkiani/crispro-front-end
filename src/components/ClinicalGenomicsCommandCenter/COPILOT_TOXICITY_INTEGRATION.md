# ⚔️ COPILOT TOXICITY & OFF-TARGET INTEGRATION MAP

**Mission**: Show how P1 Real Backends (Toxicity + Off-Target) integrate with CoPilot AI assistant

---

## 🎯 WHERE TOXICITY & OFF-TARGET FIT IN COPILOT

### **CURRENT COPILOT ARCHITECTURE**

```
ClinicalGenomicsCommandCenter
├── CoPilot Integration (Already Built) ✅
│   ├── useClinicalGenomicsCoPilot() hook
│   ├── Quick Actions (4 existing)
│   │   ├── "Why this ACMG classification?"
│   │   ├── "Drug interactions?"
│   │   ├── "Explain resistance?"
│   │   └── "Find trials?"
│   └── Suggested Questions (context-aware)
│
└── Mechanistic Evidence Tab (NEW - P1) ✅
    ├── Efficacy Card (S/P/E)
    ├── Toxicity Risk Card ← NEW!
    ├── Off-Target Preview Card ← NEW!
    ├── Evidence Band
    └── KG Context Card
```

---

## 🔥 NEW COPILOT QUICK ACTIONS (TO ADD)

### **5. "Why is this toxic?" 🩺**
- **Trigger**: Toxicity risk score > 0.3
- **Opens CoPilot with**: 
  ```
  "Why does this patient have a {risk_level} toxicity risk for {drug_moa}? 
  Explain the germline pharmacogene variants and pathway overlaps."
  ```
- **Context Provided to CoPilot**:
  - Germline variants detected (e.g., DPYD, TPMT)
  - Drug MoA (e.g., platinum_agent, anthracycline)
  - Toxicity pathway overlaps (e.g., DNA_REPAIR_PATHWAY, INFLAMMATION_PATHWAY)
  - Risk factors with weights and confidence
- **Value**: Understand germline PGx implications in plain language

### **6. "Design safer guides?" 🧬**
- **Trigger**: Off-target preview shows moderate/high risk guides
- **Opens CoPilot with**: 
  ```
  "These CRISPR guides have {risk_level} off-target risk. 
  How can I optimize GC content and avoid homopolymers for {gene} targeting?"
  ```
- **Context Provided to CoPilot**:
  - Guide sequences with GC%, homopolymer status
  - Target gene and PAM sites
  - Heuristic safety scores
- **Value**: Get actionable design recommendations

### **7. "Alternative therapies?" 💊**
- **Trigger**: High toxicity risk (>0.5) AND efficacy result available
- **Opens CoPilot with**: 
  ```
  "Given the high toxicity risk for {drug_moa} due to {germline_variants}, 
  what alternative therapies should I consider for {disease} with {gene} mutation?"
  ```
- **Context Provided to CoPilot**:
  - Toxicity factors (germline + pathway overlap)
  - Efficacy ranking for all drugs
  - Disease context and current drugs
- **Value**: Risk-benefit analysis for therapy selection

---

## 💬 NEW COPILOT SUGGESTED QUESTIONS

### **When Toxicity Result Available**
1. "How should I adjust dosing for this pharmacogene variant?"
2. "What monitoring should I recommend given this toxicity risk?"
3. "Are there drug-drug interactions that could worsen toxicity?"
4. "What biomarkers should I check before starting this therapy?"

### **When Off-Target Preview Available**
1. "What genome regions are most at risk for off-target edits?"
2. "How do I validate these guides experimentally?"
3. "What delivery methods reduce off-target effects?"
4. "Should I use a different PAM sequence?"

### **When Both Toxicity & Efficacy Available**
1. "What's the therapeutic window for this patient?"
2. "How do I balance efficacy vs. toxicity risk?"
3. "Should I consider combination therapy instead?"
4. "What supportive care can mitigate toxicity?"

---

## 🔧 IMPLEMENTATION PLAN

### **Phase 1: Add Quick Actions (30 min)**

**File**: `integrations/ClinicalGenomicsCoPilotIntegration.jsx`

**Add 3 new methods to `useClinicalGenomicsCoPilot()`**:

```javascript
// Quick action: Ask about toxicity
const askAboutToxicity = () => {
  if (!results.toxicity || results.toxicity.risk_score < 0.3) return;
  
  const risk_level = results.toxicity.risk_score >= 0.7 ? 'high' : 
                     results.toxicity.risk_score >= 0.5 ? 'moderate' : 'low';
  
  const factors = results.toxicity.factors
    .map(f => f.detail)
    .join(', ');
  
  const question = `Why does this patient have a ${risk_level} toxicity risk for ${results.toxicity.candidate_moa || 'this therapy'}? Explain: ${factors}`;
  
  setIsOpen(true);
  setChatHistory(prev => [...prev, {
    role: 'user',
    content: question,
    timestamp: new Date().toISOString(),
    context: {
      toxicity_factors: results.toxicity.factors,
      risk_score: results.toxicity.risk_score,
      germline_variants: patientProfile.germline_variants
    }
  }]);
};

// Quick action: Ask about guide design
const askAboutGuideDesign = () => {
  if (!results.offtarget || !results.offtarget.guides) return;
  
  const risky_guides = results.offtarget.guides.filter(g => g.heuristic_score < 0.7);
  
  if (risky_guides.length === 0) return;
  
  const question = `These CRISPR guides have ${risky_guides.length > 1 ? 'moderate/high' : 'moderate'} off-target risk (GC: ${risky_guides.map(g => (g.gc_content * 100).toFixed(0) + '%').join(', ')}). How can I optimize for ${variant.gene} targeting?`;
  
  setIsOpen(true);
  setChatHistory(prev => [...prev, {
    role: 'user',
    content: question,
    timestamp: new Date().toISOString(),
    context: {
      guides: risky_guides,
      target_gene: variant.gene
    }
  }]);
};

// Quick action: Ask about alternatives
const askAboutAlternatives = () => {
  if (!results.toxicity || !results.efficacy) return;
  if (results.toxicity.risk_score < 0.5) return;
  
  const top_drug = results.efficacy.drugs?.[0];
  
  const question = `Given the high toxicity risk (${(results.toxicity.risk_score * 100).toFixed(0)}%) for ${top_drug?.name || 'this therapy'} due to ${results.toxicity.factors.map(f => f.type).join(' + ')}, what alternative therapies should I consider for ${patientProfile.cancer_type || 'this disease'} with ${variant.gene} mutation?`;
  
  setIsOpen(true);
  setChatHistory(prev => [...prev, {
    role: 'user',
    content: question,
    timestamp: new Date().toISOString(),
    context: {
      toxicity_factors: results.toxicity.factors,
      efficacy_ranking: results.efficacy.drugs,
      disease: patientProfile.cancer_type,
      variant: variant
    }
  }]);
};
```

**Update `getSuggestedQuestions()`**:

```javascript
// Add toxicity questions
if (results.toxicity) {
  if (results.toxicity.risk_score >= 0.5) {
    questions.push(
      `How should I adjust dosing for these pharmacogene variants?`,
      `What monitoring should I recommend given this toxicity risk?`
    );
  }
  if (results.toxicity.factors.some(f => f.type === 'germline')) {
    questions.push(
      `Are there drug-drug interactions that could worsen toxicity?`
    );
  }
}

// Add off-target questions
if (results.offtarget) {
  const risky = results.offtarget.guides?.filter(g => g.heuristic_score < 0.7);
  if (risky && risky.length > 0) {
    questions.push(
      `What genome regions are most at risk for off-target edits?`,
      `How do I validate these guides experimentally?`
    );
  }
}

// Add combined efficacy + toxicity questions
if (results.toxicity && results.efficacy) {
  questions.push(
    `What's the therapeutic window for this patient?`,
    `How do I balance efficacy vs. toxicity risk?`
  );
}
```

---

### **Phase 2: Update Quick Actions Component (15 min)**

**File**: `integrations/ClinicalGenomicsCoPilotIntegration.jsx`

**Add toxicity/off-target chips to `<ClinicalGenomicsQuickActions />`**:

```javascript
export const ClinicalGenomicsQuickActions = ({ results, variant, patientProfile }) => {
  const copilot = useClinicalGenomicsCoPilot();
  
  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
      {/* Existing actions */}
      {results.acmg && (
        <Chip 
          label="Why this ACMG classification?" 
          onClick={copilot.askAboutACMG}
          icon={<HelpOutlineIcon />}
          color="primary"
          variant="outlined"
        />
      )}
      
      {/* NEW: Toxicity action */}
      {results.toxicity && results.toxicity.risk_score >= 0.3 && (
        <Chip 
          label="Why is this toxic?" 
          onClick={copilot.askAboutToxicity}
          icon={<WarningIcon />}
          color={results.toxicity.risk_score >= 0.7 ? 'error' : 'warning'}
          variant="outlined"
        />
      )}
      
      {/* NEW: Off-target action */}
      {results.offtarget?.guides?.some(g => g.heuristic_score < 0.7) && (
        <Chip 
          label="Design safer guides?" 
          onClick={copilot.askAboutGuideDesign}
          icon={<ScienceIcon />}
          color="secondary"
          variant="outlined"
        />
      )}
      
      {/* NEW: Alternatives action */}
      {results.toxicity && results.efficacy && results.toxicity.risk_score >= 0.5 && (
        <Chip 
          label="Alternative therapies?" 
          onClick={copilot.askAboutAlternatives}
          icon={<LocalHospitalIcon />}
          color="info"
          variant="outlined"
        />
      )}
      
      {/* Always visible CoPilot opener */}
      {variant.gene && (
        <Chip 
          label="Open Co-Pilot →" 
          onClick={copilot.openCoPilot}
          icon={<ChatIcon />}
          color="primary"
        />
      )}
    </Box>
  );
};
```

---

### **Phase 3: Wire into Mechanistic Evidence Tab (10 min)**

**File**: `tabs/MechanisticEvidenceTab.jsx`

**Add Quick Actions after "Run Deep Analysis" button**:

```javascript
import { ClinicalGenomicsQuickActions } from '../integrations/ClinicalGenomicsCoPilotIntegration';

// Inside MechanisticEvidenceTab component, after results display:
{result && (
  <Box>
    {/* CoPilot Quick Actions */}
    <ClinicalGenomicsQuickActions 
      results={{
        efficacy: result,
        toxicity: toxicityResult,
        offtarget: offTargetResult
      }}
      variant={variant}
      patientProfile={patientProfile}
    />
    
    {/* Existing cards */}
    <EvidenceBand result={result} />
    <EfficacyCard result={result} />
    <ToxicityRiskCard result={toxicityResult} loading={toxicityLoading} error={toxicityError} />
    <OffTargetPreviewCard result={offTargetResult} loading={offTargetLoading} error={offTargetError} />
  </Box>
)}
```

---

## 🎯 EXPECTED USER FLOW

### **Scenario 1: High Toxicity Risk Detected**

1. User enters variant + patient profile
2. Clicks "Run Deep Analysis"
3. Toxicity risk returns `risk_score: 0.7` (high) due to DPYD variant
4. **CoPilot Quick Action appears**: "Why is this toxic?" (red chip)
5. User clicks chip → CoPilot opens with pre-filled question:
   ```
   "Why does this patient have a high toxicity risk for platinum_agent? 
   Explain: Germline variant in pharmacogene DPYD (affects drug metabolism)"
   ```
6. CoPilot responds with plain-language explanation + dosing recommendations

### **Scenario 2: Risky CRISPR Guides**

1. User enters target gene (e.g., BRAF)
2. System generates guides with off-target preview
3. One guide has `heuristic_score: 0.6` (moderate risk, high GC 75%)
4. **CoPilot Quick Action appears**: "Design safer guides?" (yellow chip)
5. User clicks chip → CoPilot opens with:
   ```
   "These CRISPR guides have moderate off-target risk (GC: 75%). 
   How can I optimize for BRAF targeting?"
   ```
6. CoPilot suggests: "Reduce GC to 50-60% range, avoid homopolymers >3bp, consider alternative PAM sites"

### **Scenario 3: Efficacy vs. Toxicity Tradeoff**

1. User has efficacy results (top drug: platinum_agent, efficacy 0.8)
2. Toxicity results show `risk_score: 0.6` (moderate, DPYD variant)
3. **CoPilot Quick Action appears**: "Alternative therapies?" (blue chip)
4. User clicks chip → CoPilot opens with:
   ```
   "Given the high toxicity risk (60%) for platinum_agent due to germline variants, 
   what alternative therapies should I consider for ovarian cancer with BRCA1 mutation?"
   ```
5. CoPilot suggests: "Consider PARP inhibitors (efficacy 0.75, lower toxicity risk), monitor renal function closely if proceeding with platinum"

---

## ✅ COMPLETION CHECKLIST

- [ ] **Phase 1**: Add 3 new methods to `useClinicalGenomicsCoPilot()` (30 min)
  - [ ] `askAboutToxicity()`
  - [ ] `askAboutGuideDesign()`
  - [ ] `askAboutAlternatives()`
  - [ ] Update `getSuggestedQuestions()` with toxicity/off-target questions

- [ ] **Phase 2**: Update `<ClinicalGenomicsQuickActions />` (15 min)
  - [ ] Add "Why is this toxic?" chip (conditional on risk_score >= 0.3)
  - [ ] Add "Design safer guides?" chip (conditional on risky guides)
  - [ ] Add "Alternative therapies?" chip (conditional on high toxicity + efficacy)

- [ ] **Phase 3**: Wire into `MechanisticEvidenceTab` (10 min)
  - [ ] Import `ClinicalGenomicsQuickActions`
  - [ ] Pass `results` object with `{ efficacy, toxicity, offtarget }`
  - [ ] Position after "Run Deep Analysis" button, before cards

- [ ] **Phase 4**: Test integration (15 min)
  - [ ] Verify chips appear when conditions met
  - [ ] Verify CoPilot opens with pre-filled questions
  - [ ] Verify context is passed correctly to CoPilot

**Total Time**: ~70 minutes (~1 hour)

---

## 🔥 STRATEGIC VALUE

### **For Users**
- **Contextual Help**: CoPilot knows their toxicity/off-target results
- **Actionable Guidance**: Not just "high risk" but "here's what to do"
- **Risk-Benefit Analysis**: Integrated efficacy + toxicity + off-target reasoning

### **For Platform**
- **Sticky Feature**: Users return for AI-assisted decision support
- **Data Loop**: CoPilot interactions reveal user pain points
- **Differentiation**: No other platform has toxicity-aware CRISPR CoPilot

### **For Demos**
- **Wow Factor**: "Ask me about this toxicity risk" → instant explanation
- **Trust Building**: Transparent provenance + AI reasoning
- **Flow Demonstration**: Single-page from variant → analysis → CoPilot → decision

---

## ⚔️ CONCLUSION

**Toxicity & Off-Target fit perfectly into the CoPilot ecosystem as:**
1. **Context providers** for AI-assisted decision making
2. **Trigger points** for smart quick actions
3. **Question generators** for suggested follow-ups
4. **Risk-benefit calculators** when combined with efficacy

**The integration is ~1 hour of work and unlocks massive user value!** 🔥

---

**Commander Alpha**, should I proceed with the 1-hour CoPilot integration to complete the conquest? 💀⚔️

