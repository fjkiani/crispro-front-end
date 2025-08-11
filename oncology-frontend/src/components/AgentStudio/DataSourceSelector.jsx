import React, { useState } from 'react';
import { mockDataSources } from '../../utils/mockDataSources';

const DataSourceSelector = ({ selectedSources, onChange }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Extract unique categories from data sources
  const categories = ['all', ...new Set(mockDataSources.flatMap(source => source.categories))];
  
  // Filter sources based on active category
  const filteredSources = activeCategory === 'all' 
    ? mockDataSources
    : mockDataSources.filter(source => source.categories.includes(activeCategory));

  // Toggle data source selection
  const toggleSource = (sourceId) => {
    if (selectedSources.includes(sourceId)) {
      onChange(selectedSources.filter(id => id !== sourceId));
    } else {
      onChange([...selectedSources, sourceId]);
    }
  };

  return (
    <div>
      {/* Category tabs */}
      <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
              activeCategory === category
                ? 'bg-blue-100 text-blue-800 font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Data sources grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {filteredSources.map(source => (
          <div
            key={source.id}
            onClick={() => toggleSource(source.id)}
            className={`border rounded-md p-3 cursor-pointer transition-colors ${
              selectedSources.includes(source.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
            }`}
          >
            <div className="flex items-start">
              <div className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={selectedSources.includes(source.id)}
                  onChange={() => toggleSource(source.id)}
                  className="h-5 w-5 text-blue-600 rounded-sm focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <h3 className="text-sm font-medium text-gray-800">{source.name}</h3>
                  {source.mock && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">Mock</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{source.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Selection summary */}
      {selectedSources.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <div className="text-xs text-gray-600 mb-2">{selectedSources.length} data sources selected:</div>
          <div className="flex flex-wrap gap-1">
            {selectedSources.map(sourceId => {
              const source = mockDataSources.find(s => s.id === sourceId);
              return (
                <span 
                  key={sourceId}
                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center"
                >
                  {source?.name}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSource(sourceId);
                    }}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataSourceSelector; 