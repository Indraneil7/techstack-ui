import React, { useState, useEffect } from 'react';
import { Industry, ProjectType } from '../../../types/index';
import { api } from '../../../utils/api';
import { useToolkitCreationStore } from '../../../store/toolkitCreationStore';
import { validateBasicInfo, ValidationErrors, BasicInfo } from '../../../utils/validation';

interface BasicInfoStepProps {
  onNext: () => void;
  onBasicInfoChange: (field: string, value: string) => void;
  basicInfo: BasicInfo;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ onNext, onBasicInfoChange, basicInfo }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    industry: '',
    projectType: ''
  });
  
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [industriesData, projectTypesData] = await Promise.all([
          api.getIndustries(),
          api.getProjectTypes()
        ]);
        setIndustries(industriesData);
        setProjectTypes(projectTypesData);
      } catch (error) {
        console.error('Error fetching form data:', error);
      }
    };

    fetchData();
  }, []);

  const handleNext = () => {
    const validationErrors = validateBasicInfo(basicInfo);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      onNext();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={basicInfo.title}
            onChange={(e) => onBasicInfoChange('title', e.target.value)}
            className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter toolkit title"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-500">{errors.title}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={basicInfo.description}
            onChange={(e) => onBasicInfoChange('description', e.target.value)}
            rows={4}
            className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Describe your toolkit"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Industry
            </label>
            <select
              value={basicInfo.industry}
              onChange={(e) => onBasicInfoChange('industry', e.target.value)}
              className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.industry ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select an industry</option>
              {industries.map((industry) => (
                <option key={industry.id} value={industry.id}>
                  {industry.name}
                </option>
              ))}
            </select>
            {errors.industry && (
              <p className="mt-1 text-sm text-red-500">{errors.industry}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Type
            </label>
            <select
              value={basicInfo.projectType}
              onChange={(e) => onBasicInfoChange('projectType', e.target.value)}
              className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.projectType ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a project type</option>
              {projectTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            {errors.projectType && (
              <p className="mt-1 text-sm text-red-500">{errors.projectType}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleNext}
          type="button"
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Next
        </button>
      </div>
    </div>
  );
}; 