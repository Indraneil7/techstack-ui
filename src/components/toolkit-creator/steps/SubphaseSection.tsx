import React from 'react';
import { MutableProcessStep } from '../../../types/index';
import { ToolSelector } from './ToolSelector';

interface SubphaseSectionProps {
  subphases: MutableProcessStep['subphases'];
  onUpdate: (subphases: MutableProcessStep['subphases']) => void;
}

export const SubphaseSection: React.FC<SubphaseSectionProps> = ({
  subphases,
  onUpdate,
}) => {
  const addSubphase = () => {
    const newSubphases = [...subphases, {
      name: '',
      description: '',
      traditional: { tools: [] },
      ai: { tools: [] }
    }];
    onUpdate(newSubphases);
  };

  const removeSubphase = (index: number) => {
    const newSubphases = subphases.filter((_, i) => i !== index);
    onUpdate(newSubphases);
  };

  const updateSubphase = (index: number, updates: Partial<MutableProcessStep['subphases'][0]>) => {
    const newSubphases = [...subphases];
    newSubphases[index] = { ...newSubphases[index], ...updates };
    onUpdate(newSubphases);
  };

  return (
    <div className="mt-5">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Subphases</h3>
      
      <div className="space-y-6">
        {subphases.map((subphase, index) => (
          <div 
            key={index}
            className="p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex flex-col mb-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={subphase.name}
                    onChange={(e) => updateSubphase(index, { name: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-medium border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Subphase name"
                  />
                </div>
                <button
                  onClick={() => removeSubphase(index)}
                  className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              
              <textarea
                value={subphase.description}
                onChange={(e) => updateSubphase(index, { description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 mb-4"
                placeholder="Subphase description"
              />

              {/* Tool Sections - Side by Side */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-md p-3 shadow-sm">
                  <ToolSelector
                    tools={subphase.traditional.tools}
                    onUpdate={(tools) => updateSubphase(index, { 
                      traditional: { tools } 
                    })}
                    category="Traditional"
                  />
                </div>

                <div className="bg-white rounded-md p-3 shadow-sm">
                  <ToolSelector
                    tools={subphase.ai.tools}
                    onUpdate={(tools) => updateSubphase(index, { 
                      ai: { tools } 
                    })}
                    category="AI"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addSubphase}
        className="w-full py-2 border-2 border-dashed border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
      >
        <span className="text-sm font-medium text-blue-700">
          Add Subphase
        </span>
      </button>
    </div>
  );
}; 