import React, { useRef, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Alert,
  Paper,
  Chip
} from '@mui/material';
import {
  Science,
  Info
} from '@mui/icons-material';
import { useClinicalDossier } from './hooks/useClinicalDossier';
import DossierHeader from './components/DossierHeader';
import ExecutiveSummaryCard from './components/ExecutiveSummaryCard';
import VariantImpactSection from './components/VariantImpactSection';
import TherapeuticRecommendationsSection from './components/TherapeuticRecommendationsSection';
import PathwayDisruptionSection from './components/PathwayDisruptionSection';
import ClinicalTrialMatchingSection from './components/ClinicalTrialMatchingSection';
import DrugDetailModal from './components/DrugDetailModal';
import DossierErrorBoundary from './components/DossierErrorBoundary';
import { 
  FullPageLoadingState, 
  LoadingProgressIndicator 
} from './components/LoadingSkeletons';

/**
 * ClinicalDossierView - Main Container Component
 * 
 * Orchestrates the entire dossier display with error boundaries,
 * loading states, and section navigation
 * 
 * @param {Object} props
 * @param {Array} props.mutations - Array of mutation objects
 * @param {string} props.disease - Disease type
 * @param {Object} props.tumorContext - Optional tumor context
 * @param {Object} props.dossierData - Optional pre-computed dossier data
 * @param {Function} props.onExport - Export callback
 * @param {string} props.patientId - Optional patient ID
 * @param {string} props.patientName - Optional patient name
 */
const ClinicalDossierView = ({
  mutations = [],
  disease = '',
  tumorContext,
  dossierData: precomputedDossierData,
  onExport,
  patientId,
  patientName
}) => {
  const recommendationsRef = useRef(null);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Use hook to fetch dossier (or use precomputed data)
  const { dossier, loading, error, refetch } = useClinicalDossier(
    precomputedDossierData ? [] : mutations, // Don't fetch if precomputed data provided
    precomputedDossierData ? '' : disease
  );
  
  // Use precomputed data if provided, otherwise use fetched data
  const dossierData = precomputedDossierData || dossier;

  // Handle export
  const handleExport = (format) => {
    if (onExport) {
      onExport(format, dossierData);
    } else {
      console.warn('Export handler not provided');
    }
  };

  // Jump to recommendations section
  const handleJumpToRecommendations = () => {
    if (recommendationsRef.current) {
      recommendationsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle drug click - open modal
  const handleDrugClick = (drug) => {
    setSelectedDrug(drug);
    setModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedDrug(null);
  };

  return (
    <DossierErrorBoundary>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Loading State */}
        {loading && !dossierData && (
          <FullPageLoadingState message="Loading clinical dossier analysis..." />
        )}

        {/* Error State */}
        {error && !dossierData && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Failed to load dossier
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {error}
            </Typography>
            <button onClick={refetch} style={{ cursor: 'pointer' }}>
              Retry
            </button>
          </Alert>
        )}

        {/* Dossier Content */}
        {dossierData && (
          <>
            {/* Header with Scope Banner */}
            <DossierHeader
              dossierData={dossierData}
              patientId={patientId}
              patientName={patientName}
            />

            {/* Value Proposition Banner */}
            <Paper
              elevation={2}
              sx={{
                p: 3,
                mb: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Science sx={{ fontSize: 40, mt: 0.5 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    Why Mechanism Alignment Matters
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                    For rare genetic combinations like <strong>MBD4 germline + TP53 somatic</strong>, 
                    standard treatment guidelines may not exist. This analysis identifies drugs that 
                    <strong> biologically target the disrupted pathways</strong> in your tumor, providing 
                    evidence-backed options when guidelines are absent.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                    <Chip
                      label="Rare Cases"
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                    <Chip
                      label="Pathway-Based"
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                    <Chip
                      label="Evidence-Backed"
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  </Box>
                  <Alert
                    severity="info"
                    icon={<Info />}
                    sx={{
                      mt: 2,
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      color: 'white',
                      '& .MuiAlert-icon': { color: 'white' }
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Important:
                    </Typography>
                    <Typography variant="body2">
                      Mechanism alignment scores indicate <strong>biological plausibility</strong>, 
                      not validated outcome predictions. All recommendations should be discussed 
                      with your oncology team.
                    </Typography>
                  </Alert>
                </Box>
              </Box>
            </Paper>

            {/* Executive Summary */}
            <ExecutiveSummaryCard
              executiveSummary={dossierData.executive_summary}
              onJumpToRecommendations={handleJumpToRecommendations}
              onExport={handleExport}
            />

            {/* Loading indicator for remaining sections */}
            {loading && (
              <LoadingProgressIndicator
                currentSection={2}
                totalSections={11}
                sectionName="variant analysis"
              />
            )}

            {/* Variant Impact Section - Sprint 2 */}
            {dossierData.variants && dossierData.variants.length > 0 && (
              <VariantImpactSection variants={dossierData.variants} />
            )}

            {/* Therapeutic Recommendations Section - Sprint 2 */}
            <Box ref={recommendationsRef}>
              {dossierData.drugs && dossierData.drugs.length > 0 && (
                <TherapeuticRecommendationsSection
                  drugs={dossierData.drugs}
                  onDrugClick={handleDrugClick}
                />
              )}
            </Box>

            {/* Pathway Disruption Section - Sprint 3 */}
            {dossierData.pathway_disruption && (
              <PathwayDisruptionSection
                pathwayScores={dossierData.pathway_disruption}
                dnaRepairCapacity={dossierData.dna_repair_capacity}
              />
            )}

            {/* Clinical Trial Matching Section - Sprint 3 */}
            {dossierData.trials && (
              <ClinicalTrialMatchingSection trials={dossierData.trials} />
            )}

            {/* Drug Detail Modal - Sprint 2 */}
            <DrugDetailModal
              drug={selectedDrug}
              open={modalOpen}
              onClose={handleModalClose}
            />
          </>
        )}

        {/* Empty State */}
        {!loading && !error && !dossierData && (
          <Alert severity="warning">
            <Typography variant="h6" sx={{ mb: 1 }}>
              No dossier data available
            </Typography>
            <Typography variant="body2">
              Please provide mutations and disease type to generate a clinical dossier.
            </Typography>
          </Alert>
        )}
      </Container>
    </DossierErrorBoundary>
  );
};

export default ClinicalDossierView;


