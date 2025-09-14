/**
 * Game ID Utility Functions for Frontend
 * 
 * Provides utility functions for handling simple 6-digit game IDs
 * in the frontend applications with consistent handling.
 */

/**
 * Get the numeric value from a 6-digit game ID
 * 
 * @param gameId - The game ID string or number
 * @returns The numeric value of the game ID
 * 
 * @example
 * getGameIdNumber("100000") // returns 100000
 * getGameIdNumber(100001) // returns 100001
 */
export function getGameIdNumber(gameId: string | number | undefined): number {
  if (!gameId) return 0;
  
  if (typeof gameId === 'number') {
    return gameId;
  }
  
  const parsedId = parseInt(gameId, 10);
  return isNaN(parsedId) ? 0 : parsedId;
}

/**
 * Format game ID for display
 * 
 * @param gameId - The game ID (can be string or number)
 * @returns Formatted game ID for display
 * 
 * @example
 * formatGameIdForDisplay("100000") // returns "100000"
 * formatGameIdForDisplay(100001) // returns "100001"
 * formatGameIdForDisplay(undefined) // returns "0"
 */
export function formatGameIdForDisplay(gameId: string | number | undefined): string {
  if (!gameId) return '0';
  
  if (typeof gameId === 'number') {
    return gameId.toString();
  }
  
  // Handle string input - parse as number and return as string
  const parsedId = parseInt(gameId, 10);
  return isNaN(parsedId) ? '0' : parsedId.toString();
}

/**
 * Validate if a game ID has the correct 6-digit format
 * 
 * @param gameId - The game ID string to validate
 * @returns True if the game ID format is valid (6 digits)
 * 
 * @example
 * isValidGameIdFormat("100000") // returns true
 * isValidGameIdFormat("100001") // returns true
 * isValidGameIdFormat("1234") // returns false (too short)
 * isValidGameIdFormat("abc123") // returns false (not numeric)
 */
export function isValidGameIdFormat(gameId: string | number): boolean {
  if (!gameId) return false;
  
  const gameIdStr = gameId.toString();
  // Check if it's exactly 6 digits
  return /^\d{6}$/.test(gameIdStr);
}

/**
 * Check if a game ID is in the valid 6-digit range
 * 
 * @param gameId - The game ID to check
 * @returns True if the game ID is in valid range (100000-999999)
 * 
 * @example
 * isValidGameIdRange("100000") // returns true
 * isValidGameIdRange("999999") // returns true
 * isValidGameIdRange("99999") // returns false (too small)
 * isValidGameIdRange("1000000") // returns false (too large)
 */
export function isValidGameIdRange(gameId: string | number): boolean {
  const num = getGameIdNumber(gameId);
  return num >= 100000 && num <= 999999;
}

// Legacy function for backward compatibility (deprecated)
/**
 * @deprecated Use getGameIdNumber instead
 */
export function extractGameIdNumber(gameId: string | undefined): number {
  return getGameIdNumber(gameId);
}