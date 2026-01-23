import React from 'react';
import { Bot, FileText } from 'lucide-react';
import './AgentResponseDisplay.css';
import ReactMarkdown from 'react-markdown';

const LoadingSpinner = () => (
  <div className="spinner-container">
    <div className="spinner"></div>
  </div>
);

const AgentResponseDisplay = ({ data, title }) => {
  if (data === 'loading') {
    return (
      <div className="agent-response-container loading">
        <div className="response-header">
          <Bot className="response-icon" />
          <h3 className="response-title">{title}</h3>
        </div>
        <LoadingSpinner />
        <p className="loading-text">Agent is analyzing...</p>
      </div>
    );
  }

  if (!data) {
    return null; // Don't render anything if there's no data and it's not loading
  }

  // Handle various data structures from different agents
  const summary = data.summary;
  let content = '';

  if (data.output?.answer_text) { // For DataAnalysisAgent
    content = data.output.answer_text;
  } else if (data.output?.content) { // A generic content field
    content = data.output.content;
  } else if (data.output?.details) { // For GenomicAnalystAgent
    // Handle both old and new detail structures
    content = data.output.details.map(d => {
      if (d.name && d.value) {
        // New structure with name/value pairs
        return `**${d.name}**: ${d.value}`;
      } else if (d.gene_symbol && d.clinical_significance_context) {
        // Old structure with gene_symbol and context
        return `**${d.gene_symbol || 'Variant'}**: ${d.clinical_significance_context}`;
      } else {
        // Fallback for other structures
        return `**Detail**: ${JSON.stringify(d)}`;
      }
    }).join('\\n\\n');
  } else if (data.error) {
    content = `**Error:** ${data.error}`;
  } else if (typeof data === 'string') {
    content = data;
  }

  return (
    <div className="agent-response-container">
      <div className="response-header">
        <Bot className="response-icon" />
        <h3 className="response-title">{title}</h3>
      </div>
      <div className="response-content">
        {summary && <p className="response-summary"><strong>Summary:</strong> {summary}</p>}
        {content && (
          <div className="response-details">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
        {!summary && !content && <p>The agent returned a response, but it could not be displayed.</p>}
      </div>
    </div>
  );
};

export default AgentResponseDisplay; 