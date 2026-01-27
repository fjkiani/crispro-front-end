import React from 'react';
import { Search, AlertCircle, FileQuestion, Loader2 } from 'lucide-react';

/**
 * Reusable Empty State component for consistent UX across the app
 */
const EmptyState = ({ 
  type = 'empty', // 'empty' | 'error' | 'loading' | 'no-results'
  title,
  message,
  action,
  actionLabel = 'Try Again',
  icon: CustomIcon,
  className = ''
}) => {
  // Default icons based on type
  const defaultIcons = {
    empty: Search,
    error: AlertCircle,
    'no-results': FileQuestion,
    loading: Loader2
  };

  const Icon = CustomIcon || defaultIcons[type] || Search;

  // Default messages
  const defaults = {
    empty: {
      title: 'No Data Available',
      message: 'There is currently no data to display. Try adding some items or adjusting your filters.'
    },
    error: {
      title: 'Something Went Wrong',
      message: 'We encountered an error while loading this data. Please try again or contact support if the problem persists.'
    },
    'no-results': {
      title: 'No Results Found',
      message: 'We couldn\'t find any results matching your criteria. Try adjusting your search or filters.'
    },
    loading: {
      title: 'Loading',
      message: 'Please wait while we fetch your data...'
    }
  };

  const finalTitle = title || defaults[type]?.title || defaults.empty.title;
  const finalMessage = message || defaults[type]?.message || defaults.empty.message;

  // Color schemes by type
  const colorSchemes = {
    empty: 'text-gray-400 border-gray-600',
    error: 'text-red-400 border-red-600',
    'no-results': 'text-yellow-400 border-yellow-600',
    loading: 'text-blue-400 border-blue-600'
  };

  const colors = colorSchemes[type] || colorSchemes.empty;
  const isLoading = type === 'loading';

  return (
    <div className={`flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed bg-gray-900/40 ${colors} ${className}`}>
      <Icon 
        className={`w-16 h-16 mb-4 ${isLoading ? 'animate-spin' : ''}`} 
        strokeWidth={1.5}
      />
      <h3 className="text-lg font-semibold mb-2 text-gray-200">
        {finalTitle}
      </h3>
      <p className="text-sm text-gray-400 text-center max-w-md mb-4">
        {finalMessage}
      </p>
      {action && !isLoading && (
        <button
          onClick={action}
          className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;


