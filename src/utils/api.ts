import { Tool } from '../types/index';


const BASE_URL = 'https://x8ki-letl-twmt.n7.xano.io/api:JQwL4HAE';

const ENDPOINTS = {
  TOOLKIT: `${BASE_URL}/tookit_full`,
  TOOL_COMMENTS: `${BASE_URL}/toolcomments`,
  TOOLKIT_COMMENTS: `${BASE_URL}/toolkilcomments`,
  INDUSTRIES: `${BASE_URL}/industry`,
  PROJECT_TYPES: `${BASE_URL}/projecttype`,
  TOOLS: `${BASE_URL}/tools`,
  AUTH_TECH: `${BASE_URL}/auth_tech`,
};

const RETRY_DELAY = 1000; // 1 second delay between retries
const MAX_RETRIES = 3;

// Error handler
const handleResponse = async (response: Response) => {
  if (response.status === 429) {
    // Wait for rate limit window and retry once
    await new Promise(resolve => setTimeout(resolve, 20000));
    return response;
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'API request failed');
  }
  return response.json();
};

// Add at the top of the file
class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private requestsInWindow = 0;
  private windowStart = Date.now();
  private readonly MAX_REQUESTS = 10;
  private readonly WINDOW_MS = 20000; // 20 seconds

  async enqueue<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      
      // Reset window if needed
      if (now - this.windowStart >= this.WINDOW_MS) {
        this.requestsInWindow = 0;
        this.windowStart = now;
      }

      // Check if we need to wait
      if (this.requestsInWindow >= this.MAX_REQUESTS) {
        const waitTime = this.WINDOW_MS - (now - this.windowStart);
        console.log(`Rate limit reached, waiting ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      // Process next request
      const request = this.queue.shift();
      if (request) {
        this.requestsInWindow++;
        try {
          await request();
        } catch (error) {
          console.error('Error processing queued request:', error);
        }
      }
    }

    this.processing = false;
  }
}

// Create a single instance of the rate limiter
const rateLimiter = new RateLimiter();

// Update rateLimitedFetch to use the rate limiter
const rateLimitedFetch = async (url: string, options: RequestInit = {}, retries = 0): Promise<Response> => {
  return rateLimiter.enqueue(async () => {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      if (retries < MAX_RETRIES) {
        console.log(`Request failed, retrying (${retries + 1}/${MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return rateLimitedFetch(url, options, retries + 1);
      }
      throw error;
    }
  });
};

// Add auth types
export interface AuthUser {
  id: number;
  username: string;
  created_at: number;
}

export const api = {
  async getToolkits(): Promise<any> {
    try {
      const response = await rateLimitedFetch(`${BASE_URL}/tookit_full`);
      return response.json();
    } catch (error) {
      console.error('Error fetching toolkits:', error);
      throw new Error('Failed to fetch toolkits');
    }
  },

  async getIndustries(): Promise<any> {
    try {
      const response = await rateLimitedFetch(`${BASE_URL}/industry`);
      return response.json();
    } catch (error) {
      console.error('Error fetching industries:', error);
      throw new Error('Failed to fetch industries');
    }
  },

  async getProjectTypes(): Promise<any> {
    try {
      const response = await rateLimitedFetch(`${BASE_URL}/projecttype`);
      return response.json();
    } catch (error) {
      console.error('Error fetching project types:', error);
      throw new Error('Failed to fetch project types');
    }
  },

  getToolComments: (toolId: number) =>
    rateLimitedFetch(`${ENDPOINTS.TOOL_COMMENTS}?tool_id=${toolId}`)
      .then(handleResponse),

  addToolComment: (toolId: number, comment: string) =>
    rateLimitedFetch(ENDPOINTS.TOOL_COMMENTS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tool_id: toolId,
        comment,
      }),
    }).then(handleResponse),

  async getToolkitComments(toolkitId: number): Promise<any> {
    try {
      const response = await rateLimitedFetch(
        `${ENDPOINTS.TOOLKIT_COMMENTS}?toolkit_id=${toolkitId}`
      );
      return response.json();
    } catch (error) {
      console.error('Error fetching toolkit comments:', error);
      throw new Error('Failed to fetch toolkit comments');
    }
  },

  addToolkitComment: (toolkitId: number, comment: string) =>
    rateLimitedFetch(ENDPOINTS.TOOLKIT_COMMENTS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        toolkit_id: toolkitId,
        comment,
      }),
    }).then(handleResponse),

  getTools: () => 
    rateLimitedFetch(ENDPOINTS.TOOLS)
      .then(handleResponse),
      
  searchTools: (query: string) => 
    rateLimitedFetch(ENDPOINTS.TOOLS)
      .then(handleResponse)
      .then((tools: Tool[]) => 
        tools.filter(tool => 
          tool.name.toLowerCase().includes(query.toLowerCase()) ||
          tool.overview.toLowerCase().includes(query.toLowerCase())
        )
      ),

  // Check username availability
  checkUsernameAvailability: async () => {
    try {
      const response = await rateLimitedFetch(`${BASE_URL}/auth_tech`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        // Append username as query parameter directly in URL
        });
      const data = await response.json();
        return data.length === 0; // Return true if no user found with this username
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  },

  // Create new user
  createUser: async (username: string, password: string) => {
    const response = await rateLimitedFetch(`${BASE_URL}/auth_tech`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create user');
    }
    
    return response.json();
  },

  // Login existing user
  loginUser: async (): Promise<AuthUser> => {
    const response = await rateLimitedFetch(`${BASE_URL}/auth_tech`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      // Append credentials as URL search params
      signal: new AbortController().signal
    });
    
    if (!response.ok) {
      throw new Error('Invalid credentials');
    }
    
    const data = await response.json();
    if (data.length === 0) {
      throw new Error('Invalid credentials');
    }
    
    // Store auth data in localStorage
    const user = data[0];
    localStorage.setItem('auth_user', JSON.stringify(user));
    
    return user;
  },

  // Helper methods for deletion (rollback)
  deleteProcessStage: (id: number) => {
    return rateLimitedFetch(`${BASE_URL}/processstages/${id}`, {
      method: 'DELETE',
    }).then(handleResponse);
  },

  deleteSubstage: (id: number) => {
    return rateLimitedFetch(`${BASE_URL}/substages/${id}`, {
      method: 'DELETE',
    }).then(handleResponse);
  },

  deleteTool: (id: number) => {
    return rateLimitedFetch(`${BASE_URL}/tools/${id}`, {
      method: 'DELETE',
    }).then(handleResponse);
  },

  // Add method to handle tool creation
  createOrGetTool: async (toolData: any) => {
    try {
      // First check if tool exists by name
      const existingTool = await rateLimitedFetch(
        `${BASE_URL}/tools/search?name=${encodeURIComponent(toolData.name)}`,
        { method: 'GET' }
      ).then(handleResponse);

      if (existingTool && existingTool.id) {
        return existingTool;
      }

      // If tool doesn't exist, create new one
      const newTool = await rateLimitedFetch(`${BASE_URL}/tools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: toolData.name,
          overview: toolData.overview,
          features: toolData.features,
          website: toolData.website,
          category: toolData.category,
          icon: toolData.icon,
          likes: 0
        })
      }).then(handleResponse);

      return newTool;
    } catch (error) {
      console.error('Error in createOrGetTool:', error);
      throw error;
    }
  },

  // Update createToolkit to use createOrGetTool
  createToolkit: async (toolkitData: any) => {
    // Keep track of created resources for potential rollback
    const createdResources = {
      stages: [] as number[],
      substages: [] as number[],
      tools: [] as number[]
    };

    try {
      // 1. Create process stages first
      const createdStages = await Promise.all(
        toolkitData.process_steps.map(async (stage: any) => {
          const stageData = {
            name: stage.phase,
            info: stage.info
          };

          try {
          const createdStage = await rateLimitedFetch(`${BASE_URL}/processstages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(stageData)
          }).then(handleResponse);

          createdResources.stages.push(createdStage.id);

            // 2. Create substages for each stage
          const createdSubstages = await Promise.all(
            stage.subphases.map(async (subphase: any) => {
              const subphaseData = {
                processstages_id: createdStage.id,
                name: subphase.name,
                  description: subphase.description
              };

                try {
                  const createdSubphase = await rateLimitedFetch(`${BASE_URL}/substages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subphaseData)
              }).then(handleResponse);

                  createdResources.substages.push(createdSubphase.id);

                  // 3. Create tools for each substage
                  const tools = [...subphase.traditional.tools, ...subphase.ai.tools];
                  const createdTools = await Promise.all(tools.map(async (tool: any) => {
                    const processedTool = await api.createOrGetTool(tool);
                    createdResources.tools.push(processedTool.id);
                    return processedTool;
                  }));

                  return { ...createdSubphase, tools: createdTools };
                } catch (error: unknown) {
                  if (error instanceof Error) {
                    throw new Error(`Failed to create substage: ${error.message}`);
                  }
                  throw new Error('Failed to create substage: Unknown error');
                }
              })
            );

            return { ...createdStage, substages: createdSubstages };
          } catch (error: unknown) {
            if (error instanceof Error) {
              throw new Error(`Failed to create process stage: ${error.message}`);
            }
            throw new Error('Failed to create process stage: Unknown error');
          }
        })
      );

      // 4. Finally create the toolkit
      const toolkitPayload = {
        title: toolkitData.basicInfo.title,
        description: toolkitData.basicInfo.description,
        industry_id: parseInt(toolkitData.basicInfo.industry),
        projecttype_id: parseInt(toolkitData.basicInfo.projectType),
        processstages_id: createdStages.map(stage => stage.id),
        likes: 0
      };

      const createdToolkit = await rateLimitedFetch(`${BASE_URL}/toolkit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toolkitPayload)
      }).then(handleResponse);

      return createdToolkit;

    } catch (error) {
      console.error('Error in createToolkit:', error);
      
      // Rollback in reverse order
      console.log('Starting rollback...');
      
      try {
        // Delete tools
        await Promise.all(
          createdResources.tools.map(id => api.deleteTool(id))
        );
        
        // Delete substages
        await Promise.all(
          createdResources.substages.map(id => api.deleteSubstage(id))
        );
        
        // Delete process stages
        await Promise.all(
          createdResources.stages.map(id => api.deleteProcessStage(id))
        );
        
        console.log('Rollback completed successfully');
      } catch (rollbackError: unknown) {
        console.error('Error during rollback:', rollbackError);
        if (rollbackError instanceof Error) {
          throw new Error(`Creation failed and rollback failed: ${rollbackError.message}`);
        }
        throw new Error('Creation failed and rollback failed: Unknown error');
      }

      if (error instanceof Error) {
        throw new Error(`Failed to create toolkit: ${error.message}`);
      }
      throw new Error('Failed to create toolkit: Unknown error');
    }
  },

  getToolInfo: async (name: string, website: string): Promise<Partial<Tool>> => {
    try {
      const tools = await rateLimitedFetch(`${ENDPOINTS.TOOLS}?name=${encodeURIComponent(name)}`)
        .then(handleResponse);
      
      const matchingTool = tools.find((t: Tool) => 
        t.website.toLowerCase() === website.toLowerCase()
      );
      
      if (matchingTool) {
        return {
          overview: matchingTool.overview,
          features: matchingTool.features
        };
      }
      
      throw new Error('Tool not found');
    } catch (error) {
      console.error('Error fetching tool info:', error);
      throw error;
    }
  },
};