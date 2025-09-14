'use client';

import { useState } from 'react';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useToast } from '../ui/Toast';

interface LoginFormProps {
  onSubmit: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  isLoading?: boolean;
}

export default function LoginForm({ onSubmit, isLoading = false }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { showToast, ToastContainer } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      showToast('Please enter both username and password', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await onSubmit(username.trim(), password);
      
      if (!result.success) {
        showToast(result.error || 'Login failed', 'error');
      }
    } catch (error: any) {
      showToast(error.message || 'An unexpected error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-xs">
      <div className="bg-white rounded-xl shadow-sm p-5">
        {/* Header */}
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Cashier Login</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Username Field */}
          <div>
                 <input
                 id="username"
                 type="text"
                 value={username}
                 onChange={(e) => setUsername(e.target.value)}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-colors text-gray-900 placeholder-gray-400 text-sm"
                 placeholder="Username"
                 disabled={isSubmitting || isLoading}
                 autoComplete="username"
               />
          </div>

          {/* Password Field */}
          <div>
                <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-colors text-gray-900 placeholder-gray-400 text-sm"
                placeholder="Password"
                disabled={isSubmitting || isLoading}
                autoComplete="current-password"
              />
          </div>

          

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting || isLoading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" />
                <span className="ml-2 text-sm">Logging in...</span>
              </div>
            ) : (
              'Login'
            )}
                     </button>
         </form>
       </div>
       
       {/* Toast Container */}
       <ToastContainer />
     </div>
   );
 } 