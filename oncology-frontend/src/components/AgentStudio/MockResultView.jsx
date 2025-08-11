import React from 'react';

// Priority to color mapping for visualization
const getPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Type to icon mapping (mock icon names)
const getTypeIcon = (type) => {
  switch (type) {
    case 'lab_abnormality':
      return '🧪';
    case 'symptom_mention':
      return '📝';
    case 'clinical_trial':
      return '🔬';
    case 'publication':
      return '📚';
    case 'variant_reclassification':
      return '🧬';
    case 'pathway_analysis':
      return '🔄';
    default:
      return '📋';
  }
};

const MockResultView = ({ result }) => {
  if (!result) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-bold text-gray-800">{result.title}</h3>
        <div className="text-xs text-gray-500">
          {new Date(result.timestamp).toLocaleString()}
          <span className="ml-2">({result.duration}s)</span>
        </div>
      </div>
      
      <p className="text-sm text-gray-700 mb-4">{result.summary}</p>
      
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Findings:</h4>
        <div className="space-y-2">
          {result.findings.map((finding, index) => (
            <div 
              key={index} 
              className={`border rounded-md p-3 ${getPriorityColor(finding.priority)}`}
            >
              <div className="flex items-start">
                <span className="text-lg mr-2">{getTypeIcon(finding.type)}</span>
                <div>
                  <p className="font-medium text-sm">
                    {finding.title || finding.description}
                  </p>
                  {finding.description && finding.title && (
                    <p className="text-xs mt-1">{finding.description}</p>
                  )}
                  
                  {/* Variant-specific details */}
                  {finding.type === 'variant_reclassification' && (
                    <div className="text-xs mt-1">
                      <span className="font-medium">{finding.gene} {finding.variant}</span>: 
                      <span className="line-through mx-1">{finding.previous}</span> → 
                      <span className="font-bold ml-1">{finding.predicted}</span>
                      <span className="ml-2">({finding.confidence} confidence)</span>
                    </div>
                  )}
                  
                  {/* Clinical trial details */}
                  {finding.type === 'clinical_trial' && (
                    <div className="text-xs mt-1">
                      <div>{finding.location}</div>
                      <div className="flex justify-between">
                        <span>{finding.status}</span>
                        <span>{finding.distance}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Publication details */}
                  {finding.type === 'publication' && (
                    <div className="text-xs mt-1">
                      <div>{finding.journal} • {finding.date}</div>
                    </div>
                  )}
                  
                  {/* Pathway analysis */}
                  {finding.type === 'pathway_analysis' && (
                    <div className="text-xs mt-1">
                      <div>Affected genes: {finding.genes_affected.join(', ')}</div>
                    </div>
                  )}
                  
                  {/* Recommendation if available */}
                  {finding.recommendation && (
                    <div className="text-xs mt-2 font-medium">
                      Suggestion: {finding.recommendation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Overall Recommendation:</h4>
        <div className="bg-purple-50 text-purple-800 p-3 rounded-md text-sm">
          {result.recommendation}
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500 italic text-center">
        This is a simulated result for demonstration purposes only
      </div>
    </div>
  );
};

export default MockResultView;