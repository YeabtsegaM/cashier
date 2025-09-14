import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseCartelaSocketProps {
  cashierId?: string;
  sessionId?: string | null;
  onCartelaCreated?: (cartela: any) => void;
  onCartelaUpdated?: (cartela: any) => void;
  onCartelaDeleted?: (cartelaId: string) => void;
  onCartelaStatusChanged?: (cartela: any) => void;
  onDisplayConnectionChanged?: (isConnected: boolean) => void;
  onCartelaSelectionSuccess?: (data: { cartelaId: number; selectedCartelas: number[] }) => void;
  onCartelaSelectionError?: (data: { message: string; cartelaId: number }) => void;
  onCartelaDeselectionSuccess?: (data: { cartelaId: number; selectedCartelas: number[] }) => void;
  onCartelasClosed?: (data: any) => void;
  onGameDataUpdated?: (gameData: any) => void;
  onTicketCancelled?: (data: { ticketNumber: string; cartelaId: number; gameId: string; sessionId: string; timestamp: Date }) => void;
}

export function useCartelaSocket({
  cashierId,
  sessionId,
  onCartelaCreated,
  onCartelaUpdated,
  onCartelaDeleted,
  onCartelaStatusChanged,
  onDisplayConnectionChanged,
  onCartelaSelectionSuccess,
  onCartelaSelectionError,
  onCartelaDeselectionSuccess,
  onCartelasClosed,
  onGameDataUpdated,
  onTicketCancelled
}: UseCartelaSocketProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!cashierId) return;

    const token = localStorage.getItem('cashierToken');
    if (!token) return;

    console.log('🔌 useCartelaSocket: Establishing socket connection for:', { cashierId, sessionId });

    const newSocket = io('http://localhost:5000', {
      query: {
        cashierId,
        token,
        type: 'cashier',
        s: sessionId // Add session ID for display connection
      }
    });

    newSocket.on('connect', () => {
      console.log('🔌 useCartelaSocket: Socket connected successfully');
      console.log('🔌 useCartelaSocket: Socket ID:', newSocket.id);
      console.log('🔌 useCartelaSocket: Cashier ID:', cashierId);
      console.log('🔌 useCartelaSocket: Session ID:', sessionId);
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 useCartelaSocket: Socket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.log('🔌 useCartelaSocket: Socket connection error:', error);
      setIsConnected(false);
    });

    newSocket.on('cashier:unauthorized', () => {
      setIsConnected(false);
    });

    // Listen for cartela events
    if (onCartelaCreated) {
      newSocket.on('cartela:created', ({ cartela, cashierId: eventCashierId }) => {
        if (eventCashierId === cashierId) {
          onCartelaCreated(cartela);
        }
      });
    }

    if (onCartelaUpdated) {
      newSocket.on('cartela:updated', ({ cartela, cashierId: eventCashierId }) => {
        if (eventCashierId === cashierId) {
          onCartelaUpdated(cartela);
        }
      });
    }

    if (onCartelaDeleted) {
      newSocket.on('cartela:deleted', ({ cartelaId, cashierId: eventCashierId }) => {
        if (eventCashierId === cashierId) {
          onCartelaDeleted(cartelaId);
        }
      });
    }

    if (onCartelaStatusChanged) {
      newSocket.on('cartela:status-changed', ({ cartela, cashierId: eventCashierId }) => {
        if (eventCashierId === cashierId) {
          onCartelaStatusChanged(cartela);
        }
      });
    }

    // Listen for display connection status
    if (onDisplayConnectionChanged) {
      newSocket.on('display:connection_status', ({ connected }) => {
        onDisplayConnectionChanged(connected);
      });

      // Add new event listeners for better connection status
      newSocket.on('display:waiting_for_cashier', (data: any) => {
        onDisplayConnectionChanged(false);
      });

      newSocket.on('display:waiting_for_game', (data: any) => {
        onDisplayConnectionChanged(false);
      });

      newSocket.on('display:error', (data: any) => {
        onDisplayConnectionChanged(false);
      });
    }

    // Listen for game state changes
    newSocket.on('game_cleared', (data: any) => {
      // Handle when game ends and is cleared
      console.log('Game cleared:', data.message);
      // You can add a callback here to update the UI
    });

    newSocket.on('game_reset', (data: any) => {
      // Handle when game is reset
      console.log('Game reset:', data);
      // You can add a callback here to update the UI
    });







    // CRITICAL: Listen for the same events as display for proper game ID sync
    newSocket.on('game_data_updated', (data) => {
      console.log('🔄 Game data updated received:', data);
      // Update game state with real-time data (same as display)
      if (onGameDataUpdated) {
        onGameDataUpdated(data);
      }
    });

    // CRITICAL: Listen for game status updates (same as display)
    newSocket.on('game_status_updated', (data) => {
      console.log('🎮 Game status updated received:', data);
      // Update game state with status changes (same as display)
      if (onGameDataUpdated) {
        onGameDataUpdated(data);
      }
    });

    // CRITICAL: Listen for comprehensive game reset (same as display)
    newSocket.on('game_comprehensive_reset', (data) => {
      console.log('🧹 Comprehensive game reset received:', data);
      // Update game state with new game ID after reset (same as display)
      if (onGameDataUpdated) {
        onGameDataUpdated(data);
      }
    });

    // CRITICAL: Listen for game ended event (same as display)
    newSocket.on('game_ended', (data) => {
      console.log('🏁 Game ended received:', data);
      // Update game state with new game ID after game ends (same as display)
      if (onGameDataUpdated) {
        onGameDataUpdated(data);
      }
    });

    // CRITICAL: Listen for placed bets updated event (same as display)
    newSocket.on('placed_bets_updated', (data) => {
      console.log('💰 Placed bets updated received:', data);
      // Update game state with placed bets changes (same as display)
      if (onGameDataUpdated) {
        onGameDataUpdated(data);
      }
    });

    // CRITICAL: Listen for close cartelas event (same as display)
    newSocket.on('close_cartelas', (data) => {
      console.log('🚪 Close cartelas received:', data);
      // Update game state when cartelas are closed (same as display)
      if (onGameDataUpdated) {
        onGameDataUpdated(data);
      }
    });

    // CRITICAL: Listen for game start event (same as display)
    newSocket.on('game_start', (data) => {
      console.log('🎮 Game start received:', data);
      // Update game state when game starts (same as display)
      if (onGameDataUpdated) {
        onGameDataUpdated(data);
      }
    });

    // Listen for ticket cancellation events
    newSocket.on('ticket_cancelled', (data) => {
      console.log('❌ Ticket cancelled received:', data);
      // Handle ticket cancellation (remove cartela from selection, update game data)
      if (onTicketCancelled) {
        onTicketCancelled(data);
      }
    });

    newSocket.on('room_joined', (data) => {
      console.log('🎮 Joined game room:', data);
    });

    newSocket.on('user_joined_room', (data) => {
      console.log('🎮 User joined room:', data);
    });

    newSocket.on('display_joined_room', (data) => {
      console.log('📺 Display joined room:', data);
      // Update display connection status when display joins
      if (onDisplayConnectionChanged) {
        onDisplayConnectionChanged(true);
      }
    });

    // Listen for when cashier joins room to check display status
    newSocket.on('room_joined', (data) => {
      console.log('🎮 Joined game room:', data);
      // Request current display connection status
      if (sessionId) {
        newSocket.emit('get_display_status', { sessionId });
      }
    });

    // Listen for display status response
    newSocket.on('display_status_response', ({ connected }) => {
      console.log('📺 Display status response received:', connected);
      if (onDisplayConnectionChanged) {
        onDisplayConnectionChanged(connected);
      }
    });

    // Listen for display connected event
    newSocket.on('display:connected', (data) => {
      console.log('📺 Display connected event received:', data);
      if (onDisplayConnectionChanged) {
        onDisplayConnectionChanged(true);
      }
    });

    newSocket.on('game_status_updated', (data) => {
      console.log('🎮 Game status updated:', data);
    });

    // CRITICAL: Listen for cartela selection events
    if (onCartelaSelectionSuccess) {
      newSocket.on('cartela_selection_success', (data) => {
        console.log('✅ useCartelaSocket: cartela_selection_success received:', data);
        onCartelaSelectionSuccess(data);
      });
    }

    if (onCartelaSelectionError) {
      newSocket.on('cartela_selection_error', (data) => {
        console.log('❌ useCartelaSocket: cartela_selection_error received:', data);
        onCartelaSelectionError(data);
      });
    }

    if (onCartelaDeselectionSuccess) {
      newSocket.on('cartela_deselection_success', (data) => {
        console.log('✅ useCartelaSocket: cartela_deselection_success received:', data);
        onCartelaDeselectionSuccess(data);
      });
    }

    // Listen for real-time cartela selection updates
    newSocket.on('cartela_selected', (data: { cartelaId: number; timestamp: Date }) => {
      console.log('🎯 useCartelaSocket: cartela_selected event received:', data);
      // This event is for real-time updates, not for state management
      // The success events above handle the state updates
    });

    newSocket.on('cartela_deselected', (data: { cartelaId: number; timestamp: Date }) => {
      console.log('❌ useCartelaSocket: cartela_deselected event received:', data);
      // This event is for real-time updates, not for state management
      // The success events above handle the state updates
    });

    // Listen for cartela deselection events
    newSocket.on('cartela_deselection_success', (data: any) => {
      console.log('Cartela deselection success:', data);
      if (onCartelaSelectionSuccess) {
        onCartelaSelectionSuccess(data);
      }
    });

    newSocket.on('cartela_deselection_error', (data: any) => {
      console.error('Cartela deselection error:', data);
      if (onCartelaSelectionError) {
        onCartelaSelectionError(data);
      }
    });

    // Listen for cartela display errors
    newSocket.on('cartela_display_error', (data: any) => {
      console.error('Cartela display error:', data);
      // You can add a callback here to show error messages to the user
    });

    // Listen for game ID updates
    newSocket.on('game_id_updated', (data: any) => {
      console.log('🆔 Game ID update received:', data);
      // You can add a callback here to update the UI with the new game ID
    });

    newSocket.on('close_cartelas', (data: any) => {
      console.log('🚪 Cartelas closed event received:', data);
      if (onCartelasClosed) {
        onCartelasClosed(data);
      }
    });

    // Listen for refresh pages event (when end game is clicked)
    newSocket.on('refresh_pages', (data: any) => {
      console.log('🔄 Refresh pages event received:', data);
      console.log('🔄 Refreshing cashier page for new game');
      // Refresh the page to get fresh state
      window.location.reload();
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [cashierId, sessionId]);

  return { socket, isConnected };
} 