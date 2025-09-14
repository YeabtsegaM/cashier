'use client';

import React, { useCallback } from 'react';
import { apiClient } from '../../../utils/api';
import { useSummaryState } from '../../../hooks/useSummaryState';
import { useToast } from '../../../contexts/ToastContext';
import { SummaryTabProps } from '../../../types/summary';
import { printService } from '../../../utils/printService';
import { useAuth } from '../../../hooks/useAuth';
import { CustomDatePicker } from '../../ui/CustomDatePicker';

export const SummaryTab: React.FC<SummaryTabProps> = ({ 
  onBalanceUpdate, 
  summaryData, 
  showData, 
  onDataUpdate 
}) => {
  const { showToast } = useToast();
  const { user } = useAuth();
  
  const {
    loading,
    filters,
    setLoading,
    updateFilters,
    resetFilters,
    validateFilters
  } = useSummaryState({
    onError: (message) => showToast(message, 'error'),
    onSuccess: (message) => showToast(message, 'success')
  });

  // Auto-refresh data when component loads
  React.useEffect(() => {
    if (filters.fromDate && filters.toDate) {
      handleRefreshWithFilters(filters);
    }
  }, []); // Only run once when component mounts

  const handleDateChange = (field: 'fromDate' | 'toDate', value: string) => {
    // Update the filters first
    const newFilters = { ...filters, [field]: value };
    updateFilters(newFilters);
    
    // Auto-refresh data when dates change with the new filter values
    setTimeout(() => {
      if (newFilters.fromDate && newFilters.toDate) {
        // Use the new filter values directly instead of the old state
        handleRefreshWithFilters(newFilters);
      }
    }, 100); // Small delay to ensure state is updated
  };

  // Separate function to handle refresh with specific filters
  const handleRefreshWithFilters = useCallback(async (filterValues: any) => {
    if (!validateFilters(filterValues)) return;
    
    try {
      setLoading(true);
      
      const response = await apiClient.getCashierSummary({
        fromDate: filterValues.fromDate,
        toDate: filterValues.toDate
      });
      
      if (response.success && response.data) {
        onDataUpdate(response.data, true);
        
        // Update balance in real-time
        const balance = response.data.netBalance;
        onBalanceUpdate(`Br. ${balance.toFixed(2)}`);
      } else {
        showToast('Failed to fetch summary data', 'error');
      }
    } catch (error) {
      showToast('Failed to fetch summary data', 'error');
    } finally {
      setLoading(false);
    }
  }, [validateFilters, setLoading, onDataUpdate, onBalanceUpdate, showToast]);

  // Handle print functionality
  const handlePrint = useCallback(async () => {
    if (!summaryData) {
      showToast('No data available to print', 'error');
      return;
    }

    if (!user) {
      showToast('User information not available', 'error');
      return;
    }

    try {
      const printData = {
        cashierFirstName: user.fullName?.split(' ')[0] || summaryData.cashierName?.split(' ')[0] || 'Unknown',
        cashierUsername: user.username || 'Unknown',
        dateTime: new Date(),
        fromDate: summaryData.fromDate,
        toDate: summaryData.toDate,
        tickets: summaryData.tickets,
        bets: summaryData.bets,
        redeemed: summaryData.redeemed,
        endBalance: summaryData.netBalance
      };

      await printService.printSummary(printData);
      showToast('Summary printed successfully', 'success');
    } catch (error: any) {
      console.error('Print error:', error);
      showToast(error.message || 'Failed to print summary', 'error');
    }
  }, [summaryData, user, showToast]);

  return (
    <div className="space-y-4">
      {/* Date Range Filters */}
      <div className="flex items-end space-x-4">
        <div className="w-48">
          <label className="block text-xs font-medium text-gray-700 mb-1">From Date</label>
          <CustomDatePicker
            value={filters.fromDate}
            onChange={(value) => handleDateChange('fromDate', value)}
            placeholder="Select from date"
          />
        </div>
        
        <div className="w-48">
          <label className="block text-xs font-medium text-gray-700 mb-1">To Date</label>
          <CustomDatePicker
            value={filters.toDate}
            onChange={(value) => handleDateChange('toDate', value)}
            placeholder="Select to date"
          />
        </div>
        
        <button
          onClick={() => handleRefreshWithFilters(filters)}
          disabled={loading}
          className="px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-1"
        >
          {loading ? (
            <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ) : (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          <span>{loading ? 'Loading...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Data Display */}
      {loading ? (
        <div className="text-center py-8">
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5 animate-spin text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-gray-600">Loading data...</span>
          </div>
        </div>
      ) : showData ? (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Print</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cashier Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tickets</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bets</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unclaimed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Redeemed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Balance</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {summaryData && (
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={handlePrint}
                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Print
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{summaryData.cashierName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{summaryData.fromDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{summaryData.toDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{summaryData.tickets}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Br {summaryData.bets.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Br {summaryData.unclaimed.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Br {summaryData.redeemed.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Br {summaryData.netBalance.toFixed(2)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No data found!</p>
        </div>
      )}
    </div>
  );
}; 