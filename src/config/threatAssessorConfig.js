export const threatAssessorConfig = {
  toolId: 'threat-assessor',
  title: '⚔️ Threat Assessor',
  subtitle: 'Proprietary Triumvirate Protocol for rapid variant evaluation.',
  progressSteps: [
    { id: 'input', label: 'Define Threats' },
    { id: 'assessment', label: 'Run Assessment' },
    { id: 'results', label: 'View Report' }
  ],
  inputSections: [
    { 
      id: 'first_hit', 
      title: 'First Hit Analysis',
      fields: [
        { "id": "gene_symbol_1", "label": "Gene Symbol (First Hit)", "type": "text", "defaultValue": "RUNX1" },
        { "id": "protein_change_1", "label": "Protein Change (Optional)", "type": "text", "defaultValue": "p.Arg135fs" }
      ],
      action: {
        buttonText: 'Assess First Hit',
        apiCall: {
          endpoint: '/workflow/assess_threat',
          payload: {
            "gene_symbol": "{gene_symbol_1}",
            "protein_change": "{protein_change_1}"
          }
        }
      }
    },
    { 
      id: 'second_hit',
      title: 'Second Hit Analysis',
      fields: [
        { "id": "gene_symbol_2", "label": "Gene Symbol (Second Hit)", "type": "text", "defaultValue": "ASXL1" },
        { "id": "protein_change_2", "label": "Protein Change (Optional)", "type": "text", "defaultValue": "p.G646fs*12" }
      ],
      action: {
        buttonText: 'Assess Second Hit',
        apiCall: {
          endpoint: '/workflow/assess_threat',
          payload: {
            "gene_symbol": "{gene_symbol_2}",
            "protein_change": "{protein_change_2}"
          }
        }
      }
    }
  ],
  resultsComponent: 'ThreatAssessmentDisplay'
}; 