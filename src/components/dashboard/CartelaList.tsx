'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';

interface Cartela {
  id: string;
  cartelaId: number;
  isActive: boolean;
}

interface CartelaListProps {
  cashierId?: string;
  onCartelaSelect?: (cartelaId: number) => void;
  onCartelaDeselect?: (cartelaId: number) => void;
  selectedCartelaId?: number;
  isMultiSelect?: boolean;
  selectedCartelas?: number[];
  placedBets?: Map<number, any>; // Add placed bets data
  singleModeEnabled?: boolean; // Add single mode flag
}

export function CartelaList({ 
  cashierId, 
  onCartelaSelect, 
  onCartelaDeselect,
  selectedCartelaId,
  isMultiSelect = true, // Always enable multi-select for cartelas
  selectedCartelas = [],
  placedBets = new Map(), // Initialize placedBets
  singleModeEnabled = false // Initialize singleModeEnabled
}: CartelaListProps) {
  const [cartelas, setCartelas] = useState<Cartela[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    if (cashierId) {
      fetchCartelas();
    }
  }, [cashierId]);

  const fetchCartelas = async () => {
    if (!cashierId) return;
    
    setLoading(true);
    try {
      const response = await apiClient.getCartelas(cashierId);
      // Sort cartelas by cartelaId in ascending order
      const sortedCartelas = response.data.sort((a: Cartela, b: Cartela) => a.cartelaId - b.cartelaId);
      setCartelas(sortedCartelas);
    } catch (error) {
      showToast('Failed to fetch cartelas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCartelaClick = (cartelaId: number) => {
    console.log(`🎯 CartelaList: handleCartelaClick called for cartela ${cartelaId}`);
    console.log(`🎯 CartelaList: Current props:`, {
      isMultiSelect,
      singleModeEnabled,
      selectedCartelas: selectedCartelas.length,
      selectedCartelaId,
      hasPlacedBet: placedBets.has(cartelaId)
    });
    
    // Check if cartela already has a placed bet
    if (placedBets.has(cartelaId)) {
      console.log(`⚠️ Cartela ${cartelaId} already has a placed bet - cannot select`);
      return;
    }

    // For multi-select: toggle selection
    if (isMultiSelect && !singleModeEnabled) {
      if (selectedCartelas.includes(cartelaId)) {
        console.log(`🎯 CartelaList: Deselecting cartela ${cartelaId}`);
        onCartelaDeselect?.(cartelaId);
      } else {
        console.log(`🎯 CartelaList: Selecting cartela ${cartelaId}`);
        onCartelaSelect?.(cartelaId);
      }
    } else {
      // Single select: if already selected, deselect it
      if (selectedCartelaId === cartelaId) {
        console.log(`🎯 CartelaList: Deselecting cartela ${cartelaId} (single mode)`);
        onCartelaDeselect?.(cartelaId);
      } else {
        console.log(`🎯 CartelaList: Selecting cartela ${cartelaId} (single mode)`);
        onCartelaSelect?.(cartelaId);
      }
    }
  };

  const handleSearchEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const searchNumber = parseInt(searchId);
      if (!isNaN(searchNumber) && searchNumber >= 1 && searchNumber <= 210) {
        const cartela = cartelas.find(c => c.cartelaId === searchNumber);
        if (cartela) {
          handleCartelaClick(searchNumber);
          setSearchId('');
        } else {
          showToast(`Cartela ${searchNumber} not found`, 'error');
        }
      } else {
        showToast('Please enter a valid cartela ID (1-210)', 'error');
      }
    }
  };

  const handleRefresh = () => {
    fetchCartelas();
    showToast('Cartelas refreshed', 'success');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white rounded-lg border border-green-200 p-3">
      {/* Search and Refresh */}
      <div className="flex items-center space-x-2 mb-3">
        <div className="w-48 relative">
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyPress={handleSearchEnter}
            placeholder="Enter cartela ID"
            className="w-full text-gray-900 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <button
          onClick={handleRefresh}
          className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200"
          title="Refresh cartelas"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      <div className="grid grid-cols-15 gap-1 max-h-[calc(100vh-200px)] overflow-hidden py-1 px-1">
        {cartelas.filter(cartela => cartela.isActive).map((cartela) => {
          const isSelected = isMultiSelect 
            ? selectedCartelas.includes(cartela.cartelaId)
            : selectedCartelaId === cartela.cartelaId;
          
          const hasPlacedBet = placedBets.has(cartela.cartelaId);
          
          let buttonClass = '';
          let buttonText = cartela.cartelaId.toString();
          
          if (hasPlacedBet) {
            // Cartela with placed bet - disabled state
            buttonClass = 'bg-red-100 text-red-700 border-2 border-red-300 cursor-not-allowed opacity-60';
            buttonText = `${cartela.cartelaId} ✓`;
          } else if (isSelected) {
            // Selected cartela
            buttonClass = 'bg-green-500 text-white shadow-lg scale-105';
          } else {
            // Available cartela
            buttonClass = 'bg-green-100 text-green-700 hover:bg-green-200 border-2 border-green-300';
          }
          
          return (
            <button
              key={cartela.id}
              onClick={() => handleCartelaClick(cartela.cartelaId)}
              disabled={hasPlacedBet}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200 ${buttonClass}`}
              title={hasPlacedBet ? `Cartela ${cartela.cartelaId} - Bet already placed` : `Cartela ${cartela.cartelaId}`}
            >
              {buttonText}
            </button>
          );
        })}
      </div>
      
      {cartelas.length === 0 && (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">No cartelas found</p>
        </div>
      )}
    </div>
  );
} 