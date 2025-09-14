'use client';

import { useState, useCallback } from 'react';
import { SummaryData, SummaryFilters } from '../types/summary';
import { validateDateRange, getDefaultDateRange } from '../utils/summaryUtils';

interface UseSummaryStateProps {
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

export function useSummaryState({ onError, onSuccess }: UseSummaryStateProps) {
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SummaryFilters>(getDefaultDateRange());
  
  // Validation functions
  const validateFilters = useCallback((dateFilters: SummaryFilters): boolean => {
    const validation = validateDateRange(dateFilters.fromDate, dateFilters.toDate);
    if (!validation.isValid) {
      onError(validation.error!);
      return false;
    }
    return true;
  }, [onError]);

  // Filter actions
  const updateFilters = useCallback((updates: Partial<SummaryFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(getDefaultDateRange());
  }, []);

  return {
    // State
    loading,
    filters,
    
    // Actions
    setLoading,
    updateFilters,
    resetFilters,
    validateFilters
  };
} 