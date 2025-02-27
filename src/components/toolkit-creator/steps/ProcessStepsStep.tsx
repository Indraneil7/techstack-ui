import React, { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';
import { MutableProcessStep } from '../../../types/index';
import { ProcessStepCard } from './ProcessStepCard';
import { useToolkitCreationStore } from '../../../store/toolkitCreationStore';

interface ProcessStepsStepProps {
  onBack: () => void;
  onNext: () => void;
}

export const ProcessStepsStep: React.FC<ProcessStepsStepProps> = ({ onBack, onNext }) => {
  const { processSteps, setProcessSteps } = useToolkitCreationStore();
  const [errors, setErrors] = useState<string[]>([]);

  const handleAddStep = () => {
    const newStep: MutableProcessStep = {
      id: Date.now(),
      created_at: Date.now(),
      name: '',
      info: '',
      subphases: [{
        name: '',
        description: '',
        traditional: { tools: [] },
        ai: { tools: [] }
      }]
    };
    setProcessSteps([...processSteps, newStep]);
  };

  const handleUpdateStep = (index: number, updatedStep: MutableProcessStep) => {
    const newSteps = [...processSteps];
    newSteps[index] = updatedStep;
    setProcessSteps(newSteps);
  };

  const handleRemoveStep = (index: number) => {
    setProcessSteps(processSteps.filter((_, i) => i !== index));
  };

  const validateForNextStep = () => {
    const newErrors: string[] = [];
    
    // Check minimum number of steps
    if (processSteps.length < 3) {
      newErrors.push('Please add at least 3 process steps');
    }
    
    processSteps.forEach((step, index) => {
      // Check all required fields are filled
      if (!step.name.trim()) {
        newErrors.push(`Step ${index + 1} is missing a name`);
      }
      if (!step.info.trim()) {
        newErrors.push(`Step ${index + 1} is missing a description`);
      }
      
      // Check subphases
      if (step.subphases.length === 0) {
        newErrors.push(`Step ${index + 1} needs at least one subphase`);
      }
      
      step.subphases.forEach((subphase, subIndex) => {
        if (!subphase.name.trim()) {
          newErrors.push(`Subphase ${subIndex + 1} in Step ${index + 1} is missing a name`);
        }
        if (!subphase.description.trim()) {
          newErrors.push(`Subphase ${subIndex + 1} in Step ${index + 1} is missing a description`);
        }
        
        // Check if at least one tool exists in either category
        const hasAnyTools = (subphase.traditional?.tools?.length > 0) || 
                           (subphase.ai?.tools?.length > 0);
        if (!hasAnyTools) {
          newErrors.push(`Subphase ${subIndex + 1} in Step ${index + 1} needs at least one tool`);
        }
      });
    });
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleNext = () => {
    if (validateForNextStep()) {
      onNext();
    }
  };

  // Clear errors when steps are updated
  useEffect(() => {
    if (errors.length > 0) {
      validateForNextStep();
    }
  }, [processSteps, errors.length, validateForNextStep]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {errors.length > 0 && (
        <div className="mb-6 text-red-600 bg-red-50 p-4 rounded-md border border-red-200">
          <h3 className="text-lg font-medium mb-2">Please fix the following issues:</h3>
          <ul className="list-disc pl-5 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2 text-blue-800">Process Steps</h2>
        <p className="text-gray-600">
          Define the steps and tools needed for your technical process. You need at least 3 process steps, 
          and each step should have at least one subphase.
        </p>
      </div>

      <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
        <div className="flex space-x-6 min-w-max">
          {processSteps.map((step, index) => (
            <ProcessStepCard
              key={step.id}
              step={step}
              stepNumber={index + 1}
              onUpdate={(updatedStep) => handleUpdateStep(index, updatedStep)}
              onRemove={() => handleRemoveStep(index)}
            />
          ))}
          
          <button
            onClick={handleAddStep}
            className="w-[300px] h-[600px] flex flex-col items-center justify-center border-2 border-dashed border-blue-200 rounded-lg text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <PlusIcon className="h-8 w-8 mb-2" />
            <span className="text-sm font-medium">Add Process Step</span>
          </button>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg hover:from-blue-600 hover:to-blue-800 transition-colors shadow-md"
        >
          Next
        </button>
      </div>
    </div>
  );
}; 