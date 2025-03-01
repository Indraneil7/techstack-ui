import React, { useState, useEffect } from 'react';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { ProcessStepsStep } from './steps/ProcessStepsStep';
import { ReviewStep } from './steps/ReviewStep';
import { DraftManager } from './DraftManager';
import { useToolkitCreationStore } from '../../store/toolkitCreationStore';
import { LoadingProvider, useLoading } from '../../contexts/LoadingContext';
import { withErrorHandling } from '../../utils/errorHandling';
import { useAuthStore } from '../../store/authStore';
import { AuthModal } from '../auth/AuthModal';
import { toolkitCreationApi } from '../../utils/toolkitCreationApi';
import { MutableProcessStep } from '../../types/index';
import { UserStatusBar } from '../auth/UserStatusBar';

const STEPS = ['Basic Information', 'Process Steps', 'Review & Publish'];

const ToolkitCreatorContent: React.FC = () => {
  const { 
    currentStep, 
    setCurrentStep, 
    basicInfo, 
    setBasicInfo,
    processSteps, 
    resetStore 
  } = useToolkitCreationStore();

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <BasicInfoStep 
            onNext={() => setCurrentStep(1)}
            basicInfo={basicInfo}
            onBasicInfoChange={(field, value) => {
              setBasicInfo({ ...basicInfo, [field]: value });
            }}
          />
        );
      case 1:
        return (
          <ProcessStepsStep 
            onBack={() => setCurrentStep(0)}
            onNext={() => setCurrentStep(2)}
          />
        );
      case 2:
        return (
          <ReviewStep 
            onBack={() => setCurrentStep(1)}
            basicInfo={basicInfo}
            processSteps={processSteps}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserStatusBar />
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <DraftManager />
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export const ToolkitCreator: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(true);
  const { isAuthenticated, isAnonymous, clearGuestState } = useAuthStore();
  
  useEffect(() => {
    // Clear guest state on component mount
    clearGuestState();
  }, [clearGuestState]);

  const shouldShowAuthModal = !isAuthenticated && !isAnonymous;

  return (
    <>
      <AuthModal 
        isOpen={shouldShowAuthModal && showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onContinue={() => setShowAuthModal(false)}
      />
      
      {(!shouldShowAuthModal || !showAuthModal) && (
        <LoadingProvider>
          <ToolkitCreatorContent />
        </LoadingProvider>
      )}
    </>
  );
}; 