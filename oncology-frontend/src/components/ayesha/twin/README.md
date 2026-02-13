# Ayesha Twin Demo - Modular Architecture

## Overview

The `AyeshaTwinDemo` component has been modularized for scalability and maintainability. The original 513-line monolithic component has been split into:

- **1 Custom Hook** - API calls and state management
- **1 Utility Function** - Data transformation logic
- **7 Reusable Components** - UI sections

## File Structure

```
src/
├── hooks/ayesha/
│   └── useAyeshaTwinDemo.js          # API calls & state management
├── utils/ayesha/
│   └── digitalTwinTransform.js      # Data transformation logic
├── components/ayesha/twin/
│   ├── TwinDemoHeader.jsx           # Header with title & description
│   ├── TwinDemoControls.jsx         # Run demo button & controls
│   ├── PatientProfileCard.jsx       # Case profile display
│   ├── FoodRecommendationsCard.jsx  # Food/supplement recommendations
│   ├── DrugRecommendationsCard.jsx  # Drug efficacy rankings
│   ├── ProvenanceCard.jsx           # Data source & RUO disclaimer
│   ├── DigitalTwinSection.jsx      # MOAT components wrapper
│   └── index.js                     # Clean exports
└── pages/ayesha/
    └── AyeshaTwinDemo.jsx           # Main orchestrator (now ~110 lines)
```

## Component Responsibilities

### Hook: `useAyeshaTwinDemo`
- **Purpose**: Manages API calls and state
- **Returns**: `{ results, loading, error, runDemo, reset }`
- **Location**: `hooks/ayesha/useAyeshaTwinDemo.js`

### Utility: `transformToDigitalTwin`
- **Purpose**: Transforms API response to Digital Twin format
- **Input**: Raw API response object
- **Output**: Formatted digital twin data for MOAT components
- **Location**: `utils/ayesha/digitalTwinTransform.js`

### Components

#### `TwinDemoHeader`
- Displays title and description
- Gradient background styling
- **Props**: None (static content)

#### `TwinDemoControls`
- Run demo button with loading state
- **Props**: `{ onRun, loading }`

#### `PatientProfileCard`
- Displays case data (mutations, biomarkers, treatment history)
- **Props**: `{ caseData }`

#### `FoodRecommendationsCard`
- Displays A→B validated food/supplement recommendations
- Shows verdicts, scores, evidence counts
- **Props**: `{ foodRecommendations, analysisSummary }`

#### `DrugRecommendationsCard`
- Displays WIWFM drug efficacy rankings
- Shows top 5 drugs with efficacy/confidence scores
- **Props**: `{ drugRecommendations }`

#### `ProvenanceCard`
- Displays data source, method, and RUO disclaimer
- **Props**: `{ provenance }`

#### `DigitalTwinSection`
- Wraps MOAT components (MutationScoringPipeline, PathwayDisruptionMap, SyntheticLethalityFlow)
- **Props**: `{ digitalTwinData }`

## Benefits of Modularization

1. **Scalability**: Each component can be enhanced independently
2. **Reusability**: Components can be used in other pages
3. **Testability**: Each piece can be unit tested separately
4. **Maintainability**: Clear separation of concerns
5. **Readability**: Main component is now ~110 lines (vs 513)

## Usage Example

```jsx
import { useAyeshaTwinDemo } from '../../hooks/ayesha/useAyeshaTwinDemo';
import { transformToDigitalTwin } from '../../utils/ayesha/digitalTwinTransform';
import { PatientProfileCard, FoodRecommendationsCard } from '../../components/ayesha/twin';

function MyComponent() {
  const { results, loading, runDemo } = useAyeshaTwinDemo();
  const digitalTwinData = transformToDigitalTwin(results);
  
  return (
    <>
      <PatientProfileCard caseData={results?.case_data} />
      <FoodRecommendationsCard foodRecommendations={results?.food_recommendations} />
    </>
  );
}
```

## Future Enhancements

- Add unit tests for each component
- Extract loading/error states into shared components
- Add prop validation with PropTypes or TypeScript
- Create storybook stories for each component
- Add animation/transition effects
- Implement lazy loading for heavy components
