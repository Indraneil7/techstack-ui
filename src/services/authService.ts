import { create } from 'zustand';

// Base URL constant should be centralized
const BASE_URL = 'https://x8ki-letl-twmt.n7.xano.io/api:JQwL4HAE';

interface CachedUsernames {
  [username: string]: boolean;
}

interface UsernameCache {
  cachedUsernames: CachedUsernames;
  addToCache: (username: string, exists: boolean) => void;
  checkCache: (username: string) => boolean | null;
  clearCache: () => void;
}

// Local cache store for usernames
const useUsernameCache = create<UsernameCache>((set, get) => ({
  cachedUsernames: {},
  addToCache: (username, exists) => 
    set(state => ({ 
      cachedUsernames: { ...state.cachedUsernames, [username]: exists } 
    })),
  checkCache: (username) => {
    const { cachedUsernames } = get();
    return username in cachedUsernames ? cachedUsernames[username] : null;
  },
  clearCache: () => set({ cachedUsernames: {} })
}));

// Helper function to add delay between API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function for API calls with retry logic (reused from toolkitCreationApi)
const fetchWithRetry = async (
  url: string,
  options: RequestInit,
  maxRetries = 3,
  initialDelay = 2000
): Promise<any> => {
  let currentDelay = initialDelay;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(`${BASE_URL}${url}`, options);
      
      if (response.status === 429) { // Too Many Requests
        console.log(`Rate limited, attempt ${attempt}/${maxRetries}. Waiting ${currentDelay}ms...`);
        await delay(currentDelay);
        currentDelay *= 2; // Exponential backoff
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
      }

      const data = await response.json();
      await delay(1000); // Add 1s delay after successful request
      return data;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt === maxRetries) throw error;
      await delay(currentDelay);
      currentDelay *= 2;
    }
  }
};

export const authService = {
  // Login with the correct endpoint
  login: async (username: string, password: string) => {
    try {
      const response = await fetchWithRetry('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      // The response should include an authToken
      if (!response.authToken) {
        throw new Error('Authentication failed: No token received');
      }
      
      // Store the token in localStorage for future authenticated requests
      localStorage.setItem('authToken', response.authToken);
      
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },
  
  // Helper method to get the stored token
  getToken: () => {
    return localStorage.getItem('authToken');
  },
  
  // Include token in authenticated requests
  makeAuthenticatedRequest: async (url: string, options: RequestInit = {}) => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };
    
    return fetchWithRetry(url, {
      ...options,
      headers
    });
  },
  
  // Logout function to clear stored token
  logout: () => {
    localStorage.removeItem('authToken');
  },
  
  // Register user
  register: async (username: string, password: string, linkedIn?: string) => {
    try {
      // First check if username exists
      const exists = await authService.checkUsernameExists(username);
      if (exists) {
        throw new Error('Username already taken');
      }
      
      return await fetchWithRetry('/auth_tech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username, 
          password, 
          linkedIn: linkedIn || '',
          toolkit_id: [] 
        })
      });
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },
  
  // Check if a username exists - using a more reliable method with proper debugging
  checkUsernameExists: async (username: string): Promise<boolean> => {
    // Skip empty usernames
    if (!username || username.trim().length === 0) {
      return false;
    }
    
    const cache = useUsernameCache.getState();
    
    // Check cache first
    const cachedResult = cache.checkCache(username);
    if (cachedResult !== null) {
      console.log(`Username check for "${username}" returned ${cachedResult} (from cache)`);
      return cachedResult;
    }

    try {
      // Use a properly formatted query parameter
      const url = `${BASE_URL}/auth_tech?filter=username='${encodeURIComponent(username)}'`;
      console.log(`Checking username existence at: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error checking username: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`API response for username "${username}":`, data);
      
      // If we get any results back with the matching username, the username exists
      const exists = Array.isArray(data) && data.some(user => 
        user.username && user.username.toLowerCase() === username.toLowerCase()
      );
      
      console.log(`Username check result for "${username}": ${exists ? 'Taken' : 'Available'}`);
      
      // Cache the result
      cache.addToCache(username, exists);
      
      return exists;
    } catch (error) {
      console.error('Error checking username:', error);
      return false; // Assume username is available if check fails
    }
  },
  
  // Update user
  updateUser: async (userId: number, updates: any) => {
    try {
      return await fetchWithRetry(`/auth_tech/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (error) {
      console.error('User update failed:', error);
      throw error;
    }
  },
  
  // Associate toolkit with user
  associateToolkitWithUser: async (userId: number, toolkitIds: number[]) => {
    try {
      return await fetchWithRetry(`/auth_tech/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolkit_id: toolkitIds })
      });
    } catch (error) {
      console.error('Failed to associate toolkit with user:', error);
      throw error;
    }
  },
  
  // Get current authenticated user information
  getCurrentUser: async (userId: number) => {
    try {
      return await fetchWithRetry(`/auth_tech/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Failed to get user:', error);
      throw error;
    }
  },
  
  // Clear username cache
  clearUsernameCache: () => {
    useUsernameCache.getState().clearCache();
  }
}; 