import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { api } from './utils/api';
import { transformToolkitData } from './utils/transforms';
import { Industry, ProjectType, Toolkit } from './types/index';
import Header from './components/Header';
import Filters from './components/Filters';
import Section from './components/Section';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastContainer, toast } from 'react-toastify';
import { ToolkitCreator } from './components/toolkit-creator/ToolkitCreator';
import { LoadingProvider } from './contexts/LoadingContext';
import 'react-toastify/dist/ReactToastify.css';

const ToolkitList: React.FC<{
  toolkits: Toolkit[];
  industries: Industry[];
  projectTypes: ProjectType[];
  loading: boolean;
  handleAddToolkitComment: (toolkitId: number, comment: string) => Promise<void>;
  handleAddToolComment: (toolId: number, comment: string) => Promise<void>;
}> = ({
  toolkits,
  industries,
  projectTypes,
  loading,
  handleAddToolkitComment,
  handleAddToolComment,
}) => {
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedProjectType, setSelectedProjectType] = useState('');

  const filteredToolkits = toolkits.filter(toolkit => {
    if (selectedIndustry && selectedIndustry !== '') {
      if (toolkit.industry_id !== parseInt(selectedIndustry)) return false;
    }
    if (selectedProjectType && selectedProjectType !== '') {
      if (toolkit.projecttype_id !== parseInt(selectedProjectType)) return false;
    }
    return true;
  });

  return (
    <>
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
              title={toolkit.title}
            />
          ))
        )}
      </main>
    </>
  );
};

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toolkits, setToolkits] = useState<Toolkit[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [toolkitsRes, industriesRes, projectTypesRes] = await Promise.all([
          api.getToolkits(),
          api.getIndustries(),
          api.getProjectTypes()
        ]);

        setIndustries(industriesRes);
        setProjectTypes(projectTypesRes);
        setToolkits(transformToolkitData(toolkitsRes));

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
        toast.error('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddToolkitComment = async (toolkitId: number, comment: string) => {
    try {
      await api.addToolkitComment(toolkitId, comment);
      toast.success('Comment added successfully');
    } catch (err) {
      console.error('Error adding toolkit comment:', err);
      toast.error('Failed to add comment');
      throw err;
    }
  };

  const handleAddToolComment = async (toolId: number, comment: string) => {
    try {
      await api.addToolComment(toolId, comment);
      toast.success('Comment added successfully');
    } catch (err) {
      console.error('Error adding tool comment:', err);
      toast.error('Failed to add comment');
      throw err;
    }
  };

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <LoadingProvider>
          <div className="min-h-screen bg-gray-100">
            <Header />
            <Routes>
              <Route 
                path="/" 
                element={
                  <ToolkitList
                    toolkits={toolkits}
                    industries={industries}
                    projectTypes={projectTypes}
                    loading={loading}
                    handleAddToolkitComment={handleAddToolkitComment}
                    handleAddToolComment={handleAddToolComment}
                  />
                } 
              />
              <Route 
                path="/create" 
                element={<ToolkitCreator />} 
              />
              <Route 
                path="/edit/:id" 
                element={<ToolkitCreator />} 
              />
              <Route 
                path="*" 
                element={<Navigate to="/" replace />} 
              />
            </Routes>
          </div>
          <ToastContainer 
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </LoadingProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default App;