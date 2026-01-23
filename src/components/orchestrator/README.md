# 🎯 MOAT Orchestrator Frontend Components

**Purpose**: Modular frontend components for the MOAT patient care orchestration system  
**Architecture**: Modular, not monolithic - each component is self-contained

---

## 📁 Component Structure

```
orchestrator/
├── Dashboard/
│   ├── OrchestratorDashboard.jsx      # Main dashboard page
│   └── PipelineStatusCard.jsx          # Pipeline status widget
│
├── Patient/
│   ├── PatientUpload.jsx               # File upload component
│   ├── PatientProfileCard.jsx          # Patient summary card
│   └── PatientSummary.jsx               # Detailed patient view
│
├── Analysis/
│   ├── BiomarkerCard.jsx               # Biomarker results
│   ├── ResistanceCard.jsx               # Resistance prediction
│   ├── DrugRankingCard.jsx             # Drug efficacy rankings
│   ├── TrialMatchesCard.jsx            # Clinical trial matches
│   ├── NutritionCard.jsx                # Nutrition recommendations
│   └── SyntheticLethalityCard.jsx       # SL analysis results
│
├── CarePlan/
│   ├── CarePlanViewer.jsx              # Full care plan view
│   ├── CarePlanSection.jsx             # Individual section
│   └── CarePlanExport.jsx              # Export functionality
│
├── Monitoring/
│   ├── MonitoringDashboard.jsx         # Monitoring overview
│   ├── AlertPanel.jsx                  # Alerts display
│   └── BiomarkerChart.jsx              # Biomarker trends
│
└── common/
    ├── LoadingState.jsx                # Loading indicator
    ├── ErrorState.jsx                  # Error display
    └── EmptyState.jsx                  # Empty state
```

---

## 🔌 API Integration

### Service Layer (`src/services/api/orchestrator.ts`)

```typescript
// API client for orchestrator endpoints
export const orchestratorApi = {
  // Run full pipeline
  runPipeline: async (data: PipelineRequest) => Promise<PipelineResponse>,
  
  // Get pipeline status
  getStatus: async (patientId: string) => Promise<StatusResponse>,
  
  // Get patient state
  getState: async (patientId: string) => Promise<PatientState>,
  
  // Process event
  processEvent: async (event: EventRequest) => Promise<EventResponse>,
  
  // Health check
  healthCheck: async () => Promise<HealthResponse>
}
```

---

## 🎣 React Hooks

### `useOrchestrator.ts`

```typescript
export const useOrchestrator = (patientId?: string) => {
  const [state, setState] = useState<PatientState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const runPipeline = async (request: PipelineRequest) => { ... };
  const refreshStatus = async () => { ... };
  
  return { state, loading, error, runPipeline, refreshStatus };
}
```

### `usePatient.ts`

```typescript
export const usePatient = (patientId: string) => {
  // Patient-specific hooks
  const uploadFile = async (file: File, fileType: string) => { ... };
  const updateProfile = async (profile: PatientProfile) => { ... };
  
  return { uploadFile, updateProfile, ... };
}
```

---

## 🎨 Component Principles

1. **Self-Contained**: Each component manages its own state
2. **Reusable**: Components can be used independently
3. **Type-Safe**: TypeScript for all components
4. **Error-Resilient**: Graceful error handling
5. **Loading States**: Proper loading indicators
6. **Accessible**: ARIA labels and keyboard navigation

---

## 📦 Dependencies

- React 18+
- TypeScript
- Material-UI (or your UI library)
- React Query (for data fetching)
- Zustand (for state management - optional)

---

## 🚀 Getting Started

1. Create component structure
2. Set up API service layer
3. Create React hooks
4. Build core components
5. Integrate with existing dashboard

---

**Status**: 🚧 In Progress


