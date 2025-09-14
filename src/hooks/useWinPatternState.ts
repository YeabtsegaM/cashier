'use client';

import { useState, useCallback } from 'react';
import { WinPattern, WinPatternFormData } from '../types/winPattern';
import { 
  validateWinPattern, 
  validatePatternName, 
  createEmptyPattern,
  generateRandomPattern 
} from '../utils/winPatternUtils';

interface UseWinPatternStateProps {
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

export function useWinPatternState({ onError, onSuccess }: UseWinPatternStateProps) {
  const [patterns, setPatterns] = useState<WinPattern[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Selected items
  const [editingPattern, setEditingPattern] = useState<WinPattern | null>(null);
  const [deletingPattern, setDeletingPattern] = useState<WinPattern | null>(null);
  
  // Form data
  const [formData, setFormData] = useState<WinPatternFormData>({
    name: '',
    pattern: createEmptyPattern(),
    isActive: true
  });

  // Validation functions
  const validateForm = useCallback((data: WinPatternFormData): boolean => {
    // Validate pattern name
    const nameValidation = validatePatternName(data.name);
    if (!nameValidation.isValid) {
      onError(nameValidation.error!);
      return false;
    }
    
    // Validate pattern
    const patternValidation = validateWinPattern(data.pattern);
    if (!patternValidation.isValid) {
      onError(patternValidation.error!);
      return false;
    }
    
    return true;
  }, [onError]);

  // Form actions
  const updateFormData = useCallback((updates: Partial<WinPatternFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      pattern: createEmptyPattern(),
      isActive: true
    });
  }, []);

  const generatePattern = useCallback(() => {
    const newPattern = generateRandomPattern();
    updateFormData({ pattern: newPattern });
  }, [updateFormData]);

  const clearPattern = useCallback(() => {
    updateFormData({ pattern: createEmptyPattern() });
  }, [updateFormData]);

  // Modal actions
  const openCreateModal = useCallback(() => {
    resetForm();
    setShowCreateModal(true);
  }, [resetForm]);

  const openEditModal = useCallback((pattern: WinPattern) => {
    setEditingPattern(pattern);
    setFormData({
      name: pattern.name,
      pattern: pattern.pattern,
      isActive: pattern.isActive
    });
    setShowEditModal(true);
  }, []);

  const closeModals = useCallback(() => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setEditingPattern(null);
    setDeletingPattern(null);
    resetForm();
  }, [resetForm]);

  // Data management
  const addPattern = useCallback((pattern: WinPattern) => {
    setPatterns(prev => {
      const exists = prev.some(p => p.id === pattern.id);
      if (exists) return prev;
      return [pattern, ...prev];
    });
  }, []);

  const updatePattern = useCallback((pattern: WinPattern) => {
    setPatterns(prev => prev.map(p => p.id === pattern.id ? pattern : p));
  }, []);

  const removePattern = useCallback((patternId: string) => {
    setPatterns(prev => prev.filter(p => p.id !== patternId));
  }, []);

  const clearAllPatterns = useCallback(() => {
    setPatterns([]);
    onSuccess('All patterns cleared successfully!');
  }, [onSuccess]);

  return {
    // State
    patterns,
    loading,
    isCreating,
    showCreateModal,
    showEditModal,
    showDeleteModal,
    editingPattern,
    deletingPattern,
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
    closeModals,
    addPattern,
    updatePattern,
    removePattern,
    clearAllPatterns,
    validateForm,
    
    // Modal setters
    setShowCreateModal,
    setShowEditModal,
    setShowDeleteModal,
    setEditingPattern,
    setDeletingPattern
  };
} 