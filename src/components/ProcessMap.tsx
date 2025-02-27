import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Info, ChevronLeft, ChevronRight, Sparkles, Wand2 } from 'lucide-react';
import { ProcessStep, Tool, Subphase } from '../types/index';
import styled from 'styled-components';

// Create a styled component for the scrollable container
const ScrollContainer = styled.div`
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

interface ProcessMapProps {
  data: {
    processSteps: ProcessStep[];
  };
  onToolClick: (tool: Tool) => void;
  explanations: {[key: string]: boolean};
}

interface ToolButtonProps {
  tool: Tool;
  onClick: (tool: Tool) => void;
  category: 'traditional' | 'ai';
}

// Process information for tooltips
const PROCESS_INFO = {
  'Research & Discovery': {
    title: 'Understanding Your Market and Users',
    description: 'This phase focuses on gathering crucial insights about market needs, user behaviors, and competitive landscape.'
  },
  'Planning & Strategy': {
    title: 'Mapping Your Path Forward',
    description: 'In this phase, we transform insights into actionable plans.'
  }
} as const;

type InfoType = 'traditional' | 'ai' | `step-${number}` | null;

const ToolButton: React.FC<ToolButtonProps> = ({ tool, onClick, category }) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2" ry="2"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>';
  };

  const bgColor = category === 'traditional' ? 'bg-blue-50 hover:bg-blue-100' : 'bg-purple-50 hover:bg-purple-100';

  return (
    <motion.div whileHover={{ scale: 1.02 }}>
      <button
        className={`w-full p-2 rounded-md flex items-center space-x-2 ${bgColor}`}
        onClick={() => onClick(tool)}
      >
        <img 
          src={tool.icon?.url} 
          alt={tool.name}
            className="w-8 h-8 rounded object-cover"
          onError={handleImageError}
        />
        <span className="text-sm font-medium">{tool.name}</span>
      </button>
    </motion.div>
  );
};

const ProcessMap: React.FC<ProcessMapProps> = ({ data, onToolClick, explanations }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hoveredInfo, setHoveredInfo] = useState<InfoType>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const newScrollPosition = scrollContainerRef.current.scrollLeft + 
        (direction === 'left' ? -scrollAmount : scrollAmount);
      
      scrollContainerRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
    }
  };

  const renderToolComparison = (subphase: Subphase) => {
    // Get tools from _tools_of_substages
    const tools = subphase._tools_of_substages || [];
    
    console.log('Subphase:', subphase.name);
    console.log('Raw tools:', tools);

    const traditionalTools = tools.filter((t): t is Tool => 
      t && typeof t === 'object' && 
      'category' in t && 
      t.category === 'Traditional'
    );
    const aiTools = tools.filter((t): t is Tool => 
      t && typeof t === 'object' && 
      'category' in t && 
      t.category === 'AI'
    );

    console.log('Traditional tools:', traditionalTools);
    console.log('AI tools:', aiTools);

    const maxTools = Math.max(traditionalTools.length, aiTools.length);
    
    return (
      <>
        {Array.from({ length: maxTools }).map((_, index) => (
          <div key={index} className="grid grid-cols-2 gap-4 mb-4">
            <div>
              {traditionalTools[index] && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  initial={false}
                >
                  <div 
                    className="bg-blue-50 p-4 rounded-lg cursor-pointer"
                    onClick={() => onToolClick(traditionalTools[index])}
                  >
                    <div className="flex items-center space-x-2">
                      <img 
                        src={traditionalTools[index].icon?.url} 
                        alt={traditionalTools[index].name}
                        className="w-8 h-8 rounded"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/fallback-icon.png';
                        }}
                      />
                      <span className="font-medium">{traditionalTools[index].name}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div>
              {aiTools[index] && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  initial={false}
                >
                  <div 
                    className="bg-purple-50 p-4 rounded-lg cursor-pointer"
                    onClick={() => onToolClick(aiTools[index])}
                  >
                    <div className="flex items-center space-x-2">
                      <img 
                        src={aiTools[index].icon?.url} 
                        alt={aiTools[index].name}
                        className="w-8 h-8 rounded"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/fallback-icon.png';
                        }}
                      />
                      <span className="font-medium">{aiTools[index].name}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        ))}
      </>
    );
  };

  return (
    <div className="relative">
      <button
        onClick={() => handleScroll('left')}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full shadow-lg p-2 hover:bg-gray-50"
      >
        <ChevronLeft className="w-6 h-6 text-gray-600" />
      </button>
      
      <button
        onClick={() => handleScroll('right')}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full shadow-lg p-2 hover:bg-gray-50"
      >
        <ChevronRight className="w-6 h-6 text-gray-600" />
      </button>

      <ScrollContainer ref={scrollContainerRef} className="overflow-x-auto">
        <div className="min-w-max p-8">
          <div className="flex space-x-8">
            {Array.isArray(data.processSteps) && data.processSteps
              .filter(step => step !== null && typeof step === 'object' && 'id' in step)
              .map((step, stepIndex) => (
                <div key={step.id} className="w-96 bg-white rounded-lg shadow-lg p-6">
                  {explanations[step.id] && (
                    <div className="mb-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                      <div className="text-sm text-gray-700">
                        <h4 className="font-medium text-purple-700 flex items-center">
                          <Wand2 className="w-4 h-4 mr-2" />
                          AI Analysis:
                        </h4>
                        <p className="mt-2">{step.info}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {step.name}
                      </h3>
                      <Info 
                        className="w-5 h-5 text-gray-400 cursor-help"
                        onMouseEnter={() => setHoveredInfo(`step-${stepIndex}` as InfoType)}
                        onMouseLeave={() => setHoveredInfo(null)}
                      />
                    </div>
                  </div>

                  {hoveredInfo === `step-${stepIndex}` && (
                    <div className="absolute left-0 top-6 w-64 bg-gray-900 text-white p-3 rounded-lg shadow-lg text-sm z-50">
                      {step.info}
                    </div>
                  )}

                  {step._substages_of_processstages?.map((subphase, index) => (
                    <div key={subphase.id} className="mb-6 last:mb-0">
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-800">
                          {subphase.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {subphase.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-2">
                        <div className="text-sm font-medium text-blue-700">Traditional Tools</div>
                        <div className="text-sm font-medium text-purple-700">AI Alternatives</div>
                      </div>

                      {renderToolComparison(subphase)}
                    </div>
                  ))}
                </div>
              ))}
          </div>
        </div>
      </ScrollContainer>
    </div>
  );
};

export default ProcessMap;