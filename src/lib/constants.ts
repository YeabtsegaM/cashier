// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api-yebingo-com.onrender.com',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// Socket Events
export const SOCKET_EVENTS = {
  CLOSE_VERIFICATION_MODAL: 'close-verification-modal',
} as const;

// Cartela Configuration
export const CARTELA_CONFIG = {
  MAX_ID: 210,
  MIN_ID: 1,
  GRID_SIZE: 5,
  CENTER_ROW: 2,
  CENTER_COL: 2,
} as const;

// BINGO Column Ranges
export const BINGO_RANGES = {
  B: { min: 1, max: 15 },
  I: { min: 16, max: 30 },
  N: { min: 31, max: 45 },
  G: { min: 46, max: 60 },
  O: { min: 61, max: 75 },
} as const;

// UI Configuration
export const UI_CONFIG = {
  MODAL_Z_INDEX: 50,
  TOAST_DURATION: 5000,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
} as const;

// Grid Sizes
export const GRID_SIZES = {
  small: {
    grid: 'grid grid-cols-5 gap-0.5 w-24 h-24',
    cell: 'w-4.5 h-4.5 text-xs',
    icon: 'w-3 h-3',
  },
  medium: {
    grid: 'grid grid-cols-5 gap-1 w-48 h-48',
    cell: 'w-8 h-8 text-sm',
    icon: 'w-4 h-4',
  },
  large: {
    grid: 'grid grid-cols-5 gap-1.5 w-64 h-64',
    cell: 'w-10 h-10 text-base',
    icon: 'w-5 h-5',
  },
} as const;

// Color Schemes
export const COLORS = {
  primary: {
    light: 'bg-green-50',
    main: 'bg-green-100',
    dark: 'bg-green-200',
    text: 'text-green-700',
    border: 'border-green-200',
  },
  secondary: {
    light: 'bg-gray-50',
    main: 'bg-gray-100',
    dark: 'bg-gray-200',
    text: 'text-gray-700',
    border: 'border-gray-200',
  },
  danger: {
    light: 'bg-red-50',
    main: 'bg-red-100',
    dark: 'bg-red-200',
    text: 'text-red-700',
    border: 'border-red-200',
  },
  success: {
    light: 'bg-green-50',
    main: 'bg-green-100',
    dark: 'bg-green-200',
    text: 'text-green-700',
    border: 'border-green-200',
  },
} as const;

// Validation Messages
export const VALIDATION_MESSAGES = {
  CARTELA_ID_RANGE: 'Cartela ID must be between 1 and 210',
  CARTELA_ID_EXISTS: 'Cartela ID already exists',
  CENTER_FREE_SPACE: 'Center cell must be free space (0)',
  PATTERN_INVALID: 'Invalid BINGO pattern',
  NAME_REQUIRED: 'Please enter a pattern name',
  MIN_CELLS_REQUIRED: 'Please select at least one cell besides the center',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  CARTELA_CREATED: 'Cartela created successfully!',
  CARTELA_UPDATED: 'Cartela updated successfully!',
  CARTELA_DELETED: 'Cartela deleted successfully!',
  CARTELA_ACTIVATED: 'Cartela activated successfully!',
  CARTELA_DEACTIVATED: 'Cartela deactivated successfully!',
  ALL_CLEARED: 'All cartelas cleared successfully!',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  FETCH_FAILED: 'Failed to fetch cartelas',
  CREATE_FAILED: 'Failed to create cartela. Please try again.',
  UPDATE_FAILED: 'Failed to update cartela. Please try again.',
  DELETE_FAILED: 'Failed to delete cartela. Please try again.',
  STATUS_UPDATE_FAILED: 'Failed to update cartela status. Please try again.',
  CLEAR_FAILED: 'Failed to clear cartelas. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
} as const; 
