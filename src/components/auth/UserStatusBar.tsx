import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export const UserStatusBar: React.FC = () => {
  const { user, isAuthenticated, isAnonymous, logout } = useAuthStore();
  
  if (isAnonymous) {
    return (
      <div className="bg-yellow-50 border-b border-yellow-100 py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <p className="text-sm text-yellow-700">
            <UserIcon className="h-4 w-4 inline mr-1" />
            You're working as a guest. Create an account to save your work!
          </p>
          <button 
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            onClick={() => window.location.reload()} // Simple way to trigger auth flow
          >
            Sign Up / Login
          </button>
        </div>
      </div>
    );
  }
  
  if (isAuthenticated && user) {
    return (
      <div className="bg-blue-50 border-b border-blue-100 py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <p className="text-sm text-blue-700">
            <UserIcon className="h-4 w-4 inline mr-1" />
            Logged in as: <span className="font-medium">{user.username || 'User'}</span>
          </p>
          <button 
            className="text-sm text-gray-600 hover:text-gray-800 font-medium flex items-center"
            onClick={() => {
              logout();
              // Optionally redirect or reload after logout
              window.location.reload();
            }}
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
            Logout
          </button>
        </div>
      </div>
    );
  }
  
  return null;
}; 