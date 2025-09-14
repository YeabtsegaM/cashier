import { API_CONFIG } from '@/lib/constants';
import type { ApiResponse, LoginResponse, GameState, Cartela, VerificationData, DashboardStats, RecentActivity, GameSearchParams, GameSearchResponse } from '@/types';

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = localStorage.getItem('cashierToken');

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Check for specific error messages from server
        if (data.error) {
          throw new Error(data.error);
        }
        
        // Handle specific status codes with user-friendly messages
        if (response.status === 401) {
          throw new Error('Invalid username or password. Please try again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. You do not have permission for this action.');
        } else if (response.status === 404) {
          throw new Error('Resource not found. Please check your request.');
        } else if (response.status === 423) {
          throw new Error('Account is locked. Please contact the administrator.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(`Request failed: ${response.statusText}`);
        }
      }

      return data;
    } catch (error: any) {
      console.error('API request failed:', error);
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('Server is not available. Please check your connection.');
      }
      
      throw new Error(error.message || 'Network error');
    }
  }

  // Auth endpoints
  async login(username: string, password: string): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/api/cashier-auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.request<void>('/api/cashier-auth/logout', {
      method: 'POST',
    });
  }

  async verifyToken(): Promise<ApiResponse<any>> {
    return this.request<any>('/api/cashier-auth/verify');
  }

  // Dashboard endpoints
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request<DashboardStats>('/api/cashier-dashboard/stats');
  }

  async getRecentActivity(): Promise<ApiResponse<RecentActivity[]>> {
    return this.request<RecentActivity[]>('/api/cashier-dashboard/activity');
  }

  // Game endpoints
  async getCurrentGame(): Promise<ApiResponse<GameState>> {
    return this.request<GameState>('/api/cashier/game/current');
  }

  // Get cashier summary data
  async getCashierSummary(params: {
    fromDate: string;
    toDate: string;
  }): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/cashier-dashboard/summary?fromDate=${params.fromDate}&toDate=${params.toDate}`);
  }

  // Verification endpoints
  async verifyCartela(data: {
    cartelaId: number;
    gameId: string;
  }): Promise<ApiResponse<VerificationData>> {
    return this.request<VerificationData>('/api/verification/verify-cartela', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async lockVerification(data: {
    cartelaId: number;
    gameId: string;
  }): Promise<ApiResponse<VerificationData>> {
    return this.request<VerificationData>('/api/verification/lock-verification', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async startGame(gameData: { eventId: string; selectedCartelas: number[] }): Promise<ApiResponse<GameState>> {
    return this.request<GameState>('/api/cashier/game/start', {
      method: 'POST',
      body: JSON.stringify(gameData),
    });
  }

  async pauseGame(): Promise<ApiResponse<GameState>> {
    return this.request<GameState>('/api/cashier/game/pause', {
      method: 'POST',
    });
  }

  async resumeGame(): Promise<ApiResponse<GameState>> {
    return this.request<GameState>('/api/cashier/game/resume', {
      method: 'POST',
    });
  }

  async endGame(): Promise<ApiResponse<GameState>> {
    return this.request<GameState>('/api/cashier/game/end', {
      method: 'POST',
    });
  }

  async resetGame(): Promise<ApiResponse<GameState>> {
    return this.request<GameState>('/api/cashier/game/reset', {
      method: 'POST',
    });
  }



  // Profile endpoints
  async getProfile(): Promise<ApiResponse<any>> {
    return this.request<any>('/api/cashier/profile');
  }

  async updateProfile(profileData: { fullName?: string; password?: string }): Promise<ApiResponse<any>> {
    return this.request<any>('/api/cashier/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Settings endpoints
  async getSettings(): Promise<ApiResponse<any>> {
    return this.request<any>('/api/cashier/settings');
  }

  async updateSettings(settings: any): Promise<ApiResponse<any>> {
    return this.request<any>('/api/cashier/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Win Pattern endpoints
  async getWinPatterns(cashierId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/win-patterns?cashierId=${cashierId}`);
  }

  async getWinPattern(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/win-patterns/${id}`);
  }

  async createWinPattern(patternData: {
    name: string;
    pattern: boolean[][];
    isActive: boolean;
    cashierId: string;
    shopId?: string;
  }): Promise<ApiResponse<any>> {
    return this.request<any>('/api/win-patterns', {
      method: 'POST',
      body: JSON.stringify(patternData),
    });
  }

  async updateWinPattern(id: string, patternData: {
    name?: string;
    pattern?: boolean[][];
    isActive?: boolean;
  }): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/win-patterns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patternData),
    });
  }

  async deleteWinPattern(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/win-patterns/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleWinPatternStatus(id: string, isActive: boolean): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/win-patterns/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  }

  // Cartela endpoints
  async getCartelas(cashierId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/cartelas?cashierId=${cashierId}`);
  }

  async getCartela(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/cartelas/${id}`);
  }

  async createCartela(cartelaData: {
    cartelaId: number;
    pattern: number[][];
    isActive: boolean;
    cashierId: string;
    shopId?: string;
  }): Promise<ApiResponse<any>> {
    return this.request<any>('/api/cartelas', {
      method: 'POST',
      body: JSON.stringify(cartelaData),
    });
  }

  async updateCartela(id: string, cartelaData: {
    cartelaId?: number;
    pattern?: number[][];
    isActive?: boolean;
  }): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/cartelas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cartelaData),
    });
  }

  async deleteCartela(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/cartelas/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleCartelaStatus(id: string, isActive: boolean): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/cartelas/${id}/toggle-status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  }

  // Bet endpoints
  async placeBet(betData: { cartelaIds: number[]; stake: number }): Promise<ApiResponse<any>> {
    return this.request<any>('/api/bets/place', {
      method: 'POST',
      body: JSON.stringify(betData),
    });
  }

  async getRecentBets(gameId?: string): Promise<ApiResponse<any[]>> {
    const params = gameId ? `?gameId=${gameId}` : '';
    return this.request<any[]>(`/api/bets/recent${params}`);
  }

  async getRecallBets(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/api/bets/recall');
  }

  async getBetByTicketNumber(ticketNumber: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/bets/ticket/${ticketNumber}`);
  }

  async printRecallTicket(ticketNumber: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/bets/print-recall/${ticketNumber}`, {
      method: 'POST'
    });
  }

  async getPlacedBetCartelas(): Promise<ApiResponse<number[]>> {
    return this.request<number[]>('/api/cashier/game/placed-bet-cartelas');
  }

  // Ticket search and cancellation endpoints
  async searchTicketByNumber(ticketNumber: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/bets/search/${ticketNumber}`);
  }

  async cancelTicket(ticketNumber: string, reason?: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/bets/cancel/${ticketNumber}`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Ticket redemption endpoint
  async redeemTicket(ticketNumber: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/bets/redeem/${ticketNumber}`, {
      method: 'POST',
    });
  }

  // Game search endpoint
  async searchGames(params: GameSearchParams): Promise<ApiResponse<GameSearchResponse>> {
    return this.request<GameSearchResponse>('/api/game-results/search', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }
}

export const apiClient = new ApiClient(); 

 