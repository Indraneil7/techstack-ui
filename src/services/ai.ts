interface AIService {
  generateProcessDescription: (stepName: string) => Promise<string>;
  suggestSubphases: (processContext: string) => Promise<string[]>;
  fetchToolInfo: (website: string) => Promise<Partial<Tool>>;
}

export const aiService: AIService = {
  generateProcessDescription: async (stepName: string) => {
    // Integration with AI service for process descriptions
  },
  
  suggestSubphases: async (processContext: string) => {
    // AI-powered subphase suggestions
  },
  
  fetchToolInfo: async (website: string) => {
    // Smart tool info extraction
  }
}; 