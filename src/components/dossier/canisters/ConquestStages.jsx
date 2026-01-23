import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Button, Dialog, DialogTitle, DialogContent, DialogActions, Card, CardContent, Divider, Alert, LinearProgress } from '@mui/material';
import { useSpring, animated } from 'react-spring';
import ShieldIcon from '@mui/icons-material/Shield';
import TokenIcon from '@mui/icons-material/Token';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LaunchIcon from '@mui/icons-material/Launch';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SecurityIcon from '@mui/icons-material/Security';

// STAGE 2: FORTIFY - Patent Filing
export const FortifyPatentFiling = ({ dossierData, onPatentFiled }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilePatent = async () => {
    setIsProcessing(true);
    // Simulate patent filing process
    setTimeout(() => {
      setIsProcessing(false);
      setIsDialogOpen(false);
      onPatentFiled?.({
        filing_number: 'US-PROV-2024-001234',
        claims_count: 45,
        priority_date: new Date().toISOString().split('T')[0],
        estimated_cost: 15000
      });
    }, 3000);
  };

  const patentAnimation = useSpring({
    from: { opacity: 0, transform: 'translateX(-30px)' },
    to: { opacity: 1, transform: 'translateX(0px)' },
    config: { tension: 200, friction: 20 },
    delay: 600,
  });

  return (
    <animated.div style={patentAnimation}>
      <Paper sx={{
        p: 4,
        background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.15), rgba(25, 118, 210, 0.05))',
        border: '2px solid rgba(25, 118, 210, 0.3)',
        borderRadius: 4,
        mb: 4
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <ShieldIcon sx={{ fontSize: 40, color: '#1976d2', mr: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'white' }}>
            🛡️ FORTIFY: Patent Protection
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" sx={{ color: '#60a5fa', mb: 2, fontWeight: 700 }}>
              Provisional Patent Application Ready
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 1 }}>
                ✅ <strong>45 Novel Composition Claims</strong> - Small molecule inhibitors, CRISPR guides, synthesis methods
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 1 }}>
                ✅ <strong>Zero Prior Art Conflicts</strong> - AI-powered patent landscape analysis completed
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 1 }}>
                ✅ <strong>Expedited Filing Track</strong> - 24-hour provisional protection available
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 1 }}>
                ✅ <strong>PCT Conversion Ready</strong> - International protection pathway secured
              </Typography>
            </Box>

            <Alert severity="info" sx={{ mb: 3, bgcolor: 'rgba(96, 165, 250, 0.1)', color: 'white' }}>
              <Typography variant="body2">
                <strong>Strategic Advantage:</strong> Filing immediately creates prior art date and defensive IP position. 
                Estimated patent value: $10M-$50M upon validation completion.
              </Typography>
            </Alert>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.2), rgba(25, 118, 210, 0.1))',
              border: '1px solid rgba(25, 118, 210, 0.4)'
            }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ color: '#1976d2', fontWeight: 900, mb: 1 }}>
                  $15K
                </Typography>
                <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
                  Filing Cost
                </Typography>
                
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => setIsDialogOpen(true)}
                  disabled={isProcessing}
                  sx={{
                    background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                    width: '100%',
                    py: 2,
                    fontWeight: 700,
                    fontSize: '1.1rem'
                  }}
                >
                  {isProcessing ? 'Filing...' : '🚀 FILE PATENT NOW'}
                </Button>
                
                <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'rgba(255,255,255,0.7)' }}>
                  24-hour provisional protection
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Patent Filing Dialog */}
        <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white' }}>
            <ShieldIcon sx={{ mr: 2 }} />
            Confirm Patent Filing
          </DialogTitle>
          <DialogContent sx={{ bgcolor: '#1a1a1a', color: 'white', pt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Patent Application Summary
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Title:</strong> "AI-Generated PIK3CA E542K Selective Inhibitor Compositions and CRISPR Guide Systems"
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Claims:</strong> 45 total (15 composition, 10 CRISPR, 10 synthesis, 10 therapeutic use)
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Filing Type:</strong> US Provisional Patent Application
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Cost:</strong> $15,000 (including attorney fees, USPTO fees, prior art search)
            </Typography>
            {isProcessing && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" sx={{ mb: 2 }}>Filing in progress...</Typography>
                <LinearProgress />
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ bgcolor: '#1a1a1a', p: 3 }}>
            <Button onClick={() => setIsDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              onClick={handleFilePatent} 
              variant="contained" 
              disabled={isProcessing}
              sx={{ background: 'linear-gradient(45deg, #1976d2, #42a5f5)' }}
            >
              {isProcessing ? 'Filing...' : 'Confirm Filing'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </animated.div>
  );
};

// STAGE 3: ARM - IP-NFT Minting
export const ArmIPNFT = ({ patentData, onNFTMinted }) => {
  const [isMinting, setIsMinting] = useState(false);

  const handleMintNFT = async () => {
    setIsMinting(true);
    // Simulate NFT minting process
    setTimeout(() => {
      setIsMinting(false);
      onNFTMinted?.({
        collection_address: '0x742d35cc6600c7c47b7c40a7ab5c6b1e6e7a1b2c',
        total_supply: 1000,
        token_price: 5000,
        funding_target: 5000000
      });
    }, 4000);
  };

  const nftAnimation = useSpring({
    from: { opacity: 0, transform: 'translateX(30px)' },
    to: { opacity: 1, transform: 'translateX(0px)' },
    config: { tension: 200, friction: 20 },
    delay: 800,
  });

  return (
    <animated.div style={nftAnimation}>
      <Paper sx={{
        p: 4,
        background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.15), rgba(156, 39, 176, 0.05))',
        border: '2px solid rgba(156, 39, 176, 0.3)',
        borderRadius: 4,
        mb: 4
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <TokenIcon sx={{ fontSize: 40, color: '#9c27b0', mr: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'white' }}>
            ⚔️ ARM: IP-NFT Weaponization
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ color: '#e1bee7', mb: 2, fontWeight: 700 }}>
              Fractional Patent Ownership Tokens
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Total Supply
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                    1,000 NFTs
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Token Price
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#9c27b0', fontWeight: 700 }}>
                    $5,000 each
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Funding Target
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#22c55e', fontWeight: 700 }}>
                    $5M total
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Revenue Share
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#f59e0b', fontWeight: 700 }}>
                    2-5% royalties
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 3, lineHeight: 1.6 }}>
              Each IP-NFT represents fractional ownership of patent application <strong>{patentData?.filing_number}</strong> 
              and entitles holders to proportional revenue sharing from future licensing deals.
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.2), rgba(156, 39, 176, 0.1))',
              border: '1px solid rgba(156, 39, 176, 0.4)',
              height: '100%'
            }}>
              <CardContent sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <TokenIcon sx={{ fontSize: 60, color: '#9c27b0', mb: 2 }} />
                <Typography variant="h5" sx={{ color: 'white', mb: 3, fontWeight: 700 }}>
                  PIK3CA IP-NFT Collection
                </Typography>
                
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleMintNFT}
                  disabled={isMinting}
                  sx={{
                    background: 'linear-gradient(45deg, #9c27b0, #e1bee7)',
                    width: '100%',
                    py: 2,
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    mb: 2
                  }}
                >
                  {isMinting ? 'Minting...' : '⚡ MINT IP-NFT COLLECTION'}
                </Button>
                
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Deploy on Polygon • Low gas fees • Instant trading
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </animated.div>
  );
};

// STAGE 4: FUND - DeSci Community Raise
export const FundDeSciRaise = ({ nftData, onFundingLaunched }) => {
  const [isLaunching, setIsLaunching] = useState(false);

  const handleLaunchFunding = async () => {
    setIsLaunching(true);
    setTimeout(() => {
      setIsLaunching(false);
      onFundingLaunched?.({
        marketplace_url: 'https://desci.market/collections/pik3ca-ip-nft',
        funding_raised: 0,
        target_amount: 5000000,
        launch_date: new Date().toISOString()
      });
    }, 2000);
  };

  const fundAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(30px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: { tension: 200, friction: 20 },
    delay: 1000,
  });

  return (
    <animated.div style={fundAnimation}>
      <Paper sx={{
        p: 4,
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05))',
        border: '2px solid rgba(245, 158, 11, 0.3)',
        borderRadius: 4,
        mb: 4
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <AttachMoneyIcon sx={{ fontSize: 40, color: '#f59e0b', mr: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'white' }}>
            🧬 FUND: Scientific Democracy
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" sx={{ color: '#fbbf24', mb: 2, fontWeight: 700 }}>
              Breaking the Broken System: Scientists Fund Scientists
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2, lineHeight: 1.6 }}>
                🎯 <strong>No More VC Pivots:</strong> Research community validates and funds based on scientific merit, not market trends or investor buzzwords
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2, lineHeight: 1.6 }}>
                🧪 <strong>Data-Driven Funding:</strong> Computational validation + peer review replaces PowerPoint pitches and hockey stick projections
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2, lineHeight: 1.6 }}>
                📊 <strong>Transparent Science:</strong> All validation data, protocols, and results publicly accessible - no hiding behind NDAs
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2, lineHeight: 1.6 }}>
                🏆 <strong>Scientific ROI:</strong> Returns based on therapeutic impact and patent value - good science = good returns
              </Typography>
            </Box>

            <Alert severity="info" sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', color: 'white' }}>
              <Typography variant="body2">
                <strong>The New Standard:</strong> Scientists who understand biology fund breakthroughs that VCs would force to pivot. 
                No compromise. No dilution. Pure scientific integrity at scale.
              </Typography>
            </Alert>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1))',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              textAlign: 'center'
            }}>
              <CardContent>
                <TrendingUpIcon sx={{ fontSize: 50, color: '#f59e0b', mb: 2 }} />
                <Typography variant="h3" sx={{ color: '#f59e0b', fontWeight: 900, mb: 1 }}>
                  $5M
                </Typography>
                <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
                  Community Funding Target
                </Typography>
                
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleLaunchFunding}
                  disabled={isLaunching}
                  sx={{
                    background: 'linear-gradient(45deg, #f59e0b, #fbbf24)',
                    width: '100%',
                    py: 2,
                    fontWeight: 700,
                    fontSize: '1.1rem'
                  }}
                >
                  {isLaunching ? 'Launching...' : '🚀 LAUNCH ON DESCI MARKETS'}
                </Button>
                
                <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'rgba(255,255,255,0.7)' }}>
                  Live marketplace integration
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </animated.div>
  );
};

// STAGE 5: CONQUER - Licensing & Rewards
export const ConquerLicensing = ({ fundingData }) => {
  const conquerAnimation = useSpring({
    from: { opacity: 0, transform: 'scale(0.9)' },
    to: { opacity: 1, transform: 'scale(1)' },
    config: { tension: 200, friction: 20 },
    delay: 1200,
  });

  return (
    <animated.div style={conquerAnimation}>
      <Paper sx={{
        p: 4,
        background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(220, 38, 38, 0.05))',
        border: '2px solid rgba(220, 38, 38, 0.3)',
        borderRadius: 4,
        mb: 4
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <EmojiEventsIcon sx={{ fontSize: 40, color: '#dc2626', mr: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'white' }}>
            👑 CONQUER: Licensing Supremacy
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" sx={{ color: '#f87171', mb: 2, fontWeight: 700 }}>
              Victory Economics & Revenue Projections
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Validation Success Probability
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#22c55e', fontWeight: 700 }}>
                    95%
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    Based on AI predictions
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Patent Value (Validated)
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#60a5fa', fontWeight: 700 }}>
                    $100M-$500M
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    Market comparable analysis
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Licensing Royalty Rate
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#f59e0b', fontWeight: 700 }}>
                    8-15%
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    To pharma partners
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    NFT Holder Revenue Share
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#9c27b0', fontWeight: 700 }}>
                    2-5%
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    Of licensing revenue
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.2)' }} />

            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.6 }}>
              Upon successful validation, the patent becomes exponentially more valuable. Major pharmaceutical 
              companies will compete for licensing rights, driving up royalty rates and total deal value. 
              IP-NFT holders receive proportional revenue distributions via smart contracts.
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.2), rgba(220, 38, 38, 0.1))',
              border: '1px solid rgba(220, 38, 38, 0.4)',
              textAlign: 'center',
              height: '100%'
            }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                <EmojiEventsIcon sx={{ fontSize: 60, color: '#dc2626', mb: 2 }} />
                <Typography variant="h4" sx={{ color: '#dc2626', fontWeight: 900, mb: 1 }}>
                  TOTAL
                </Typography>
                <Typography variant="h4" sx={{ color: '#dc2626', fontWeight: 900, mb: 1 }}>
                  VICTORY
                </Typography>
                <Divider sx={{ my: 2, borderColor: 'rgba(220, 38, 38, 0.3)' }} />
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, lineHeight: 1.4 }}>
                  Platform → Patent → NFT → Funding → Licensing → Returns
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 2 }}>
                  First-ever AI-to-licensing pipeline complete
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </animated.div>
  );
};

export default {
  FortifyPatentFiling,
  ArmIPNFT,
  FundDeSciRaise,
  ConquerLicensing
}; 