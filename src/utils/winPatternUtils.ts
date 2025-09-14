import { WinPatternValidationResult, WinPatternFormData } from '../types/winPattern';

// Validation functions
export const validateWinPattern = (pattern: boolean[][]): WinPatternValidationResult => {
  // Check if center is free space (should be true)
  if (!pattern[2][2]) {
    return { isValid: false, error: 'Center cell must be free space (selected)' };
  }
  
  // Check if pattern has at least one selected cell (besides center)
  const selectedCells = pattern.flat().filter(cell => cell).length;
  if (selectedCells <= 1) { // Only center cell is selected
    return { isValid: false, error: 'Please select at least one cell besides the center' };
  }
  
  return { isValid: true };
};

export const validatePatternName = (name: string): WinPatternValidationResult => {
  if (name.trim() === '') {
    return { isValid: false, error: 'Please enter a pattern name' };
  }
  
  if (name.length > 50) {
    return { isValid: false, error: 'Pattern name must be less than 50 characters' };
  }
  
  return { isValid: true };
};

// Pattern creation
export const createEmptyPattern = (): boolean[][] => {
  return Array(5).fill(null).map((_, i) => 
    Array(5).fill(null).map((_, j) => i === 2 && j === 2)
  );
};

// Pattern analysis
export const getSelectedCellsCount = (pattern: boolean[][]): number => {
  return pattern.flat().filter(cell => cell).length;
};

export const isPatternValid = (pattern: boolean[][]): boolean => {
  const validation = validateWinPattern(pattern);
  return validation.isValid;
};

// Pattern comparison
export const patternsAreEqual = (pattern1: boolean[][], pattern2: boolean[][]): boolean => {
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      if (pattern1[i][j] !== pattern2[i][j]) {
        return false;
      }
    }
  }
  return true;
};

// Pattern display helpers
export const getPatternDisplayName = (pattern: boolean[][]): string => {
  const selectedCount = getSelectedCellsCount(pattern);
  return `${selectedCount} cells selected`;
};

export const getPatternComplexity = (pattern: boolean[][]): 'simple' | 'medium' | 'complex' => {
  const selectedCount = getSelectedCellsCount(pattern);
  if (selectedCount <= 5) return 'simple';
  if (selectedCount <= 10) return 'medium';
  return 'complex';
};

// Generate a random pattern for testing/demo purposes
export const generateRandomPattern = (): boolean[][] => {
  const pattern = Array(5).fill(null).map(() => Array(5).fill(false));
  
  // Always set center as free space
  pattern[2][2] = true;
  
  // Randomly select 5-12 additional cells
  const additionalCells = Math.floor(Math.random() * 8) + 5; // 5 to 12 cells
  
  for (let i = 0; i < additionalCells; i++) {
    let row, col;
    do {
      row = Math.floor(Math.random() * 5);
      col = Math.floor(Math.random() * 5);
    } while (pattern[row][col] || (row === 2 && col === 2)); // Avoid center and already selected cells
    
    pattern[row][col] = true;
  }
  
  return pattern;
}; 