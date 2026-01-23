import React from 'react';
import { Link } from 'react-router-dom';
import { aiAgent } from '../assets';

const AgentInsightWidget = ({ patientId }) => {
  // Sample simulated insights - in a real app, these would come from an API call
  const insights = [
    "AI analysis suggests a potential match with 3 clinical trials",
    "Recent labs indicate stable response to current treatment",
    "Medication analysis shows no adverse interactions detected"
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <img src={aiAgent} alt="AI Agent" className="w-6 h-6 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">AI Assistant Insights</h3>
        </div>
        <Link 
          to={patientId ? `/agent-dashboard/${patientId}` : '/agent-dashboard'} 
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View Full Dashboard →
        </Link>
      </div>
      <div className="space-y-2">
        {insights.map((insight, idx) => (
          <div key={idx} className="flex items-start py-1">
            <div className="h-4 w-4 mt-1 mr-2 rounded-full bg-blue-100 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-blue-600"></div>
            </div>
            <p className="text-sm text-gray-600">{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentInsightWidget; 