import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Button,
  CircularProgress
} from '@mui/material';
import MedicationIcon from '@mui/icons-material/Medication';
import InfoIcon from '@mui/icons-material/Info';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AssessmentIcon from '@mui/icons-material/Assessment';

// Modular Components
import DrugCardHeader from './ranking/DrugCardHeader';
import EvidenceRenderer from './ranking/EvidenceRenderer';
import SafetyPanel from './ranking/SafetyPanel';
import ProvenanceAccordion from './ranking/ProvenanceAccordion';

// Utils
import { humanize } from '../../utils/drugRendering';
import TherapyFitExplainerAgent from './TherapyFitExplainerAgent';

const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://127.0.0.1:8000';

/**
 * DrugRankingPanel - Displays ranked drug recommendations
 * 
 * Props:
 * @param {Array} drugs - Array of drug recommendation objects
 * @param {Function} onViewDetails - Optional callback when "Details" clicked
 * @param {Object} context - Analysis context for dossier generation (level, scenario, inputs)
 */
export default function DrugRankingPanel({ drugs = [], onViewDetails, context = {} }) {
  const [showExplanation, setShowExplanation] = useState({});
  const [creatingDossier, setCreatingDossier] = useState(null); // drug index -> loading state
  const navigate = useNavigate();

  const toggleExplanation = (idx) => {
    setShowExplanation(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleInformDoctor = async (drug, idx) => {
    setCreatingDossier(idx);
    try {
      // Construct Payload matching DoctorDossierInput
      const payload = {
        drug_data: {
          ...drug,
          drug: drug.name || drug.drug || "Unknown",
          label_status: drug.label_status || "UNKNOWN"
        },
        context: {
          patient_id: "AK",
          level: context.level || "L2",
          scenario: context.scenario || "Unknown",
          mutations: context.inputs?.mutations || []
        },
        provenance: context.provenance || {}
      };

      const res = await fetch(`${API_ROOT}/api/ayesha/dossiers/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to generate dossier");

      const data = await res.json();
      // Navigate to the new dossier
      navigate(data.path);

    } catch (err) {
      console.error("Dossier creation failed:", err);
      alert("Failed to create dossier: " + err.message);
    } finally {
      setCreatingDossier(null);
    }
  };

  if (!drugs || drugs.length === 0) {
    return (
      <Card sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary">
          No drug recommendations available.
        </Typography>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <MedicationIcon color="primary" fontSize="large" />
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Drug Efficacy Rankings
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {drugs.map((drug, idx) => (
          <Card key={idx} variant="outlined" sx={{ bgcolor: idx === 0 ? 'primary.50' : 'white' }}>
            <CardContent>
              {/* Header */}
              <DrugCardHeader drug={drug} index={idx} />

              {/* Score Bar */}
              <Box sx={{ mb: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={(drug.efficacy_score || 0) * 100}
                  color="primary"
                  sx={{ height: 10, borderRadius: 1 }}
                />
              </Box>

              {/* Rationale / Evidence */}
              <EvidenceRenderer rationale={drug.rationale} />

              {/* If we only have citations_count (not actual PMIDs), be explicit */}
              {typeof drug.citations_count === 'number' && (!drug.citations || drug.citations.length === 0) && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {drug.citations_count > 0
                      ? `Citations surfaced: ${drug.citations_count} (PMIDs not attached in this response)`
                      : 'No citations surfaced in this response.'}
                  </Typography>
                </Box>
              )}

              {/* PGx Screening (RUO) */}
              <SafetyPanel pgxScreening={drug.pgx_screening} />

              {/* Sporadic Gates Provenance - Why this confidence? */}
              <ProvenanceAccordion provenance={drug.sporadic_gates_provenance} />

              {/* Citations (PMIDs) */}
              {drug.citations && drug.citations.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Citations: {drug.citations.slice(0, 3).map(pmid => (
                      <a
                        key={pmid}
                        href={`https://pubmed.ncbi.nlm.nih.gov/${pmid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ marginLeft: '8px', color: 'inherit' }}
                      >
                        PMID:{pmid}
                      </a>
                    ))}
                  </Typography>
                </Box>
              )}

              {/* AI Explanation Block - Deterministic Agent */}
              {showExplanation[idx] && (
                <TherapyFitExplainerAgent target={drug} />
              )}

              {/* Action Buttons */}
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button
                  variant={showExplanation[idx] ? "outlined" : "contained"}
                  size="small"
                  color="secondary"
                  startIcon={<AutoAwesomeIcon />}
                  onClick={() => toggleExplanation(idx)}
                >
                  {showExplanation[idx] ? 'Hide Agent Analysis' : 'Ask Agent'}
                </Button>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={creatingDossier === idx ? <CircularProgress size={20} /> : <AssessmentIcon />} // Use AssessmentIcon
                  onClick={() => handleInformDoctor(drug, idx)}
                  disabled={creatingDossier === idx}
                >
                  Inform Doctor
                </Button>

                {onViewDetails && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<InfoIcon />}
                    onClick={() => onViewDetails(drug)}
                  >
                    View Details
                  </Button>
                )}
              </Box>

            </CardContent>
          </Card>
        ))}
      </Box>
    </Card>
  );
}

DrugRankingPanel.propTypes = {
  drugs: PropTypes.arrayOf(PropTypes.shape({
    drug: PropTypes.string.isRequired,
    efficacy_score: PropTypes.number,
    confidence: PropTypes.number,
    tier: PropTypes.string,
    sae_features: PropTypes.object,
    rationale: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.object)
    ]),
    citations: PropTypes.array,
    badges: PropTypes.array,
    insights: PropTypes.object,
    sporadic_gates_provenance: PropTypes.object,
    pgx_screening: PropTypes.object,
    label_status: PropTypes.string // added to prop types
  })),
  onViewDetails: PropTypes.func,
  context: PropTypes.object
};
