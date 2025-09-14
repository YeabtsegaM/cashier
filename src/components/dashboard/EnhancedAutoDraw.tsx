import React, { useState, useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { useToast } from '@/contexts/ToastContext';

interface AutoDrawConfig {
  enabled: boolean;
  interval: number; // Fixed at 5000ms
}

interface AutoDrawStats {
  isActive: boolean;
  totalDraws: number;
  successfulDraws: number;
  failedDraws: number;
  averageDrawTime: number;
  lastDrawTime?: Date;
  nextDrawTime?: Date;
  performanceScore: number;
  errors: Array<{ timestamp: Date; error: string }>;
}

interface NumberPoolStats {
  totalNumbers: number;
  drawnNumbers: number;
  remainingNumbers: number;
  lastDrawTime?: Date;
  drawCount: number;
  averageDrawTime: number;
}

interface EnhancedAutoDrawProps {
  socket: Socket | null;
  sessionId: string | null;
  cashierId: string | null;
  gameStatus: string;
  isDisplayConnected: boolean;
}

export function EnhancedAutoDraw({
  socket,
  sessionId,
  cashierId,
  gameStatus,
  isDisplayConnected
}: EnhancedAutoDrawProps) {
  const { showToast } = useToast();
  
  // Auto Draw State
  const [isAutoDrawActive, setIsAutoDrawActive] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [autoDrawStats, setAutoDrawStats] = useState<AutoDrawStats | null>(null);
  const [poolStats, setPoolStats] = useState<NumberPoolStats | null>(null);
  const [countdown, setCountdown] = useState<number>(0);

  // Configuration State
  const [config, setConfig] = useState<AutoDrawConfig>({
    enabled: false,
    interval: 5000 // Fixed at 5000ms (5 seconds)
  });

  // UI State
  const [isLoading, setIsLoading] = useState(false);

  // Initialize auto draw when component mounts
  useEffect(() => {
    if (socket && cashierId && sessionId && !isInitialized) {
      console.log('🎮 Initializing auto draw for:', { cashierId, sessionId });
      // Initialize without config to load saved settings from database
      initializeAutoDraw();
    }
  }, [socket, cashierId, sessionId, isInitialized]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleAutoDrawInitialized = (data: any) => {
      if (data.success && data.cashierId === cashierId) {
        setIsInitialized(true);
        
        // Load saved configuration if available
        if (data.config) {
          setConfig(data.config);
          console.log('📂 Loaded saved auto draw config:', data.config);
        }
        
        showToast('Auto draw initialized successfully', 'success');
      }
    };

    const handleAutoDrawStarted = (data: any) => {
      if (data.success && data.cashierId === cashierId) {
        setIsAutoDrawActive(true);
        showToast('Auto draw started successfully', 'success');
        // Refresh stats immediately to get updated nextDrawTime
        setTimeout(() => {
          if (socket) {
            socket.emit('get_auto_draw_stats');
          }
        }, 200);
      }
    };

    const handleAutoDrawStopped = (data: any) => {
      if (data.success && data.cashierId === cashierId) {
        setIsAutoDrawActive(false);
        setCountdown(0);
        showToast('Auto draw stopped successfully', 'info');
      }
    };

    const handleAutoDrawStats = (data: any) => {
      if (data.cashierId === cashierId) {
        console.log('📊 Auto draw stats received:', data.autoDrawStats);
        setAutoDrawStats(data.autoDrawStats);
        setPoolStats(data.poolStats);
      }
    };

    const handleNumberPoolShuffled = (data: any) => {
      if (data.success && data.cashierId === cashierId) {
        // Don't show toast here - we already showed it when shuffle started
        if (socket) {
          socket.emit('get_auto_draw_stats');
        }
      }
    };

    const handleShuffleCompleted = (data: any) => {
      if (data.success && data.cashierId === cashierId) {
        showToast('🎉 3D shuffle completed! Pool is ready for new game.', 'success');
        if (socket) {
          socket.emit('get_auto_draw_stats');
        }
      }
    };



         socket.on('auto_draw_initialized', handleAutoDrawInitialized);
     socket.on('auto_draw_started', handleAutoDrawStarted);
     socket.on('auto_draw_stopped', handleAutoDrawStopped);
     socket.on('auto_draw_stats', handleAutoDrawStats);
     socket.on('number_pool_shuffled', handleNumberPoolShuffled);
     socket.on('shuffle_completed', handleShuffleCompleted);

         return () => {
       socket.off('auto_draw_initialized', handleAutoDrawInitialized);
       socket.off('auto_draw_started', handleAutoDrawStarted);
       socket.off('auto_draw_stopped', handleAutoDrawStopped);
       socket.off('auto_draw_stats', handleAutoDrawStats);
       socket.off('number_pool_shuffled', handleNumberPoolShuffled);
       socket.off('shuffle_completed', handleShuffleCompleted);
     };
  }, [socket, cashierId, showToast]);

  // Countdown timer - Simplified and stable
  useEffect(() => {
    if (!isAutoDrawActive) {
      setCountdown(0);
      return;
    }

    // Use a single, stable countdown timer
    const timer = setInterval(() => {
      if (autoDrawStats?.nextDrawTime) {
        const nextDrawTime = new Date(autoDrawStats.nextDrawTime).getTime();
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((nextDrawTime - now) / 1000));
        setCountdown(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isAutoDrawActive, autoDrawStats?.nextDrawTime]);

  // Auto-refresh stats when auto draw is active - Reduced frequency for stability
  useEffect(() => {
    if (!isAutoDrawActive || !socket || !cashierId) return;

    const statsRefreshInterval = setInterval(() => {
      socket.emit('get_auto_draw_stats');
    }, 3000); // Refresh every 3 seconds instead of 2 for stability

    return () => clearInterval(statsRefreshInterval);
  }, [isAutoDrawActive, socket, cashierId]);

  // Initialize auto draw
  const initializeAutoDraw = useCallback(() => {
    if (!socket || !cashierId || !sessionId) return;

    console.log('🎮 Sending auto draw initialize to load saved config');
    setIsLoading(true);
    socket.emit('auto_draw_initialize', {}); // Empty to load saved config
    setIsLoading(false);
  }, [socket, cashierId, sessionId]);

  // Start auto draw
  const startAutoDraw = useCallback(() => {
    if (!socket || !cashierId || !sessionId) return;

    if (gameStatus !== 'active') {
      showToast('Game must be active to start auto draw', 'error');
      return;
    }

    if (!isDisplayConnected) {
      showToast('Display must be connected to start auto draw', 'error');
      return;
    }

    console.log('🎮 Starting auto draw with config:', config);
    setIsLoading(true);
    socket.emit('auto_draw_start');
    setIsLoading(false);
  }, [socket, cashierId, sessionId, gameStatus, isDisplayConnected, showToast, config]);

  // Stop auto draw
  const stopAutoDraw = useCallback(() => {
    if (!socket || !cashierId) return;

    setIsLoading(true);
    socket.emit('auto_draw_stop');
    setIsLoading(false);
  }, [socket, cashierId]);



  // Refresh stats
  const refreshStats = useCallback(() => {
    if (!socket || !cashierId) return;

    socket.emit('get_auto_draw_stats');
  }, [socket, cashierId]);

  // Shuffle number pool
  const shufflePool = useCallback(() => {
    if (!socket || !cashierId) return;

    if (gameStatus !== 'waiting') {
      showToast('Shuffle only available when game is waiting', 'error');
      return;
    }

    showToast('🎲 Starting 3D shuffle animation on display...', 'info');
    
    // Send shuffle event to display
    socket.emit('shuffle_number_pool');
  }, [socket, cashierId, gameStatus, showToast]);



  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format performance score
  const getPerformanceColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg border border-green-200 p-4">
             {/* Header */}
       <div className="flex items-center justify-between mb-4">
         <h6 className="text-sm font-sm text-gray-500 flex items-center">
           Auto Draw
           {isAutoDrawActive && (
             <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
               Active
             </span>
           )}
         </h6>
       </div>



      {/* Control Buttons */}
      <div className="flex flex-wrap gap-2 ">
        {!isInitialized ? (
          <button
            onClick={initializeAutoDraw}
            disabled={isLoading || !socket || !cashierId || !sessionId}
            className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Initializing...' : 'Initialize'}
          </button>
        ) : (
          <>
            {!isAutoDrawActive ? (
              <button
                onClick={startAutoDraw}
                disabled={isLoading || gameStatus !== 'active' || !isDisplayConnected}
                className="px-5 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? 'Starting...' : 'Start'}
              </button>
            ) : (
              <button
                onClick={stopAutoDraw}
                disabled={isLoading}
                className="px-5 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? 'Stopping...' : 'Stop'}
              </button>
            )}
            
            
              {/* Shuffle button - always visible but disabled when not waiting */}
             <button
               onClick={shufflePool}
               className="px-12 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
               disabled={isLoading || gameStatus !== 'waiting'}
               title={gameStatus !== 'waiting' ? 'Shuffle only available when game is waiting' : 'Shuffle number pool'}
             >
               🎲 Shuffle Pool
             </button>
            
            
          </>
        )}
      </div>

      

    


      {/* Number Pool Statistics */}
      {poolStats && (
        <div className="bg-gray-50 rounded-lg p-3 mb-12">
          <h4 className="font-medium text-gray-800 mb-3 text-sm">Number Pool</h4>
          <div className="grid grid-cols-4 gap-3 text-xs mb-3">
            <div className="text-center">
              <div className="text-gray-600">Total</div>
              <div className="font-semibold text-green-600">{poolStats.totalNumbers}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-600">Drawn</div>
              <div className="font-semibold text-blue-600">{poolStats.drawnNumbers}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-600">Left</div>
              <div className="font-semibold text-green-600">{poolStats.remainingNumbers}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-600">Progress</div>
              <div className="font-semibold text-green-600">
                {Math.round((poolStats.drawnNumbers / poolStats.totalNumbers) * 100)}%
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(poolStats.drawnNumbers / poolStats.totalNumbers) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

             {/* Error Display */}
       {autoDrawStats?.errors && autoDrawStats.errors.length > 0 && (
         <div className="bg-red-50 rounded-lg p-3 mt-3">
           <h4 className="font-medium text-red-800 mb-2 text-sm">Recent Errors</h4>
           <div className="space-y-1">
             {autoDrawStats.errors.slice(-2).map((error, index) => (
               <div key={index} className="text-xs text-red-700">
                 <span className="font-medium">
                   {new Date(error.timestamp).toLocaleTimeString()}:
                 </span> {error.error}
               </div>
             ))}
           </div>
         </div>
       )}



                 </div>
    );
  }
