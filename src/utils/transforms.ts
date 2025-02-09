import { 
  Tool, 
  Toolkit, 
  ApiToolkit, 
  ProcessStep, 
  Subphase,
  Industry,
  ProjectType 
} from '../types';

const transformTool = (tool: Tool): Tool => ({
  id: tool.id,
  created_at: tool.created_at,
  name: tool.name,
  overview: tool.overview || '',
  features: tool.features || [],
  likes: tool.likes || 0,
  website: tool.website || '',
  category: tool.category,
  icon: tool.icon
});

const transformSubphases = (substages: any[]): Subphase[] => {
  if (!substages || !Array.isArray(substages)) return [];
  
  return substages.map(substage => {
    const tools = substage._tools_of_substages || [];
    return {
      id: substage.id,
      name: substage.name,
      description: substage.description,
      traditional: {
        tools: tools
          .filter((tool:Tool) => tool.category === 'Traditional')
          .map(transformTool)
      },
      ai: {
        tools: tools
          .filter((tool:Tool) => tool.category === 'AI')
          .map(transformTool)
      }
    };
  });
};

const transformProcessStages = (stagesArray: any[][]): ProcessStep[] => {
  if (!stagesArray || !Array.isArray(stagesArray)) return [];

  return stagesArray.flat().map(stage => ({
    id: stage.id,
    phase: stage.name,
    info: stage.info,
    subphases: transformSubphases(stage._substages_of_processstages)
  }));
};

export const transformToolkitData = (
  apiResponse: { result1: ApiToolkit[] },
  industries: Industry[],
  projectTypes: ProjectType[]
): Toolkit[] => {
  if (!apiResponse?.result1 || !Array.isArray(apiResponse.result1)) {
    return [];
  }

  return apiResponse.result1.map(toolkit => {
    const industry = industries.find(i => i.id === toolkit.industry_id)?.name || 'Unknown';
    const projectType = projectTypes.find(p => p.id === toolkit.projecttype_id)?.name || 'Unknown';

    return {
      id: toolkit.id,
      title: toolkit.title,
      description: toolkit.description,
      likes: toolkit.likes || 0,
      industry,
      projectType,
      industry_id: toolkit.industry_id,
      projecttype_id: toolkit.projecttype_id,
      processSteps: transformProcessStages(toolkit.processstages_id),
      comments: 0 // Initialize with 0, can be updated when comments are fetched
    };
  });
};