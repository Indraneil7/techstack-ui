import React, { createContext, useContext, useState, useCallback } from 'react';

interface LoadingState {
  isLoading: boolean;
  message: string;
  error: string | null;
}

interface LoadingContextType extends LoadingState {
  startLoading: (message: string) => void;
  stopLoading: () => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    message: '',
    error: null,
  });

  const startLoading = useCallback((message: string) => {
    setState(prev => ({ ...prev, isLoading: true, message, error: null }));
  }, []);

  const stopLoading = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: false, message: '' }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, isLoading: false }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return (
    <LoadingContext.Provider
      value={{
        ...state,
        startLoading,
        stopLoading,
        setError,
        clearError,
      }}
    >
      {children}
      {/* Loading Overlay */}
      {state.isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-700">{state.message}</p>
            </div>
          </div>
        </div>
      )}
      {/* Error Toast */}
      {state.error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50 flex items-center shadow-lg">
          <div className="mr-2">{state.error}</div>
          <button
            onClick={clearError}
            className="text-red-700 hover:text-red-900"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}; 