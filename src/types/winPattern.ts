export interface WinPattern {
  id: string;
  name: string;
  pattern: boolean[][];
  isActive: boolean;
  cashierId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WinPatternFormData {
  name: string;
  pattern: boolean[][];
  isActive: boolean;
}

export interface WinPatternValidationResult {
  isValid: boolean;
  error?: string;
}

export interface WinPatternGridProps {
  pattern: boolean[][];
  interactive?: boolean;
  size?: 'small' | 'medium' | 'large';
  onCellToggle?: (rowIndex: number, colIndex: number) => void;
}

export interface WinPatternModalProps {
  isOpen: boolean;
  onClose: () => void;
  pattern?: WinPattern;
  onSubmit: (data: WinPatternFormData) => Promise<void>;
  isSubmitting?: boolean;
} 