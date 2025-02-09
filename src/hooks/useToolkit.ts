import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Industry, ProjectType, Toolkit, ApiToolkit } from '../types';

export const useToolkit = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toolkits, setToolkits] = useState<Toolkit[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [selectedProjectType, setSelectedProjectType] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data
        const [toolkitsResponse, industriesResponse, projectTypesResponse] = await Promise.all([
          api.getToolkits(),
          api.getIndustries(),
          api.getProjectTypes()
        ]);

        setIndustries(industriesResponse || []);
        setProjectTypes(projectTypesResponse || []);

        // Transform API toolkits to match UI requirements
        const transformedToolkits = (toolkitsResponse.result1 || []).map((apiToolkit: ApiToolkit) => {
          const industry = industriesResponse.find((i: Industry) => i.id === apiToolkit.industry_id)?.name || 'Unknown';
          const projectType = projectTypesResponse.find((p: ProjectType) => p.id === apiToolkit.projecttype_id)?.name || 'Unknown';
          
          return {
            id: apiToolkit.id,
            title: apiToolkit.title,
            description: apiToolkit.description,
            likes: apiToolkit.likes,
            industry,
            projectType,
            processSteps: apiToolkit.processstages_id.flat() // Flatten the nested array
          };
        });

        setToolkits(transformedToolkits);

      } catch (err) {
        console.error('Error in useToolkit:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter toolkits based on selected industry and project type
  const filteredToolkits = toolkits.filter(toolkit => {
    if (selectedIndustry && toolkit.industry !== selectedIndustry) return false;
    if (selectedProjectType && toolkit.projectType !== selectedProjectType) return false;
    return true;
  });

  return {
    loading,
    error,
    toolkits: filteredToolkits,
    industries,
    projectTypes,
    selectedIndustry,
    selectedProjectType,
    setSelectedIndustry,
    setSelectedProjectType,
    addToolkitComment: async (toolkitId: number, comment: string): Promise<void> => {
      try {
        await api.addToolkitComment(toolkitId, comment);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add toolkit comment');
        throw err;
      }
    },
    addToolComment: async (toolId: number, comment: string): Promise<void> => {
      try {
        await api.addToolComment(toolId, comment);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add tool comment');
        throw err;
      }
    }
  };
};