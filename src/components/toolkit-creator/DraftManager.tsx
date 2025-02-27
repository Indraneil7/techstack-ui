import React, { useEffect } from 'react';
import { useToolkitCreationStore } from '../../store/toolkitCreationStore';

const DRAFT_KEY = 'toolkit_draft';
const AUTO_SAVE_INTERVAL = 60000; // 1 minute

export const DraftManager: React.FC = () => {
  const { basicInfo, processSteps, setBasicInfo, setProcessSteps } = useToolkitCreationStore();

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const { basicInfo: savedBasicInfo, processSteps: savedProcessSteps } = JSON.parse(savedDraft);
        if (savedBasicInfo) setBasicInfo(savedBasicInfo);
        if (savedProcessSteps) setProcessSteps(savedProcessSteps);
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, []);

  // Auto-save draft
  useEffect(() => {
    const saveDraft = () => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({
          basicInfo,
          processSteps,
          lastModified: new Date().toISOString()
        }));
      } catch (error) {
        console.error('Failed to save draft:', error);
      }
    };

    const timer = setInterval(saveDraft, AUTO_SAVE_INTERVAL);
    return () => clearInterval(timer);
  }, [basicInfo, processSteps]);

  return null; // This component only handles auto-save functionality
}; 