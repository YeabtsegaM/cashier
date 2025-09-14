export interface SummaryData {
  cashierName: string;
  fromDate: string;
  toDate: string;
  tickets: number;
  bets: number;
  unclaimed: number;
  redeemed: number;
  netBalance: number;
  shopName: string;
}

export interface SummaryFilters {
  fromDate: string;
  toDate: string;
}

export interface SummaryTabProps {
  onBalanceUpdate: (balance: string) => void;
  summaryData: SummaryData | null;
  showData: boolean;
  onDataUpdate: (data: SummaryData | null, showData: boolean) => void;
}

export interface SummaryValidationResult {
  isValid: boolean;
  error?: string;
} 