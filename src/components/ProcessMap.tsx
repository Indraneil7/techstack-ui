import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { ProcessStep, Tool } from '../types';

interface ProcessMapProps {
  data: {
    processSteps: ProcessStep[];
  };
  onToolClick: (tool: Tool) => void;
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

const ProcessMap: React.FC<ProcessMapProps> = ({ data, onToolClick }) => {
  const [hoveredInfo, setHoveredInfo] = useState<InfoType>(null);

  if (!data?.processSteps || !Array.isArray(data.processSteps)) {
    console.error('Invalid process steps data:', data);
    return null;
  }

  const renderProcessFlow = (category: 'traditional' | 'ai') => {
    const isTraditional = category === 'traditional';
    const title = isTraditional ? 'Traditional Development Process' : 'AI-Powered Alternatives';
    const titleColor = isTraditional ? 'text-blue-700' : 'text-purple-700';
    const infoColor = isTraditional ? 'text-blue-500' : 'text-purple-500';

    return (
      <div className="relative">
        <div className="flex items-center space-x-2 mb-4">
          <h3 className={`text-xl font-semibold ${titleColor}`}>{title}</h3>
          <div className="relative">
            <Info 
              className={`w-5 h-5 ${infoColor} cursor-help`}
              onMouseEnter={() => setHoveredInfo(category)}
              onMouseLeave={() => setHoveredInfo(null)}
            />
            {hoveredInfo === category && (
              <div className="absolute left-0 top-6 w-64 bg-gray-900 text-white p-3 rounded-lg shadow-lg text-sm z-50">
                {isTraditional 
                  ? 'Proven methodologies and tools that have been industry standards for years.'
                  : 'Modern AI-driven tools that enhance productivity through automation and intelligent assistance.'}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-start space-x-4">
          {data.processSteps.map((step, stepIndex) => (
            <div key={stepIndex} className="flex-shrink-0 w-72">
              <div className="bg-white rounded-lg shadow-lg p-4">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-gray-900">{step.phase}</h4>
                  <div className="relative">
                    <Info 
                      className="w-4 h-4 text-gray-400 cursor-help"
                      onMouseEnter={() => setHoveredInfo(`step-${stepIndex}` as InfoType)}
                      onMouseLeave={() => setHoveredInfo(null)}
                    />
                    {hoveredInfo === `step-${stepIndex}` && (
                      <div className="absolute left-0 top-6 w-64 bg-gray-900 text-white p-3 rounded-lg shadow-lg text-sm z-50">
                        {PROCESS_INFO[step.phase as keyof typeof PROCESS_INFO]?.description || step.info}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {step.subphases.map((subphase, subIndex) => (
                    <div key={subIndex} className="border-t pt-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">
                        {subphase.name}
                      </h5>
                      <p className="text-xs text-gray-500 mb-3">
                        {subphase.description}
                      </p>
                      <div className="space-y-2">
                        {(isTraditional ? subphase.traditional.tools : subphase.ai.tools).map((tool, toolIndex) => (
                          <ToolButton
                            key={toolIndex}
                            tool={tool}
                            onClick={onToolClick}
                            category={category}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-max p-8">
        <div className="flex flex-col space-y-12">
          {renderProcessFlow('traditional')}
          {renderProcessFlow('ai')}
        </div>
      </div>
    </div>
  );
};

export default ProcessMap;