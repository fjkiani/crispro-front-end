import React from 'react';
import PropTypes from 'prop-types';
import { BeakerIcon } from '@heroicons/react/24/solid'; // Example using Heroicons
import './HereditaryRiskReport.css';

const HereditaryRiskReport = ({ riskData, onAnalyze, isLoading }) => {
  if (!riskData || !riskData.findings || riskData.findings.length === 0) {
    return (
      <div className="risk-report-container">
        <h4>Hereditary Risk Analysis</h4>
        <p>No significant hereditary risk variants found or analysis not run.</p>
      </div>
    );
  }

  const { findings, summary } = riskData;
  const mainFinding = findings[0]; // Assuming one primary finding for this view

  const handleAnalyzeClick = () => {
    const prompt = `Explore therapeutic implications for ${mainFinding.gene} mutation.`;
    onAnalyze('therapy', prompt);
  };

  return (
    <div className="risk-report-container">
      <div className="risk-header">
        <span className="risk-icon">⚠️</span>
        <h4 className="risk-title">Hereditary Risk Analysis</h4>
      </div>
      <p className="risk-summary">{summary}</p>

      <div className="finding-card">
        <div className="finding-main">
          <div className="gene-info">
            <strong>Gene:</strong>
            <span className="gene-name">{mainFinding.gene}</span>
          </div>
          <div className="risk-metric">
            <strong>Relative Risk Increase:</strong>
            <span className="risk-value">{mainFinding.relative_risk_increase}x</span>
          </div>
        </div>
        <div className="evo2-narrative">
          <h5>Conceptual Evo2 Analysis</h5>
          <p>{mainFinding.evo2_narrative}</p>
        </div>
        <div className="recommendations">
          <h5>Recommendations</h5>
          <ul>
            {mainFinding.recommendations.map((rec, index) => (
              <li key={index}>
                <p className="rec-text">{rec.recommendation}</p>
                <span className="rec-source">Source: {rec.guideline_source}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="report-actions">
          <button 
            className="action-button"
            onClick={handleAnalyzeClick}
            disabled={isLoading}
          >
            {isLoading ? 'Analyzing...' : 'Explore Therapy Options'}
          </button>
        </div>
      </div>
    </div>
  );
};

HereditaryRiskReport.propTypes = {
  riskData: PropTypes.shape({
    summary: PropTypes.string,
    findings: PropTypes.arrayOf(
      PropTypes.shape({
        gene: PropTypes.string,
        relative_risk_increase: PropTypes.number,
        evo2_narrative: PropTypes.string,
        recommendations: PropTypes.arrayOf(
          PropTypes.shape({
            recommendation: PropTypes.string,
            guideline_source: PropTypes.string,
          })
        ),
      })
    ),
  }),
  onAnalyze: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default HereditaryRiskReport; 