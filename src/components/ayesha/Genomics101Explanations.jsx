/**
 * Genomics101Explanations - Patient-friendly genetic explanations
 * 
 * Provides simple, accessible explanations of genetic findings and their treatment implications.
 */

import React from 'react';
import { Card, Typography, Box } from '@mui/material';

export default function Genomics101Explanations({ patientProfile, result }) {
  if (!patientProfile || (!patientProfile.germline?.mutations?.length && !patientProfile.tumor_context?.somatic_mutations?.length)) {
    return null;
  }

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        🧬 Understanding Your Genetics
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Simple explanations of your genetic findings and what they mean for your treatment.
      </Typography>

      {/* MBD4 Explanation */}
      {patientProfile.germline?.mutations?.find(m => m.gene === 'MBD4' && m.classification === 'pathogenic') && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
            MBD4 Mutation (Homozygous)
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>What it means:</strong> You have a mutation in both copies of the MBD4 gene. 
            This gene normally repairs DNA damage. When it's broken, your cells can't fix certain 
            types of DNA damage as well.
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Why this matters for treatment:</strong> Because your DNA repair system is compromised, 
            drugs that create DNA damage (like platinum chemotherapy or PARP inhibitors) can be especially 
            effective. Your tumor is more vulnerable to these drugs.
          </Typography>
          <Typography variant="body2">
            <strong>Risk increases:</strong> This mutation is associated with increased risk for 
            acute myeloid leukemia and colorectal cancer. Regular monitoring is recommended.
          </Typography>
        </Box>
      )}

      {/* TP53 Explanation */}
      {patientProfile.tumor_context?.somatic_mutations?.find(m => m.gene === 'TP53') && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
            TP53 Mutation (Tumor)
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>What it means:</strong> Your tumor has a mutation in the TP53 gene, which is 
            often called the "guardian of the genome." This gene normally stops damaged cells from 
            growing and dividing.
          </Typography>
          <Typography variant="body2">
            <strong>Why this matters for treatment:</strong> When TP53 is broken, tumor cells can 
            grow unchecked. However, this also means the tumor has lost an important "checkpoint" 
            that normally protects cells from DNA-damaging drugs. Combined with your MBD4 mutation, 
            this creates a "double hit" vulnerability that certain drugs can exploit.
          </Typography>
        </Box>
      )}

      {/* PDGFRA VUS Explanation */}
      {patientProfile.germline?.mutations?.find(m => m.gene === 'PDGFRA' && m.classification === 'VUS') && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
            PDGFRA Variant (VUS - Variant of Uncertain Significance)
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>What it means:</strong> A variant (genetic change) was found in your PDGFRA gene, 
            but we don't yet know if it causes disease or is harmless. It could contribute to your 
            cancer risk, or it could be benign (harmless).
          </Typography>
          <Typography variant="body2">
            <strong>What we're doing:</strong> We're using advanced AI tools (Evo2, AlphaMissense) 
            to analyze this variant and determine if it's likely harmful. The results will help 
            clarify whether this variant needs monitoring or action.
          </Typography>
        </Box>
      )}

      {/* Synthetic Lethality Explanation */}
      {result?.synthetic_lethality?.synthetic_lethality_detected && (
        <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Treatment Opportunity: Synthetic Lethality
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>What this means:</strong> Your combination of genetic mutations (MBD4 + TP53) 
            creates a specific vulnerability. When both DNA repair pathways are broken, your tumor 
            becomes dependent on backup pathways that can be targeted with drugs.
          </Typography>
          <Typography variant="body2">
            <strong>Why this is good news:</strong> This vulnerability means certain drugs (like 
            PARP inhibitors, platinum chemotherapy, or ATR inhibitors) may be especially effective 
            for you because they target the pathways your tumor now depends on.
          </Typography>
        </Box>
      )}
    </Card>
  );
}
