'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/utils/api';

interface BetslipTabProps {
  selectedCartelas: number[];
  onCartelaClear?: () => void;
  gameData: any;
  isLoadingGameData: boolean;
  onBetPlaced?: (cartelaIds: number[], betDetails: any) => void;
  onSingleModeChange?: (enabled: boolean) => void;
  singleModeEnabled?: boolean;
  socket?: any; // Add socket for real-time updates
  sessionId?: string | null; // Add sessionId for socket events
  placedBets?: Map<number, any>; // Add placed bets data
  cashierId?: string; // Add cashier ID for bet placement
}

export function BetslipTab({
  selectedCartelas,
  onCartelaClear,
  gameData,
  isLoadingGameData,
  onBetPlaced,
  onSingleModeChange,
  singleModeEnabled = false,
  socket,
  sessionId,
  placedBets = new Map(),
  cashierId
}: BetslipTabProps) {
  // Initialize stake from localStorage or default to 5
  const [stake, setStake] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const savedStake = localStorage.getItem('lastSelectedStake');
      return savedStake ? parseInt(savedStake) : 5;
    }
    return 5;
  });
  
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [betError, setBetError] = useState<string | null>(null);
  const [betSuccess, setBetSuccess] = useState<string | null>(null);

  // Available stake options
  const stakeOptions = [5, 10, 20, 50, 100, 200, 500, 1000];

  // Calculate total stake and potential winnings
  const totalStake = stake * selectedCartelas.length;
  
  // Check if bet can be placed
  const canPlaceBet = selectedCartelas.length > 0 && 
                     gameData?.status === 'waiting' && 
                     !isLoadingGameData &&
                     !!cashierId;

  // Handle stake change and save to localStorage
  const handleStakeChange = (newStake: number) => {
    setStake(newStake);
    setBetError(null);
    setBetSuccess(null);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastSelectedStake', newStake.toString());
    }
  };

  // Handle clearing all cartelas with real-time update
  const handleClearCartelas = () => {
    if (socket && sessionId) {
      // Emit clear event to server for real-time synchronization
      socket.emit('clear_all_cartelas', { sessionId });
    }
    
    // Call the parent callback to update local state
    onCartelaClear?.();
  };

  // Handle bet placement using socket
  const handlePlaceBet = async () => {
    if (!canPlaceBet || !socket || !sessionId || !cashierId) {
      console.log('❌ Cannot place bet:', { 
        canPlaceBet, 
        hasSocket: !!socket, 
        hasSessionId: !!sessionId, 
        hasCashierId: !!cashierId,
        cashierId 
      });
      return;
    }

    setIsPlacingBet(true);
    setBetError(null);
    setBetSuccess(null);

    try {

      // Emit bet placement event via socket
      socket.emit('place_bet', {
        sessionId,
        cartelaIds: selectedCartelas,
        stake: stake,
        cashierId: cashierId || 'unknown'
      });

      // Listen for response
      const handleBetResponse = (data: any) => {
        if (data.cartelaIds) {
          setBetSuccess(``);
          
          // Call the parent callback
          onBetPlaced?.(data.cartelaIds, {
            ...data,
            stake,
            totalStake: data.totalStake,
            placedAt: new Date()
          });

          // Clear selected cartelas
          onCartelaClear?.();
          
          // Reset form but keep the current stake (don't reset to 5)
          // setStake(5); // Removed this line to maintain stake memory
          
          // Remove listener
          socket.off('bet_placed_success', handleBetResponse);
          socket.off('bet_error', handleBetError);
          socket.off('ticket_print_status', handleTicketPrintStatus);
        }
      };

      const handleBetError = (data: any) => {
        setBetError(data.message || 'Failed to place bet');
        socket.off('bet_placed_success', handleBetResponse);
        socket.off('bet_error', handleBetError);
        socket.off('ticket_print_status', handleTicketPrintStatus);
      };

      const handleTicketPrintStatus = (data: any) => {
        console.log('🖨️ Ticket print status:', data);
        if (data.failedPrints > 0) {
          setBetError(`Bet placed successfully, but ${data.failedPrints} ticket(s) failed to print. Please check printer connection.`);
        } else if (data.successfulPrints > 0) {
          setBetSuccess(`Bet placed successfully! ${data.successfulPrints} ticket(s) printed.`);
        }
        socket.off('bet_placed_success', handleBetResponse);
        socket.off('bet_error', handleBetError);
        socket.off('ticket_print_status', handleTicketPrintStatus);
      };

      // Add listeners
      socket.on('bet_placed_success', handleBetResponse);
      socket.on('bet_error', handleBetError);
      socket.on('ticket_print_status', handleTicketPrintStatus);

      // Set timeout for response
      setTimeout(() => {
        socket.off('bet_placed_success', handleBetResponse);
        socket.off('bet_error', handleBetError);
        socket.off('ticket_print_status', handleTicketPrintStatus);
        if (!betSuccess && !betError) {
          setBetError('');
        }
      }, 10000);

    } catch (error: any) {
      console.error('Error placing bet:', error);
      setBetError(error.message || 'Failed to place bet. Please try again.');
    } finally {
      setIsPlacingBet(false);
    }
  };

  // Clear error/success messages after delay
  useEffect(() => {
    if (betError || betSuccess) {
      const timer = setTimeout(() => {
        setBetError(null);
        setBetSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [betError, betSuccess]);

  return (
    <div className="p-4 space-y-4">
      {/* Selected Cartelas */}
      <div className="bg-gray-50 rounded-lg py-3 px-0">
        <h5 className="font-medium text-gray-500 text-sm mb-2">Selected Cartelas ({selectedCartelas.length})</h5>
        {selectedCartelas.length > 0 ? (
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {selectedCartelas.map((cartelaId) => (
              <span
                key={cartelaId}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
              >
                {cartelaId}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-400 text-sm font-medium">No cartelas selected</p>
            <p className="text-gray-300 text-xs mt-1">Select cartelas to place bets</p>
          </div>
        )}
      </div>

      {/* Cashier ID Validation */}
      {!cashierId && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-red-700 text-sm font-medium">
              Cashier ID not available. Please refresh the page or contact support.
            </p>
          </div>
        </div>
      )}

      {/* Warning for cartelas with placed bets */}
      {selectedCartelas.some(cartelaId => placedBets.has(cartelaId)) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-red-700 text-sm font-medium">
              Cannot place bets on cartelas that already have bets: {
                selectedCartelas.filter(cartelaId => placedBets.has(cartelaId)).join(', ')
              }
            </p>
          </div>
          <p className="text-red-600 text-xs mt-1">
            These cartelas will be automatically cleared from your selection.
          </p>
        </div>
      )}

      {/* Stake Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-500 text-sm">Stake</h4>
        </div>
        
        {/* Manual Stack Input */}
        <div className="flex items-center space-x-2 text-sm">
          <button
            onClick={() => handleStakeChange(Math.max(5, stake - 5))}
            className="w-10 h-10 text-sm rounded-lg transition-colors flex items-center justify-center font-bold bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            -
          </button>
          
          <input
            type="number"
            value={stake}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 5;
              handleStakeChange(Math.max(5, Math.min(1000, value)));
            }}
            className="flex-1 h-10 px-3 border rounded-lg text-center font-medium focus:outline-none focus:ring-2 focus:border-transparent text-gray-700 border-gray-300 focus:ring-green-500"
            min="5"
            max="1000"
            step="5"
          />
          
          <button
            onClick={() => handleStakeChange(Math.min(1000, stake + 5))}
            className="w-10 h-10 rounded-lg transition-colors flex items-center justify-center font-bold bg-gray-500 hover:bg-gray-200"
          >
            +
          </button>
        </div>
        
        {/* Preset Stake Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {stakeOptions.map((stakeOption) => (
            <button
              key={stakeOption}
              onClick={() => handleStakeChange(stakeOption)}
              className={`p-2 text-sm font-medium rounded-lg border transition-colors ${
                stake === stakeOption
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Br. {stakeOption}
            </button>
          ))}
        </div>
      </div>

      {/* Bet Summary */}
      {selectedCartelas.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-3 space-y-2">
          <h4 className="font-medium text-blue-800">Bet Summary</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Cartelas:</span>
              <span className="font-medium text-blue-600">{selectedCartelas.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Stake per cartela:</span>
              <span className="font-medium text-blue-600">Br. {stake}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total stake:</span>
              <span className="font-medium text-blue-600">Br. {totalStake}</span>
            </div>
          </div>
        </div>
      )}

      {/* Error/Success Messages */}
      {betError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 text-sm">{betError}</p>
        </div>
      )}

      {betSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-green-700 text-sm">{betSuccess}</p>
        </div>
      )}

      {/* Action Buttons - On One Line */}
      <div className="flex space-x-2">
        {selectedCartelas.length > 0 && (
          <button
            onClick={handleClearCartelas}
            className="px-4 py-3 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors whitespace-nowrap"
          >
            Clear
          </button>
        )}
        
        <button
          onClick={handlePlaceBet}
          disabled={!canPlaceBet || isPlacingBet}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
            canPlaceBet
              ? 'bg-green-500 text-white hover:bg-green-600 disabled:bg-green-300'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isPlacingBet ? 'Placing Bet...' : 'Place Bet'}
        </button>
      </div>
    </div>
  );
}