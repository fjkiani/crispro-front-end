// Mock execution status types
export const EXECUTION_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

// Mock execution results based on agent type/purpose
const mockResultTemplates = {
  // For monitoring agents
  monitoring: {
    title: 'Patient Monitoring Results',
    summary: 'Identified potential issues that may require attention',
    findings: [
      {
        type: 'lab_abnormality',
        priority: 'high',
        description: 'AST/ALT elevated >3x ULN in latest lab results (7/10/2023)',
        recommendation: 'Consider checking for immune-related hepatitis'
      },
      {
        type: 'symptom_mention',
        priority: 'medium',
        description: 'Multiple mentions of "fatigue" in recent clinical notes',
        recommendation: 'Evaluate for treatment side effects or disease progression'
      }
    ],
    recommendation: 'Recommend follow-up appointment within 7 days'
  },
  
  // For research/trial matching agents
  research: {
    title: 'Research & Clinical Trial Matches',
    summary: 'Found 3 potentially relevant clinical trials and 5 recent publications',
    findings: [
      {
        type: 'clinical_trial',
        title: 'Phase II Trial of Novel KRAS G12C Inhibitor in Pancreatic Cancer',
        location: 'Memorial Sloan Kettering Cancer Center',
        distance: '12 miles from patient',
        status: 'Recruiting',
        nctId: 'NCT0000000 (mock)'
      },
      {
        type: 'publication',
        title: 'Advances in Targeting RAS-Driven Cancers with Combination Therapies',
        journal: 'Journal of Clinical Oncology',
        date: 'April 2023',
        doi: '10.XXXX/XXX (mock)'
      }
    ],
    recommendation: 'Consider trial NCT0000000 for patients with KRAS G12C mutations'
  },
  
  // For genomic analysis agents
  genomic: {
    title: 'Genomic Analysis Summary',
    summary: 'Analyzed 3 VUS mutations using Evo2 prediction model',
    findings: [
      {
        type: 'variant_reclassification',
        gene: 'BRCA2',
        variant: 'p.Arg2784Gln',
        previous: 'VUS',
        predicted: 'Likely Pathogenic',
        confidence: '87%',
        action: 'CRISPR guide design available'
      },
      {
        type: 'pathway_analysis',
        pathway: 'DNA Repair',
        status: 'Significantly altered',
        genes_affected: ['BRCA2', 'PALB2', 'RAD51']
      }
    ],
    recommendation: 'Consider genetic counseling referral based on BRCA2 findings'
  },
  
  // Default template
  default: {
    title: 'Agent Execution Results',
    summary: 'Completed analysis based on configured parameters',
    findings: [
      {
        type: 'general_finding',
        description: 'Analysis complete with mock findings',
        details: 'This is a conceptual demonstration of how the agent would work'
      }
    ],
    recommendation: 'No specific recommendations at this time'
  }
};

// Mock execution function that simulates running an agent
export const executeAgent = (agent) => {
  return new Promise((resolve) => {
    // Determine which result template to use based on agent properties
    let resultType = 'default';
    
    // Simple keyword matching to determine agent type
    const agentPurpose = agent.goal.toLowerCase();
    if (agentPurpose.includes('monitor') || agentPurpose.includes('adverse') || agentPurpose.includes('symptom')) {
      resultType = 'monitoring';
    } else if (agentPurpose.includes('trial') || agentPurpose.includes('research') || agentPurpose.includes('publication')) {
      resultType = 'research';
    } else if (agentPurpose.includes('genom') || agentPurpose.includes('mutation') || agentPurpose.includes('variant')) {
      resultType = 'genomic';
    }
    
    // Create a customized result based on the agent properties
    const result = {
      ...mockResultTemplates[resultType],
      agentId: agent.id,
      executionId: `exec-${Date.now()}`,
      timestamp: new Date().toISOString(),
      duration: Math.floor(Math.random() * 5) + 2, // Random duration between 2-7 seconds
    };
    
    // Add a slight delay to simulate processing time
    setTimeout(() => {
      resolve(result);
    }, 2500);
  });
};

// Helper function to generate a execution status message
export const getExecutionStatusMessage = (status) => {
  switch (status) {
    case EXECUTION_STATUS.PENDING:
      return 'Agent execution is queued and waiting to start';
    case EXECUTION_STATUS.RUNNING:
      return 'Agent is currently running and processing data...';
    case EXECUTION_STATUS.COMPLETED:
      return 'Agent execution completed successfully';
    case EXECUTION_STATUS.FAILED:
      return 'Agent execution failed due to an error';
    default:
      return 'Unknown execution status';
  }
}; 