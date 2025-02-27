import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Industry, ProjectType, Toolkit } from '../types/index';
import { transformToolkitData } from '../utils/transforms';

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

        console.log('Raw toolkit response:', toolkitsResponse); // Debug log

        setIndustries(industriesResponse || []);
        setProjectTypes(projectTypesResponse || []);

        // Transform API toolkits to match UI requirements
        const transformedToolkits = transformToolkitData(
          toolkitsResponse,
          industriesResponse,
          projectTypesResponse
        );

        console.log('Transformed toolkits:', transformedToolkits); // Debug log
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
    const industryMatch = !selectedIndustry || toolkit.industry_id.toString() === selectedIndustry;
    const projectTypeMatch = !selectedProjectType || toolkit.projecttype_id.toString() === selectedProjectType;
    return industryMatch && projectTypeMatch;
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