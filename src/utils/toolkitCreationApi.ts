import { Tool, ProcessStep, Toolkit, MutableProcessStep } from '../types/index';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';

const BASE_URL = 'https://x8ki-letl-twmt.n7.xano.io/api:JQwL4HAE';

// Helper function to add delay between API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function for API calls with retry logic
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

interface ToolCreationPayload {
  name: string;
  website: string;
  overview: string;
  features: string[];
  category: 'Traditional' | 'AI';
  icon?: {
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
    data: string;
  };
}

// Add a type definition for the toolkit payload
interface ToolkitPayload {
  title: string;
  description: string;
  industry_id: number;
  projecttype_id: number;
  processstages_id: number[];
  likes: number;
  auth_tech_id?: number | null; // Allow null as a valid value
}

export const toolkitCreationApi = {
  // First create any new tools
  createTool: async (toolData: {
    name: string;
    website: string;
    overview: string;
    features: string[];
    category: 'Traditional' | 'AI';
    icon?: any;
  }) => {
    try {
      const formData = new FormData();
      formData.append('name', toolData.name);
      formData.append('website', toolData.website);
      formData.append('overview', toolData.overview);
      formData.append('category', toolData.category);
      formData.append('features', JSON.stringify(toolData.features || []));

      // Enhance logging in createTool function
      console.log('Tool data full object:', JSON.stringify(toolData, (key, value) => {
        // Skip file objects in JSON stringification
        if (key === 'file' && value instanceof File) return `[File: ${value.name}]`;
        return value;
      }));

      // More detailed file check
      if (toolData.icon?.file) {
        console.log('File type:', typeof toolData.icon.file);
        console.log('Is File instance:', toolData.icon.file instanceof File);
        console.log('File properties:', Object.keys(toolData.icon.file));
      }
      
      if (toolData.icon?.file instanceof File) {
        formData.append('file', toolData.icon.file);
        console.log('Uploading file:', toolData.icon.file);
      } else {
        console.log('No valid file found in icon object:', toolData.icon);
        // Use placeholder if no valid file
        const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
        const binaryString = window.atob(base64Image);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const placeholderBlob = new Blob([bytes], { type: 'image/png' });
        const placeholderFile = new File([placeholderBlob], 'placeholder.png', { type: 'image/png' });
        formData.append('file', placeholderFile);
      }

      return await fetchWithRetry('/tools', {
        method: 'POST',
        body: formData
      });
    } catch (error) {
      console.error('Error in createTool:', error);
      throw error;
    }
  },

  createCompleteToolkit: async (
    data: {
      basicInfo: {
        title: string;
        description: string;
        industry: number;
        projectType: number;
      };
      processSteps: Array<{
        name: string;
        info: string;
        subphases: Array<{
          name: string;
          description: string;
          traditional: { tools: any[] };
          ai: { tools: any[] };
        }>;
      }>;
    },
    onProgress: (stage: string, progress: number) => void,
    userData?: { userId: number; toolkitIds: number[] }
  ) => {
    try {
      onProgress('Creating toolkit...', 10);
      console.log('Initial process steps:', data.processSteps);

      // Create tools first
      const toolsToCreate = [];
      
      // Iterate through all steps and subphases to collect tools
      for (const step of data.processSteps) {
        for (const subphase of step.subphases) {
          console.log('Subphase tools:', { 
            traditional: subphase.traditional?.tools, 
            ai: subphase.ai?.tools 
          });
          
          // Process traditional tools
          for (const tool of subphase.traditional?.tools || []) {
            console.log('Checking tool:', tool);
            // Check if this is a custom tool with our special _iconFile property
            if (tool._iconFile || (tool.icon && tool.icon._iconFile)) {
              const fileToUpload = tool._iconFile || tool.icon._iconFile;
              console.log('Found file to upload:', fileToUpload);
              
              // Add to our array in a format ready for API
              toolsToCreate.push({
                id: tool.id,
                name: tool.name,
                website: tool.website,
                overview: tool.overview || '',
                features: tool.features || [],
                category: 'Traditional' as 'Traditional',
                icon: { file: fileToUpload }
              });
            } else {
              // Regular tool without file upload
              toolsToCreate.push({
                id: tool.id,
                name: tool.name,
                website: tool.website,
                overview: tool.overview || '',
                features: tool.features || [],
                category: 'Traditional' as 'Traditional'
              });
            }
          }
          
          // Same for AI tools
          for (const tool of subphase.ai?.tools || []) {
            console.log('Checking tool:', tool);
            // Similar logic for AI tools
            if (tool._iconFile || (tool.icon && tool.icon._iconFile)) {
              const fileToUpload = tool._iconFile || tool.icon._iconFile;
              console.log('Found file to upload:', fileToUpload);
              
              toolsToCreate.push({
                id: tool.id,
                name: tool.name,
                website: tool.website,
                overview: tool.overview || '',
                features: tool.features || [],
                category: 'AI' as 'AI',
                icon: { file: fileToUpload }
              });
            } else {
              toolsToCreate.push({
                id: tool.id,
                name: tool.name,
                website: tool.website,
                overview: tool.overview || '',
                features: tool.features || [],
                category: 'AI' as 'AI'
              });
            }
          }
        }
      }
      
      // Create a Set to track processed tool IDs
      const processedTools = new Set<number>();
      
      // Create tools sequentially with delays
      const toolIdMap = new Map();
      let toolProgress = 0;
      
      // Debug tools to be created
      console.log('Tools to create:', toolsToCreate.map(t => [t.name, t.category]));

      for (const [tempId, toolData] of toolsToCreate.entries()) {
        if (!processedTools.has(tempId)) {
          try {
            console.log('Attempting to create tool:', toolData);
            const createdTool = await toolkitCreationApi.createTool(toolData);
            console.log('Successfully created tool:', createdTool);
            
            // Store the mapping from local ID to server ID
            toolIdMap.set(toolData.id, createdTool.id);
            console.log(`Mapping tool ID: ${toolData.id} -> ${createdTool.id}`);
            
            toolProgress += 1;
            onProgress('Creating tools...', 10 + (toolProgress / toolsToCreate.length * 20));
            await delay(2000);
            processedTools.add(tempId);
          } catch (error) {
            console.error('Error creating tool:', error);
            throw error;
          }
        }
      }

      // More detailed debugging for tool ID mapping
      console.log('Tool ID mapping:', Array.from(toolIdMap.entries()));

      // Update tool references in the data structure
      const updatedProcessSteps = data.processSteps.map(step => ({
        ...step,
        subphases: step.subphases.map(subphase => ({
          ...subphase,
          traditional: {
            tools: subphase.traditional.tools.map(tool => ({
              ...tool,
              id: toolIdMap.get(tool.id) || tool.id
            }))
          },
          ai: {
            tools: subphase.ai.tools.map(tool => ({
              ...tool,
              id: toolIdMap.get(tool.id) || tool.id
            }))
          }
        }))
      }));

      // Step 2: Create process stages sequentially
      onProgress('Creating process stages...', 30);
      const processStages = [];
      for (const step of updatedProcessSteps) {
        const stage = await fetchWithRetry('/processstages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: step.name,
            info: step.info
          })
        });
        processStages.push(stage);
        await delay(2000); // 2s delay between stage creations
      }

      // Step 3: Create substages sequentially
      onProgress('Creating substages...', 60);
      for (let i = 0; i < processStages.length; i++) {
        const stage = processStages[i];
        for (const subphase of updatedProcessSteps[i].subphases) {
          const toolIds = [
            ...subphase.traditional.tools.map(t => toolIdMap.get(t.id) || t.id),
            ...subphase.ai.tools.map(t => toolIdMap.get(t.id) || t.id)
          ];
          
          // Debug the tool IDs being sent
          console.log('Creating substage with tools:', {
            name: subphase.name,
            toolIds: toolIds
          });
          
          await fetchWithRetry('/substages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              processstages_id: stage.id,
              name: subphase.name,
              description: subphase.description,
              tools_id: toolIds
            })
          });
          await delay(2000); // 2s delay between substage creations
        }
      }

      // Step 4: Create the final toolkit
      onProgress('Creating toolkit...', 90);
      await delay(2000); // Final delay before creating toolkit

      // Prepare the toolkit creation payload
      const toolkitPayload: ToolkitPayload = {
        title: data.basicInfo.title,
        description: data.basicInfo.description,
        industry_id: data.basicInfo.industry,
        projecttype_id: data.basicInfo.projectType,
        processstages_id: processStages.map(stage => stage.id),
        likes: 0,
        auth_tech_id: userData?.userId || null // Explicitly set null for anonymous users
      };

      console.log('Creating toolkit with auth status:', userData?.userId ? 
        `Authenticated user: ${userData.userId}` : 
        'Anonymous user (null auth_tech_id)'
      );

      const toolkit = await fetchWithRetry('/toolkit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toolkitPayload)
      });

      // No need for separate user association as it's done during creation
      onProgress('Complete!', 100);
      return toolkit;
    } catch (error) {
      console.error('Error in createCompleteToolkit:', error);
      throw error;
    }
  },

  // Add a separate method for icon upload if needed
  uploadToolIcon: async (toolId: number, iconFile: File) => {
    try {
      const formData = new FormData();
      formData.append('icon', iconFile);

      const response = await fetch(`${BASE_URL}/tools/${toolId}/icon`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload icon');
      }

      return response.json();
    } catch (error) {
      console.error('Error uploading tool icon:', error);
      throw error;
    }
  }
}; 