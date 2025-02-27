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
  icon: Icon;
  overview: string;
  features: string[];
  likes: number;
  website: string;
  category: 'Traditional' | 'AI';
}

// Process related types
export interface Subphase {
  id: number;
  created_at: number;
  processstages_id: number;
  name: string;
  description: string;
  tools_id: number[][];
  _tools_of_substages: Tool[];
}

export interface ProcessStep {
  id: number;
  created_at: number;
  name: string;
  info: string;
  _substages_of_processstages: Subphase[];
}

// API response types
export interface Toolkit {
  id: number;
  created_at: number;
  title: string;
  description: string;
  likes: number;
  industry_id: number;
  projecttype_id: number;
  processstages_id: Array<Array<ProcessStep>>;
}

export interface Comment {
  id: number;
  text: string;
  author: string;
  timestamp: string;
}

// Add new types
export interface ValidationErrors {
  [key: string]: string[];
}

export interface ValidationIssue {
  field: string;
  message: string;
}

export interface AuthData {
  username: string;
  password: string;
  confirmPassword: string;
  linkedinProfile?: string;
}

// Add MutableProcessStep for the form
export interface MutableProcessStep extends Omit<ProcessStep, '_substages_of_processstages'> {
  subphases: Array<{
    id?: number;
    created_at?: number;
    name: string;
    description: string;
    processstages_id?: number;
    traditional: {
      tools: Tool[];
    };
    ai: {
      tools: Tool[];
    };
  }>;
}