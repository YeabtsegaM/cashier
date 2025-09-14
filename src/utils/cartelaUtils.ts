import { CartelaValidationResult, CartelaFormData } from '../types/cartela';

// BINGO column ranges
const BINGO_RANGES = {
  B: { min: 1, max: 15 },
  I: { min: 16, max: 30 },
  N: { min: 31, max: 45 },
  G: { min: 46, max: 60 },
  O: { min: 61, max: 75 }
} as const;

// Validation functions
export const validateBingoPattern = (pattern: number[][]): CartelaValidationResult => {
  // Check if center is free space
  if (pattern[2][2] !== 0) {
    return { isValid: false, error: 'Center cell must be free space (0)' };
  }
  
  // Validate BINGO rules for each column
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      if (i === 2 && j === 2) continue; // Skip center
      
      const cell = pattern[i][j];
      if (cell === 0) continue; // Skip empty cells
      
      // Validate based on column position
      const columnRanges = Object.values(BINGO_RANGES);
      const range = columnRanges[j];
      
      if (cell < range.min || cell > range.max) {
        const columnName = Object.keys(BINGO_RANGES)[j];
        return { 
          isValid: false, 
          error: `${columnName} column must contain numbers ${range.min}-${range.max}, found ${cell}` 
        };
      }
    }
  }
  
  return { isValid: true };
};

export const validateCartelaId = (cartelaId: number, existingIds: number[]): CartelaValidationResult => {
  if (cartelaId < 1 || cartelaId > 210) {
    return { isValid: false, error: 'Cartela ID must be between 1 and 210' };
  }
  
  if (existingIds.includes(cartelaId)) {
    return { isValid: false, error: 'Cartela ID already exists' };
  }
  
  return { isValid: true };
};

// Pattern generation
export const generateBingoPattern = (): number[][] => {
  const bNumbers = Array.from({ length: 15 }, (_, i) => i + 1);
  const iNumbers = Array.from({ length: 15 }, (_, i) => i + 16);
  const nNumbers = Array.from({ length: 15 }, (_, i) => i + 31);
  const gNumbers = Array.from({ length: 15 }, (_, i) => i + 46);
  const oNumbers = Array.from({ length: 15 }, (_, i) => i + 61);
  
  // Shuffle each column's numbers
  const shuffleArray = (arr: number[]) => arr.sort(() => Math.random() - 0.5);
  const shuffledB = shuffleArray([...bNumbers]);
  const shuffledI = shuffleArray([...iNumbers]);
  const shuffledN = shuffleArray([...nNumbers]);
  const shuffledG = shuffleArray([...gNumbers]);
  const shuffledO = shuffleArray([...oNumbers]);
  
  return Array(5).fill(null).map((_, rowIndex) =>
    Array(5).fill(null).map((_, colIndex) => {
      if (rowIndex === 2 && colIndex === 2) return 0; // Center is free space
      if (colIndex === 0) return shuffledB[rowIndex]; // B column
      if (colIndex === 1) return shuffledI[rowIndex]; // I column
      if (colIndex === 2) return shuffledN[rowIndex]; // N column
      if (colIndex === 3) return shuffledG[rowIndex]; // G column
      if (colIndex === 4) return shuffledO[rowIndex]; // O column
      return 0;
    })
  );
};

export const createEmptyPattern = (): number[][] => {
  return Array(5).fill(null).map((_, i) => 
    Array(5).fill(null).map((_, j) => i === 2 && j === 2 ? 0 : 0)
  );
};

// ID management
export const findNextAvailableId = (existingIds: number[]): number => {
  for (let i = 1; i <= 210; i++) {
    if (!existingIds.includes(i)) {
      return i;
    }
  }
  return 1; // Fallback
};

// Cell validation
export const getCellValidationStatus = (rowIndex: number, colIndex: number, cell: number): 'valid' | 'invalid' | 'empty' => {
  if (rowIndex === 2 && colIndex === 2) return 'valid'; // Center is always valid
  if (cell === 0) return 'empty'; // Empty cells are neutral
  
  const columnRanges = Object.values(BINGO_RANGES);
  const range = columnRanges[colIndex];
  
  if (cell >= range.min && cell <= range.max) return 'valid';
  return 'invalid';
};

// Column range helpers
export const getColumnRange = (colIndex: number): { min: number; max: number } => {
  const columnRanges = Object.values(BINGO_RANGES);
  return columnRanges[colIndex];
};

export const getColumnPlaceholder = (colIndex: number): string => {
  const range = getColumnRange(colIndex);
  return `${range.min}-${range.max}`;
}; 