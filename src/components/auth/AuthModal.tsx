import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Modal } from './Modal';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { authService } from '../../services/authService';

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
  message = "Please sign in or create an account"
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [linkedIn, setLinkedIn] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);
  const { login, register, continueAsGuest } = useAuthStore();

  // Check password strength
  const checkPasswordStrength = (password: string) => {
    if (password.length < 8) {
      setPasswordStrength('weak');
      return false;
    }
    
    // Check for complexity (at least one uppercase, one lowercase, one number, one special char)
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const complexity = [hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(Boolean).length;
    
    if (complexity < 2) {
      setPasswordStrength('weak');
      return false;
    } else if (complexity < 4) {
      setPasswordStrength('medium');
      return password.length >= 8;
    } else {
      setPasswordStrength('strong');
      return true;
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    
    // Only clear errors when typing
    if (usernameError) {
      setUsernameError(null);
    }
  };

  const handleUsernameBlur = async () => {
    // Only check non-empty usernames with minimum length when blurring
    if (mode === 'register' && username && username.trim().length >= 3) {
      setIsCheckingUsername(true);
      try {
        // Clear any existing cache for this username to ensure a fresh check
        authService.clearUsernameCache();
        
        const exists = await authService.checkUsernameExists(username);
        if (exists) {
          setUsernameError('Username already taken');
        } else {
          setUsernameError(null);
        }
      } catch (error) {
        console.error('Error checking username:', error);
      }
      setIsCheckingUsername(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (mode === 'register') {
      checkPasswordStrength(value);
    }
  };

  const handleGuestContinue = () => {
    continueAsGuest();
    onContinue();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (mode === 'register') {
      // Validate password strength
      if (!checkPasswordStrength(password)) {
        setError('Please use a stronger password (at least 8 characters with a mix of letters, numbers, and symbols)');
        return;
      }
      
      // Check username uniqueness on submit with a cleared cache
      setIsCheckingUsername(true);
      try {
        // Clear cache before checking to ensure fresh result
        authService.clearUsernameCache();
        const exists = await authService.checkUsernameExists(username);
        console.log(`Username check on submit for "${username}": ${exists ? 'Taken' : 'Available'}`);
        
        if (exists) {
          setUsernameError('Username already taken');
          setIsCheckingUsername(false);
          return;
        }
      } catch (error) {
        console.error('Error checking username:', error);
      }
      setIsCheckingUsername(false);
    }
    
    try {
      if (mode === 'login') {
        await login(username, password);
      } else {
        await register(username, password, linkedIn);
      }
      
      // Clear username cache after successful registration
      if (mode === 'register') {
        authService.clearUsernameCache();
      }
      
      onContinue();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">{message}</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <div className="flex space-x-4">
            <button
              type="button"
              className={`flex-1 pb-2 border-b-2 ${mode === 'login' ? 'border-blue-500 font-medium' : 'border-transparent text-gray-500'}`}
              onClick={() => {
                setMode('login');
                setError(null);
                setUsernameError(null);
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`flex-1 pb-2 border-b-2 ${mode === 'register' ? 'border-blue-500 font-medium' : 'border-transparent text-gray-500'}`}
              onClick={() => {
                setMode('register');
                setError(null);
                setUsernameError(null);
              }}
            >
              Create Account
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              onBlur={handleUsernameBlur}
              className={`w-full px-3 py-2 border ${usernameError ? 'border-red-300' : 'border-gray-300'} rounded-md`}
              required
              minLength={3}
            />
            {isCheckingUsername && <p className="text-xs text-gray-500 mt-1">Checking username...</p>}
            {usernameError && <p className="text-xs text-red-500 mt-1">{usernameError}</p>}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md pr-10"
                required
                minLength={mode === 'register' ? 8 : 1}
              />
              <button 
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            
            {mode === 'register' && passwordStrength && (
              <div className="mt-1">
                <div className="flex items-center">
                  <div className="h-1 flex-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        passwordStrength === 'weak' ? 'bg-red-500 w-1/3' : 
                        passwordStrength === 'medium' ? 'bg-yellow-500 w-2/3' : 
                        'bg-green-500 w-full'
                      }`}
                    />
                  </div>
                  <span className="ml-2 text-xs text-gray-500 capitalize">{passwordStrength}</span>
                </div>
                {passwordStrength === 'weak' && (
                  <p className="text-xs text-red-500 mt-1">
                    Password should be at least 8 characters with a mix of letters, numbers, and symbols
                  </p>
                )}
              </div>
            )}
          </div>
          
          {mode === 'register' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                LinkedIn Profile URL <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <input
                type="url"
                value={linkedIn}
                onChange={(e) => setLinkedIn(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
          )}
          
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            disabled={mode === 'register' && (!!usernameError || passwordStrength === 'weak')}
          >
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        
        {showSkip && (
          <button
            onClick={handleGuestContinue}
            className="w-full mt-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Continue as Guest
          </button>
        )}
      </div>
    </Modal>
  );
}; 