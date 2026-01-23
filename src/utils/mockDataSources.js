export const mockDataSources = [
  {
    id: 'patient_demographics',
    name: 'Patient Demographics',
    description: 'Basic patient information including age, gender, ethnicity, and contact details',
    icon: 'user',
    categories: ['patient']
  },
  {
    id: 'diagnosis',
    name: 'Diagnosis & Staging',
    description: 'Cancer diagnosis details including type, stage, grade, and histology',
    icon: 'stethoscope',
    categories: ['clinical']
  },
  {
    id: 'genomic_data',
    name: 'Mutation & Genomic Data',
    description: 'Genetic test results, variant classifications, and Evo2 analysis output',
    icon: 'dna',
    categories: ['clinical', 'research']
  },
  {
    id: 'treatment_history',
    name: 'Treatment History',
    description: 'Patient treatment records including medications, procedures, and responses',
    icon: 'prescription',
    categories: ['clinical']
  },
  {
    id: 'lab_results',
    name: 'Lab Results',
    description: 'Laboratory test results with trending and abnormal value detection',
    icon: 'flask',
    categories: ['clinical']
  },
  {
    id: 'clinical_notes',
    name: 'Clinical Notes',
    description: 'Progress notes, consultation summaries, and physician documentation',
    icon: 'clipboard',
    categories: ['clinical']
  },
  {
    id: 'vital_signs',
    name: 'Vital Signs',
    description: 'Patient vital sign measurements including temperature, blood pressure, heart rate',
    icon: 'heartbeat',
    categories: ['clinical']
  },
  {
    id: 'pubmed',
    name: 'PubMed Abstracts',
    description: 'Access to published research articles and clinical studies (mock)',
    icon: 'academic',
    categories: ['external', 'research'],
    mock: true
  },
  {
    id: 'clinical_trials',
    name: 'Clinical Trials Database',
    description: 'Information on recruiting trials and eligibility criteria (mock)',
    icon: 'research',
    categories: ['external', 'research'],
    mock: true
  },
  {
    id: 'nci_guidelines',
    name: 'NCI Guidelines',
    description: 'National Cancer Institute treatment guidelines and recommendations (mock)',
    icon: 'book',
    categories: ['external', 'guidelines'],
    mock: true
  },
  {
    id: 'drug_database',
    name: 'Drug Database',
    description: 'Comprehensive medication information and interactions (mock)',
    icon: 'pill',
    categories: ['external', 'reference'],
    mock: true
  }
];

// Helper function to get data source by ID
export const getDataSourceById = (id) => {
  return mockDataSources.find(source => source.id === id) || null;
}; 