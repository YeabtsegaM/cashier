'use client';

import React from 'react';
import { CartelaGridProps } from '../../types/cartela';
import { getCellValidationStatus, getColumnRange, getColumnPlaceholder } from '../../utils/cartelaUtils';

export function CartelaGrid({ 
  pattern, 
  interactive = false, 
  size = 'small',
  onCellChange 
}: CartelaGridProps) {
  const gridClasses = {
    small: 'grid grid-cols-5 gap-0.5 w-24 h-24',
    medium: 'grid grid-cols-5 gap-1 w-48 h-48',
    large: 'grid grid-cols-5 gap-1.5 w-64 h-64'
  };
  
  const cellClasses = {
    small: 'w-4.5 h-4.5 text-xs',
    medium: 'w-8 h-8 text-sm',
    large: 'w-10 h-10 text-base'
  };
  
  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    if (!interactive || !onCellChange) return;
    
    const numValue = value === '' ? 0 : parseInt(value);
    const range = getColumnRange(colIndex);
    
    if (isNaN(numValue) || numValue < range.min || numValue > range.max) return;
    
    onCellChange(rowIndex, colIndex, value);
  };
  
  return (
    <div className={gridClasses[size]}>
      {pattern.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const isCenter = rowIndex === 2 && colIndex === 2;
          const validationStatus = getCellValidationStatus(rowIndex, colIndex, cell);
          
          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`${cellClasses[size]} rounded-md border-2 transition-all duration-200 relative flex items-center justify-center font-bold ${
                isCenter
                  ? 'bg-green-500 border-green-600 text-white shadow-lg'
                  : interactive 
                    ? validationStatus === 'valid'
                      ? 'bg-green-50 border-green-300 text-gray-900 hover:border-green-400 focus-within:border-green-500 shadow-sm'
                      : validationStatus === 'invalid'
                      ? 'bg-red-50 border-red-300 text-red-700 hover:border-red-400 focus-within:border-red-500 shadow-sm'
                      : 'bg-white border-green-200 text-gray-900 hover:border-green-300 focus-within:border-green-400 shadow-sm'
                    : 'bg-white border-green-200 text-gray-900 shadow-sm'
              }`}
              title={isCenter ? 'Free Space (Center)' : `Number: ${cell} (${validationStatus})`}
            >
              {isCenter ? (
                <svg className={`${size === 'small' ? 'w-3 h-3' : size === 'medium' ? 'w-4 h-4' : 'w-5 h-5'}`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                </svg>
              ) : interactive ? (
                <input
                  type="number"
                  min={getColumnRange(colIndex).min}
                  max={getColumnRange(colIndex).max}
                  value={cell === 0 ? '' : cell}
                  onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                  className="w-full h-full text-center text-sm font-bold bg-transparent border-none outline-none focus:ring-0"
                  placeholder={getColumnPlaceholder(colIndex)}
                />
              ) : (
                cell
              )}
            </div>
          );
        })
      )}
    </div>
  );
} 