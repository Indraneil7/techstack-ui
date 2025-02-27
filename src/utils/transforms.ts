import { 
  Toolkit} from '../types/index';



export const transformToolkitData = (
  apiResponse: { result1: any[] }): Toolkit[] => {
  if (!apiResponse?.result1) return [];

  return apiResponse.result1.map(toolkit => {
    console.log('Raw toolkit data:', toolkit);
    console.log('Raw process stages:', toolkit.processstages_id);
    
    // Handle the nested array structure and flatten all process stages
    let processSteps = [];
    if (Array.isArray(toolkit.processstages_id)) {
      // Flatten all nested arrays and filter out nulls
      processSteps = toolkit.processstages_id
        .flat()
        .filter((step: unknown) => step !== null);
    }
    
    console.log('Processed process steps:', processSteps);

    return {
      id: toolkit.id,
      created_at: toolkit.created_at,
      title: toolkit.title,
      description: toolkit.description,
      likes: toolkit.likes || 0,
      industry_id: toolkit.industry_id,
      projecttype_id: toolkit.projecttype_id,
      processstages_id: processSteps.map((step: any) => {
        if (!step || typeof step !== 'object') return null;
        
        return {
          id: step.id,
          created_at: step.created_at,
          name: step.name,
          info: step.info,
          _substages_of_processstages: (step._substages_of_processstages || [])
            .filter((substage: any) => substage !== null)
            .map((substage: any) => {
              if (!substage || typeof substage !== 'object') return null;
              
              // Handle tools array the same way - flatten and filter nulls
              const tools = Array.isArray(substage.tools_id)
                ? substage.tools_id.flat().filter((tool: any) => tool !== null)
                : [];
              
              return {
                id: substage.id,
                created_at: substage.created_at,
                name: substage.name,
                description: substage.description,
                processstages_id: substage.processstages_id,
                _tools_of_substages: tools
              };
            })
            .filter(Boolean)
        };
      }).filter(Boolean)
    };
  });
};