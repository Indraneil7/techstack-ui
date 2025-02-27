import React from 'react';

interface Tool {
  id: number;
  created_at: number;
  name: string;
  icon: {
    url: string;
    name: string;
  };
  overview: string;
  features: string[];
  likes: number;
  website: string;
  category: 'Traditional' | 'AI';
}

interface ToolSelectorProps {
  tools: Tool[];
  onToolsChange: (tools: Tool[]) => void;
  category: 'Traditional' | 'AI';
}

export const ToolSelector: React.FC<ToolSelectorProps> = ({
  tools,
  onToolsChange,
  category
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center mb-2">
        <span className={`w-2 h-2 rounded-full mr-2 ${category === 'AI' ? 'bg-blue-400' : 'bg-gray-400'}`} />
        <span className="text-sm font-medium text-gray-700">{category} Tools</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {tools.map((tool) => (
          <div 
            key={tool.id}
            className="flex items-center bg-gray-100 rounded-full px-3 py-1"
          >
            {tool.icon && (
              <img 
                src={tool.icon.url} 
                alt={tool.name} 
                className="w-4 h-4 mr-2"
              />
            )}
            <span className="text-sm text-gray-700">{tool.name}</span>
            <button
              onClick={() => {
                const newTools = tools.filter(t => t.id !== tool.id);
                onToolsChange(newTools);
              }}
              className="ml-2 text-gray-400 hover:text-red-500"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      
      <button
        onClick={() => {
          // This should open a modal or dropdown to select from available tools
          // For now, we'll just show an alert
          alert('Tool selection modal will be implemented here');
        }}
        className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
      >
        <span className="mr-1">+</span>
        Add {category} Tool
      </button>
    </div>
  );
}; 