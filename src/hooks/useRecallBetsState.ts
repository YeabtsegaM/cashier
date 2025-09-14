'use client';

import { useState, useCallback } from 'react';
import { RecallBetsData, RecallBetsFilters } from '../types/recallBets';

import { apiClient } from '../utils/api';

interface UseRecallBetsStateProps {
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

export function useRecallBetsState({ onError, onSuccess }: UseRecallBetsStateProps) {
  const [recallBetsData, setRecallBetsData] = useState<RecallBetsData[]>([]);
  const [showRecallBets, setShowRecallBets] = useState(false);
  const [showRecallBetsTable, setShowRecallBetsTable] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Data loading
  const loadRecallBetsData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.getRecallBets();
      if (response.success && response.data) {
        // The data is already transformed on the server side
        setRecallBetsData(response.data);
        setShowRecallBets(true);
        onSuccess('Recalled bets loaded successfully');
      } else {
        onError(response.error || 'Failed to load recall bets');
      }
    } catch (error: any) {
      console.error('Error loading recall bets:', error);
      onError(error.message || 'Failed to load recall bets');
    } finally {
      setLoading(false);
    }
  }, [onError, onSuccess]);

  // Data processing - just return the data as is since no filtering/sorting needed
  const getFilteredAndSortedData = useCallback(() => {
    return recallBetsData;
  }, [recallBetsData]);

  // Table visibility
  const toggleTable = useCallback(() => {
    setShowRecallBetsTable(prev => !prev);
  }, []);

  // Ticket selection
  const handleViewSlips = useCallback((ticketNumber: string) => {
    setSelectedTicket(prev => prev === ticketNumber ? null : ticketNumber);
  }, []);

  // Print ticket functionality
  const handlePrintTicket = useCallback(async (ticketNumber: string) => {
    try {
      // Find the ticket data
      const ticket = recallBetsData.find(t => t.ticketNumber === ticketNumber);
      if (!ticket) {
        onError('Ticket not found');
        return;
      }

      // Call the print API
      const response = await apiClient.printRecallTicket(ticketNumber);
      if (response.success) {
        onSuccess(`Ticket ${ticketNumber} printed successfully`);
      } else {
        onError(response.error || 'Failed to print ticket');
      }
    } catch (error: any) {
      console.error('Error printing ticket:', error);
      onError(error.message || 'Failed to print ticket');
    }
  }, [recallBetsData, onError, onSuccess]);

  const clearSelectedTicket = useCallback(() => {
    setSelectedTicket(null);
  }, []);

  return {
    // State
    recallBetsData,
    showRecallBets,
    showRecallBetsTable,
    selectedTicket,
    loading,
    
    // Computed
    filteredAndSortedData: getFilteredAndSortedData(),
    
    // Actions
    loadRecallBetsData,
    toggleTable,
    handleViewSlips,
    handlePrintTicket,
    clearSelectedTicket,
    setShowRecallBets,
    setShowRecallBetsTable
  };
} 