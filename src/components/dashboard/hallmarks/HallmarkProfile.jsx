import React from 'react';
import PropTypes from 'prop-types';
import './HallmarkProfile.css';

// Mapping from hallmark names to icons
const HALLMARK_ICONS = {
  "Sustaining Proliferative Signaling": "💥",
  "Evading Growth Suppressors": "🛡️",
  "Genome Instability & Mutation": "🧬",
  "Deregulating Cellular Energetics": "⚡️",
  "Resisting Cell Death": "💀",
  "Enabling Replicative Immortality": "⏳",
  "Inducing Angiogenesis": "🌱",
  "Activating Invasion & Metastasis": "🗺️",
  "Avoiding Immune Destruction": "👻",
  "Tumor-Promoting Inflammation": "🔥",
};

const HallmarkProfile = ({ hallmarkData }) => {
  if (!hallmarkData || hallmarkData.length === 0) {
    return (
      <div className="hallmark-container">
        <p>No hallmark data available for this patient.</p>
      </div>
    );
  }

  return (
    <div className="hallmark-container">
      <h3 className="hallmark-main-title">Hallmarks of Cancer Profile</h3>
      <p className="hallmark-subtitle">Primary driving hallmarks are highlighted. Hover over an icon for therapeutic context.</p>
      <div className="hallmark-grid">
        {hallmarkData.map((hallmark) => (
          <div
            key={hallmark.hallmark}
            className={`hallmark-card priority-${hallmark.priority}`}
          >
            <div className="hallmark-icon">{HALLMARK_ICONS[hallmark.hallmark] || "❓"}</div>
            <div className="hallmark-info">
              <h4 className="hallmark-title">{hallmark.hallmark}</h4>
              <div className="hallmark-genes">
                <strong>Driving Genes:</strong> {hallmark.genes.join(', ')}
              </div>
            </div>
            <div className="hallmark-tooltip">
              <p><strong>Therapeutic Implication:</strong></p>
              <p>{hallmark.therapeutic_implication}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

HallmarkProfile.propTypes = {
  hallmarkData: PropTypes.arrayOf(
    PropTypes.shape({
      hallmark: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      genes: PropTypes.arrayOf(PropTypes.string).isRequired,
      pathways: PropTypes.arrayOf(PropTypes.string).isRequired,
      priority: PropTypes.number.isRequired,
      therapeutic_implication: PropTypes.string.isRequired,
    })
  ),
};

export default HallmarkProfile; 