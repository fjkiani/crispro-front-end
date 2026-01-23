# Analysis History with Supabase Integration

This feature allows you to save and restore previous analysis results, eliminating the need to re-run expensive computations.

## Features

- **Auto-Save**: Automatically saves successful analyses
- **Smart Loading**: Checks for existing analyses before running new ones
- **Manual Save**: Save current analysis with custom names
- **History Management**: View, load, and delete saved analyses
- **Supabase Integration**: Persistent storage across devices/sessions
- **LocalStorage Fallback**: Works without Supabase for development

## Setup Instructions

### 1. Supabase Setup (Optional but Recommended)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Get your project URL and anon key from Settings → API

2. **Run Database Setup**
   - In your Supabase dashboard, go to SQL Editor
   - Run the SQL from `supabase-setup.sql`
   - This creates the `analysis_history` table with proper indexes and security policies

3. **Configure Environment Variables**
   ```bash
   # Copy env.example to .env
   cp env.example .env

   # Edit .env and add your Supabase credentials
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 2. Without Supabase (Development Mode)

If you don't configure Supabase, the system will automatically fall back to localStorage, which:
- Saves analyses in your browser
- Persists across browser sessions
- Is limited to ~5-10MB storage
- Cannot sync across devices

## Usage

### In the Myeloma Digital Twin Page

1. **Run Analysis**: The system automatically saves successful analyses
2. **View History**: Click the 📚 History button to see saved analyses
3. **Load Analysis**: Click on any saved analysis to restore it instantly
4. **Manual Save**: Use the 💾 Save button to save current results with a custom name
5. **Smart Deduplication**: If you run the same analysis parameters, it loads the existing result instead of re-computing

### Analysis Matching

Analyses are matched based on:
- Model ID (evo2_7b, evo2_40b, etc.)
- Mutation set (exact gene + position + change)
- Analysis options (dual compare, use priors, etc.)

This ensures you get the exact same results for identical parameters.

## Database Schema

```sql
CREATE TABLE analysis_history (
    id UUID PRIMARY KEY,
    key TEXT UNIQUE,              -- Hash of analysis parameters
    name TEXT,                    -- Human-readable name
    model_id TEXT,                -- Model used for analysis
    mutations JSONB,              -- Input mutations
    options JSONB,                -- Analysis options
    results JSONB,                -- Analysis results
    timestamp TIMESTAMPTZ,        -- When analysis was run
    metadata JSONB,               -- Additional metadata
    user_id UUID,                 -- For future user auth
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```

## API Reference

### Frontend Services

- `analysisHistoryService.saveAnalysis(analysisData)` - Save analysis
- `analysisHistoryService.loadAnalysis(key)` - Load by key
- `analysisHistoryService.loadAllAnalyses(limit)` - Load all analyses
- `analysisHistoryService.deleteAnalysis(key)` - Delete analysis
- `analysisHistoryService.clearAllAnalyses()` - Clear all

### Context Hooks

```javascript
import { useAnalysisHistory } from '../context/AnalysisHistoryContext';

const {
  savedAnalyses,           // Array of saved analyses
  saveAnalysis,            // Function to save new analysis
  loadAnalysis,            // Function to load analysis
  deleteAnalysis,          // Function to delete analysis
  clearAllAnalyses,        // Function to clear all
  hasAnalysis,             // Check if analysis exists
  getRecentAnalyses        // Get most recent analyses
} = useAnalysisHistory();
```

## Performance Benefits

- **Time Savings**: Skip re-computation of expensive analyses
- **Cost Reduction**: Reduce API calls to ML models
- **User Experience**: Instant results for repeated queries
- **Data Preservation**: Never lose important analysis results

## Troubleshooting

### Save Button Disabled
- Check if you have analysis results
- Ensure results don't contain errors
- Verify browser storage permissions

### Analysis Not Loading
- Check browser console for errors
- Verify Supabase configuration
- Ensure analysis key exists

### Database Errors
- Check Supabase connection
- Verify RLS policies
- Check table permissions

## Future Enhancements

- User authentication integration
- Analysis sharing between users
- Analysis export/import
- Advanced search and filtering
- Analysis comparison tools
