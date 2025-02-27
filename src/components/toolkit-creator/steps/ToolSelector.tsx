import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Tool } from '../../../types/index';
import { api } from '../../../utils/api';
import { PhotoIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { debounce } from 'lodash';

interface ToolSelectorProps {
  tools: Tool[];
  onUpdate: (tools: Tool[]) => void;
  category: 'Traditional' | 'AI';
}

export const ToolSelector: React.FC<ToolSelectorProps> = ({
  tools,
  onUpdate,
  category
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Tool[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newTool, setNewTool] = useState({
    name: '',
    website: '',
    overview: '',
    features: [''],
    icon: {
      file: null as File | null,
      url: '',
      name: '',
      type: '',
      path: '',
      access: 'public',
      size: 0,
      mime: 'image/png',
      meta: {
        width: 0,
        height: 0
      }
    }
  });
  const [formErrors, setFormErrors] = useState({
    name: false,
    website: false,
    overview: false
  });
  
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Ensure all tools have required fields
  useEffect(() => {
    const validTools = tools.filter(tool => tool.name && tool.website);
    if (validTools.length !== tools.length) {
      console.log('Removing invalid tools:', tools.filter(tool => !tool.name || !tool.website));
      onUpdate(validTools);
    }
  }, [tools, onUpdate]);

  // Handle selecting a tool from suggestions
  const handleSelectTool = (tool: Tool) => {
    // Ensure tool has required fields before adding
    if (!tool.name || !tool.website) {
      console.error('Cannot add tool without name and website:', tool);
      return;
    }
    onUpdate([...tools, tool]);
    setSearchTerm('');
    setSuggestions([]);
  };

  // Handle adding a new custom tool
  const handleAddNewTool = () => {
    if (!newTool.name.trim() || !newTool.website.trim()) {
      return;
    }
    
    const newToolWithId = {
      id: Date.now(),
      created_at: Date.now(),
      name: newTool.name.trim(),
      website: newTool.website.trim(),
      likes: 0,
      category,
      features: newTool.features.filter(f => f.trim() !== ''),
      overview: newTool.overview.trim(),
      icon: {
        url: newTool.icon.url || '',
        name: newTool.icon.name || '',
        path: newTool.icon.path || '',
        type: newTool.icon.type || '',
        access: newTool.icon.access || 'public',
        size: newTool.icon.size || 0,
        mime: newTool.icon.mime || 'image/png',
        meta: newTool.icon.meta || { width: 0, height: 0 }
      }
    } as Tool;
    
    // Add the file as a non-typed property
    if (newTool.icon.file) {
      (newToolWithId as any)._iconFile = newTool.icon.file;
    }
    
    onUpdate([...tools, newToolWithId]);
    setIsAddingNew(false);
    setNewTool({
      name: '',
      website: '',
      overview: '',
      features: [''],
      icon: {
        file: null,
        url: '',
        name: '',
        type: '',
        path: '',
        access: 'public',
        size: 0,
        mime: 'image/png',
        meta: {
          width: 0,
          height: 0
        }
      }
    });
  };

  // Handle removing a tool
  const handleRemoveTool = (index: number) => {
    const updatedTools = [...tools];
    updatedTools.splice(index, 1);
    onUpdate(updatedTools);
  };

  // Remove overview from required validation
  const validateField = (field: string, value: string) => {
    if (field === 'name' || field === 'website') {
      setFormErrors(prev => ({ ...prev, [field]: !value.trim() }));
      return !!value.trim();
    }
    return true;
  };

  // Handle changing a value in the new tool form
  const handleNewToolChange = (field: string, value: string) => {
    setNewTool(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Validate the field if it's been touched before
    if (formErrors[field as keyof typeof formErrors] !== undefined) {
      validateField(field, value);
    }
  };
  
  // Handle feature input changes
  const handleFeatureChange = (index: number, value: string) => {
    const updatedFeatures = [...newTool.features];
    updatedFeatures[index] = value;
    setNewTool(prev => ({
      ...prev,
      features: updatedFeatures
    }));
  };
  
  // Add a new feature input
  const addFeature = () => {
    setNewTool(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };
  
  // Remove a feature input
  const handleRemoveFeature = (index: number) => {
    const updatedFeatures = [...newTool.features];
    updatedFeatures.splice(index, 1);
    setNewTool(prev => ({
      ...prev,
      features: updatedFeatures
    }));
  };
  
  const processImage = (file: File): Promise<{ processedFile: File, dimensions: { width: number, height: number } }> => {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      img.onload = () => {
        // Max dimensions
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;

        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to file
        canvas.toBlob((blob) => {
          const processedFile = new File([blob!], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });

          resolve({
            processedFile,
            dimensions: { width, height }
          });
        }, 'image/jpeg', 0.8); // 80% quality JPEG
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);

      try {
        const { processedFile, dimensions } = await processImage(file);
        console.log('Processed file:', processedFile); // Debug log
        
        setNewTool({
          ...newTool,
          icon: {
            file: processedFile,  // This is the key part - we're storing the processed file
            url: previewUrl,
            name: file.name,
            type: 'image',
            path: '',
            access: 'public',
            size: processedFile.size,
            mime: processedFile.type,
            meta: {
              width: dimensions.width,
              height: dimensions.height
            }
          }
        });
      } catch (error) {
        console.error('Error handling image:', error);
      }
    }
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (newTool.icon?.url?.startsWith('blob:')) {
        URL.revokeObjectURL(newTool.icon.url);
      }
    };
  }, [newTool.icon?.url]);

  const debouncedSearch = useMemo(
    () => debounce(async (term: string) => {
      if (term.length < 2) {
        setSuggestions([]);
        return;
      }
      
      setIsLoading(true);
      try {
        const response = await api.searchTools(term);
        const filteredTools = response.filter((tool: Tool) => 
          tool.category === category
        );
        setSuggestions(filteredTools);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [category]
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => debouncedSearch.cancel();
  }, [searchTerm, debouncedSearch]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        !searchInputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="space-y-2">
      {/* Search & Tool display section */}
      {!isAddingNew && (
        <>
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => {
                if (searchTerm.length >= 2) {
                  setShowSuggestions(true);
                }
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder={`Search for ${category} tools...`}
            />
            {isLoading && (
              <div className="absolute right-3 top-2">
                <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
              </div>
            )}
            
            {/* Tool suggestions dropdown */}
            {showSuggestions && (
              <div 
                ref={suggestionsRef}
                className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
              >
                {suggestions.length > 0 ? (
                  suggestions.map((tool) => (
                    <div
                      key={tool.id || tool.name}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                      onClick={() => {
                        handleSelectTool(tool);
                        setSearchTerm('');
                        setShowSuggestions(false);
                      }}
                    >
                      {tool.icon?.url && (
                        <img 
                          src={tool.icon.url} 
                          alt={tool.name} 
                          className="w-5 h-5 mr-2 rounded-sm object-contain"
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-medium text-sm">{tool.name}</div>
                        <div className="text-xs text-gray-500 truncate">{tool.overview.substring(0, 60)}...</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500">No matching tools found</div>
                )}
              </div>
            )}
          </div>
          
          {/* Selected Tools */}
          <div className="flex flex-wrap gap-2 mt-2">
            {tools.map((tool, index) => (
              <div 
                key={tool.id || index}
                className="flex items-center px-3 py-1 rounded-full bg-gray-100"
              >
                {tool.icon?.url && (
                  <img 
                    src={tool.icon.url} 
                    alt={tool.name || 'Tool'} 
                    className="w-4 h-4 mr-2 rounded-sm object-contain"
                  />
                )}
                <span className="text-sm text-gray-700">{tool.name}</span>
                <button
                  onClick={() => handleRemoveTool(index)}
                  className="ml-2 text-gray-400 hover:text-red-500"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </>
      )}
      
      {/* Add New Tool Form */}
      {isAddingNew && (
        <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
          <h4 className="text-sm font-medium mb-3">Add New {category} Tool</h4>
          
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Tool Name*
                {formErrors.name && <span className="text-red-500 ml-1">Required</span>}
              </label>
              <input
                type="text"
                value={newTool.name}
                onChange={(e) => handleNewToolChange('name', e.target.value)}
                onBlur={() => validateField('name', newTool.name)}
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  formErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Tool name"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Website URL*
                {formErrors.website && <span className="text-red-500 ml-1">Required</span>}
              </label>
              <input
                type="url"
                value={newTool.website}
                onChange={(e) => handleNewToolChange('website', e.target.value)}
                onBlur={() => validateField('website', newTool.website)}
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  formErrors.website ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="https://example.com"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Overview*
                {formErrors.overview && <span className="text-red-500 ml-1">Required</span>}
              </label>
              <textarea
                value={newTool.overview}
                onChange={(e) => handleNewToolChange('overview', e.target.value)}
                onBlur={() => validateField('overview', newTool.overview)}
                rows={2}
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  formErrors.overview ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Brief description of the tool"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Icon (optional)</label>
              <div className="flex items-center">
                <label className="flex items-center justify-center w-16 h-16 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-gray-400">
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleIconUpload}
                  />
                  {newTool.icon?.url ? (
                    <img src={newTool.icon.url} alt="Tool icon" className="w-full h-full object-contain" />
                  ) : (
                    <PhotoIcon className="w-6 h-6 text-gray-400" />
                  )}
                </label>
                <span className="ml-3 text-xs text-gray-500">Upload tool logo</span>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Features</label>
              {newTool.features.map((feature, index) => (
                <div key={index} className="flex mb-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`Feature ${index + 1}`}
                  />
                  {newTool.features.length > 1 && (
                    <button
                      onClick={() => handleRemoveFeature(index)}
                      className="ml-2 text-gray-400 hover:text-red-500 px-2"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addFeature}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
              >
                <PlusCircleIcon className="w-4 h-4 mr-1" />
                Add Feature
              </button>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => {
                setIsAddingNew(false);
                setFormErrors({name: false, website: false, overview: false});
              }}
              className="flex-1 py-2 rounded-md text-sm bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddNewTool}
              disabled={!newTool.name || !newTool.website || !newTool.overview}
              className={`flex-1 py-2 rounded-md text-sm ${
                !newTool.name || !newTool.website || !newTool.overview
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
              }`}
            >
              Add Tool
            </button>
          </div>
        </div>
      )}
      
      {/* Add Tool Button */}
      {!isAddingNew && (
        <button
          onClick={() => setIsAddingNew(true)}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
        >
          <PlusCircleIcon className="w-4 h-4 mr-1" />
          Add {category} Tool
        </button>
      )}
    </div>
  );
}; 