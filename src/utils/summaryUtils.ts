import { SummaryFilters, SummaryValidationResult } from '../types/summary';

// Date validation
export const validateDateRange = (fromDate: string, toDate: string): SummaryValidationResult => {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  
  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    return { isValid: false, error: 'Invalid date format' };
  }
  
  if (from > to) {
    return { isValid: false, error: 'From date cannot be after to date' };
  }
  
  const today = new Date();
  const maxDateRange = new Date();
  maxDateRange.setDate(today.getDate() + 365); // Allow up to 1 year in the future
  
  if (to > maxDateRange) {
    return { isValid: false, error: 'Date range cannot exceed 1 year' };
  }
  
  return { isValid: true };
};

// Date formatting
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Currency formatting
export const formatCurrency = (amount: number): string => {
  return `Br. ${amount.toFixed(2)}`;
};

// Default date range (today only)
export const getDefaultDateRange = (): SummaryFilters => {
  const today = new Date();
  
  return {
    fromDate: today.toISOString().slice(0, 10), // Today's date
    toDate: today.toISOString().slice(0, 10)    // Today's date
  };
};

// Summary calculations
export const calculateTotalRevenue = (bets: number, redeemed: number): number => {
  return bets + redeemed;
};

export const calculateProfitMargin = (netBalance: number, totalRevenue: number): number => {
  if (totalRevenue === 0) return 0;
  return (netBalance / totalRevenue) * 100;
};

// Data validation
export const validateSummaryData = (data: any): boolean => {
  const requiredFields = [
    'cashierName', 'fromDate', 'toDate', 'tickets', 
    'bets', 'unclaimed', 'redeemed', 'netBalance', 'shopName'
  ];
  
  return requiredFields.every(field => 
    data.hasOwnProperty(field) && data[field] !== undefined && data[field] !== null
  );
}; 