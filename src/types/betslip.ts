export interface BetslipData {
  code: string;
  amount: number;
  status: string;
  date: string;
  gameId?: string;
  // Additional fields for cancellation
  betId?: string;
  cartelaId?: number;
  gameStatus?: string;
  canCancel?: boolean;
  // Additional fields for redemption
  canRedeem?: boolean;
  redemptionStatus?: 'available' | 'already_redeemed';
  prizeAmount?: number;
  win?: number; // Win amount (0 initially, updated to prize amount when redeemed)
  gameData?: {
    netPrizePool?: number;
    totalStack?: number;
  };
  winningNumbers?: number[];
  cartelaPattern?: number[];
}

export interface BetslipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface BetslipKeypadProps {
  betslipCode: string;
  onNumberClick: (number: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onEnter: () => void;
}

export interface BetslipDisplayProps {
  betslipData: BetslipData | null;
  actionButtonText: string;
  onAction: () => void;
}

export interface BetslipValidationResult {
  isValid: boolean;
  error?: string;
} 