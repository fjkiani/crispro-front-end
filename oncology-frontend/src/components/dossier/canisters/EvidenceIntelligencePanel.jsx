import React, { useState } from 'react';
import { 
  Box, Typography, Card, CardContent, Chip, 
  LinearProgress, Collapse, IconButton, Button, Dialog, DialogContent, DialogTitle
} from '@mui/material';
import { 
  Assessment, DataUsage, TrendingUp, ExpandMore, ExpandLess, 
  Visibility, Gavel, Close
} from '@mui/icons-material';

import evidenceIntelligence from '../data/evidenceIntelligence';
import INDDocumentGenerator from '../ind/INDDocumentGenerator';
import { endpointContext } from './EndpointBreakdown';

const DataProvenanceCard = ({ rawApiResponse, summary, endpointType, expanded, onToggle }) => (
  <Card sx={{
    background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.15), rgba(96, 165, 250, 0.08))',
    border: '1px solid rgba(96, 165, 250, 0.4)',
    borderRadius: 3,
    mb: 3
  }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ 
          fontWeight: 700, 
          color: '#60a5fa', 
          fontSize: '1.4rem',
          display: 'flex',
          alignItems: 'center'
        }}>
          <DataUsage sx={{ mr: 1, fontSize: '1.6rem' }} />
          Data Provenance
        </Typography>
        <IconButton onClick={onToggle} size="small" sx={{ color: '#60a5fa' }}>
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>
      <Collapse in={expanded}>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ color: '#60a5fa', fontWeight: 600, mb: 1 }}>
            Raw API Response:
          </Typography>
          <Box sx={{ 
            background: 'rgba(0,0,0,0.4)',
            borderRadius: 2,
            p: 2,
            mb: 2,
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            color: '#60a5fa',
            overflow: 'auto',
            maxHeight: '200px'
          }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(rawApiResponse, null, 2)}
            </pre>
          </Box>
          <Typography variant="subtitle2" sx={{ color: '#60a5fa', fontWeight: 600, mt: 2, mb: 1 }}>
            Key Metrics:
          </Typography>
          <Typography variant="body2" sx={{ 
            color: 'rgba(255,255,255,0.9)',
            fontFamily: 'monospace',
            background: 'rgba(0,0,0,0.3)',
            p: 1,
            borderRadius: 1,
            mb: 2
          }}>
            {(() => {
              if (rawApiResponse.pathogenicity_prediction) {
                return `Pathogenicity: ${rawApiResponse.pathogenicity_prediction} (Score: ${rawApiResponse.delta_likelihood_score})`;
              }
              if (rawApiResponse.essentiality_score) {
                return `Gene Essentiality: ${(rawApiResponse.essentiality_score * 100).toFixed(1)}% - ${rawApiResponse.essentiality_category}`;
              }
              if (rawApiResponse.accessibility_score) {
                return `Chromatin Accessibility: ${(rawApiResponse.accessibility_score * 100).toFixed(1)}% - ${rawApiResponse.accessibility_category}`;
              }
              if (rawApiResponse.candidate_1?.predicted_efficacy) {
                return `CRISPR Efficacy: ${rawApiResponse.candidate_1.predicted_efficacy}% (Lead candidate)`;
              }
              return "Raw API response available for analysis";
            })()}
          </Typography>
          <Typography variant="subtitle2" sx={{ color: '#60a5fa', fontWeight: 600, mt: 2, mb: 1 }}>
            Data Interpretation:
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
            {summary || 'API response data not available'}
          </Typography>
        </Box>
      </Collapse>
    </CardContent>
  </Card>
);

const AnalysisSummaryCard = ({ summary }) => (
  <Card sx={{
    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.08))',
    border: '2px solid rgba(34, 197, 94, 0.4)',
    borderRadius: 3,
    mb: 3
  }}>
    <CardContent sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ 
        fontWeight: 700, 
        color: '#22c55e', 
        fontSize: '1.3rem',
        display: 'flex',
        alignItems: 'center',
        mb: 2
      }}>
        <Assessment sx={{ mr: 1, fontSize: '1.5rem' }} />
        Analysis Summary
      </Typography>
      <Typography variant="body1" sx={{ 
        color: 'rgba(255,255,255,0.95)', 
        fontSize: '1.1rem',
        lineHeight: 1.6,
        fontWeight: 500
      }}>
        {summary || 'Analysis completed with actionable insights.'}
      </Typography>
    </CardContent>
  </Card>
);

const EvidenceBreakdownList = ({ evidenceItems }) => (
  <Card sx={{
    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.08))',
    border: '1px solid rgba(34, 197, 94, 0.4)',
    borderRadius: 3,
    mb: 3
  }}>
    <CardContent sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ 
        fontWeight: 700, 
        color: '#22c55e', 
        mb: 3,
        fontSize: '1.4rem',
        display: 'flex',
        alignItems: 'center'
      }}>
        <Assessment sx={{ mr: 1, fontSize: '1.6rem' }} />
        Evidence Breakdown
      </Typography>
      {evidenceItems.map((item, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Chip 
            label={`${index + 1}`} 
            size="small" 
            sx={{ 
              mr: 2, 
              mt: 0.5,
              bgcolor: '#22c55e', 
              color: 'white',
              fontWeight: 700,
              fontSize: '0.9rem'
            }} 
          />
          <Typography variant="body1" sx={{ 
            color: 'white', 
            fontSize: '1.2rem',
            fontWeight: 500,
            lineHeight: 1.5
          }}>
            {/* Special formatting for IND package emoji-prefixed deliverables */}
            {item.startsWith('🎯') || item.startsWith('🔬') || 
             item.startsWith('💊') || item.startsWith('🧬') || 
             item.startsWith('📊') || item.startsWith('📋') || 
             item.startsWith('💰') || item.startsWith('⚖️') ? (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Typography component="span" sx={{ 
                  fontSize: '1.4rem', 
                  minWidth: '28px',
                  lineHeight: 1.2
                }}>
                  {item.split(' ')[0]}
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <Typography component="span" sx={{ 
                    color: '#22c55e',
                    fontWeight: 700,
                    fontSize: '1.1rem'
                  }}>
                    {item.split(':')[0].split(' ').slice(1).join(' ')}:
                  </Typography>
                  <Typography component="span" sx={{ 
                    color: 'rgba(255,255,255,0.95)',
                    fontWeight: 500,
                    fontSize: '1.1rem',
                    ml: 1
                  }}>
                    {item.split(':').slice(1).join(':').trim()}
                  </Typography>
                </Box>
              </Box>
            ) : (
              item
            )}
          </Typography>
        </Box>
      ))}
    </CardContent>
  </Card>
);

const ComparativeBenchmarkChart = ({ data }) => {
  // Add null checks for data
  if (!data || !data.benchmarks || !Array.isArray(data.benchmarks)) {
    return (
      <Card sx={{
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(168, 85, 247, 0.08))',
        border: '1px solid rgba(168, 85, 247, 0.4)',
        borderRadius: 3,
        mb: 3
      }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 700, 
            color: '#a855f7', 
            mb: 2,
            fontSize: '1.4rem',
            display: 'flex',
            alignItems: 'center'
          }}>
            <TrendingUp sx={{ mr: 1, fontSize: '1.6rem' }} />
            Comparative Analysis
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            No benchmark data available for this analysis.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{
      background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(168, 85, 247, 0.08))',
      border: '1px solid rgba(168, 85, 247, 0.4)',
      borderRadius: 3,
      mb: 3
    }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ 
          fontWeight: 700, 
          color: '#a855f7', 
          mb: 3,
          fontSize: '1.4rem',
          display: 'flex',
          alignItems: 'center'
        }}>
          <TrendingUp sx={{ mr: 1, fontSize: '1.6rem' }} />
          {data.title || 'Comparative Analysis'}
        </Typography>
        
        {data.benchmarks.map((benchmark, index) => {
          const isOurTarget = benchmark.status?.includes('OUR') || benchmark.status?.includes('DESIGN') || false;
          const scoreValue = benchmark.score || benchmark.efficacy || benchmark.affinity || benchmark.effect || benchmark.confidence || 0;
          const maxScore = Math.max(...data.benchmarks.map(b => b.score || b.efficacy || b.affinity || b.effect || b.confidence || 0));
          const percentage = maxScore > 0 ? (scoreValue / maxScore) * 100 : 0;
          
          return (
            <Box key={index} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body1" sx={{ 
                  fontWeight: isOurTarget ? 700 : 500,
                  color: isOurTarget ? '#00ff7f' : 'white',
                  fontSize: '1.2rem'
                }}>
                  {benchmark.tool || benchmark.gene || benchmark.drug || benchmark.protein || benchmark.guide || benchmark.program || 'Unknown'}
                  {isOurTarget && ' ⭐'}
                </Typography>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700,
                  color: isOurTarget ? '#00ff7f' : '#a855f7',
                  fontSize: '1.2rem'
                }}>
                  {scoreValue.toFixed(1)}{benchmark.unit || '%'}
                </Typography>
              </Box>
              <Box sx={{ 
                height: 8, 
                borderRadius: 4,
                background: 'rgba(255,255,255,0.1)',
                mb: 1,
                overflow: 'hidden',
                position: 'relative'
              }}>
                <Box sx={{ 
                  height: '100%', 
                  bgcolor: isOurTarget ? '#00ff7f' : '#60a5fa',
                  borderRadius: 4,
                  width: `${percentage}%`
                }} />
              </Box>
              <Typography variant="caption" sx={{ 
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.9rem',
                fontWeight: 500
              }}>
                {benchmark.status || 'Unknown Status'}
              </Typography>
            </Box>
          );
        })}
      </CardContent>
    </Card>
  );
};

const BiotechContextSummary = ({ context, decision }) => (
  <Card sx={{
    background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(251, 191, 36, 0.08))',
    border: '1px solid rgba(251, 191, 36, 0.4)',
    borderRadius: 3
  }}>
    <CardContent sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ 
        fontWeight: 700, 
        color: '#fbbf24', 
        fontSize: '1.4rem',
        display: 'flex',
        alignItems: 'center',
        mb: 3
      }}>
        <Assessment sx={{ mr: 1, fontSize: '1.6rem' }} />
        R&D DECISION IMPACT
      </Typography>
      
      <Box sx={{
        p: 3,
        background: 'linear-gradient(135deg, rgba(0, 255, 127, 0.2), rgba(0, 255, 127, 0.1))',
        border: '2px solid rgba(0, 255, 127, 0.5)',
        borderRadius: 3,
        mb: 3
      }}>
        <Typography variant="h6" sx={{
          fontWeight: 800,
          color: '#00ff7f',
          fontSize: '1.2rem',
          textAlign: 'center',
          mb: 2
        }}>
          {decision || 'ANALYSIS COMPLETE'}
        </Typography>
      </Box>

      <Typography variant="body1" sx={{ 
        color: 'rgba(255,255,255,0.9)', 
        fontSize: '1.1rem',
        lineHeight: 1.6,
        fontWeight: 400
      }}>
        {context || 'Analysis provides actionable insights for R&D decision making.'}
      </Typography>
    </CardContent>
  </Card>
);

const EvidenceIntelligencePanel = ({ endpoint, currentAnalysis }) => {
  // Add state for IND Package dialog
  const [showINDPackage, setShowINDPackage] = useState(false);
  // IMPORTANT: Hooks must not be conditionally skipped across renders
  const [viewMode, setViewMode] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({
    analysis: true,
    evidence: false,
    comparison: false,
    provenance: false
  });

  // Early return if no endpoint provided
  if (!endpoint || !currentAnalysis) {
    return null;
  }

  console.log('EvidenceIntelligencePanel - endpoint:', endpoint);
  console.log('EvidenceIntelligencePanel - currentAnalysis:', currentAnalysis);
  console.log('EvidenceIntelligencePanel - evidenceIntelligence keys:', Object.keys(evidenceIntelligence));
  console.log('EvidenceIntelligencePanel - currentAnalysis.demoData:', currentAnalysis.demoData);
  
  // Special logging for IND package
  if (endpoint === 'ind_package') {
    console.log('EvidenceIntelligencePanel - IND PACKAGE DETECTED');
    console.log('EvidenceIntelligencePanel - IND intelligence data:', evidenceIntelligence.ind_package);
  }

  const intelligenceData = evidenceIntelligence[endpoint];
  const context = endpointContext[`/${endpoint}`] || endpointContext[endpoint];
  
  if (!intelligenceData) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: 'white', mb: 1 }}>
          Evidence Intelligence
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
          Loading intelligence data for {endpoint}...
        </Typography>
      </Box>
    );
  }

  // (moved viewMode/expandedSections hooks above to keep hook order stable)

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleViewINDPackage = () => {
    setShowINDPackage(true);
  };

  const handleCloseINDPackage = () => {
    setShowINDPackage(false);
  };

  return (
    <Box sx={{ p: 3, height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: 'white', mb: 1 }}>
          Evidence Intelligence
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          Real-time analysis validation & regulatory intelligence
        </Typography>
      </Box>

      {/* Tab Navigation */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          p: 2, 
          background: 'linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.4))',
          borderRadius: 3,
          border: '2px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}>
          <Button
            variant={viewMode === 'overview' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('overview')}
            startIcon={<DataUsage />}
            sx={{
              flex: 1,
              color: viewMode === 'overview' ? 'white' : '#60a5fa',
              background: viewMode === 'overview' ? 
                'linear-gradient(135deg, #60a5fa, #3b82f6)' : 
                'transparent',
              border: viewMode === 'overview' ? 'none' : '2px solid #60a5fa',
              fontWeight: 700,
              fontSize: '0.9rem',
              textTransform: 'none',
              py: 1.5,
              borderRadius: 2,
              boxShadow: viewMode === 'overview' ? 
                '0 4px 20px rgba(96, 165, 250, 0.4)' : 
                '0 2px 8px rgba(96, 165, 250, 0.2)',
              '&:hover': {
                background: viewMode === 'overview' ? 
                  'linear-gradient(135deg, #60a5fa, #3b82f6)' : 
                  'rgba(96, 165, 250, 0.1)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 24px rgba(96, 165, 250, 0.3)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            📊 Data Provenance
          </Button>
          <Button
            variant={viewMode === 'evidence' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('evidence')}
            startIcon={<Assessment />}
            sx={{
              flex: 1,
              color: viewMode === 'evidence' ? 'white' : '#34d399',
              background: viewMode === 'evidence' ? 
                'linear-gradient(135deg, #34d399, #10b981)' : 
                'transparent',
              border: viewMode === 'evidence' ? 'none' : '2px solid #34d399',
              fontWeight: 700,
              fontSize: '0.9rem',
              textTransform: 'none',
              py: 1.5,
              borderRadius: 2,
              boxShadow: viewMode === 'evidence' ? 
                '0 4px 20px rgba(52, 211, 153, 0.4)' : 
                '0 2px 8px rgba(52, 211, 153, 0.2)',
              '&:hover': {
                background: viewMode === 'evidence' ? 
                  'linear-gradient(135deg, #34d399, #10b981)' : 
                  'rgba(52, 211, 153, 0.1)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 24px rgba(52, 211, 153, 0.3)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            🔬 Evidence
          </Button>
          <Button
            variant={viewMode === 'comparison' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('comparison')}
            startIcon={<TrendingUp />}
            sx={{
              flex: 1,
              color: viewMode === 'comparison' ? 'white' : '#a855f7',
              background: viewMode === 'comparison' ? 
                'linear-gradient(135deg, #a855f7, #9333ea)' : 
                'transparent',
              border: viewMode === 'comparison' ? 'none' : '2px solid #a855f7',
              fontWeight: 700,
              fontSize: '0.9rem',
              textTransform: 'none',
              py: 1.5,
              borderRadius: 2,
              boxShadow: viewMode === 'comparison' ? 
                '0 4px 20px rgba(168, 85, 247, 0.4)' : 
                '0 2px 8px rgba(168, 85, 247, 0.2)',
              '&:hover': {
                background: viewMode === 'comparison' ? 
                  'linear-gradient(135deg, #a855f7, #9333ea)' : 
                  'rgba(168, 85, 247, 0.1)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 24px rgba(168, 85, 247, 0.3)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            📈 Benchmark
          </Button>
        </Box>
      </Box>

      {/* Toggle Navigation */}
      <Box sx={{ mb: 4 }}>
        <Button
          variant="contained"
          startIcon={<Gavel />}
          onClick={handleViewINDPackage}
          sx={{ 
            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
            color: 'white',
            fontWeight: 700,
            px: 3,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem',
            mb: 2,
            width: '100%'
          }}
        >
          📋 View Complete IND Package
        </Button>
      </Box>

      {/* Content based on view mode */}
      {viewMode === 'overview' && (
        <>
          <DataProvenanceCard 
            rawApiResponse={currentAnalysis.demoData || {}}
            summary={intelligenceData.dataProvenance?.summary}
            endpointType={endpoint}
            expanded={expandedSections.provenance}
            onToggle={() => toggleSection('provenance')}
          />
          <AnalysisSummaryCard summary={context?.summary} />
        </>
      )}

      {viewMode === 'evidence' && (
        <EvidenceBreakdownList evidenceItems={intelligenceData.evidenceBreakdown || []} />
      )}

      {viewMode === 'comparison' && (
        <>
          <ComparativeBenchmarkChart data={intelligenceData.comparativeIntelligence} />
          <BiotechContextSummary 
            context={intelligenceData.biotechContext} 
            decision={intelligenceData.decision}
          />
        </>
      )}

      {/* IND Package Dialog */}
      <Dialog 
        open={showINDPackage}
        onClose={handleCloseINDPackage}
        maxWidth="xl"
        fullWidth
        fullScreen
        sx={{
          '& .MuiDialog-paper': {
            background: 'linear-gradient(135deg, rgba(0,20,40,0.98) 0%, rgba(0,30,60,0.95) 100%)',
            backdropFilter: 'blur(20px)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            📋 IND Package Generator
          </Typography>
          <IconButton onClick={handleCloseINDPackage} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {showINDPackage && (
            <INDDocumentGenerator 
              analysisData={{
                metadata: {
                  targetName: 'PIK3CA E542K',
                  indication: 'Advanced Solid Tumors with PIK3CA E542K Mutation',
                  timestamp: new Date().toISOString(),
                  platform: 'Zeta Platform AI Analysis Suite'
                },
                oracle: {
                  zetaScore: -1883.15,
                  functionalImpact: 'HIGH-CONFIDENCE PATHOGENIC',
                  therapeuticWindow: '11.5x',
                  accessibilityScore: 0.88,
                  pathogenicity: 'Severe biological disruption',
                  targetConfidence: 96
                },
                forge: {
                  candidates: [
                    {
                      type: 'CRISPR',
                      id: 'crispr_guide_1',
                      efficacy: 94.5,
                      sequence: 'GACCCAGAACCGATACGAGG',
                      description: 'Precision CRISPR guide RNA'
                    },
                    {
                      type: 'Inhibitor',
                      id: 'protein_inhibitor_1',
                      efficacy: 12.3,
                      bindingAffinity: -12.3,
                      description: 'Novel protein inhibitor'
                    }
                  ],
                  averageEfficacy: 53.4,
                  therapeuticCount: 2,
                  designConfidence: 88
                },
                gauntlet: {
                  selectivityRatio: 56,
                  structuralConfidence: 87.2,
                  safetyMargin: 84,
                  efficacyPrediction: 76
                },
                dossier: {
                  completeness: 84,
                  readiness: 'complete',
                  costAvoidance: '$47.2M',
                  timeline: '5 minutes vs 36 months'
                }
              }}
              onClose={handleCloseINDPackage}
              fullscreen={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default EvidenceIntelligencePanel; 

export default EvidenceIntelligencePanel; 

export default EvidenceIntelligencePanel; 