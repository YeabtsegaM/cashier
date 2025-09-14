'use client';

import React from 'react';
import { WinPatternGridProps } from '../../types/winPattern';

export function WinPatternGrid({ 
  pattern, 
  interactive = false, 
  size = 'small',
  onCellToggle 
}: WinPatternGridProps) {
  const gridClasses = {
    small: 'grid grid-cols-5 gap-0.5 w-24 h-24',
    medium: 'grid grid-cols-5 gap-1 w-48 h-48',
    large: 'grid grid-cols-5 gap-1.5 w-64 h-64'
  };
  
  const cellClasses = {
    small: 'w-4.5 h-4.5',
    medium: 'w-8 h-8',
    large: 'w-10 h-10'
  };
  
  const handleCellClick = (rowIndex: number, colIndex: number) => {
    if (!interactive || !onCellToggle) return;
    onCellToggle(rowIndex, colIndex);
  };
  
  return (
    <div className={gridClasses[size]}>
      {pattern.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const isCenter = rowIndex === 2 && colIndex === 2;
          
          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`${cellClasses[size]} rounded-md border-2 transition-all duration-200 relative ${
                cell
                  ? 'bg-emerald-500 border-emerald-600 shadow-md'
                  : 'bg-gray-100 border-gray-300'
              } ${
                interactive && !isCenter
                  ? 'cursor-pointer hover:bg-emerald-400 hover:border-emerald-500 hover:shadow-lg transform hover:scale-105'
                  : interactive && isCenter
                  ? 'cursor-not-allowed'
                  : ''
              } ${
                isCenter && !cell
                  ? 'border-dashed border-blue-400 bg-blue-50'
                  : ''
              }`}
              onClick={interactive && !isCenter ? () => handleCellClick(rowIndex, colIndex) : undefined}
              title={isCenter ? 'Free Space (Center)' : undefined}
            >
              {isCenter && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className={`${size === 'small' ? 'w-3 h-3' : size === 'medium' ? 'w-5 h-5' : 'w-6 h-6'} text-blue-600 drop-shadow-sm`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                  </svg>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
} 