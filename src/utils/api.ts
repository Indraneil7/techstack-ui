const BASE_URL = 'https://x8ki-letl-twmt.n7.xano.io/api:JQwL4HAE';

const ENDPOINTS = {
  TOOLKIT: `${BASE_URL}/tookit_full`,
  TOOL_COMMENTS: `${BASE_URL}/toolcomments`,
  TOOLKIT_COMMENTS: `${BASE_URL}/toolkilcomments`,
  INDUSTRIES: `${BASE_URL}/industry`,
  PROJECT_TYPES: `${BASE_URL}/projecttype`,
};

// Error handler
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'API request failed');
  }
  return response.json();
};

// Rate limiter configuration
const RATE_LIMIT = {
  maxRequests: 9,
  timeWindow: 20000,
  requestQueue: [] as number[],
};

// Rate limiter function
const rateLimitedFetch = async (url: string, options: RequestInit = {}) => {
  const now = Date.now();
  
  // Remove old requests from queue
  RATE_LIMIT.requestQueue = RATE_LIMIT.requestQueue.filter(
    timestamp => now - timestamp < RATE_LIMIT.timeWindow
  );

  // Check if we're at the rate limit
  if (RATE_LIMIT.requestQueue.length >= RATE_LIMIT.maxRequests) {
    const oldestRequest = RATE_LIMIT.requestQueue[0];
    const waitTime = RATE_LIMIT.timeWindow - (now - oldestRequest);
    
    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    RATE_LIMIT.requestQueue = RATE_LIMIT.requestQueue.filter(
      timestamp => Date.now() - timestamp < RATE_LIMIT.timeWindow
    );
  }

  RATE_LIMIT.requestQueue.push(Date.now());
  return fetch(url, options);
};

export const api = {
  getToolkits: () => 
    rateLimitedFetch(ENDPOINTS.TOOLKIT)
      .then(handleResponse),

  getIndustries: () =>
    rateLimitedFetch(ENDPOINTS.INDUSTRIES)
      .then(handleResponse),

  getProjectTypes: () =>
    rateLimitedFetch(ENDPOINTS.PROJECT_TYPES)
      .then(handleResponse),

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

  getToolkitComments: (toolkitId: number) =>
    rateLimitedFetch(`${ENDPOINTS.TOOLKIT_COMMENTS}?toolkit_id=${toolkitId}`)
      .then(handleResponse),

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
};