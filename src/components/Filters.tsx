import React from 'react';
import { Industry, ProjectType } from '../types';

interface FiltersProps {
  industries: Industry[];
  projectTypes: ProjectType[];
  selectedIndustry: string;
  setSelectedIndustry: (industry: string) => void;
  selectedProjectType: string;
  setSelectedProjectType: (projectType: string) => void;
  isLoading?: boolean;
}

const Filters: React.FC<FiltersProps> = ({
  industries,
  projectTypes,
  selectedIndustry,
  setSelectedIndustry,
  selectedProjectType,
  setSelectedProjectType,
  isLoading = false
}) => {
  return (
    <div className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-wrap gap-4">
          {/* Industry Filter */}
          <div className="flex items-center space-x-2">
            <label 
              htmlFor="industry" 
              className="text-sm font-medium text-gray-700"
            >
              Industry:
            </label>
            <select
              id="industry"
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              <option value="">All Industries</option>
              {industries.map((industry) => (
                <option key={industry.id} value={industry.id}>
                  {industry.name}
                </option>
              ))}
            </select>
          </div>

          {/* Project Type Filter */}
          <div className="flex items-center space-x-2">
            <label 
              htmlFor="projectType" 
              className="text-sm font-medium text-gray-700"
            >
              Project Type:
            </label>
            <select
              id="projectType"
              value={selectedProjectType}
              onChange={(e) => setSelectedProjectType(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              <option value="">All Project Types</option>
              {projectTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
              <span className="text-sm text-gray-500">Loading filters...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Filters;