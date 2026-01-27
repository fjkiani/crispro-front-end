import React from 'react';

/**
 * Reusable loading skeleton components for consistent loading states
 */

export const SkeletonBox = ({ width = 'w-full', height = 'h-4', className = '' }) => (
  <div 
    className={`${width} ${height} bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-pulse rounded ${className}`}
  />
);

export const SkeletonText = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <SkeletonBox 
        key={i} 
        width={i === lines - 1 ? 'w-3/4' : 'w-full'} 
      />
    ))}
  </div>
);

export const SkeletonCard = ({ className = '' }) => (
  <div className={`p-4 rounded-lg border border-gray-700 bg-gray-800/40 ${className}`}>
    <SkeletonBox height="h-6" className="mb-3" width="w-1/3" />
    <SkeletonText lines={3} />
  </div>
);

export const SkeletonTable = ({ rows = 5, columns = 4, className = '' }) => (
  <div className={`overflow-hidden rounded-lg border border-gray-700 ${className}`}>
    {/* Header */}
    <div className="flex gap-4 p-3 bg-gray-800 border-b border-gray-700">
      {Array.from({ length: columns }).map((_, i) => (
        <SkeletonBox key={i} width="flex-1" height="h-5" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIdx) => (
      <div key={rowIdx} className="flex gap-4 p-3 border-b border-gray-700/50">
        {Array.from({ length: columns }).map((_, colIdx) => (
          <SkeletonBox key={colIdx} width="flex-1" height="h-4" />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonChips = ({ count = 4, className = '' }) => (
  <div className={`flex flex-wrap gap-2 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonBox 
        key={i} 
        width="w-24" 
        height="h-8" 
        className="rounded-full"
      />
    ))}
  </div>
);

const LoadingSkeleton = {
  Box: SkeletonBox,
  Text: SkeletonText,
  Card: SkeletonCard,
  Table: SkeletonTable,
  Chips: SkeletonChips
};

export default LoadingSkeleton;


