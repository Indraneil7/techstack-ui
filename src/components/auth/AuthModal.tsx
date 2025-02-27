import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  showSkip?: boolean;
  message?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onContinue,
  showSkip = false,
  message = "Sign in to save your progress and manage your toolkits, or continue as a guest."
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignup, setIsSignup] = useState(false);
  
  const { login, continueAsGuest } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      if (isSignup) {
        // Handle signup
        await fetch('https://x8ki-letl-twmt.n7.xano.io/api:JQwL4HAE/auth_tech', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
      }
      // Login after signup or direct login
      await login(username, password);
      onContinue();
    } catch (err) {
      setError(isSignup ? 'Signup failed. Please try again.' : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueAsGuest = () => {
    continueAsGuest();
    onContinue();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">
          {isSignup ? 'Create Account' : 'Sign In'}
        </h2>
        <p className="text-gray-600 mb-4">{message}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4 mb-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {isLoading ? 'Processing...' : (isSignup ? 'Create Account' : 'Sign In')}
          </button>
        </form>
        
        <div className="flex flex-col items-center space-y-2">
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-blue-600 hover:text-blue-800"
          >
            {isSignup ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
          </button>
          
          {!isSignup && (
            <button
              onClick={handleContinueAsGuest}
              className="text-gray-600 hover:text-gray-800"
            >
              Continue as Guest
            </button>
          )}
          
          {showSkip && (
            <button
              onClick={onContinue}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Skip for now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}; 