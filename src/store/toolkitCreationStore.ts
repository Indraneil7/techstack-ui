import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MutableProcessStep, Tool, ValidationErrors } from '../types/index';

interface BasicInfo {
  title: string;
  description: string;
  industry: string;
  projectType: string;
}

interface ToolkitCreationState {
  currentStep: number;
  basicInfo: BasicInfo;
  processSteps: MutableProcessStep[];
  validationErrors: ValidationErrors;
  isDirty: boolean;

  // Actions
  setCurrentStep: (step: number) => void;
  setBasicInfo: (info: Partial<BasicInfo>) => void;
  setProcessSteps: (steps: MutableProcessStep[]) => void;
  addProcessStep: (step: MutableProcessStep) => void;
  updateProcessStep: (index: number, step: MutableProcessStep) => void;
  removeProcessStep: (index: number) => void;
  addToolToSubphase: (
    stepIndex: number,
    subphaseIndex: number,
    tool: Tool,
    category: 'traditional' | 'ai'
  ) => void;
  removeToolFromSubphase: (
    stepIndex: number,
    subphaseIndex: number,
    toolId: number,
    category: 'traditional' | 'ai'
  ) => void;
  setValidationErrors: (errors: ValidationErrors) => void;
  resetStore: () => void;
}

const initialState = {
  currentStep: 0,
  basicInfo: {
    title: '',
    description: '',
    industry: '',
    projectType: ''
  },
  processSteps: [],
  validationErrors: {},
  isDirty: false
};

export const useToolkitCreationStore = create<ToolkitCreationState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrentStep: (step) => 
        set({ currentStep: step }),

      setBasicInfo: (info) => 
        set((state) => ({
          basicInfo: { ...state.basicInfo, ...info },
          isDirty: true
        })),

      setProcessSteps: (steps) => 
        set({ processSteps: steps, isDirty: true }),

      addProcessStep: (step) => 
        set((state) => ({
          processSteps: [...state.processSteps, step],
          isDirty: true
        })),

      updateProcessStep: (index, step) => 
        set((state) => {
          const newSteps = [...state.processSteps];
          newSteps[index] = step;
          return { processSteps: newSteps, isDirty: true };
        }),

      removeProcessStep: (index) => 
        set((state) => ({
          processSteps: state.processSteps.filter((_, i) => i !== index),
          isDirty: true
        })),

      addToolToSubphase: (stepIndex, subphaseIndex, tool, category) => 
        set((state) => {
          const newSteps = [...state.processSteps];
          const step = { ...newSteps[stepIndex] };
          const subphase = { ...step.subphases[subphaseIndex] };
          
          if (category === 'traditional') {
            subphase.traditional.tools = [...subphase.traditional.tools, tool];
          } else {
            subphase.ai.tools = [...subphase.ai.tools, tool];
          }
          
          step.subphases[subphaseIndex] = subphase;
          newSteps[stepIndex] = step;
          
          return { processSteps: newSteps, isDirty: true };
        }),

      removeToolFromSubphase: (stepIndex, subphaseIndex, toolId, category) => 
        set((state) => {
          const newSteps = [...state.processSteps];
          const step = { ...newSteps[stepIndex] };
          const subphase = { ...step.subphases[subphaseIndex] };
          
          if (category === 'traditional') {
            subphase.traditional.tools = subphase.traditional.tools.filter(
              tool => tool.id !== toolId
            );
          } else {
            subphase.ai.tools = subphase.ai.tools.filter(
              tool => tool.id !== toolId
            );
          }
          
          step.subphases[subphaseIndex] = subphase;
          newSteps[stepIndex] = step;
          
          return { processSteps: newSteps, isDirty: true };
        }),

      setValidationErrors: (errors) => 
        set({ validationErrors: errors }),

      resetStore: () => 
        set({ ...initialState, isDirty: false })
    }),
    {
      name: 'toolkit-creation-storage',
      partialize: (state) => ({
        basicInfo: state.basicInfo,
        processSteps: state.processSteps,
        isDirty: state.isDirty
      })
    }
  )
); 