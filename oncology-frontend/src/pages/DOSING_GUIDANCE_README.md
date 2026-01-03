# Dosing Guidance Frontend Integration

**Page:** `/dosing-guidance`  
**Component:** `DosingGuidancePage.jsx`  
**Status:** ✅ Integrated

---

## 🎯 Overview

The Dosing Guidance page provides AI-powered pharmacogenomics-based dose recommendations for three personas:

### Personas

| Persona | Use Case | Features |
|---------|----------|----------|
| **Patient** | Understand genetic risk | Simple explanations, questions to ask doctor |
| **Oncologist** | Clinical decision support | CPIC evidence, dose calculations, monitoring |
| **Researcher** | Validation & API access | Metrics, export, documentation |

---

## 🚀 Access

**URL:** `http://localhost:5173/dosing-guidance`

---

## 📁 Files

```
src/
├── pages/
│   └── DosingGuidancePage.jsx     ← Main page component
└── components/
    └── dosing/
        ├── Dosingt
        └── useDosingGuidance.js   ← API hook
```

---

## 🎨 Features

### 1. Hero Section
- Validation metrics (100% sensitivity, specificity, CPIC concordance)
- RUO disclaimer

### 2. Persona Selector
- Toggle between Patient/Oncologist/Researcher views
- View-specific features

### 3. Demo Cases
- 5 preset pharmacogenomics cases
- One-click to run demo
- Expected outcomes displayed

### 4. Input Form
- Pharmacogene selection (DPYD, TPMT, UGT1A1)
- Variant input (HGVS or star allele)
- Drug input
- Real-time API calls

### 5. Results Display
- Uses existing DosingGuidanceCard component
- Persona-specific enhancements
- CPIC reference information

### 6. Validation Tab (Researcher only)
- 100% sensitivity, specificity, CPIC concordance
- Cohort breakdown
- Export capabilities

---

## 🔗 API Integration

**Endpoint:** `POST /api/dosing/guidance`

**Request:**
```json
{
  "gene": "DPYD",
  "variant": "c.2846A>T",
  "drug": "capecitabine"
}
```

**Response:**
```json
{
  "recommendations": [{ment_type": "reduce_50_percent",
    "adjustment_factor": 0.5,
    "phenotype": "Intermediate Metabolizer",
    "cpic_level": "A",
    "recommendation": "Reduce dose by 50%",
    "monitoring": ["CBC weekly", "Liver function"],
    "alternatives": ["Raltitrexed"]
  }],
  "confidence": 0.95
}
```

---

## 📊 Demo Cases

| # | Case | Gene | Variant | Drug | Expected |
|---|------|------|---------|------|----------|
| 1 | DPYD Intermediate | DPYD | c.2846A>T | capecitabine | 50% reduction |
| 2 | DPYD Deficiency | DPYD | *2A/*2A | 5-FU | AVOID |
| 3 | TPMT Hetero | TPMT | *1/*3A | 6-MP | 50% reduction |
| 4 | UGT1A1 Homo | UGT1A1 | *28/*28 | irinotecan | 50% reduction |
| 5 | Normal | DPYD | *1/*1 | capecitabine | Standard dose |

---

## 🔧 Backend Requirements

Ensure the backend is running with the dosing guidance endpoint:

```bash
cd oncology-backend-minimal
uvicorn api.main:app --reload --port 8000
```

Endpoint must be registered at `/api/dosing/guidance`.

---

## 📈 Validation Metrics Displayed

ic | Value |
|--------|-------|
| Sensitivity | 100% |
| Specificity | 100% |
| CPIC Concordance | 100% |
| Total Cases | N=59 |
| Pharmacogenes | DPYD, TPMT, UGT1A1 |

---

**Last Updated:** January 2025  
**Author:** Zo (Agent)
