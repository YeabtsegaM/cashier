export interface RecallBetsData {
  ticketNumber: string;
  cartelaNumber: number;
  amount: number;
  createdAt: string;
  gameId: string;
  _id?: string;
  winAmount?: number;
  sessionId?: string;
  status?: string;
}

export interface RecallBetsTabProps {
  cashierId?: string;
}

export interface RecallBetsFilters {
  status?: string;
  dateRange?: string;
}

export interface RecallBetsValidationResult {
  isValid: boolean;
  error?: string;
} 