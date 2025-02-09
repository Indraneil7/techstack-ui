import React, { useState, useEffect } from 'react';
import { api } from './utils/api';
import { transformToolkitData } from './utils/transforms';
import { Industry, ProjectType, Toolkit } from './types';
import Header from './components/Header';
import Filters from './components/Filters';
import Section from './components/Section';
import ErrorBoundary from './components/ErrorBoundary';

const App: React.FC = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toolkits, setToolkits] = useState<Toolkit[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedProjectType, setSelectedProjectType] = useState('');

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all required data in parallel
        const [toolkitsRes, industriesRes, projectTypesRes] = await Promise.all([
          api.getToolkits(),
          api.getIndustries(),
          api.getProjectTypes()
        ]);

        // Set industries and project types
        setIndustries(industriesRes);
        setProjectTypes(projectTypesRes);

        // Transform and set toolkits data
        const transformedToolkits = transformToolkitData(
          toolkitsRes,
          industriesRes,
          projectTypesRes
        );
        setToolkits(transformedToolkits);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter toolkits based on selected filters
  const filteredToolkits = toolkits.filter(toolkit => {
    if (selectedIndustry && selectedIndustry !== '') {
      if (toolkit.industry_id !== parseInt(selectedIndustry)) return false;
    }
    if (selectedProjectType && selectedProjectType !== '') {
      if (toolkit.projecttype_id !== parseInt(selectedProjectType)) return false;
    }
    return true;
  });

  // Comment handlers
  const handleAddToolkitComment = async (toolkitId: number, comment: string) => {
    try {
      await api.addToolkitComment(toolkitId, comment);
      // Optionally update local state or refetch comments
    } catch (err) {
      console.error('Error adding toolkit comment:', err);
      throw err;
    }
  };

  const handleAddToolComment = async (toolId: number, comment: string) => {
    try {
      await api.addToolComment(toolId, comment);
      // Optionally update local state or refetch comments
    } catch (err) {
      console.error('Error adding tool comment:', err);
      throw err;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tech stack guide...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <Filters
          industries={industries}
          projectTypes={projectTypes}
          selectedIndustry={selectedIndustry}
          setSelectedIndustry={setSelectedIndustry}
          selectedProjectType={selectedProjectType}
          setSelectedProjectType={setSelectedProjectType}
          isLoading={loading}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {filteredToolkits.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No results found
              </h3>
              <p className="text-gray-600">
                Try adjusting your filters to find more tech stacks.
              </p>
            </div>
          ) : (
            filteredToolkits.map((toolkit) => (
              <Section
                key={toolkit.id}
                data={toolkit}
                onAddComment={handleAddToolkitComment}
                onAddToolComment={handleAddToolComment}
              />
            ))
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default App;