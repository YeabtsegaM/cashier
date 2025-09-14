'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '../../ui/Toast';
import { SOCKET_EVENTS } from '../../../lib/constants';
import { EnhancedAutoDraw } from '../EnhancedAutoDraw';
import { useAuth } from '../../../hooks/useAuth';
import { apiClient } from '../../../utils/api'; // Fixed import path for apiClient

interface GameTabProps {
  isDisplayConnected: boolean;
  gameData: any;
  isLoadingGameData: boolean;
  isVerified: boolean;
  isDrawToggleLoading: boolean;
  socket?: any; // Add socket for connection status
  onVerifyToggle: () => void;
  onGameStart: () => void;
  onEndGame: () => void;
  onShuffle: () => void;
  sessionId?: string; // Add sessionId for verification
  onRefreshConnection?: () => void; // Add refresh connection callback
  placedBets?: Map<number, any>; // Add placed bets data to control Start button
  cashierId?: string; // Add cashierId for auto draw
}

export function GameTab({
  isDisplayConnected,
  gameData,
  isLoadingGameData,
  isVerified,
  isDrawToggleLoading,
  socket,
  onVerifyToggle,
  onGameStart,
  onEndGame,
  onShuffle,
  sessionId,
  onRefreshConnection,
  placedBets = new Map(),
  cashierId,
}: GameTabProps) {
  // Toast system
  const { showToast, ToastContainer } = useToast();
  
  // Get cashierId from auth if not provided
  const { user } = useAuth();
  const effectiveCashierId = cashierId || user?.id;
  
  // Verification state
  const [verificationInput, setVerificationInput] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isLocking, setIsLocking] = useState(false);




  // Handle verification
  const handleVerification = async () => {
    if (!verificationInput.trim() || !sessionId) {
      // Show toast instead of alert
      showToast('Please enter a cartela ID and ensure session is active', 'error');
      return;
    }

    // Validate cartela ID is a valid number
    const cartelaId = parseInt(verificationInput);
    if (isNaN(cartelaId) || cartelaId <= 0) {
      showToast('Please enter a valid cartela ID (positive number)', 'error');
      return;
    }

    // Check if we have valid game data
    if (!gameData?.id) {
      showToast('No active game found. Please start a game first.', 'error');
      return;
    }

    setIsVerifying(true);

    try {
      console.log('🔍 Verifying cartela:', cartelaId,
        'for game:', gameData.id,
        'session:', sessionId,
        'cashier:', effectiveCashierId);

      const response = await apiClient.verifyCartela({
        cartelaId,
        gameId: gameData.id
      });

      if (response.success) {
        console.log('✅ Verification successful:', response.data);
        
        // Check if verification is locked
        if (response.data?.status === 'locked') {
          showToast(`Cartela ${cartelaId} verification is locked and cannot be re-verified!`, 'warning');
          setVerificationInput(''); // Clear input
        } else {
          showToast(`Cartela ${cartelaId} verified successfully!`, 'success');
          setIsVerificationOpen(true);
          setVerificationInput(''); // Clear input after successful verification
          
          // Emit verification event to display
          if (socket && sessionId) {
            socket.emit('cartela_verified', {
              cartelaId,
              gameId: gameData.id,
              sessionId,
              cashierId: effectiveCashierId
            });
          }
        }
      } else {
        console.error('❌ Verification failed:', response.message);
        showToast(`Verification failed: ${response.message}`, 'error');
      }
    } catch (error) {
      console.error('❌ Verification error:', error);
      showToast('Verification failed. Please try again.', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle manual verification locking
  const handleLockVerification = async () => {
    if (!verificationInput.trim() || !sessionId) {
      showToast('Please enter a cartela ID and ensure session is active', 'error');
      return;
    }

    const cartelaId = parseInt(verificationInput);
    if (isNaN(cartelaId) || cartelaId <= 0) {
      showToast('Please enter a valid cartela ID (positive number)', 'error');
      return;
    }

    if (!gameData?.id) {
      showToast('No active game found. Please start a game first.', 'error');
      return;
    }

    setIsLocking(true);

    try {
      console.log('🔒 Locking verification for cartela:', cartelaId,
        'for game:', gameData.id,
        'session:', sessionId,
        'cashier:', effectiveCashierId);

      const response = await apiClient.lockVerification({
        cartelaId,
        gameId: gameData.id
      });

      if (response.success) {
        console.log('✅ Verification locked successfully:', response.data);
        showToast(`Cartela ${cartelaId} verification locked!`, 'success');
        setVerificationInput(''); // Clear input after successful locking
      } else {
        console.error('❌ Verification locking failed:', response.message);
        showToast(`Locking failed: ${response.message}`, 'error');
      }
    } catch (error) {
      console.error('❌ Verification locking error:', error);
      showToast('Verification locking failed. Please try again.', 'error');
    } finally {
      setIsLocking(false);
    }
  };

  // Listen for verification modal open/close events to toggle Close button state
  useEffect(() => {
    if (!socket) return;

    const handleVerified = () => {
      setIsVerificationOpen(true);
    };

    const handleCloseModal = () => {
      setIsVerificationOpen(false);
    };

    socket.on('cartela_verified', handleVerified);
    socket.on('close-verification-modal', handleCloseModal);

    return () => {
      socket.off('cartela_verified', handleVerified);
      socket.off('close-verification-modal', handleCloseModal);
    };
  }, [socket]);





  return (
    <div className="p-2">
      <div className="space-y-2">
        <div className="text-xs text-gray-400 font-medium">Game Information</div>
        <div className="space-y-1">
          {/* Connection Status */}
          <div className="flex justify-between items-center p-1.5 bg-gray-50 rounded-md">
            <span className="text-sm text-gray-500">Display:</span>
            <div className="flex items-center space-x-1">
              <div className={`w-1.5 h-1.5 rounded-full ${isDisplayConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`text-sm font-medium ${isDisplayConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isDisplayConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>



          {/* Game ID */}
          <div className="flex justify-between items-center p-1.5 bg-gray-50 rounded-md">
            <span className="text-sm text-gray-500">Game ID:</span>
            <span className="text-sm text-gray-900 font-medium">
              {isLoadingGameData ? '...' : gameData?.id || 'No Game Data'}
            </span>
          </div>

          {/* Status */}
          <div className="flex justify-between items-center p-1.5 bg-gray-50 rounded-md">
            <span className="text-sm text-gray-500">Status:</span>
            <span className={`text-sm font-medium ${
              gameData?.status === 'active' ? 'text-green-600' :
              gameData?.status === 'paused' ? 'text-yellow-600' :
              gameData?.status === 'completed' ? 'text-blue-600' :
              'text-gray-600'
            }`}>
              {isLoadingGameData ? '...' : (gameData?.status || 'waiting')}
            </span>
          </div>
        </div>
      </div>

      {/* Game Controls */}
      <div className="mt-4">
        <div className="text-xs text-gray-400 font-medium">Game Controls</div>
        <div className="mt-3 pt-2 border-t border-gray-200">
          {/* Verification Section */}
          {gameData?.status !== 'completed' && (
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Verification:</span>
              </div>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={verificationInput}
                  onChange={(e) => setVerificationInput(e.target.value)}
                  placeholder="Enter cartela ID"
                  min="1"
                  max="210"
                  className="flex-1 text-gray-900 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                />
                <button
                  onClick={handleVerification}
                  disabled={isVerifying || (!verificationInput.trim() || !sessionId)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors duration-200 border ${
                    isVerifying || (!verificationInput.trim() || !sessionId)
                      ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                  }`}
                >
                  {isVerifying ? 'Verifying...' : 'Verify'}
                </button>
                <button
                  onClick={handleLockVerification}
                  disabled={isLocking || (!verificationInput.trim() || !sessionId)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors duration-200 border ${
                    isLocking || (!verificationInput.trim() || !sessionId)
                      ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  {isLocking ? 'Locking...' : 'Lock'}
                </button>
                <button
                  onClick={() => {
                    if (socket && sessionId) {
                      console.log('🔍 Cashier clicking Close button:', { sessionId, socketConnected: socket.connected });
                      setIsVerificationOpen(false); // Optimistic UI
                      socket.emit(SOCKET_EVENTS.CLOSE_VERIFICATION_MODAL, { sessionId });
                      console.log('📡 Close verification event emitted to server');
                    } else {
                      console.log('❌ Cannot close:', { socket: !!socket, sessionId, socketConnected: socket?.connected });
                    }
                  }}
                  disabled={!socket?.connected || !sessionId || !isVerificationOpen}
                  className={`px-3 py-1 text-sm rounded-md transition-colors duration-200 border ${
                    !socket?.connected || !sessionId || !isVerificationOpen
                      ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                  }`}
                  title="Close verification"
                >
                  Close
                </button>
              </div>
            </div>
          )}

  

          {!socket?.connected && (
            <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-xs text-red-700 font-medium">
                  Socket not connected. Please refresh the page or check your connection.
                </span>
              </div>
            </div>
          )}

          {!isDisplayConnected && socket?.connected && (
            <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-xs text-yellow-700 font-medium">
                    Display not connected. Connect display to start games.
                  </span>
                </div>
                <button
                  onClick={() => {
                    // Emit refresh request to parent component
                    if (socket) {
                      socket.emit('get_display_status', { sessionId });
                    }
                    // Also call parent refresh function if available
                    if (onRefreshConnection) {
                      onRefreshConnection();
                    }
                  }}
                  className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 border border-yellow-300 rounded hover:bg-yellow-200 transition-colors"
                  title="Refresh connection status"
                >
                  🔄
                </button>
              </div>
            </div>
          )}

          {/* NEW RULE: Inform users about the bet requirement */}
          {isDisplayConnected && gameData?.status === 'waiting' && (
            <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                                  <span className="text-xs text-green-700 font-medium">
                    Game ready! Place at least 3 bets to start the game.
                  </span>
              </div>
            </div>
          )}

          {isDisplayConnected && gameData?.status && gameData.status !== 'waiting' && gameData.status !== 'active' && gameData.status !== 'paused' && gameData.status !== 'completed' && (
            <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs text-blue-700 font-medium">
                  Game status: {gameData.status}. Wait for game to be ready.
                </span>
              </div>
            </div>
          )}

          {/* Game Control Buttons */}
          {gameData?.status === 'completed' ? (
            // Show only End Game button when game is completed
            <div className="flex space-x-2">
              <button
                onClick={onEndGame}
                className="flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors duration-200 border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                title="End this game and prepare for new game"
              >
                End Game
              </button>
            </div>
          ) : (
            // Show normal game control buttons for other statuses
            <div className="flex space-x-2">
              
              <button
                onClick={onGameStart}
                disabled={gameData?.status === 'active' || !isDisplayConnected || gameData?.status !== 'waiting' || !socket?.connected || placedBets.size < 3}
                className={`flex-1 py-1 px-2 text-sm rounded-md transition-colors duration-200 border flex items-center justify-center space-x-2 ${
                  gameData?.status === 'active' || !isDisplayConnected || gameData?.status !== 'waiting' || !socket?.connected || placedBets.size < 3
                    ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                  }`}
                title={!socket?.connected ? 'Socket not connected' : !isDisplayConnected ? 'Display must be connected' : gameData?.status !== 'waiting' ? 'Game must be in waiting status' : placedBets.size < 3 ? `Place at least 3 bets to start the game (currently ${placedBets.size})` : 'Start the game'}
              >
                <div className={`w-2 h-2 rounded-full ${socket?.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Start</span>
              </button>

              <button
                onClick={onEndGame}
                disabled={gameData?.status !== 'active' && gameData?.status !== 'paused'}
                className={`flex-1 py-1 px-2 text-sm rounded-md transition-colors duration-200 border ${
                  gameData?.status !== 'active' && gameData?.status !== 'paused'
                    ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                  }`}
                title={gameData?.status !== 'active' && gameData?.status !== 'paused' ? 'Game must be active or paused' : 'End the game'}
              >
                End
              </button>
            </div>
          )}

          {/* Enhanced Auto Draw Component */}
          <div className="mt-6">
            <EnhancedAutoDraw
              socket={socket}
              sessionId={sessionId || null}
              cashierId={effectiveCashierId || null}
              gameStatus={gameData?.status || 'waiting'}
              isDisplayConnected={isDisplayConnected}
            />
          </div>

        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}