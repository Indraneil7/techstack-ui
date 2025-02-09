// Basic types
export interface Industry {
  id: number;
  name: string;
}

export interface ProjectType {
  id: number;
  name: string;
}

// Tool related types
export interface Icon {
  access: string;
  path: string;
  name: string;
  type: string;
  size: number;
  mime: string;
  meta: {
    width: number;
    height: number;
  };
  url: string;
}

export interface Tool {
  id: number;
  created_at: number;
  name: string;
  overview: string;
  features: string[];
  likes: number;
  website: string;
  category: 'Traditional' | 'AI';
  icon: Icon;
}

// Process related types
export interface Subphase {
  id: number;
  name: string;
  description: string;
  traditional: {
    tools: Tool[];
  };
  ai: {
    tools: Tool[];
  };
}

export interface ProcessStep {
  id: number;
  phase: string;
  info: string;
  subphases: Subphase[];
}

// API response types
export interface ApiToolkit {
  id: number;
  created_at: number;
  title: string;
  description: string;
  likes: number;
  industry_id: number;
  projecttype_id: number;
  processstages_id: Array<Array<{
    id: number;
    created_at: number;
    name: string;
    info: string;
    _substages_of_processstages: Array<{
      id: number;
      created_at: number;
      processstages_id: number;
      name: string;
      description: string;
      _tools_of_substages: Tool[];
    }>;
  }>>;
}

// Transformed types for UI
export interface Toolkit {
  id: number;
  title: string;
  description: string;
  likes: number;
  industry: string;
  industry_id: number;    // Add this
  projecttype_id: number; // Add this
  projectType: string;
  processSteps: ProcessStep[];
  comments?: number;
}

export interface Comment {
  id: number;
  text: string;
  author: string;
  timestamp: string;
}