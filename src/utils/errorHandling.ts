export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = (error: unknown): string => {
  if (error instanceof AppError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  errorHandler: (error: string) => void,
  loadingMessage?: string,
  loadingHandler?: {
    startLoading: (message: string) => void;
    stopLoading: () => void;
  }
): Promise<T | undefined> => {
  try {
    if (loadingHandler && loadingMessage) {
      loadingHandler.startLoading(loadingMessage);
    }
    const result = await operation();
    return result;
  } catch (error) {
    const errorMessage = handleError(error);
    errorHandler(errorMessage);
    return undefined;
  } finally {
    if (loadingHandler) {
      loadingHandler.stopLoading();
    }
  }
}; 