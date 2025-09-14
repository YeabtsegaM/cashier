'use client';

import React, { useState, useEffect } from 'react';
import { GameTab, BetslipTab} from './tabs';
import { apiClient } from '@/utils/api';
import { useToast } from '@/contexts/ToastContext';  

interface BetslipAreaProps {
  selectedCartelaId?: number;
  selectedCartelas?: number[];
  sessionId?: string | null;
  socket?: any;
  onCartelaClear?: () => void;
  onCartelaSelect?: (cartelaId: number) => void;
  onCartelaDeselect?: (cartelaId: number) => void;
  onBetPlaced?: (cartelaIds: number[], betDetails: any) => void;
  onSingleModeChange?: (enabled: boolean) => void;
  placedBets?: Map<number, any>; // Add placed bets data
  cashierId?: string; // Add cashier ID for bet placement
  currentGameId?: string | null; // Add current game ID for real-time sync
}

export function BetslipArea({
  selectedCartelaId,
  selectedCartelas = [],
  sessionId,
  socket,
  onCartelaClear,
  onCartelaSelect,
  onCartelaDeselect,
  onBetPlaced,
  onSingleModeChange,
  placedBets = new Map(),
  cashierId,
  currentGameId
}: BetslipAreaProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'game' | 'betslip'>('betslip');
  const [gameData, setGameData] = useState<any>(null);
  const [isLoadingGameData, setIsLoadingGameData] = useState(false);
  const [isDisplayConnected, setIsDisplayConnected] = useState(false);
  const [isDrawToggleLoading, setIsDrawToggleLoading] = useState(false);

  // Initialize game data when component mounts
  useEffect(() => {
    if (sessionId) {
      console.log('🔍 BetslipArea: Session ID received, fetching game data...', sessionId);
      // Get real game data from server
      fetchGameData();
    } else {
      console.log('⚠️ BetslipArea: No session ID available yet');
    }
  }, [sessionId]);

  // CRITICAL: Update game data when currentGameId changes from parent
  useEffect(() => {
    if (currentGameId && gameData?.id !== currentGameId) {
      console.log(`🔄 BetslipArea: Game ID updated from parent: ${gameData?.id} → ${currentGameId}`);
      setGameData((prev: any) => ({
        ...prev,
        id: currentGameId,
        gameId: currentGameId
      }));
    }
  }, [currentGameId, gameData?.id]);



  // Fetch real game data from server
  const fetchGameData = async () => {
    if (!sessionId) {
      console.log('⚠️ fetchGameData: No session ID available');
      return;
    }
    
    console.log('🔍 fetchGameData: Fetching game data for session:', sessionId);
    setIsLoadingGameData(true);
    
    try {
      const response = await apiClient.getCurrentGame();
      console.log('📊 fetchGameData: API response:', response);
      
      if (response.success && response.data) {
        setGameData(response.data);
        // Update display connection status based on real data
        setIsDisplayConnected((response.data as any).connectionStatus?.displayConnected || false);
        console.log('✅ fetchGameData: Game data updated successfully:', {
          status: (response.data as any).status,
          displayConnected: (response.data as any).connectionStatus?.displayConnected,
          gameData: (response.data as any).gameData
        });
      } else {
        console.log('⚠️ fetchGameData: API response not successful:', response);
      }
    } catch (error) {
      console.error('❌ fetchGameData: Failed to fetch game data:', error);
    } finally {
      setIsLoadingGameData(false);
    }
  };

  // Data-level refresh function - replaces hard page refresh
  const refreshGameDataCompletely = async () => {
    try {
      console.log('🔄 Starting data-level refresh...');
      
      // Clear all local state
      setGameData(null);
      
      // Fetch fresh game data
      await fetchGameData();
      
      // Emit socket event to refresh display
      if (socket) {
        socket.emit('refresh_game_data', { sessionId });
        console.log('📡 Emitted refresh_game_data event to display');
      }
      
      console.log('✅ Data-level refresh completed successfully');
      
      // Show success message to user (using console for now)
      console.log('✅ Game refreshed successfully!');
      
    } catch (error) {
      console.error('❌ Error during data-level refresh:', error);
      
      // Show error message to user (using console for now)
      console.error('❌ Failed to refresh game data');
    }
  };

  // Listen for real-time game updates via WebSocket
  useEffect(() => {
    if (!sessionId || !socket) return;

    // Set up WebSocket event listeners for real-time updates
    const handleGameDataUpdate = (data: any) => {
      if (data.sessionId === sessionId) {
        console.log('📡 BetslipArea: Real-time game data update received:', data);
        
        // CRITICAL: Update game data with new information, preserving existing data
        setGameData((prev: any) => {
          const updatedData = {
            ...prev,
            ...data,
            // Ensure game ID is properly set
            id: data.id || data.gameId || prev?.id,
            gameId: data.gameId || data.id || prev?.gameId
          };
          
          console.log('✅ BetslipArea: Updated game data:', {
            oldId: prev?.id,
            newId: updatedData.id,
            oldGameId: prev?.gameId,
            newGameId: updatedData.gameId,
            status: updatedData.status
          });
          
          return updatedData;
        });
        
        // Update display connection status if provided
        if (data.connectionStatus?.displayConnected !== undefined) {
          setIsDisplayConnected(data.connectionStatus.displayConnected);
        }
      }
    };

    // Listen for game reset events
    const handleGameReset = (data: any) => {
      if (data.sessionId === sessionId) {
        console.log('🔄 BetslipArea: Game reset event received:', data);
        // Fetch fresh game data after reset
        fetchGameData();
      }
    };

    // Listen for refresh pages events
    const handleRefreshPages = (data: any) => {
      if (data.sessionId === sessionId) {
        console.log('🔄 BetslipArea: Refresh pages event received:', data);
        // Use data-level refresh instead of page reload
        refreshGameDataCompletely();
      }
    };

    // NEW: Listen for new game ready events
    const handleNewGameReady = (data: any) => {
      console.log('🎮 BetslipArea: New game ready event received:', data);
      if (data.gameId) {
        // Update the game data with new game ID
        setGameData((prev: any) => ({
          ...prev,
          id: data.gameId,
          gameId: data.gameId,
          status: 'waiting'
        }));
        console.log(`✅ BetslipArea: Updated to new game ID: ${data.gameId}`);
      }
    };

    // NEW: Listen for game ID updated events
    const handleGameIdUpdated = (data: any) => {
      console.log('🎮 BetslipArea: Game ID updated event received:', data);
      if (data.newGameId) {
        // Update the game data with new game ID
        setGameData((prev: any) => ({
          ...prev,
          id: data.newGameId,
          gameId: data.newGameId,
          status: 'waiting'
        }));
        console.log(`✅ BetslipArea: Game ID updated to: ${data.newGameId}`);
      }
    };

    // NEW: Listen for cashier refresh required events
    const handleCashierRefreshRequired = (data: any) => {
      console.log('🔄 BetslipArea: Cashier refresh required event received:', data);
      if (data.gameId) {
        // Update the game data with new game ID
        setGameData((prev: any) => ({
          ...prev,
          id: data.gameId,
          gameId: data.gameId,
          status: 'waiting'
        }));
        console.log(`✅ BetslipArea: Updated to new game ID: ${data.gameId}`);
      }
    };

    const handleGameStatusUpdate = (data: any) => {
      if (data.sessionId === sessionId) {
        setGameData((prev: any) => ({
          ...prev,
          status: data.status,
          gameData: data.gameData
        }));
      }
    };

    const handleDisplayConnectionStatus = (data: any) => {
      if (data.sessionId === sessionId) {
        console.log('📺 Display connection status update received:', data.connected);
        setIsDisplayConnected(data.connected);
      }
    };

    const handleNumberDrawn = (data: any) => {
      if (data.sessionId === sessionId) {
        // Refresh game data to get updated numbers
        fetchGameData();
      }
    };


    
    const handleDrawRejected = (data: any) => {
      console.error('Draw rejected:', data.reason);
      // Show a toast or notification to the user
    };

    const handleConnectionStatusUpdate = (data: any) => {
      if (data.sessionId === sessionId) {
        console.log('🔄 Connection status update received:', data);
        setIsDisplayConnected(data.displayConnected || false);
      }
    };

    // Add real socket event listeners
    socket.on('game_data_updated', handleGameDataUpdate);
    socket.on('game_status_updated', handleGameStatusUpdate);
    socket.on('display:connection_status', handleDisplayConnectionStatus);
    socket.on('number_drawn', handleNumberDrawn);


    // Add back missing socket event listeners
    socket.on('draw_rejected', handleDrawRejected);
    socket.on('connection_status_update', handleConnectionStatusUpdate);
    socket.on('game_reset', handleGameReset);
    socket.on('refresh_pages', handleRefreshPages);
    
    // NEW: Add listeners for new game events
    socket.on('game:new_ready', handleNewGameReady);
    socket.on('game:game_id_updated', handleGameIdUpdated);
    socket.on('cashier:refresh_required', handleCashierRefreshRequired);

    // Listen for refresh game data events
    socket.on('refresh_game_data', (data: any) => {
      if (data.sessionId === sessionId) {
        console.log('🔄 Refresh game data event received from display');
        refreshGameDataCompletely();
      }
    });
    
    // Listen for display refresh requests
    socket.on('display:refresh_request', (data: any) => {
      if (data.sessionId === sessionId) {
        console.log('📺 Display requested refresh, refreshing game data...');
        refreshGameDataCompletely();
      }
    });
    
    // Listen for comprehensive game reset events
    socket.on('game_comprehensive_reset', (data: any) => {
      if (data.sessionId === sessionId) {
        console.log('🎮 Game comprehensive reset received:', data);
        if (data.newGameId) {
          // Update game data with new game ID
          setGameData((prev: any) => ({
            ...prev,
            id: data.newGameId,
            gameId: data.newGameId,
            status: 'waiting'
          }));
          console.log(`✅ Updated to new game ID: ${data.newGameId}`);
        }
        // Refresh game data completely
        refreshGameDataCompletely();
      }
    });
    
    // CRITICAL: Listen for game_data_sync events (real-time sync from server)
    socket.on('game_data_sync', (data: any) => {
      if (data.sessionId === sessionId) {
        console.log('🔄 BetslipArea: game_data_sync received:', data);
        // Update game data with new game ID
        if (data.gameId) {
          setGameData((prev: any) => ({
            ...prev,
            id: data.gameId,
            gameId: data.gameId,
            status: data.status || prev?.status
          }));
          console.log(`✅ BetslipArea: Updated to new game ID: ${data.gameId}`);
        }
      }
    });
    
    // Listen for game ended events
    socket.on('game_ended', (data: any) => {
      if (data.sessionId === sessionId) {
        console.log('🎮 Game ended event received:', data);
        if (data.gameId) {
          // Update game data with new game ID
          setGameData((prev: any) => ({
            ...prev,
            id: data.gameId,
            gameId: data.gameId,
            status: 'waiting'
          }));
          console.log(`✅ Updated to new game ID: ${data.gameId}`);
        }
        // Refresh game data completely
        refreshGameDataCompletely();
      }
    });
    
    // Listen for game session info updates
    socket.on('game_session_info', (data: any) => {
      if (data.sessionId === sessionId) {
        console.log('🎮 Game session info received:', data);
        if (data.gameId) {
          // Update game data with new game ID
          setGameData((prev: any) => ({
            ...prev,
            id: data.gameId,
            gameId: data.gameId,
            status: data.status || 'waiting'
          }));
          console.log(`✅ Updated to new game ID: ${data.gameId}, status: ${data.status}`);
        }
        // Refresh game data completely
        refreshGameDataCompletely();
      }
    });
    
    // Listen for placed bets updates
    socket.on('placed_bartelas', (data: any) => {
      if (data.sessionId === sessionId) {
        console.log('💰 Placed bets updated:', data);
        // Refresh game data to show updated betting information
        fetchGameData();
      }
    });
    
    // Listen for cartelas closed events
    socket.on('close_cartelas', (data: any) => {
      if (data.sessionId === sessionId) {
        console.log('📋 Cartelas closed event received:', data);
        // Refresh game data to show updated state
        fetchGameData();
      }
    });
    
    // Listen for cartelas cleared events
    socket.on('cartelas_cleared', (data: any) => {
      if (data.sessionId === sessionId) {
        console.log('🧹 Cartelas cleared event received:', data);
        // Refresh game data to show updated state
        fetchGameData();
      }
    });
    
    // Listen for cartelas shown events
    socket.on('show_cartelas', (data: any) => {
      if (data.sessionId === sessionId) {
        console.log('📋 Cartelas shown event received:', data);
        // Refresh game data to show updated state
        fetchGameData();
      }
    });
    
    // Listen for cartela selection events
    socket.on('cartela_selected', (data: any) => {
      if (data.sessionId === sessionId) {
        console.log('🎯 Cartela selected event received:', data);
        // Refresh game data to show updated selections
        fetchGameData();
      }
    });
    
    // Listen for cartela deselection events
    socket.on('cartela_deselected', (data: any) => {
      if (data.sessionId === sessionId) {
        console.log('❌ Cartela deselected event received:', data);
        // Refresh game data to show updated selections
        fetchGameData();
      }
    });
    
    // Listen for bets placed events
    socket.on('bets_placed', (data: any) => {
      if (data.sessionId === sessionId) {
        console.log('💰 Bets placed event received:', data);
        // Refresh game data to show updated betting information
        fetchGameData();
      }
    });
    
    // Listen for game start events
    socket.on('game_start', (data: any) => {
      if (data.sessionId === sessionId) {
        console.log('🎮 Game start event received:', data);
        // Refresh game data to show updated game status
        fetchGameData();
      }
    });
    
    // Listen for game start error events
    socket.on('game_start_error', (data: any) => {
      if (data.sessionId === sessionId) {
        console.error('❌ BetslipArea: Game start error received:', data);
        showToast(data.message || 'Failed to start game', 'error');
      }
    });
    
    // Listen for game status updated events
    socket.on('game_status_updated', (data: any) => {
      if (data.sessionId === sessionId) {
        console.log('🎮 Game status updated event received:', data);
        // Refresh game data to show updated game status
        fetchGameData();
      }
    });
    
    // Listen for game data updated events
    socket.on('game_data_updated', (data: any) => {
      if (data.sessionId === sessionId) {
        console.log('🎮 Game data updated event received:', data);
        // Refresh game data to show updated information
        fetchGameData();
      }
    });
    
    // Listen for connection status update events
    socket.on('connection:status_update', (data: any) => {
      if (data.sessionId === sessionId) {
        console.log('🔗 Connection status update event received:', data);
        // Update display connection status
        if (data.display) {
          setIsDisplayConnected(data.display.connected);
        }
        // Refresh game data to show updated information
        fetchGameData();
      }
    });
    
    // Listen for display connection status events
    socket.on('display:connection_status', (data: any) => {
      if (data.sessionId === sessionId) {
        console.log('📺 Display connection status event received:', data);
        // Update display connection status
        setIsDisplayConnected(data.connected);
        
        // CRITICAL FIX: Also update the game data to reflect the new connection status
        if (gameData) {
          setGameData((prev: any) => ({
            ...prev,
            connectionStatus: {
              ...prev.connectionStatus,
              displayConnected: data.connected,
              lastDisplayActivity: data.timestamp || new Date()
            }
          }));
        }
        
        // Refresh game data to show updated information
        fetchGameData();
      }
    });

    // CRITICAL FIX: Listen for game status sync events to keep UI in sync
    socket.on('game:status_sync', (data: any) => {
      if (data.sessionId === sessionId) {
        console.log('🎮 Game status sync event received:', data);
        
        // Update game data with the new status
        if (gameData) {
          setGameData((prev: any) => ({
            ...prev,
            status: data.status || prev.status,
            gameId: data.gameId || prev.gameId,
            timestamp: data.timestamp || new Date()
          }));
        }
        
        // If status changed to 'active', refresh game data to get latest info
        if (data.status === 'active') {
          console.log('🎮 Game is now active, refreshing game data...');
          fetchGameData();
        }
      }
    });

    // CRITICAL FIX: Listen for game refresh required events
    socket.on('game:refresh_required', (data: any) => {
      if (data.sessionId === sessionId) {
        console.log('🔄 Game refresh required event received:', data);
        
        // Automatically refresh game data
        setTimeout(() => {
          console.log('🔄 Auto-refreshing game data due to refresh required event...');
          fetchGameData();
        }, 100); // Small delay to ensure server state is updated
      }
    });
    
    // Handle bet placement success
    socket.on('bet_placed_success', (data: any) => {
      console.log('💰 Bet placed successfully:', data);
      // Refresh game data to show updated totals
      fetchGameData();
    });
    
    // Request current connection status on mount
    socket.emit('get_display_status', { sessionId });
    
    return () => {
      // Cleanup event listeners
      socket.off('game_data_updated', handleGameDataUpdate);
      socket.off('game_status_updated', handleGameStatusUpdate);
      socket.off('display:connection_status', handleDisplayConnectionStatus);
      socket.off('number_drawn', handleNumberDrawn);

      socket.off('draw_rejected', handleDrawRejected);
      socket.off('connection_status_update', handleConnectionStatusUpdate);
      socket.off('game_reset', handleGameReset); // Remove game_reset listener
      socket.off('refresh_pages', handleRefreshPages); // Remove refresh_pages listener
      socket.off('bet_placed_success');
      
      // NEW: Cleanup new game event listeners
      socket.off('game:new_ready', handleNewGameReady);
      socket.off('game:game_id_updated', handleGameIdUpdated);
      socket.off('cashier:refresh_required', handleCashierRefreshRequired);
      
      // Cleanup refresh game data listener
      socket.off('refresh_game_data');
      socket.off('display:refresh_request');
          socket.off('game_comprehensive_reset');
    socket.off('game_ended');
    socket.off('game_session_info');
    socket.off('game_data_sync');
      socket.off('placed_bartelas');
      socket.off('close_cartelas');
      socket.off('cartelas_cleared');
      socket.off('show_cartelas');
      socket.off('cartela_selected');
      socket.off('cartela_deselected');
      socket.off('bets_placed');
      socket.off('game_start');
      socket.off('game_status_updated');
      socket.off('game_data_updated');
      socket.off('connection:status_update');
      socket.off('display:connection_status');
      socket.off('game:status_sync'); // Remove game status sync listener
      socket.off('game:refresh_required'); // Remove game refresh required listener
    };
  }, [sessionId, socket]);

  // Manual refresh function for connection status
  const refreshConnectionStatus = async () => {
    if (!sessionId || !socket) return;
    
    console.log('🔄 Manually refreshing connection status...');
    
    // Request current display status from server
    socket.emit('get_display_status', { sessionId });
    
    // Also fetch fresh game data
    await fetchGameData();
    
    // CRITICAL FIX: Also call the server endpoint for connection status
    try {
      const response = await fetch(`http://localhost:5000/api/display/connection-status/${sessionId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log('📊 Server connection status:', result.data);
          
          // Update local state based on server response
          setIsDisplayConnected(result.data.displayConnected);
          
          // Update game data if there's a mismatch
          if (result.data.displayConnected !== result.data.dbDisplayConnected) {
            console.log('⚠️ Connection status mismatch detected, refreshing game data...');
            await fetchGameData();
          }
        }
      }
    } catch (error) {
      console.error('❌ Failed to check server connection status:', error);
    }
    
    // Show toast notification
    // Note: You'll need to implement showToast if not already available
    console.log('✅ Connection status refresh completed');
  };

  const handleGameStart = async () => {
    if (!sessionId || !socket) {
      console.error('Cannot start game: missing sessionId or socket');
      return;
    }
    
    // Check if socket is connected
    if (!socket.connected) {
      console.error('Cannot start game: socket is not connected');
      return;
    }
    
    // Check if game is in waiting status
    if (gameData?.status !== 'waiting') {
      console.error(`Cannot start game: current status is ${gameData?.status || 'unknown'}, must be 'waiting'`);
      return;
    }
    
    // Check if display is connected
    if (!isDisplayConnected) {
      console.error('Cannot start game: display is not connected');
      return;
    }
    
    // NEW RULE: Check if at least 3 tickets have placed bets before starting the game
    if (!placedBets || placedBets.size < 3) {
      console.error(`Cannot start game: only ${placedBets?.size || 0} tickets with placed bets found, need at least 3`);
      showToast(`Cannot start game: At least 3 tickets must have placed bets (currently ${placedBets?.size || 0})`, 'error');
      return;
    }
    
    console.log('✅ Game start validation passed:', {
      sessionId,
      gameStatus: gameData?.status,
      displayConnected: isDisplayConnected,
      hasSocket: !!socket,
      socketConnected: socket.connected,
      placedBetsCount: placedBets.size
    });
    
    try {
      console.log('🎮 Starting game via socket...');
      
      // Use socket to start game for real-time updates
      socket.emit('start_game', {
        gameData: {
          gameStartTime: new Date()
        }
      });
      
      // Refresh game data after a short delay to get updated status
      setTimeout(() => {
        fetchGameData();
        // Request current display connection status after starting game
        socket.emit('get_display_status', { sessionId });
      }, 500);
      
      console.log('🎮 Game start event emitted successfully');
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  };



  const handleEndGame = async () => {
    if (!sessionId) {
      console.error('Cannot end game: missing sessionId');
      return;
    }
    
    try {
      console.log('🏁 Ending game via API...');
      
      // Use the apiClient method instead of direct fetch
      const result = await apiClient.endGame();
      
      if (result.success) {
        console.log('✅ Game ended successfully');
        console.log('✅ New game ready with ID:', result.data?.nextGameId || 'unknown');
        
        // Refresh both cashier and display pages
        if (socket) {
          // Emit refresh event to display
          socket.emit('refresh_display', { message: 'Game ended - refreshing for new game' });
        }
        
        // Refresh cashier page data using data-level refresh
        setTimeout(() => {
          // Use data-level refresh instead of page reload
          refreshGameDataCompletely();
        }, 1500);
        
      } else {
        console.error('❌ Failed to end game:', result.message || result.error);
      }
    } catch (error) {
      console.error('❌ Error ending game:', error);
    }
  };

  const handleShuffle = async () => {
    if (!sessionId || gameData?.status !== 'active') return;
    
    try {
      // Use the socket event for drawing numbers since it's already implemented
      // The socket will handle the real-time updates
      if (socket) {
        socket.emit('draw_number', { 
          sessionId,
          number: Math.floor(Math.random() * 75) + 1
        });
        // Refresh game data after a short delay to get updated numbers
        setTimeout(() => fetchGameData(), 500);
      }
    } catch (error) {
      console.error('Failed to draw number:', error);
    }
  };

  const handleVerifyToggle = () => {
    // Toggle verification state - implement when verification system is ready
  };









  const renderTabContent = () => {
    switch (activeTab) {
      case 'game':
        return (
          <GameTab
            isDisplayConnected={isDisplayConnected}
            gameData={gameData}
            isLoadingGameData={isLoadingGameData}
            isVerified={false}
            isDrawToggleLoading={isDrawToggleLoading}
            socket={socket}
            onVerifyToggle={handleVerifyToggle}
            onGameStart={handleGameStart}
            onEndGame={handleEndGame}
            onShuffle={handleShuffle}
            sessionId={sessionId || undefined}
            onRefreshConnection={refreshConnectionStatus}
            placedBets={placedBets}
          />
        );
      case 'betslip':
        return (
          <BetslipTab 
            selectedCartelas={selectedCartelas} 
            onCartelaClear={onCartelaClear}
            gameData={gameData}
            isLoadingGameData={isLoadingGameData}
            onBetPlaced={onBetPlaced}
            onSingleModeChange={onSingleModeChange}
            singleModeEnabled={false}
            socket={socket}
            sessionId={sessionId || undefined}
            placedBets={placedBets}
            cashierId={cashierId}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full mt-8 bg-white rounded-lg border border-green-200">

      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('game')}
          className={`flex-1 py-2 px-3 text-sm font-medium transition-colors duration-200 ${
            activeTab === 'game'
              ? 'text-green-700 border-b-2 border-green-500 bg-green-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          Game
        </button>
        <button
          onClick={() => setActiveTab('betslip')}
          className={`flex-1 py-2 px-3 text-sm font-medium transition-colors duration-200 ${
            activeTab === 'betslip'
              ? 'text-green-700 border-b-2 border-green-500 bg-green-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          Betslip
        </button>
      </div>

      {/* Tab Content */}
      <div className="h-full overflow-y-auto">
        {renderTabContent()}
      </div>
    </div>
  );
}