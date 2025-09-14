'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface WinPattern {
  id: string;
  name: string;
  pattern: boolean[][];
  isActive: boolean;
  cashierId: string;
  createdAt: string;
  updatedAt: string;
}

interface UseWinPatternSocketProps {
  cashierId?: string;
  onPatternCreated?: (pattern: WinPattern) => void;
  onPatternUpdated?: (pattern: WinPattern) => void;
  onPatternDeleted?: (patternId: string) => void;
  onPatternStatusChanged?: (pattern: WinPattern) => void;
}

export function useWinPatternSocket({
  cashierId,
  onPatternCreated,
  onPatternUpdated,
  onPatternDeleted,
  onPatternStatusChanged
}: UseWinPatternSocketProps) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!cashierId) return;

    // Get token from localStorage
    const token = localStorage.getItem('cashierToken');
    if (!token) return;

    // Connect to socket server
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'https://api-yebingo-com.onrender.com', {
      query: {
        cashierId,
        token,
        type: 'cashier'
      }
    });

    const socket = socketRef.current;

    // Listen for win pattern events
    socket.on('win-pattern:created', (data: { pattern: WinPattern; cashierId: string }) => {
      if (data.cashierId === cashierId) {
        onPatternCreated?.(data.pattern);
      }
    });

    socket.on('win-pattern:updated', (data: { pattern: WinPattern; cashierId: string }) => {
      if (data.cashierId === cashierId) {
        onPatternUpdated?.(data.pattern);
      }
    });

    socket.on('win-pattern:deleted', (data: { patternId: string; cashierId: string }) => {
      if (data.cashierId === cashierId) {
        onPatternDeleted?.(data.patternId);
      }
    });

    socket.on('win-pattern:status-changed', (data: { pattern: WinPattern; cashierId: string }) => {
      if (data.cashierId === cashierId) {
        onPatternStatusChanged?.(data.pattern);
      }
    });

    // Handle connection events
    socket.on('connect', () => {
      console.log('✅ Win pattern socket connected:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Win pattern socket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Win pattern socket connection error:', error);
      setIsConnected(false);
    });

    socket.on('cashier:unauthorized', () => {
      console.error('❌ Win pattern socket unauthorized');
      setIsConnected(false);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [cashierId]);

  return {
    socket: socketRef.current,
    isConnected
  };
} 
