import React, { useState } from 'react';
import { MutableProcessStep } from '../../../types/index';
import { api } from '../../../utils/api';
import { useAuthStore } from '../../../store/authStore';
import { AuthModal } from '../../auth/AuthModal';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/solid';
import { toolkitCreationApi } from '../../../utils/toolkitCreationApi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface ReviewStepProps {
  onBack: () => void;
  basicInfo: {
    title: string;
    description: string;
    industry: string;
    projectType: string;
  };
  processSteps: MutableProcessStep[];
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  onBack,
  basicInfo,
  processSteps
}) => {
  const navigate = useNavigate();
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const { isAnonymous } = useAuthStore();
  const [publishingStage, setPublishingStage] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);

  const handlePublish = async () => {
    setIsPublishing(true);
    setError(null);
    
    try {
      const toolkitData = {
        basicInfo: {
          title: basicInfo.title,
          description: basicInfo.description,
          industry: parseInt(basicInfo.industry),
          projectType: parseInt(basicInfo.projectType),
        },
        processSteps: processSteps.map(step => ({
          id: step.id || Date.now(),
          created_at: step.created_at || Date.now(),
          name: step.name,
          info: step.info,
          subphases: step.subphases.map(subphase => ({
            ...subphase,
            traditional: {
              tools: subphase.traditional.tools.map(tool => ({
                ...tool,
                icon: tool.icon
              }))
            },
            ai: {
              tools: subphase.ai.tools.map(tool => ({
                ...tool,
                icon: tool.icon
              }))
            }
          }))
        }))
      };

      console.log('Publishing toolkit with data:', toolkitData);

      const result = await toolkitCreationApi.createCompleteToolkit(
        toolkitData,
        (stage, progress) => {
          setPublishingStage(stage);
          setProgress(progress);
        }
      );

      if (result.id) {
        toast.success('Toolkit published successfully!');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (err) {
      console.error('Publish error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to publish toolkit';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsPublishing(false);
      setPublishingStage('');
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header with Publish button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Review Your Toolkit</h2>
        <div className="space-x-4">
          <button
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            disabled={isPublishing}
          >
            Back
          </button>
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isPublishing ? 'Publishing...' : 'Publish Toolkit'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-600">
          {error}
        </div>
      )}

      {isPublishing && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-700 font-medium">{publishingStage}</span>
            <span className="text-blue-600">{progress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Basic Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium mb-4">Basic Information</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <dt className="text-sm font-medium text-gray-500">Title</dt>
            <dd className="mt-1 text-gray-900">{basicInfo.title}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Industry</dt>
            <dd className="mt-1 text-gray-900">{basicInfo.industry}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-gray-900">{basicInfo.description}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Project Type</dt>
            <dd className="mt-1 text-gray-900">{basicInfo.projectType}</dd>
          </div>
        </div>
      </div>

      {/* Process Steps */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Process Steps</h3>
        <div className="overflow-x-auto pb-4">
          <div className="flex space-x-4 min-w-max">
            {processSteps.map((step, stepIndex) => (
              <div key={stepIndex} className="w-80 bg-white rounded-lg shadow-sm border border-gray-200 flex-shrink-0">
                <div className="p-4 border-b border-gray-200">
                  <h4 className="text-md font-medium">
                    {stepIndex + 1}. {step.name}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">{step.info}</p>
                </div>

                <div className="p-4 space-y-4">
                  {step.subphases.map((subphase, subphaseIndex) => (
                    <div key={subphaseIndex} className="bg-gray-50 rounded-md p-3">
                      <h5 className="text-sm font-medium mb-2">{subphase.name}</h5>
                      <p className="text-sm text-gray-600 mb-3">{subphase.description}</p>

                      {/* Traditional Tools */}
                      {subphase.traditional.tools.length > 0 && (
                        <div className="mb-3">
                          <h6 className="text-xs font-medium text-gray-500 flex items-center">
                            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2" />
                            Traditional Tools
                          </h6>
                          <ul className="mt-1 space-y-1">
                            {subphase.traditional.tools.map((tool, toolIndex) => (
                              <li key={toolIndex} className="text-sm text-gray-600 ml-4">
                                {tool.name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* AI Tools */}
                      {subphase.ai.tools.length > 0 && (
                        <div>
                          <h6 className="text-xs font-medium text-gray-500 flex items-center">
                            <span className="w-2 h-2 bg-blue-400 rounded-full mr-2" />
                            AI Tools
                          </h6>
                          <ul className="mt-1 space-y-1">
                            {subphase.ai.tools.map((tool, toolIndex) => (
                              <li key={toolIndex} className="text-sm text-gray-600 ml-4">
                                {tool.name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Separate Account Creation Card */}
      {isAnonymous && (
        <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
          <h3 className="text-lg font-medium text-blue-800 mb-3">
            Want to manage your toolkit better?
          </h3>
          <p className="text-gray-600 mb-4">
            Create an account to access additional features:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li>Edit your toolkit anytime</li>
            <li>Get notifications on comments</li>
            <li>Create more toolkits easily</li>
          </ul>
          <button
            onClick={() => setShowAuthPrompt(true)}
            className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-300 rounded-md hover:bg-blue-100 transition-colors"
          >
            Create Account
          </button>
        </div>
      )}

      <AuthModal
        isOpen={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        onContinue={() => setShowAuthPrompt(false)}
        showSkip={true}
        message="Create an account to manage your toolkit better!"
      />
    </div>
  );
}; 