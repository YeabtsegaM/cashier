export interface Cartela {
  id: string;
  cartelaId: number;
  pattern: number[][];
  isActive: boolean;
  cashierId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartelaFormData {
  cartelaId: number;
  pattern: number[][];
  isActive: boolean;
}

export interface CartelaValidationResult {
  isValid: boolean;
  error?: string;
}

export interface CartelaGridProps {
  pattern: number[][];
  interactive?: boolean;
  size?: 'small' | 'medium' | 'large';
  onCellChange?: (rowIndex: number, colIndex: number, value: string) => void;
}

export interface CartelaModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartela?: Cartela;
  onSubmit: (data: CartelaFormData) => Promise<void>;
  isSubmitting?: boolean;
} 