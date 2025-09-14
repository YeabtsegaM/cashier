'use client';

import { useState, useCallback } from 'react';
import { BetslipData } from '../types/betslip';
import { validateBetslipCode } from '../utils/betslipUtils';
import { apiClient } from '../utils/api';

interface UseBetslipStateProps {
  type: 'cancel' | 'redeem';
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

export function useBetslipState({ type, onError, onSuccess }: UseBetslipStateProps) {
  const [betslipCode, setBetslipCode] = useState('');
  const [showData, setShowData] = useState(false);
  const [betslipData, setBetslipData] = useState<BetslipData | null>(null);
  const [loading, setLoading] = useState(false);

  // Keypad handlers
  const handleNumberClick = useCallback((number: string) => {
    // Handle both direct input and keypad clicks
    if (number.length === 13 && /^\d{13}$/.test(number)) {
      // Full 13-digit number (from paste or direct input)
      setBetslipCode(number);
    } else if (number.length === 1 && /^\d$/.test(number)) {
      // Single digit from keypad
      setBetslipCode(prev => {
        const newCode = prev + number;
        return newCode.length <= 13 ? newCode : prev;
      });
    } else if (number.length > 0 && number.length <= 13) {
      // Partial number from direct input (already validated in onChange)
      setBetslipCode(number);
    }
  }, []);

  const handleBackspace = useCallback(() => {
    setBetslipCode(prev => prev.slice(0, -1));
  }, []);

  const handleClear = useCallback(() => {
    setBetslipCode('');
    setShowData(false);
    setBetslipData(null);
  }, []);

  const handleEnter = useCallback(async () => {
    if (!betslipCode.trim()) return;

    const validation = validateBetslipCode(betslipCode);
    if (!validation.isValid) {
      onError(validation.error!);
      return;
    }

    setLoading(true);
    try {
      if (type === 'cancel') {
        // For cancel, use real API for ticket search
        const response = await apiClient.searchTicketByNumber(betslipCode);
        if (response.success && response.data) {
          // Check if ticket can be cancelled before showing table
          if (response.data.gameStatus === 'completed') {
            onError('Already Completed Game');
            return;
          }
          
          if (response.data.gameStatus === 'active') {
            onError('Already Started Game');
            return;
          }
          
          if (response.data.betStatus === 'cancelled') {
            onError('Already Canceled Ticket');
            return;
          }
          
          if (!response.data.canCancel) {
            onError('This ticket cannot be cancelled');
            return;
          }

          // Transform the API response to match our BetslipData interface
          const ticketData: BetslipData = {
            code: response.data.ticketNumber,
            amount: response.data.stake,
            status: response.data.betStatus,
            date: new Date(response.data.placedAt).toLocaleString(),
            // Additional data for cancellation
            betId: response.data.betId,
            cartelaId: response.data.cartelaId,
            gameId: response.data.gameId,
            gameStatus: response.data.gameStatus,
            canCancel: response.data.canCancel,
            cartelaPattern: response.data.cartelaPattern || []
          };
          setBetslipData(ticketData);
          setShowData(true);
          onSuccess('Ticket found and can be cancelled');
        } else {
          onError(response.error || 'No ticket found with this code');
        }
      } else {
        // For redeem, use real API for ticket search
        const response = await apiClient.searchTicketByNumber(betslipCode);
        if (response.success && response.data) {
          // Check if ticket can be redeemed before showing table
          if (response.data.gameStatus !== 'completed') {
            onError('Only completed games can be redeemed');
            return;
          }
          
          if (response.data.betStatus === 'redeemed') {
            onError('Already Redeemed');
            return;
          }
          
          // Show ALL tickets from completed games, including losing ones
          // This allows players to see their ticket status even if they lost
          
          // Transform the API response to match our BetslipData interface
          const ticketData: BetslipData = {
            code: response.data.ticketNumber,
            amount: response.data.stake,
            status: response.data.betStatus,
            date: new Date(response.data.placedAt).toLocaleString(),
            // Additional data for redemption
            betId: response.data.betId,
            cartelaId: response.data.cartelaId,
            gameId: response.data.gameId,
            gameStatus: response.data.gameStatus,
            canRedeem: response.data.canRedeem || false,
            redemptionStatus: response.data.redemptionStatus || 'available',
            prizeAmount: response.data.prizeAmount || 0,
            winningNumbers: response.data.winningNumbers || [],
            cartelaPattern: response.data.cartelaPattern || []
          };
          
          // Debug logging
          console.log('🔍 API Response:', response.data);
          console.log('🔍 Transformed Data:', ticketData);
          console.log('🔍 Prize Amount:', ticketData.prizeAmount);
          console.log('🔍 Game Status:', ticketData.gameStatus);
          console.log('🔍 Bet Status:', ticketData.status);
          console.log('🔍 Can Redeem:', ticketData.canRedeem);

          setBetslipData(ticketData);
          setShowData(true);
          
          // Show appropriate success message based on ticket status
          if (response.data.betStatus === 'lost') {
            onSuccess('Ticket found - Game completed (Ticket lost)');
          } else if (response.data.redemptionStatus === 'already_redeemed') {
            onSuccess('Ticket found - Game already redeemed');
          } else if (response.data.canRedeem) {
            onSuccess('Ticket found - Winner! Can be redeemed');
          } else {
            onSuccess('Ticket found - Game completed');
          }
        } else {
          onError(response.error || 'No ticket found with this code');
        }
      }
    } catch (error: any) {
      onError(error.message || 'Failed to search ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [betslipCode, type, onError, onSuccess]);

  // Action handlers
  const handleAction = useCallback(async () => {
    if (!betslipData) return;
    
    if (type === 'cancel') {
      try {
        setLoading(true);
        const response = await apiClient.cancelTicket(betslipData.code);
        if (response.success) {
          onSuccess(`Ticket ${betslipData.code} cancelled successfully`);
          // Clear the form after successful cancellation
          setBetslipCode('');
          setShowData(false);
          setBetslipData(null);
        } else {
          onError(response.error || 'Failed to cancel ticket');
        }
      } catch (error: any) {
        onError(error.message || 'Failed to cancel ticket');
      } finally {
        setLoading(false);
      }
    } else {
      // For redeem, call the redeem API
      try {
        // All validation already done before showing table
        setLoading(true);
        const response = await apiClient.redeemTicket(betslipData.code);
        if (response.success) {
          if (response.data.isWinner) {
            onSuccess(`🎉 Congratulations! Ticket ${betslipData.code} won Br. ${response.data.prizeAmount.toFixed(2)}!`);
          } else {
            onSuccess(`Ticket ${betslipData.code} redeemed successfully. Game already won by another ticket.`);
          }
          // Clear the form after successful redemption
          setBetslipCode('');
          setShowData(false);
          setBetslipData(null);
        } else {
          onError(response.error || 'Failed to redeem ticket');
        }
      } catch (error: any) {
        onError(error.message || 'Failed to redeem ticket');
      } finally {
        setLoading(false);
      }
    }
  }, [betslipData, type, onSuccess, onError, setBetslipCode]);

  return {
    // State
    betslipCode,
    showData,
    betslipData,
    loading,
    
    // Actions
    setBetslipCode,
    handleNumberClick,
    handleBackspace,
    handleClear,
    handleEnter,
    handleAction
  };
} 