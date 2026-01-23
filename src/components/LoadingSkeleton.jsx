import React from 'react';
import { Box, Skeleton, Stack, Card, CardContent } from '@mui/material';

/**
 * Reusable loading skeleton components for different page types
 */

export const PageLoadingSkeleton = () => (
  <Stack spacing={3} sx={{ width: '100%', p: 3 }}>
    {/* Header skeleton */}
    <Skeleton variant="text" width="40%" height={40} />
    <Skeleton variant="text" width="60%" height={24} />
    
    {/* Content skeleton */}
    <Stack spacing={2}>
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} variant="rectangular" height={120} sx={{ borderRadius: 1 }} />
      ))}
    </Stack>
  </Stack>
);

export const CardGridSkeleton = ({ count = 6 }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: 3,
      p: 3
    }}
  >
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i}>
        <CardContent>
          <Skeleton variant="text" width="60%" height={28} />
          <Skeleton variant="text" width="100%" height={20} />
          <Skeleton variant="text" width="100%" height={20} />
          <Skeleton variant="rectangular" height={100} sx={{ mt: 2, borderRadius: 1 }} />
        </CardContent>
      </Card>
    ))}
  </Box>
);

export const TableLoadingSkeleton = ({ rows = 5, columns = 4 }) => (
  <Stack spacing={1} sx={{ width: '100%', p: 2 }}>
    {/* Header */}
    <Stack direction="row" spacing={2}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} variant="text" width={`${100 / columns}%`} height={32} />
      ))}
    </Stack>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <Stack key={rowIndex} direction="row" spacing={2}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} variant="text" width={`${100 / columns}%`} height={24} />
        ))}
      </Stack>
    ))}
  </Stack>
);

export const CompleteCareLoadingSkeleton = () => (
  <Stack spacing={4} sx={{ p: 4 }}>
    {/* Header */}
    <Box>
      <Skeleton variant="text" width="50%" height={36} />
      <Skeleton variant="text" width="70%" height={24} sx={{ mt: 1 }} />
    </Box>

    {/* Profile selector */}
    <Stack direction="row" spacing={2}>
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} />
      ))}
    </Stack>

    {/* Drug recommendations section */}
    <Box>
      <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
      <Stack spacing={2}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="40%" height={28} />
                  <Skeleton variant="text" width="60%" height={20} />
                </Box>
                <Box>
                  <Skeleton variant="circular" width={60} height={60} />
                </Box>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
                ))}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>

    {/* Food recommendations section */}
    <Box>
      <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
      <Stack spacing={2}>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent>
              <Skeleton variant="text" width="50%" height={28} />
              <Skeleton variant="text" width="100%" height={20} />
              <Skeleton variant="text" width="80%" height={20} />
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  </Stack>
);

export const FoodValidatorLoadingSkeleton = () => (
  <Stack spacing={3} sx={{ p: 4 }}>
    {/* Header */}
    <Skeleton variant="text" width="40%" height={36} />
    
    {/* Input form */}
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={150} height={40} sx={{ borderRadius: 1 }} />
        </Stack>
      </CardContent>
    </Card>

    {/* Results section */}
    <Box>
      <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
      <Card>
        <CardContent>
          <Stack spacing={3}>
            {/* S/P/E scores */}
            <Stack direction="row" spacing={2}>
              {['S', 'P', 'E'].map((label) => (
                <Box key={label} sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="40%" height={24} />
                  <Skeleton variant="circular" width={80} height={80} sx={{ mx: 'auto', mt: 1 }} />
                  <Skeleton variant="text" width="60%" height={20} sx={{ mt: 1 }} />
                </Box>
              ))}
            </Stack>

            {/* Evidence section */}
            <Box>
              <Skeleton variant="text" width="30%" height={28} sx={{ mb: 1 }} />
              <Stack spacing={1}>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} variant="text" width="100%" height={20} />
                ))}
              </Stack>
            </Box>

            {/* Recommendations */}
            <Box>
              <Skeleton variant="text" width="40%" height={28} sx={{ mb: 1 }} />
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 1 }} />
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  </Stack>
);

export const CoPilotLoadingSkeleton = () => (
  <Stack spacing={2} sx={{ p: 2 }}>
    {/* Typing indicator */}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Skeleton variant="circular" width={32} height={32} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="30%" height={20} />
      </Box>
    </Box>
    {/* Message skeleton */}
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Skeleton variant="circular" width={32} height={32} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
      </Box>
    </Box>
  </Stack>
);

export default {
  PageLoadingSkeleton,
  CardGridSkeleton,
  TableLoadingSkeleton,
  CompleteCareLoadingSkeleton,
  FoodValidatorLoadingSkeleton,
  CoPilotLoadingSkeleton
};






