'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCartelaSocket } from '@/hooks/useCartelaSocket';
import Header from '@/components/layout/Header';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { CartelaList } from '@/components/dashboard/CartelaList';
import { BetslipArea } from '@/components/dashboard/BetslipArea';
import { useToast } from '@/contexts/ToastContext';
import { apiClient } from '@/utils/api';
import { EnhancedAutoDraw } from '@/components/dashboard/EnhancedAutoDraw';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [selectedCartelas, setSelectedCartelas] = useState<number[]>([]);
  const [selectedCartelaId, setSelectedCartelaId] = useState<number | undefined>();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [placedBets, setPlacedBets] = useState<Map<number, any>>(new Map()); // Track placed bets
  

  const [singleModeEnabled, setSingleModeEnabled] = useState(false); // Track single mode
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);

  // Define fetchPlacedBetCartelas function so it can be called from socket events
  const fetchPlacedBetCartelas = useCallback(async () => {
    if (sessionId) {
      try {
        console.log('🔄 Fetching placed bet cartelas for session:', sessionId);
        const response = await apiClient.getPlacedBetCartelas();
        console.log('📊 API response:', response);
        
        if (response.success && response.data) {
          // Create fresh bets map from server data
          const freshBets = new Map();
          
          response.data.forEach((cartelaId: number) => {
            freshBets.set(cartelaId, {
              cartelaId,
              placedAt: new Date(),
              status: 'active'
            });
          });
          
          setPlacedBets(freshBets);
          console.log(`✅ Fetched ${response.data.length} placed bet cartelas from server:`, Array.from(freshBets.keys()));
        } else {
          console.log('⚠️ No placed bets found or API error:', response);
          setPlacedBets(new Map());
        }
      } catch (error) {
        console.error('❌ Error fetching placed bet cartelas:', error);
        setPlacedBets(new Map());
      }
    }
  }, [sessionId]);

  // Initialize socket connection - ensure user?.id is always defined
  const { socket, isConnected } = useCartelaSocket({
    cashierId: user?.id || '',
    sessionId: sessionId || '',
    onCartelaSelectionSuccess: (data) => {
      // Update selected cartelas from server response
      setSelectedCartelas(data.selectedCartelas);
      showToast(`Cartela ${data.cartelaId} selected successfully`, 'success');
    },
    onCartelaSelectionError: (data) => {
      showToast(data.message, 'error');
    },
    onCartelaDeselectionSuccess: (data) => {
      // Update selected cartelas from server response
      setSelectedCartelas(data.selectedCartelas);
      showToast(`Cartela ${data.cartelaId} deselected successfully`, 'success');
    },
    onTicketCancelled: (data) => {
      console.log('❌ Ticket cancelled event received:', data);
      // Remove the cancelled cartela from placed bets
      setPlacedBets(prev => {
        const newPlacedBets = new Map(prev);
        newPlacedBets.delete(data.cartelaId);
        return newPlacedBets;
      });
      // Remove the cancelled cartela from selected cartelas
      setSelectedCartelas(prev => {
        const newSelectedCartelas = prev.filter(id => id !== data.cartelaId);
        if (newSelectedCartelas.length !== prev.length) {
          console.log(`🧹 Removed cancelled cartela ${data.cartelaId} from selected cartelas`);
        }
        return newSelectedCartelas;
      });
      // Also emit cartela deselection to server to sync the state
      if (socket && sessionId) {
        console.log(`🔄 Emitting deselect_cartela for cancelled cartela ${data.cartelaId}`);
        socket.emit('deselect_cartela', { sessionId, cartelaId: data.cartelaId });
      }
      // Show success message
      showToast(`Ticket ${data.ticketNumber} cancelled successfully`, 'success');
    },
    onGameDataUpdated: (data) => {
      console.log('🔄 Game data updated received:', data);
      // Update game state with real-time data from server
      if (data.gameData) {
        // Update any game-related state here if needed
        console.log('📊 Updated game data:', data.gameData);
      }
    }
  });

  // Define functions after socket hook to maintain consistent hook order
  const handleCartelaSelect = (cartelaId: number) => {
    console.log(`🎯 Dashboard: handleCartelaSelect called for cartela ${cartelaId}`);
    console.log(`🎯 Dashboard: Current state:`, {
      socket: !!socket,
      sessionId,
      isConnected,
      selectedCartelas: selectedCartelas.length,
      placedBets: placedBets.size
    });
    
    if (!socket || !sessionId) {
      console.log(`❌ Dashboard: Cannot select - socket: ${!!socket}, sessionId: ${sessionId}`);
      showToast('Not connected to server', 'error');
      return;
    }
    
    // Check if cartela already has a placed bet
    if (placedBets.has(cartelaId)) {
      console.log(`⚠️ Dashboard: Cartela ${cartelaId} already has a placed bet - cannot select`);
      showToast(`Cartela ${cartelaId} already has a placed bet and cannot be selected`, 'error');
      return;
    }
    
    // Check if cartela is already selected
    if (selectedCartelas.includes(cartelaId)) {
      console.log(`⚠️ Dashboard: Cartela ${cartelaId} is already selected`);
      showToast(`Cartela ${cartelaId} is already selected`, 'info');
      return;
    }
    
    console.log(`🎯 Dashboard: Emitting select_cartela event for cartela ${cartelaId}`);
    // Emit cartela selection to server
    socket.emit('select_cartela', { sessionId, cartelaId });
  };

  const handleCartelaDeselect = (cartelaId: number) => {
    console.log(`❌ Dashboard: handleCartelaDeselect called for cartela ${cartelaId}`);
    
    if (!socket || !sessionId) {
      console.log(`❌ Dashboard: Cannot deselect - socket: ${!!socket}, sessionId: ${sessionId}`);
      showToast('Not connected to server', 'error');
      return;
    }
    
    console.log(`❌ Dashboard: Emitting deselect_cartela event for cartela ${cartelaId}`);
    // Emit cartela deselection to server
    socket.emit('deselect_cartela', { sessionId, cartelaId });
  };

  // Handle bet placement
  const handleBetPlaced = (cartelaIds: number[], betDetails: any) => {
    console.log(`💰 Bet placed for cartelas: ${cartelaIds.join(', ')}`);
    
    // Update placed bets state
    const newPlacedBets = new Map(placedBets);
    cartelaIds.forEach(cartelaId => {
      newPlacedBets.set(cartelaId, {
        ...betDetails,
        cartelaId,
        placedAt: new Date()
      });
    });
    setPlacedBets(newPlacedBets);
    
    // Clear selected cartelas after bet placement to prevent conflicts
    setSelectedCartelas([]);
    setSelectedCartelaId(undefined);
    
    // Show success message
    showToast(`Bet placed successfully for ${cartelaIds.length} cartela(s)!`, 'success');
    
    console.log(`✅ Placed bets updated. Total placed: ${newPlacedBets.size}`);
  };

  // Function to clear cartelas with placed bets
  const clearCartelasWithPlacedBets = () => {
    const cartelasWithBets = Array.from(placedBets.keys());
    const newSelectedCartelas = selectedCartelas.filter(cartelaId => !cartelasWithBets.includes(cartelaId));
    
    if (newSelectedCartelas.length !== selectedCartelas.length) {
      setSelectedCartelas(newSelectedCartelas);
      if (selectedCartelaId && cartelasWithBets.includes(selectedCartelaId)) {
        setSelectedCartelaId(undefined);
      }
      console.log(`🧹 Cleared ${selectedCartelas.length - newSelectedCartelas.length} cartelas with placed bets`);
      return true; // Indicates that clearing was needed
    }
    return false; // No clearing was needed
  };

  // Handle single mode change
  const handleSingleModeChange = async (enabled: boolean) => {
    setSingleModeEnabled(enabled);
    
    // If switching to single mode and multiple cartelas are selected, clear all but first
    if (enabled && selectedCartelas.length > 1) {
      const firstCartela = selectedCartelas[0];
      setSelectedCartelas([firstCartela]);
      showToast('Single mode enabled - keeping only first cartela', 'info');
    }
    
    // Save preference to localStorage
    localStorage.setItem('bingo_single_mode_enabled', enabled.toString());
  };



  // Listen for cartela selections response
  useEffect(() => {
    if (socket) {
      // Listen for real-time cartela selection events
      socket.on('cartela_selected', (data: { cartelaId: number; timestamp: Date }) => {
        console.log('🎯 Cartela selected event received:', data);
        setSelectedCartelas(prev => {
          if (!prev.includes(data.cartelaId)) {
            const newSelections = [...prev, data.cartelaId];
            console.log('🎯 Updated selected cartelas:', newSelections);
            return newSelections;
          }
          return prev;
        });
      });

      socket.on('cartela_deselected', (data: { cartelaId: number; timestamp: Date }) => {
        console.log('❌ Cartela deselected event received:', data);
        setSelectedCartelas(prev => {
          const newSelections = prev.filter(id => id !== data.cartelaId);
          console.log('❌ Updated selected cartelas:', newSelections);
          return newSelections;
        });
      });

      // Listen for cartela selection errors
      socket.on('cartela_selection_error', (data: { message: string; cartelaId: number; gameStatus: string }) => {
        console.log('❌ Cartela selection error:', data);
        showToast(data.message, 'error');
      });

      // Listen for successful cartela selections
      socket.on('cartela_selection_success', (data: { cartelaId: number; selectedCartelas: number[] }) => {
        console.log('✅ Cartela selection success:', data);
        setSelectedCartelas(data.selectedCartelas);
        showToast(`Cartela ${data.cartelaId} selected successfully`, 'success');
      });

      // Listen for successful cartela deselections
      socket.on('cartela_deselection_success', (data: { cartelaId: number; selectedCartelas: number[] }) => {
        console.log('✅ Cartela deselection success:', data);
        setSelectedCartelas(data.selectedCartelas);
        showToast(`Cartela ${data.cartelaId} deselected successfully`, 'success');
      });

             // Listen for comprehensive game reset to clear selected cartelas
       socket.on('game_comprehensive_reset', (data: any) => {
         console.log('🧹 Comprehensive game reset received on dashboard:', data.message);
         setSelectedCartelas([]);
         setSelectedCartelaId(undefined);
         // ❌ DON'T clear placed bets - they should remain for reporting/history
         console.log('🧹 Dashboard cartela states cleared for new game (bets preserved)');
       });

             // Listen for bet placement events
       socket.on('bet_placed', (data: { cartelaIds: number[]; ticketNumbers: string[]; stake: number }) => {
         console.log('💰 Bet placed event received:', data);
         const newPlacedBets = new Map(placedBets);
         data.cartelaIds.forEach(cartelaId => {
           newPlacedBets.set(cartelaId, {
             cartelaId,
             placedAt: new Date(),
             status: 'active',
             ticketNumber: data.ticketNumbers[data.cartelaIds.indexOf(cartelaId)],
             stake: data.stake
           });
         });
         setPlacedBets(newPlacedBets);
         console.log(`💰 Updated placed bets state: ${newPlacedBets.size} total`);
       });

       // Listen for game start events to fetch placed bet cartelas
       socket.on('game_started', (data: any) => {
         console.log('🎮 Game started event received:', data);
         // Fetch placed bet cartelas when game starts
         setTimeout(() => {
           fetchPlacedBetCartelas();
         }, 500); // Small delay to ensure game data is fully updated
       });



                   // Listen for real-time game data updates
      socket.on('game_data_updated', (data: any) => {
        console.log('🔄 Dashboard: game_data_updated received:', data);
        // Update current game ID if provided
        if (data?.id || data?.gameId) {
          const newGameId = data.id || data.gameId;
          console.log(`✅ Dashboard: Game ID updated from game_data_updated: ${newGameId}`);
          setCurrentGameId(newGameId.toString());
        }
        

      });
       
       // CRITICAL: Listen for game_data_sync events (real-time sync from server)
       socket.on('game_data_sync', (data: any) => {
         console.log('🔄 Dashboard: game_data_sync received:', data);
         // Update current game ID if provided
         if (data?.gameId) {
           console.log(`✅ Dashboard: Game ID updated from game_data_sync: ${data.gameId}`);
           setCurrentGameId(data.gameId.toString());
         }
       });
       
       // CRITICAL: Listen for game_session_info events
       socket.on('game_session_info', (data: any) => {
         console.log('🎮 Dashboard: game_session_info received:', data);
         // Update current game ID if provided
         if (data?.gameId) {
           console.log(`✅ Dashboard: Game ID updated from game_session_info: ${data.gameId}`);
           setCurrentGameId(data.gameId.toString());
         }
       });
      
      // Listen for game data refresh events
      socket.on('game_data_refresh', (data: any) => {
        console.log('🔄 Game data refresh received:', data);
        // Trigger a normal data update instead of page reload
        // The existing game_data_updated listener will handle this
      });

             // NEW: Listen for cashier refresh required events
       socket.on('cashier:refresh_required', (data: any) => {
         console.log('🔄 Dashboard: Refresh required event received:', data);
         console.log(`🔄 Reason: ${data.reason}`);
         // Update the current game ID if provided
         if (data.gameId) {
           setCurrentGameId(data.gameId);
         }
         // Force page refresh for new game
         setTimeout(() => {
           window.location.reload();
         }, 1000);
       });

      // NEW: Listen for game ended events
      socket.on('game:ended', (data: any) => {
        console.log('🎮 Dashboard: Game ended event received:', data);
        // Show notification that previous game ended
        // The UI will be updated when we receive the new game ready event
      });

             // NEW: Listen for new game ready events
       socket.on('game:new_ready', (data: any) => {
         console.log('🎮 Dashboard: New game ready event received:', data);
         // Update the game state with new game information
         // This includes the new game ID and cleared game data
         if (data.gameId) {
           setCurrentGameId(data.gameId);
           console.log(`✅ New game ready with ID: ${data.gameId}`);
           // Force page refresh for new game
           setTimeout(() => {
             window.location.reload();
           }, 1000);
         }
       });

             // NEW: Listen for game ID updated events
       socket.on('game:game_id_updated', (data: any) => {
         console.log('🎮 Dashboard: Game ID updated event received:', data);
         console.log(`✅ New game ID: ${data.newGameId}`);
         // Update the current game ID state
         setCurrentGameId(data.newGameId);
         // Force page refresh to show new game
         setTimeout(() => {
           window.location.reload();
         }, 1000);
       });

                     return () => {
          // Clean up all event listeners
          socket.off('cartela_selected');
          socket.off('cartela_deselected');
          socket.off('cartela_selection_error');
          socket.off('cartela_selection_success');
          socket.off('cartela_deselection_success');
          socket.off('game_comprehensive_reset');
          socket.off('bet_placed');
          socket.off('game_started');
          socket.off('game_data_updated');
          socket.off('game_data_sync');
          socket.off('game_session_info');
          socket.off('game:ended');
          socket.off('game:new_ready');
          socket.off('game:game_id_updated');
          socket.off('cashier:refresh_required');
        };
    }
  }, [socket, placedBets, showToast, fetchPlacedBetCartelas]);





  // Effect to automatically clear cartelas with placed bets
  useEffect(() => {
    if (placedBets.size > 0 && selectedCartelas.length > 0) {
      clearCartelasWithPlacedBets();
    }
  }, [selectedCartelas]); // Remove placedBets and clearCartelasWithPlacedBets to prevent infinite loops

  // Fetch placed bet cartelas when sessionId is available
  useEffect(() => {
    if (sessionId) {
      console.log('🎯 Session ID available, fetching placed bets...');
      fetchPlacedBetCartelas();
    }
  }, [sessionId, fetchPlacedBetCartelas]);

  // Also fetch placed bets when currentGameId changes (game starts/ends)
  useEffect(() => {
    if (sessionId && currentGameId) {
      console.log('🎮 Game ID changed, fetching placed bets...');
      fetchPlacedBetCartelas();
    }
  }, [sessionId, currentGameId, fetchPlacedBetCartelas]);



  // Get session ID from user data (from login response) or URL params
  useEffect(() => {
    console.log('🔍 Dashboard: User data received:', user);
    console.log('🔍 Dashboard: User sessionId:', user?.sessionId);
    console.log('🔍 Dashboard: Full user object:', JSON.stringify(user, null, 2));
    
    // First try to get from URL params (for display connection)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const displaySessionId = urlParams.get('sessionId') || urlParams.get('s');
      
      if (displaySessionId) {
        setSessionId(displaySessionId);
        console.log('🔍 Using session ID from URL params:', displaySessionId);
      } else if (user?.sessionId) {
        setSessionId(user.sessionId);
        console.log('🔍 Using session ID from user data:', user.sessionId);
      } else {
        console.log('⚠️ No session ID found in user data or URL params');
        console.log('⚠️ User object keys:', user ? Object.keys(user) : 'No user object');
      }
    } else if (user?.sessionId) {
      setSessionId(user.sessionId);
      console.log('🔍 Using session ID from user data:', user.sessionId);
    }
  }, [user]);

  // Load single mode preference from localStorage on mount
  useEffect(() => {
    const savedSingleMode = localStorage.getItem('bingo_single_mode_enabled');
    if (savedSingleMode) {
      setSingleModeEnabled(savedSingleMode === 'true');
    }
  }, []);

  // Initialize current game ID from user data
  useEffect(() => {
    const fetchCurrentGame = async () => {
      if (sessionId) {
        try {
          const response = await apiClient.getCurrentGame();
          if (response.success && response.data?.gameId) {
            setCurrentGameId(response.data.gameId.toString());
            console.log(`🎮 Initialized current game ID: ${response.data.gameId}`);
          }
        } catch (error) {
          console.error('Error fetching current game:', error);
        }
      }
    };

    fetchCurrentGame();
  }, [sessionId]);

  // Check authentication and redirect if needed
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  // Early returns after all hooks are called
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" text="Loading..." />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Fixed Header */}
      <div className="flex-shrink-0 z-50">
        <Header 
          userName={user?.username} 
          userRole={user?.role} 
        />
 
      </div>
      
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side - Cartela List */}
        <div className="w-3/4 p-4">
          {/* Cartela Status Summary */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-100 border-2 border-green-300 rounded-full"></div>
                <span className="text-gray-600">Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Selected ({selectedCartelas.length})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-100 border-2 border-red-300 rounded-full"></div>
                <span className="text-gray-600">With Bets ({placedBets.size})</span>
              </div>
            </div>
          </div>
          
          <CartelaList 
            cashierId={user?.id}
            onCartelaSelect={handleCartelaSelect}
            onCartelaDeselect={handleCartelaDeselect}
            selectedCartelaId={selectedCartelaId}
            selectedCartelas={selectedCartelas}
            placedBets={placedBets}
            singleModeEnabled={singleModeEnabled}
          />

        </div>
        
        {/* Right Side - Betslip */}
        <div className="w-1/4 p-4">
          <BetslipArea 
            selectedCartelaId={selectedCartelaId}
            selectedCartelas={selectedCartelas}
            sessionId={sessionId}
            socket={socket}
            onCartelaClear={() => setSelectedCartelas([])}
            onCartelaSelect={handleCartelaSelect}
            onCartelaDeselect={handleCartelaDeselect}
            onBetPlaced={handleBetPlaced}
            onSingleModeChange={handleSingleModeChange}
            placedBets={placedBets}
            cashierId={user?.id}
            currentGameId={currentGameId}
          />

          {/* Enhanced Auto Draw Component */}
          <div className="mt-6">
            <EnhancedAutoDraw
              socket={socket}
              sessionId={sessionId}
              cashierId={user?.id}
              gameStatus="waiting" // This will be updated when game starts
              isDisplayConnected={isConnected}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 