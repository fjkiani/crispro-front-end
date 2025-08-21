import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Container, Fab, Tooltip } from '@mui/material';
import { Help, Info, Assignment } from '@mui/icons-material';
import { useSpring, animated } from 'react-spring';

// Import the existing premium components
import AICopilotPanel from './panels/AICopilotPanel';
import AnalysisFocusView from './panels/AnalysisFocusView';
import HeroMetricsSection from './common/HeroMetricsSection';
import ZetaWelcomeModal from './ZetaWelcomeModal';
import MissionStatusSidebar from './common/MissionStatusSidebar';
import DossierSidebar from './common/DossierSidebar';
import EvidenceIntelligencePanel from './canisters/EvidenceIntelligencePanel';

const AnimatedContainer = animated(Container);

export const TargetDossierDisplay = ({ 
  results, 
  onAction, 
  currentStep, 
  completedSteps = [], 
  isLoading,
  currentAction,
  conversation,
  setCurrentStep
}) => {
  const { oracle, forge, gauntlet, dossier } = results;
  const [missionBriefOpen, setMissionBriefOpen] = useState(true);
  const [hasCommenced, setHasCommenced] = useState(false);

  const headerAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(-20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 280, friction: 30 },
  });

  const AnimatedPaper = animated(Paper);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      width: '100%',
      color: 'white',
      overflow: 'auto',
      position: 'relative'
    }}>
      {/* Premium Header */}
      <AnimatedPaper 
        style={headerAnimation}
        sx={{ 
          background: `
            linear-gradient(135deg, 
              rgba(0, 20, 40, 0.9) 0%, 
              rgba(0, 30, 60, 0.8) 50%,
              rgba(10, 40, 70, 0.9) 100%
            ),
            radial-gradient(circle at 30% 40%, rgba(0, 255, 127, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 70% 60%, rgba(0, 191, 255, 0.1) 0%, transparent 50%)
          `,
          backdropFilter: 'blur(20px)',
          borderRadius: 0,
          border: 'none',
          borderBottom: '2px solid rgba(0, 255, 127, 0.3)',
          p: 3,
          mb: 0,
          position: 'relative',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              repeating-linear-gradient(
                90deg,
                transparent 0px,
                rgba(0, 255, 127, 0.03) 1px,
                transparent 2px,
                transparent 30px
              ),
              repeating-linear-gradient(
                45deg,
                transparent 0px,
                rgba(0, 191, 255, 0.02) 1px,
                transparent 2px,
                transparent 60px
              )
            `,
            pointerEvents: 'none',
          }
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 900, 
                background: 'linear-gradient(45deg, #00ff7f, #00bfff, #ff1493, #ffa500)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
                fontSize: { xs: '3rem', md: '4rem' },
                textShadow: '0 0 20px rgba(0, 255, 127, 0.3)',
                fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
              🧬 CrisPRO.ai Genomic Platform
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.9)', 
                fontWeight: 600,
                fontSize: '1.8rem',
                mb: 2,
                fontFamily: 'Monaco, "Courier New", monospace',
                letterSpacing: '1px'
              }}
            >
              AI-Powered Therapeutic Discovery Engine • Sequence → Structure → Success
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: 4,
              flexWrap: 'wrap',
              mt: 3
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                p: 2,
                background: 'rgba(255, 20, 147, 0.1)',
                borderRadius: 2,
                border: '1px solid rgba(255, 20, 147, 0.3)'
              }}>
                <Typography sx={{ 
                  color: '#ff1493', 
                  fontWeight: 700, 
                  fontSize: '1.1rem',
                  fontFamily: 'monospace'
                }}>
                  Traditional R&D:
                </Typography>
                <Typography sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)', 
                  fontSize: '1rem',
                  fontFamily: 'monospace'
                }}>
                  8-12 years • 90% failure • $2.8B cost
                </Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                p: 2,
                background: 'rgba(0, 255, 127, 0.1)',
                borderRadius: 2,
                border: '1px solid rgba(0, 255, 127, 0.3)'
              }}>
                <Typography sx={{ 
                  color: '#00ff7f', 
                  fontWeight: 700, 
                  fontSize: '1.1rem',
                  fontFamily: 'monospace'
                }}>
                  CrisPRO Platform:
                </Typography>
                <Typography sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)', 
                  fontSize: '1rem',
                  fontFamily: 'monospace'
                }}>
                  Minutes • {'<'}10% failure • AI-validated
                </Typography>
              </Box>
          </Box>
          </Box>
        </Container>
      </AnimatedPaper>

      {/* Dossier Sidebar */}
      <DossierSidebar 
        results={results}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        conquestStages={dossier ? [
          { name: "VICTORY", status: "complete", value: "$47.2M cost avoidance", description: "IND-ready therapeutic dossier generated using AI-powered validation" },
          { name: "FORTIFY", status: "ready", target: "$15K filing cost", description: "File provisional patent on novel compositions - no prior art conflicts", action: "File Patent Now" },
          { name: "ARM", status: "pending", target: "1,000 NFTs @ $5K each", description: "Mint IP-NFT collection representing fractional patent ownership", action: "Mint IP-NFT" },
          { name: "FUND", status: "pending", target: "$5M funding target", description: "Scientists fund scientists - no VC pivots, pure data-driven validation" },
          { name: "CONQUER", status: "pending", projection: "$100M+ licensing value", description: "Good science wins - licensing deals reward validated breakthroughs" }
        ] : null}
      />

      {/* Evidence Intelligence Sidebar - Right */}
      <Box sx={{
        position: 'fixed',
        right: 0,
        top: 0,
        width: '500px',
        height: '100vh',
        background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.15), rgba(96, 165, 250, 0.08))',
        backdropFilter: 'blur(20px)',
        border: '2px solid rgba(96, 165, 250, 0.4)',
        borderRight: 'none',
        borderRadius: '16px 0 0 16px',
        zIndex: 1000,
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(96, 165, 250, 0.3)',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(96, 165, 250, 0.1)',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(96, 165, 250, 0.5)',
          borderRadius: '4px',
        }
      }}>
        {(() => {
          const hasStarted = Boolean(
            (oracle && oracle.data && oracle.data.endpoints && oracle.data.endpoints.length > 0) ||
            (forge && forge.data && forge.data.endpoints && forge.data.endpoints.length > 0) ||
            (gauntlet && gauntlet.data && gauntlet.data.endpoints && gauntlet.data.endpoints.length > 0) ||
            dossier
          );
          if (!hasStarted) {
            return (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'white', mb: 1 }}>
                  Evidence Intelligence
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Standby. Evidence will appear after the first analysis runs.
                </Typography>
              </Box>
            );
          }
          return (
            <EvidenceIntelligencePanel 
              endpoint={(() => {
                console.log('Evidence mapping - currentStep:', currentStep);
                console.log('Evidence mapping - oracle:', oracle);
                console.log('Evidence mapping - forge:', forge);
                console.log('Evidence mapping - gauntlet:', gauntlet);
                
                // Oracle Phase: Steps 0-3
                if (currentStep <= 3 && oracle?.data?.endpoints?.[currentStep]) {
                  const endpoint = oracle.data.endpoints[currentStep].endpoint_name?.replace('/', '');
                  console.log('Using Oracle endpoint:', endpoint);
                  return endpoint;
                }
                
                // Forge Phase: Steps 4-5
                if (currentStep >= 4 && currentStep <= 5) {
                  // Step 4: CRISPR Forge (generate_optimized_guide_rna)
                  // Step 5: Inhibitor Forge (generate_protein_inhibitor)
                  if (currentStep === 4) {
                    console.log('Using Forge endpoint: generate_optimized_guide_rna');
                    return 'generate_optimized_guide_rna';
                  } else if (currentStep === 5) {
                    console.log('Using Forge endpoint: generate_protein_inhibitor');
                    return 'generate_protein_inhibitor';
                  }
                }
                
                // Gauntlet Phase: Step 6
                if (currentStep === 6) {
                  console.log('Using Gauntlet endpoint: predict_protein_functionality_change');
                  return 'predict_protein_functionality_change';
                }
                
                // Dossier Phase: Step 7
                if (currentStep === 7) {
                  console.log('Using Dossier endpoint: ind_package');
                  return 'ind_package';
                }
                
                console.log('Fallback to default endpoint');
                return 'predict_variant_impact';
              })()}
              currentAnalysis={(() => {
                // Oracle Phase: Steps 0-3
                if (currentStep <= 3 && oracle?.data?.endpoints?.[currentStep]) {
                  return oracle.data.endpoints[currentStep];
                }
                
                // Forge Phase: Steps 4-5
                if (currentStep >= 4 && currentStep <= 5) {
                  // Create synthetic analysis data for Forge endpoints
                  if (currentStep === 4) {
                    return {
                      endpoint_name: '/generate_optimized_guide_rna',
                      demoData: {
                        predicted_efficacy: 94.5,
                        candidate_1: { sequence: 'GACCCAGAACCGATACGAGG', predicted_efficacy: 94.5 },
                        candidate_2: { sequence: 'CTACGAGGACCCAGAACCGA', predicted_efficacy: 92.8 },
                        candidate_3: { sequence: 'AACCGATACGAGGACCCAGA', predicted_efficacy: 91.2 }
                      }
                    };
                  } else if (currentStep === 5) {
                    return {
                      endpoint_name: '/generate_protein_inhibitor',
                      demoData: {
                        binding_affinity: -12.3,
                        compound_id: 'ZF-PIK3CA-001',
                        molecular_weight: 456.78,
                        predicted_selectivity: 'Best-in-class vs Alpelisib'
                      }
                    };
                  }
                }
                
                // Gauntlet Phase: Step 6
                if (currentStep === 6) {
                  return {
                    endpoint_name: '/predict_protein_functionality_change',
                    demoData: {
                      target_knockdown: 85,
                      cancer_cell_viability_loss: 76,
                      selectivity_ratio: 56,
                      predicted_outcome: 'High probability clinical success'
                    }
                  };
                }
                
                // Dossier Phase: Step 7
                if (currentStep === 7 && dossier) {
                  return {
                    demoData: {
                      deliverables: [
                        '3 CRISPR guides (94%+ efficacy)',
                        '1 novel inhibitor',
                        'Complete IND package',
                        '$47.2M cost avoidance'
                      ]
                    }
                  };
                }
                
                return oracle?.data?.endpoints?.[0] || {};
              })()}
            />
          );
        })()}
      </Box>

      {/* Conditionally render main content only after commence */}
      {hasCommenced && (
        <Container maxWidth="xl" sx={{ py: 4, ml: '360px', mr: '470px' }}>
          {/* Hero Metrics Section */}
          <HeroMetricsSection 
            oracleData={oracle}
            forgeData={forge}
            gauntletData={gauntlet}
            currentStep={currentStep}
            isLoading={isLoading}
          />
          
          {/* Main Command Grid */}
          <Grid container spacing={4}>
            
            {/* Left Panel - Mission Control */}
            <Grid item xs={12} lg={6}>
              <Paper sx={{ 
                background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 3,
                height: '70vh',
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
              }}>
                <AICopilotPanel
                  onAction={onAction}
                  isAnalyzing={isLoading}
                  currentAction={currentAction}
                  conversation={conversation}
                />
              </Paper>
            </Grid>

            {/* Right Panel - Analysis Metrics */}
            <Grid item xs={12} lg={6}>
              <Paper sx={{ 
                background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 3,
                height: '70vh',
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
              }}>
                <AnalysisFocusView
                  results={results}
                  currentStep={currentStep}
                />
              </Paper>
            </Grid>
          </Grid>

          {/* Bottom Status Bar */}
          <Paper sx={{ 
            mt: 4,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 3,
            p: 2
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.3rem', fontWeight: 600 }}>
                🔬 AI-Powered Biotech R&D De-risking Platform • Step {currentStep + 1} of 8
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  width: 12, 
                  height: 12, 
                  borderRadius: '50%', 
                  backgroundColor: isLoading ? '#fbbf24' : '#34d399',
                  animation: isLoading ? 'pulse 2s infinite' : 'none',
                  boxShadow: `0 0 12px ${isLoading ? '#fbbf24' : '#34d399'}`
                }} />
                <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.95)', fontWeight: 700, fontSize: '1.4rem' }}>
                  {isLoading ? 'ANALYZING...' : 'READY'}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Container>
      )}

      {/* Floating Mission Brief Button */}
      <Tooltip title="Mission Brief" placement="left" arrow>
        <Fab
          color="primary"
          onClick={() => setMissionBriefOpen(true)}
          sx={{ 
            position: 'fixed',
            bottom: 24,
            right: 380, // Moved left to avoid overlap with mission status sidebar
            background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
            '&:hover': {
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              transform: 'scale(1.1)',
            },
            boxShadow: '0 8px 32px rgba(96, 165, 250, 0.4)',
            border: '1px solid rgba(96, 165, 250, 0.3)',
            zIndex: 1000,
          }}
        >
          <Assignment sx={{ fontSize: 28 }} />
        </Fab>
      </Tooltip>

      {/* Mission Brief Modal */}
      <ZetaWelcomeModal 
        isOpen={missionBriefOpen}
        onClose={() => setMissionBriefOpen(false)}
        forceShow={true}
        onCommence={() => { setHasCommenced(true); setMissionBriefOpen(false); }}
      />

      {/* Mission Status Sidebar */}
      {/* <MissionStatusSidebar 
        results={results}
        currentStep={currentStep}
      /> */}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </Box>
  );
};