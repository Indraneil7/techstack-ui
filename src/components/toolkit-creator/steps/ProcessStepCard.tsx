import React, { useState, useEffect, useCallback } from 'react';
import { MutableProcessStep, Tool } from '../../../types/index';
import { SubphaseSection } from './SubphaseSection';
import { aiService } from '../../../services/ai';
import { SparklesIcon } from '@heroicons/react/24/outline';

// Use the same MutableSubphase interface
interface MutableSubphase {
  name: string;
  description: string;
  traditional: { tools: Tool[] };
  ai: { tools: Tool[] };
}

interface ProcessStepCardProps {
  step: MutableProcessStep;
  stepNumber: number;
  onUpdate: (step: MutableProcessStep) => void;
  onRemove: () => void;
}

export const ProcessStepCard: React.FC<ProcessStepCardProps> = ({
  step,
  stepNumber,
  onUpdate,
  onRemove
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidForAI, setIsValidForAI] = useState(false);
  
  const validateForAIGeneration = useCallback(() => {
    if (!step.name) return false;
    
    for (const subphase of step.subphases) {
      if (!subphase.name) return false;
      
      const allTools = [
        ...(subphase.traditional?.tools || []),
        ...(subphase.ai?.tools || [])
      ];
      
      if (allTools.length > 0) {
        const hasEmptyTools = allTools.some(tool => !tool.name || !tool.website);
        if (hasEmptyTools) return false;
      }
    }
    
    return true;
  }, [step]);

  useEffect(() => {
    const isValid = validateForAIGeneration();
    setIsValidForAI(isValid);
  }, [validateForAIGeneration]);

  // Implement exponential backoff for API requests
  const fetchWithRetry = async (
    apiCall: () => Promise<any>,
    maxRetries = 5,
    initialDelay = 1000
  ) => {
    let retries = 0;
    let delay = initialDelay;
    
    while (retries < maxRetries) {
      try {
        return await apiCall();
      } catch (error) {
        if (typeof error === 'object' && error !== null && 'status' in error) {
          if (error.status === 429) {
            retries++;
            console.log(`Rate limited, waiting ${delay}ms before retry ${retries}/${maxRetries}`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // Double the delay for next retry
          } else {
            throw error;
          }
        }
      }
    }
    
    throw new Error(`Maximum retries (${maxRetries}) exceeded`);
  };

  const handleGenerateWithAI = async () => {
    if (!isValidForAI) {
      alert('Please ensure all tools have both name and website fields filled out.');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Generate process step description with retry
      const description = await fetchWithRetry(() => 
        aiService.generateProcessDescription(step.name)
      );
      
      // Make a copy of the step to update
      const updatedStep = { ...step, info: description };
      
      // Generate descriptions for all subphases
      const updatedSubphases = await Promise.all(
        step.subphases.map(async (subphase) => {
          if (!subphase.name) return subphase;
          
          // Generate subphase description with retry
          const subphaseDescription = await fetchWithRetry(() =>
            aiService.generateProcessDescription(
              `Subphase: ${subphase.name} of process step ${step.name}`
            )
          );
          
          // Update traditional tools if any
          const updatedTradTools = await Promise.all(
            subphase.traditional.tools.map(async (tool) => {
              if (!tool.name || !tool.website) return tool;
              // For tools with names but without descriptions, generate them
              if (!tool.overview || tool.overview.trim() === '') {
                const overview = await fetchWithRetry(() =>
                  aiService.generateProcessDescription(
                    `Traditional tool: ${tool.name} for ${subphase.name} in ${step.name}`
                  )
                );
                return { ...tool, overview };
              }
              return tool;
            })
          );
          
          // Update AI tools if any
          const updatedAITools = await Promise.all(
            subphase.ai.tools.map(async (tool) => {
              if (!tool.name || !tool.website) return tool;
              // For tools with names but without descriptions, generate them
              if (!tool.overview || tool.overview.trim() === '') {
                const overview = await fetchWithRetry(() =>
                  aiService.generateProcessDescription(
                    `AI tool: ${tool.name} for ${subphase.name} in ${step.name}`
                  )
                );
                return { ...tool, overview };
              }
              return tool;
            })
          );
          
          return {
            ...subphase,
            description: subphaseDescription,
            traditional: { tools: updatedTradTools },
            ai: { tools: updatedAITools }
          };
        })
      );
      
      // Update the step with all the new data
      onUpdate({ ...updatedStep, subphases: updatedSubphases });
    } catch (error) {
      console.error('Error generating AI content:', error);
      alert('There was an error generating content. Please try again later.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateSubphases = (newSubphases: MutableSubphase[]) => {
    onUpdate({
      ...step,
      subphases: newSubphases
    });
  };

  return (
    <div className="w-[550px] flex-shrink-0">
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-full overflow-y-auto max-h-[600px]">
        <div className="flex items-start">
          <div className="flex-1">
            <div className="flex items-center mb-4">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium mr-3">
                {stepNumber}
              </span>
              <input
                type="text"
                value={step.name}
                onChange={(e) => onUpdate({ ...step, name: e.target.value })}
                className="flex-1 font-medium text-blue-900 px-3 py-2 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Process step name"
              />
            </div>
            
            <div className="mb-5 flex items-start">
              <textarea
                value={step.info}
                onChange={(e) => onUpdate({ ...step, info: e.target.value })}
                rows={3}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Process step description"
              />
            </div>
            
            {/* AI Button - With visual feedback */}
            <div className="mb-5">
              <button
                onClick={handleGenerateWithAI}
                disabled={!isValidForAI || isGenerating}
                className={`w-full px-4 py-3 rounded-md text-sm font-medium relative group flex items-center justify-center ${
                  !isValidForAI || isGenerating
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all'
                }`}
              >
                <SparklesIcon className="h-5 w-5 mr-2" />
                {isGenerating ? 'Generating...' : 'Generate with AI'}
                <div className="absolute hidden group-hover:block w-72 bg-gray-800 text-white text-xs rounded p-2 -top-20 left-1/2 transform -translate-x-1/2 z-10">
                  {!isValidForAI ? 
                    'All tools must have name and website fields filled out.' :
                    'Click to generate AI descriptions for all content.'
                  }
                </div>
              </button>
            </div>
          </div>
          
          <button
            onClick={onRemove}
            className="ml-4 text-gray-400 hover:text-red-500 transition-colors"
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

        {/* Subphases */}
        <SubphaseSection
          subphases={step.subphases}
          onUpdate={handleUpdateSubphases}
        />
      </div>
    </div>
  );
}; 