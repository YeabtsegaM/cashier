import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseCartelSocketProps {
  cashierId?: string;
  onCartelCreated?: (cartel: any) => void;
  onCartelUpdated?: (cartel: any) => void;
  onCartelDeleted?: (cartelId: string) => void;
  onCartelStatusChanged?: (cartel: any) => void;
}

export function useCartelSocket({
  cashierId,
  onCartelCreated,
  onCartelUpdated,
  onCartelDeleted,
  onCartelStatusChanged
}: UseCartelSocketProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!cashierId) return;

    const token = localStorage.getItem('cashierToken');
    if (!token) return;

    const newSocket = io('https://api-yebingo-com.onrender.com', {
      query: {
        cashierId,
        token,
        type: 'cashier'
      }
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('connect_error', () => {
      setIsConnected(false);
    });

    // Listen for cartel events
    if (onCartelCreated) {
      newSocket.on('cartel:created', ({ cartel, cashierId: eventCashierId }) => {
        if (eventCashierId === cashierId) {
          onCartelCreated(cartel);
        }
      });
    }

    if (onCartelUpdated) {
      newSocket.on('cartel:updated', ({ cartel, cashierId: eventCashierId }) => {
        if (eventCashierId === cashierId) {
          onCartelUpdated(cartel);
        }
      });
    }

    if (onCartelDeleted) {
      newSocket.on('cartel:deleted', ({ cartelId, cashierId: eventCashierId }) => {
        if (eventCashierId === cashierId) {
          onCartelDeleted(cartelId);
        }
      });
    }

    if (onCartelStatusChanged) {
      newSocket.on('cartel:status-changed', ({ cartel, cashierId: eventCashierId }) => {
        if (eventCashierId === cashierId) {
          onCartelStatusChanged(cartel);
        }
      });
    }

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [cashierId]);

  return { socket, isConnected };
} 
