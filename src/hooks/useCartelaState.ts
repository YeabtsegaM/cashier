'use client';

import { useState, useCallback } from 'react';
import { Cartela, CartelaFormData } from '../types/cartela';
import { 
  validateBingoPattern, 
  validateCartelaId, 
  generateBingoPattern, 
  createEmptyPattern,
  findNextAvailableId 
} from '../utils/cartelaUtils';

interface UseCartelaStateProps {
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

export function useCartelaState({ onError, onSuccess }: UseCartelaStateProps) {
  const [cartelas, setCartelas] = useState<Cartela[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Selected items
  const [editingCartela, setEditingCartela] = useState<Cartela | null>(null);
  const [selectedCartela, setSelectedCartela] = useState<Cartela | null>(null);
  const [deletingCartela, setDeletingCartela] = useState<Cartela | null>(null);
  
  // Form data
  const [formData, setFormData] = useState<CartelaFormData>({
    cartelaId: 1,
    pattern: createEmptyPattern(),
    isActive: true
  });

  // Validation functions
  const validateForm = useCallback((data: CartelaFormData, excludeId?: string): boolean => {
    // Validate cartela ID
    const existingIds = cartelas
      .filter(c => c.id !== excludeId)
      .map(c => c.cartelaId);
    
    const idValidation = validateCartelaId(data.cartelaId, existingIds);
    if (!idValidation.isValid) {
      onError(idValidation.error!);
      return false;
    }
    
    // Validate BINGO pattern
    const patternValidation = validateBingoPattern(data.pattern);
    if (!patternValidation.isValid) {
      onError(patternValidation.error!);
      return false;
    }
    
    return true;
  }, [cartelas, onError]);

  // Form actions
  const updateFormData = useCallback((updates: Partial<CartelaFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      cartelaId: 1,
      pattern: createEmptyPattern(),
      isActive: true
    });
  }, []);

  const generatePattern = useCallback(() => {
    const newPattern = generateBingoPattern();
    updateFormData({ pattern: newPattern });
  }, [updateFormData]);

  const clearPattern = useCallback(() => {
    updateFormData({ pattern: createEmptyPattern() });
  }, [updateFormData]);

  // Modal actions
  const openCreateModal = useCallback(() => {
    const existingIds = cartelas.map(c => c.cartelaId).sort((a, b) => a - b);
    const nextId = findNextAvailableId(existingIds);
    
    setFormData({
      cartelaId: nextId,
      pattern: createEmptyPattern(),
      isActive: true
    });
    setShowCreateModal(true);
  }, [cartelas]);

  const openEditModal = useCallback((cartela: Cartela) => {
    setEditingCartela(cartela);
    setFormData({
      cartelaId: cartela.cartelaId,
      pattern: cartela.pattern,
      isActive: cartela.isActive
    });
    setShowEditModal(true);
  }, []);

  const openDetailModal = useCallback((cartela: Cartela) => {
    setSelectedCartela(cartela);
    setShowDetailModal(true);
  }, []);

  const closeModals = useCallback(() => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDetailModal(false);
    setShowDeleteModal(false);
    setEditingCartela(null);
    setSelectedCartela(null);
    setDeletingCartela(null);
    resetForm();
  }, [resetForm]);

  // Data management
  const addCartela = useCallback((cartela: Cartela) => {
    setCartelas(prev => {
      const exists = prev.some(c => c.id === cartela.id);
      if (exists) return prev;
      return [cartela, ...prev];
    });
  }, []);

  const updateCartela = useCallback((cartela: Cartela) => {
    setCartelas(prev => prev.map(c => c.id === cartela.id ? cartela : c));
  }, []);

  const removeCartela = useCallback((cartelaId: string) => {
    setCartelas(prev => prev.filter(c => c.id !== cartelaId));
  }, []);

  const clearAllCartelas = useCallback(() => {
    setCartelas([]);
    onSuccess('All cartelas cleared successfully!');
  }, [onSuccess]);

  return {
    // State
    cartelas,
    loading,
    isCreating,
    showCreateModal,
    showEditModal,
    showDetailModal,
    showDeleteModal,
    editingCartela,
    selectedCartela,
    deletingCartela,
    formData,
    
    // Actions
    setLoading,
    setIsCreating,
    updateFormData,
    resetForm,
    generatePattern,
    clearPattern,
    openCreateModal,
    openEditModal,
    openDetailModal,
    closeModals,
    addCartela,
    updateCartela,
    removeCartela,
    clearAllCartelas,
    validateForm,
    
    // Modal setters
    setShowCreateModal,
    setShowEditModal,
    setShowDetailModal,
    setShowDeleteModal,
    setEditingCartela,
    setSelectedCartela,
    setDeletingCartela
  };
} 