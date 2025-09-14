import { BetslipData, BetslipValidationResult } from '../types/betslip';

// Validation functions
export const validateBetslipCode = (code: string): BetslipValidationResult => {
  if (!code.trim()) {
    return { isValid: false, error: 'Ticket number is required' };
  }
  
  if (code.length !== 13) {
    return { isValid: false, error: 'Ticket number must be exactly 13 digits' };
  }
  
  if (!/^\d{13}$/.test(code)) {
    return { isValid: false, error: 'Ticket number must contain only numbers' };
  }
  
  return { isValid: true };
};



// Keypad configuration
export const KEYPAD_NUMBERS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'backspace']
] as const;



// Format currency
export const formatCurrency = (amount: number): string => {
  return `Br. ${amount.toFixed(2)}`;
};

 