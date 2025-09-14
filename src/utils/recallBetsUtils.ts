import { RecallBetsData, RecallBetsFilters } from '../types/recallBets';
import { formatCurrency } from './summaryUtils';

// Data filtering
export const filterRecallBets = (
  data: RecallBetsData[], 
  filters: RecallBetsFilters
): RecallBetsData[] => {
  let filtered = [...data];
  
  if (filters.status) {
    filtered = filtered.filter(item => item.status === filters.status);
  }
  
  if (filters.dateRange) {
    const filterDate = new Date(filters.dateRange);
    filtered = filtered.filter(item => {
      const itemDate = new Date(item.createdAt);
      return itemDate.toDateString() === filterDate.toDateString();
    });
  }
  
  return filtered;
};

// Data sorting
export const sortRecallBets = (
  data: RecallBetsData[], 
  sortBy: 'date' | 'ticketNumber' | 'amount' = 'date',
  sortOrder: 'asc' | 'desc' = 'desc'
): RecallBetsData[] => {
  return [...data].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'date':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      case 'ticketNumber':
        aValue = a.ticketNumber;
        bValue = b.ticketNumber;
        break;
      case 'amount':
        aValue = a.amount;
        bValue = b.amount;
        break;
      default:
        return 0;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
};

// Statistics calculation
export const calculateRecallBetsStats = (data: RecallBetsData[]) => {
  const totalTickets = data.length;
  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);
  const averageAmount = totalTickets > 0 ? totalAmount / totalTickets : 0;
  
  return {
    totalTickets,
    totalAmount,
    averageAmount,
    formattedTotalAmount: formatCurrency(totalAmount),
    formattedAverageAmount: formatCurrency(averageAmount)
  };
};

// Date formatting
export const formatRecallBetsDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Status validation
export const isValidStatus = (status: string): boolean => {
  const validStatuses = ['Active', 'Inactive', 'Pending', 'Completed'];
  return validStatuses.includes(status);
};

// Ticket number validation
export const isValidTicketNumber = (ticketNumber: string): boolean => {
  return /^\d{13}$/.test(ticketNumber);
}; 