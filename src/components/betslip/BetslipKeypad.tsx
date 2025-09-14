'use client';

import React, { useEffect, useRef } from 'react';
import { BetslipKeypadProps } from '../../types/betslip';
import { KEYPAD_NUMBERS } from '../../utils/betslipUtils';

export function BetslipKeypad({
  betslipCode,
  onNumberClick,
  onBackspace,
  onClear,
  onEnter
}: BetslipKeypadProps) {
  
  // Barcode scanner functionality
  const scanBuffer = useRef('');
  const scanTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Clear any existing timeout
      if (scanTimeout.current) {
        clearTimeout(scanTimeout.current);
      }

      // If it's a number, add to scan buffer
      if (event.key >= '0' && event.key <= '9') {
        scanBuffer.current += event.key;
        
        // Set timeout to process scan after 100ms of no input
        scanTimeout.current = setTimeout(() => {
          // Check if we have a valid 13-digit barcode
          if (scanBuffer.current.length === 13 && /^\d{13}$/.test(scanBuffer.current)) {
            onNumberClick(scanBuffer.current);
            scanBuffer.current = '';
          } else if (scanBuffer.current.length > 13) {
            // Reset if too long
            scanBuffer.current = '';
          }
        }, 100);
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (scanTimeout.current) {
        clearTimeout(scanTimeout.current);
      }
    };
  }, [onNumberClick]);

  return (
    <div className="w-1/3 bg-green-50 p-4 rounded-lg border border-green-200">
      {/* Instruction */}
      <div className="text-center mb-3">
        <p className="text-green-600 text-xs font-medium">Enter betslip code or Scan</p>
      </div>

      {/* Input Field */}
      <div className="relative mb-3">
        <input
          type="text"
          value={betslipCode}
          onChange={(e) => {
            // Only allow numeric input and limit to 13 digits
            const value = e.target.value.replace(/\D/g, '').slice(0, 13);
            onNumberClick(value);
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pastedText = e.clipboardData.getData('text');
            const numericText = pastedText.replace(/\D/g, '').slice(0, 13);
            if (numericText.length === 13) {
              onNumberClick(numericText);
            }
          }}
          onKeyDown={(e) => {
            // Spacebar to clear
            if (e.key === ' ') {
              e.preventDefault();
              onClear();
            }
            // Enter key to submit
            if (e.key === 'Enter') {
              e.preventDefault();
              onEnter();
            }
            // Escape key to clear
            if (e.key === 'Escape') {
              e.preventDefault();
              onClear();
            }
            // Backspace key to remove last character
            if (e.key === 'Backspace') {
              e.preventDefault();
              onBackspace();
            }
          }}
          placeholder=""
          className="w-full px-2 py-1 text-center text-sm font-mono border border-green-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900"
        />
        

      </div>

      {/* Numeric Keypad */}
      <div className="space-y-1">
        {KEYPAD_NUMBERS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex space-x-2">
            {row.map((item) => (
              item === '' ? (
                <div key="empty" className="flex-1 py-3 px-2" />
              ) : (
                <button
                  key={item}
                  onClick={() => item === 'backspace' ? onBackspace() : onNumberClick(item)}
                  className={`flex-1 py-2 px-1 rounded font-medium text-xs transition-colors duration-200 border border-green-300 ${
                    item === 'backspace'
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {item === 'backspace' ? (
                    <svg className="w-3 h-3 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414-6.414a2 2 0 012.828 0L21 12M4.586 17.414A2 2 0 002 19v1a2 2 0 002 2h12a2 2 0 002-2v-1a2 2 0 00-.586-1.414L12 14l-7.414 3.414z" />
                    </svg>
                  ) : (
                    item
                  )}
                </button>
              )
            ))}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2 mt-3">
        <button
          onClick={onClear}
          className="flex-1 py-1 px-2 bg-white text-green-700 border border-green-300 rounded font-medium text-xs hover:bg-green-50 transition-colors duration-200"
        >
          Clear
        </button>
        <button
          onClick={onEnter}
          disabled={!betslipCode.trim()}
          className="flex-1 py-1 px-2 bg-green-500 text-white rounded font-medium text-xs hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          Enter
        </button>
      </div>
    </div>
  );
} 