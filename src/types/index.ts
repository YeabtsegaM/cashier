// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    fullName: string;
    role: string;
    sessionId?: string;
    displayUrl?: string;
  };
}

// Game Types
export interface GameState {
  gameId?: string;
  eventId?: string;
  gameStatus: 'waiting' | 'active' | 'paused' | 'finished' | 'completed';
  calledNumbers: number[];
  currentNumber?: number;
  currentColumn?: string;
  cartelas: number;
  selectedCartelas: number[];
  gameHistory: GameHistory[];
  top3Winners: Winner[];
  // Additional properties for game management
  status?: 'waiting' | 'active' | 'paused' | 'finished' | 'completed';
  message?: string;
  nextGameId?: string;
}

export interface GameHistory {
  id: string;
  gameId: string;
  eventId: string;
  status: string;
  startTime: string;
  endTime?: string;
  totalCartelas: number;
  winStack: number;
  calledNumbers: number[];
}

export interface Winner {
  position: number;
  cartelaNumber: number;
  playerName: string;
  prize: number;
}

// Cashier Types
export interface Cashier {
  id: string;
  fullName: string;
  username: string;
  shop: {
    id: string;
    shopName: string;
    location: string;
  };
  isActive: boolean;
  role: string;
  createdAt: string;
}

export interface Shop {
  _id: string;
  shopName: string;
  margin: number;
  status: 'active' | 'inactive';
}

// Cartela Types
export interface Cartela {
  number: number;
  price: number;
  isSelected: boolean;
  isVerified: boolean;
}

export interface VerificationData {
  cartelaId: number;
  ticketNumber: string;
  gameId: string;
  status: string;
  cartelaGrid: number[][];
  matchedNumbers: number[];
  drawnNumbers: number[];
  winningPatternDetails: Array<{
    patternName: string;
    pattern: number[];
    matchedPositions: number[];
  }>;
  gameProgress: number;
  totalCalledNumbers: number;
  isLocked: boolean;
  originalStatus: string;
  canBeLocked?: boolean;
  lockedAt?: Date;
  lockedBy?: string;
  patterns?: any[];
  patternNames?: string[];
  verifiedAt?: Date;
  verifiedBy?: string;
  totalDrawn?: number;
}

// Dashboard Types
export interface DashboardStats {
  totalCartelas: number;
  totalRevenue: number;
  activeGames: number;
  completedGames: number;
}

export interface RecentActivity {
  id: string;
  type: 'cartela_sold' | 'game_started' | 'game_ended' | 'verification';
  description: string;
  timestamp: string;
  amount?: number;
}

// Socket Types
export interface SocketState {
  isConnected: boolean;
  connectionError: string | null;
  isLoading: boolean;
}

// Form Types
export interface LoginFormData {
  username: string;
  password: string;
}

export interface CartelaFormData {
  cartelaNumber: number;
  playerName: string;
  verificationCode: string;
}

// UI Types
export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  isVisible: boolean;
  onClose: () => void;
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  message?: string;
}

// Game Control Types
export interface GameControl {
  canStart: boolean;
  canPause: boolean;
  canResume: boolean;
  canEnd: boolean;
  canReset: boolean;
}

// Settings Types
export interface CashierSettings {
  autoRefresh: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  language: 'AM' | 'OR' | 'TG';
}

export interface GameSearchResult {
  gameId: string;
  status: string;
  gameStartTime?: Date;
  gameEndTime?: Date;
  finalProgress: number;
  finalCalledNumbers: number[];
  finalCurrentNumber: number | null;
  finalCartelas: number;
  finalTotalStack: number;
  finalTotalWinStack: number;
  finalTotalShopMargin: number;
  finalTotalSystemFee: number;
  finalNetPrizePool: number;
  finalDrawHistory: Array<{
    number: number;
    timestamp: Date;
    type?: string;
    drawnBy?: 'manual' | 'auto';
  }>;
  completedAt: Date;
}

export interface GameSearchResponse {
  results: GameSearchResult[];
  total: number;
  activeGames: number;
  completedGames: number;
}

export interface GameSearchParams {
  startDate?: string;
  endDate?: string;
  gameId?: string;
  cashierId?: string;
} 