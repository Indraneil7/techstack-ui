export interface ValidationErrors {
  title?: string;
  description?: string;
  industry?: string;
  projectType?: string;
}

export interface BasicInfo {
  title: string;
  description: string;
  industry: string;
  projectType: string;
}

export const validateBasicInfo = (basicInfo: BasicInfo): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!basicInfo.title.trim()) {
    errors.title = 'Title is required';
  } else if (basicInfo.title.length < 3) {
    errors.title = 'Title must be at least 3 characters';
  }

  if (!basicInfo.description.trim()) {
    errors.description = 'Description is required';
  } else if (basicInfo.description.length < 10) {
    errors.description = 'Description must be at least 10 characters';
  }

  if (!basicInfo.industry) {
    errors.industry = 'Industry is required';
  }

  if (!basicInfo.projectType) {
    errors.projectType = 'Project type is required';
  }

  return errors;
};

export const isValidBasicInfo = (basicInfo: BasicInfo): boolean => {
  const errors = validateBasicInfo(basicInfo);
  return Object.keys(errors).length === 0;
}; 