/**
 * Research Intelligence Loading Skeleton
 * 
 * Shows skeleton loading state matching the actual content structure
 * for better perceived performance.
 * 
 * Research Use Only - Not for Clinical Diagnosis
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Skeleton,
  Stack,
  Divider
} from '@mui/material';

export default function ResearchIntelligenceSkeleton() {
  return (
    <Box>
      {/* Research Plan Skeleton */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="80%" height={24} sx={{ mb: 1 }} />
          <Stack spacing={1} sx={{ mt: 2 }}>
            <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
          </Stack>
        </CardContent>
      </Card>

      {/* Portal Results Skeleton */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Skeleton variant="text" width="30%" height={28} sx={{ mb: 2 }} />
          
          {/* Keyword Analysis Skeleton */}
          <Box sx={{ mb: 2 }}>
            <Skeleton variant="text" width="50%" height={24} sx={{ mb: 1 }} />
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} variant="rectangular" width={100} height={32} sx={{ borderRadius: 16 }} />
              ))}
            </Stack>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Papers List Skeleton */}
          <Stack spacing={2}>
            {[1, 2, 3].map((i) => (
              <Box key={i} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}>
                <Skeleton variant="text" width="70%" height={24} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="50%" height={20} sx={{ mb: 0.5 }} />
                <Skeleton variant="text" width="40%" height={20} />
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Parsed Content Skeleton */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Skeleton variant="text" width="30%" height={28} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="60%" height={20} />
        </CardContent>
      </Card>

      {/* Synthesized Findings Skeleton */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Skeleton variant="text" width="40%" height={28} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1, mb: 2 }} />
          <Stack spacing={1}>
            {[1, 2, 3].map((i) => (
              <Box key={i} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 1.5 }}>
                <Skeleton variant="text" width="60%" height={20} />
                <Skeleton variant="text" width="40%" height={16} sx={{ mt: 0.5 }} />
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* MOAT Analysis Skeleton */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Skeleton variant="text" width="30%" height={28} sx={{ mb: 2 }} />
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rectangular" width={120} height={32} sx={{ borderRadius: 16 }} />
            ))}
          </Stack>
          <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
        </CardContent>
      </Card>
    </Box>
  );
}


