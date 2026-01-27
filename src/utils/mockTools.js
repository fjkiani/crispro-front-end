export const mockTools = [
  {
    id: 'summarizeTextTool',
    name: 'Summarize Text',
    description: 'Condense and extract key points from clinical notes, abstracts, and documentation',
    icon: 'text-summary',
    categories: ['text-analysis']
  },
  {
    id: 'identifyLabTrendTool',
    name: 'Identify Lab Trends',
    description: 'Detect significant changes, patterns, or anomalies in lab result time series',
    icon: 'chart-line',
    categories: ['data-analysis']
  },
  {
    id: 'keywordConceptExtractionTool',
    name: 'Extract Keywords & Concepts',
    description: 'Identify key clinical terms, symptoms, and concepts from free text',
    icon: 'key-words',
    categories: ['text-analysis']
  },
  {
    id: 'evo2VEPAnalysisTool',
    name: 'Evo2 Variant Analysis',
    description: 'Trigger variant effect prediction analysis on genomic data',
    icon: 'dna-analysis',
    categories: ['genomics']
  },
  {
    id: 'crisprGuideDesignLinkerTool',
    name: 'CRISPR Guide Design Linker',
    description: 'Create links to the CRISPR design tools for targetable mutations',
    icon: 'crispr',
    categories: ['genomics', 'therapeutics']
  },
  {
    id: 'generateNotificationDraftTool',
    name: 'Generate Notification Draft',
    description: 'Create alert text based on findings for review before sending',
    icon: 'notification',
    categories: ['communication']
  },
  {
    id: 'searchPubMedTool',
    name: 'Search PubMed',
    description: 'Query PubMed for relevant literature based on clinical parameters (mock)',
    icon: 'search-academic',
    categories: ['research', 'external'],
    mock: true
  },
  {
    id: 'clinicalTrialMatcherTool',
    name: 'Clinical Trial Matcher',
    description: 'Find relevant clinical trials based on patient characteristics (mock)',
    icon: 'trial-match',
    categories: ['research', 'external'],
    mock: true
  },
  {
    id: 'dataValidationTool',
    name: 'Data Validation',
    description: 'Check for completeness of patient data fields and highlight missing information',
    icon: 'check-data',
    categories: ['data-management']
  },
  {
    id: 'scheduleReminderTool',
    name: 'Schedule Reminder',
    description: 'Set up follow-up tasks and reminders for specific events (mock)',
    icon: 'calendar',
    categories: ['workflow'],
    mock: true
  }
];

// Helper function to get tool by ID
export const getToolById = (id) => {
  return mockTools.find(tool => tool.id === id) || null;
}; 