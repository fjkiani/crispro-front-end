import React from 'react';
import PropTypes from 'prop-types';
import './LiquidBiopsyMonitor.css';

const LiquidBiopsyMonitor = ({ biopsyData, onAnalyze, isLoading }) => {
  if (!biopsyData || !biopsyData.latest_biopsy_analysis || !biopsyData.latest_biopsy_analysis.date) {
    return (
      <div className="biopsy-monitor-container">
        <h4>Liquid Biopsy Monitoring</h4>
        <p>No liquid biopsy data available.</p>
      </div>
    );
  }

  const { latest_biopsy_analysis: latest, summary } = biopsyData;

  const handleAnalyzeClick = () => {
    const prompt = `Analyze the clinical significance of the ${latest.emerging_variant} mutation.`;
    onAnalyze('variant', prompt);
  };

  const getStatusClass = (status) => {
    if (!status) return '';
    return status.toLowerCase().replace(/ /g, '-');
  };

  return (
    <div className={`biopsy-monitor-container ${getStatusClass(latest.status)}`}>
      <div className="biopsy-header">
        <span className="biopsy-icon">🩸</span>
        <h4 className="biopsy-title">Liquid Biopsy Monitoring</h4>
      </div>
      <p className="biopsy-summary">{summary}</p>
      
      <div className="biopsy-details-grid">
        <div className="detail-item">
          <span className="detail-label">Biopsy Date</span>
          <span className="detail-value">{new Date(latest.date).toLocaleDateString()}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Status</span>
          <span className="detail-value status-badge">{latest.status}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">ctDNA Level</span>
          <span className="detail-value">{latest.ctdna_level_percentage}%</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Resistance Pathway</span>
          <span className="detail-value">{latest.resistance_pathway || 'N/A'}</span>
        </div>
        <div className="detail-item full-width">
          <span className="detail-label">Emerging Variant</span>
          <span className="detail-value code-font">{latest.emerging_variant || 'None Detected'}</span>
        </div>
      </div>
      {latest.emerging_variant && (
        <div className="report-actions">
          <button 
            className="action-button"
            onClick={handleAnalyzeClick}
            disabled={isLoading}
          >
            {isLoading ? 'Analyzing...' : `Analyze ${latest.emerging_variant}`}
          </button>
        </div>
      )}
    </div>
  );
};

LiquidBiopsyMonitor.propTypes = {
  biopsyData: PropTypes.shape({
    summary: PropTypes.string,
    latest_biopsy_analysis: PropTypes.shape({
      date: PropTypes.string,
      status: PropTypes.string,
      ctdna_level_percentage: PropTypes.number,
      emerging_variant: PropTypes.string,
      resistance_pathway: PropTypes.string,
    }),
  }),
  onAnalyze: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default LiquidBiopsyMonitor; 