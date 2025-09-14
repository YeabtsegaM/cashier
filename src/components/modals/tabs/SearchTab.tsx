'use client';

import React, { useState, useCallback } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../contexts/ToastContext';
import { apiClient } from '../../../utils/api';
import { GameSearchResult, GameSearchParams } from '../../../types';
import LoadingSpinner from '../../ui/LoadingSpinner';
import { printService } from '../../../utils/printService';
import { CustomDatePicker } from '../../ui/CustomDatePicker';

export const SearchTab: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  // Set default date to today
  const today = new Date().toISOString().split('T')[0]; // Changed to date format
  
  const [searchParams, setSearchParams] = useState<GameSearchParams>({
    startDate: today,
    endDate: '',
    gameId: '',
    cashierId: user?.id || ''
  });
  
  const [searchResults, setSearchResults] = useState<GameSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Handle print functionality
  const handlePrint = useCallback(async () => {
    if (!searchResults || searchResults.length === 0) {
      showToast('No results available to print', 'error');
      return;
    }

    if (!user) {
      showToast('User information not available', 'error');
      return;
    }

    try {
      const firstResult = searchResults[0];
      const printData = {
        cashierFirstName: user.fullName?.split(' ')[0] || 'Unknown',
        cashierUsername: user.username || 'Unknown',
        dateTime: new Date(),
        gameId: firstResult.gameId,
        resultNumbers: firstResult.finalCalledNumbers || []
      };

      await printService.printResults(printData);
      showToast('Results printed successfully', 'success');
    } catch (error: any) {
      console.error('Print error:', error);
      showToast(error.message || 'Failed to print results', 'error');
    }
  }, [searchResults, user, showToast]);

  const handleInputChange = useCallback((field: keyof GameSearchParams, value: string) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSearch = useCallback(async () => {
    // Both Date and Game ID are required
    if (!searchParams.startDate || !searchParams.gameId || searchParams.gameId.trim() === '') {
      showToast('Both Date and Event No are required', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.searchGames(searchParams);
      const results = response.data?.results || [];
      
      setSearchResults(results);
      
      if (!results || results.length === 0) {
        showToast('No games found', 'error');
      } else {
        showToast(`Found ${results.length} games`, 'success');
      }
    } catch (error) {
      console.error('Search failed:', error);
      showToast('Search failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, showToast]);

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="bg-white p-6 rounded-lg border border-green-200">
        <div className="flex items-end space-x-4">
          {/* Date Field */}
          <div className="w-48">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <CustomDatePicker
              value={searchParams.startDate || ''}
              onChange={(value) => handleInputChange('startDate', value)}
              placeholder="Select date"
            />
          </div>

          {/* Event No Field */}
          <div className="w-32">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Event No <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., 4000"
              value={searchParams.gameId}
              onChange={(e) => handleInputChange('gameId', e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 text-sm"
              required
            />
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={isLoading || !searchParams.startDate || !searchParams.gameId || searchParams.gameId.trim() === ''}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Search'}
          </button>
          
        </div>
      </div>

      {/* Game Draw Results */}
      {searchResults.length > 0 && (
        <div className="bg-white rounded-lg border border-green-200 p-6">
          {/* Event Header */}
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-green-700">
              Event Id {searchResults[0].gameId} | Bingo
            </h3>
            <button 
              onClick={handlePrint}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
          </div>
          
          {/* Called Numbers Grid */}
          <div className="bg-gray-100 rounded-lg p-4">
            {searchResults[0].finalCalledNumbers && searchResults[0].finalCalledNumbers.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {searchResults[0].finalCalledNumbers.map((number, idx) => (
                  <span
                    key={idx}
                    className="inline-block w-8 h-8 px-2 py-1 bg-green-600 text-white text-sm font-medium rounded-full flex items-center justify-spa"
                  >
                    {number}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>No called numbers found for this game</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 