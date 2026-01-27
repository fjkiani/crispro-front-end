import React, { useState } from 'react';
import { mockTools } from '../../utils/mockTools';

const ToolSelector = ({ selectedTools, onChange }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Extract unique categories from tools
  const categories = ['all', ...new Set(mockTools.flatMap(tool => tool.categories))];
  
  // Filter tools based on active category
  const filteredTools = activeCategory === 'all' 
    ? mockTools
    : mockTools.filter(tool => tool.categories.includes(activeCategory));

  // Toggle tool selection with config
  const toggleTool = (toolId) => {
    if (selectedTools.some(t => t.id === toolId)) {
      onChange(selectedTools.filter(t => t.id !== toolId));
    } else {
      onChange([...selectedTools, {
        id: toolId,
        config: {} // Default empty config
      }]);
    }
  };

  // Check if a tool is selected
  const isToolSelected = (toolId) => {
    return selectedTools.some(t => t.id === toolId);
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
                ? 'bg-green-100 text-green-800 font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </button>
        ))}
      </div>

      {/* Tools grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {filteredTools.map(tool => (
          <div
            key={tool.id}
            onClick={() => toggleTool(tool.id)}
            className={`border rounded-md p-3 cursor-pointer transition-colors ${
              isToolSelected(tool.id)
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
            }`}
          >
            <div className="flex items-start">
              <div className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={isToolSelected(tool.id)}
                  onChange={() => toggleTool(tool.id)}
                  className="h-5 w-5 text-green-600 rounded-sm focus:ring-green-500"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <h3 className="text-sm font-medium text-gray-800">{tool.name}</h3>
                  {tool.mock && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">Mock</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{tool.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Selection summary */}
      {selectedTools.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <div className="text-xs text-gray-600 mb-2">{selectedTools.length} tools selected:</div>
          <div className="flex flex-wrap gap-1">
            {selectedTools.map(selectedTool => {
              const tool = mockTools.find(t => t.id === selectedTool.id);
              return (
                <span 
                  key={selectedTool.id}
                  className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded flex items-center"
                >
                  {tool?.name}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTool(selectedTool.id);
                    }}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Tool configuration would go here in a full implementation */}
      {selectedTools.length > 0 && (
        <div className="mt-4 p-3 border border-dashed border-gray-300 rounded-md bg-gray-50">
          <p className="text-xs text-gray-500 italic">
            In a full implementation, this area would contain configuration options for each selected tool.
            For this demonstration, tool configurations are simplified.
          </p>
        </div>
      )}
    </div>
  );
};

export default ToolSelector; 