-- Supabase Analysis History Table Setup
-- Run this SQL in your Supabase SQL Editor

-- Create analysis_history table
CREATE TABLE analysis_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    model_id TEXT NOT NULL,
    mutations JSONB NOT NULL,
    options JSONB NOT NULL,
    results JSONB NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    user_id UUID, -- For future user authentication
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_analysis_history_key ON analysis_history(key);
CREATE INDEX idx_analysis_history_timestamp ON analysis_history(timestamp DESC);
CREATE INDEX idx_analysis_history_model_id ON analysis_history(model_id);
CREATE INDEX idx_analysis_history_user_id ON analysis_history(user_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own analyses (when user_id is implemented)
CREATE POLICY "Users can only access their own analyses" ON analysis_history
    FOR ALL USING (
        user_id IS NULL OR -- Allow anonymous access for now
        auth.uid() = user_id
    );

-- Policy: Allow inserts for authenticated users or anonymous for now
CREATE POLICY "Allow analysis creation" ON analysis_history
    FOR INSERT WITH CHECK (
        user_id IS NULL OR -- Allow anonymous access for now
        auth.uid() = user_id
    );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_analysis_history_updated_at
    BEFORE UPDATE ON analysis_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
