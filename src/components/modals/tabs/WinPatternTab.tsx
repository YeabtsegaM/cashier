'use client';

import React, { useEffect, useCallback } from 'react';
import { apiClient } from '../../../utils/api';
import { useWinPatternSocket } from '../../../hooks/useWinPatternSocket';
import { useWinPatternState } from '../../../hooks/useWinPatternState';
import { useToast } from '../../../contexts/ToastContext';
import { DeleteModal } from '../../ui/DeleteModal';
import { WinPatternGrid } from '../../winPattern/WinPatternGrid';
import { WinPattern } from '../../../types/winPattern';

interface WinPatternTabProps {
  cashierId?: string;
}

export function WinPatternTab({ cashierId }: WinPatternTabProps) {
  const { showToast } = useToast();
  
  const {
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
  } = useWinPatternState({
    onError: (message) => showToast(message, 'error'),
    onSuccess: (message) => showToast(message, 'success')
  });

  // Socket for real-time updates
  const { isConnected } = useWinPatternSocket({
    cashierId,
    onPatternCreated: addPattern,
    onPatternUpdated: updatePattern,
    onPatternDeleted: removePattern,
    onPatternStatusChanged: updatePattern
  });

  // Fetch patterns on component mount
  useEffect(() => {
    fetchPatterns();
  }, [cashierId]);

  const fetchPatterns = useCallback(async () => {
    if (!cashierId) return;
    
    setLoading(true);
    try {
      const response = await apiClient.getWinPatterns(cashierId);
      // Update state with fetched patterns
      response.data.forEach(addPattern);
    } catch (error) {
      showToast('Failed to fetch patterns', 'error');
    } finally {
      setLoading(false);
    }
  }, [cashierId, setLoading, addPattern, showToast]);

  // API handlers
  const handleCreatePattern = async () => {
    if (!cashierId || isCreating) return;
    
    if (!validateForm(formData)) return;
    
    setIsCreating(true);
    try {
      await apiClient.createWinPattern({
        ...formData,
        cashierId
      });
      
      setShowCreateModal(false);
      resetForm();
      showToast('Pattern created successfully!', 'success');
    } catch (error: any) {
      if (error.response?.data?.error) {
        showToast(error.response.data.error, 'error');
      } else {
        showToast('Failed to create pattern. Please try again.', 'error');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdatePattern = async () => {
    if (!editingPattern?.id) return;
    
    if (!validateForm(formData)) return;
    
    try {
      const response = await apiClient.updateWinPattern(editingPattern.id, formData);
      updatePattern(response.data);
      setShowEditModal(false);
      setEditingPattern(null);
      resetForm();
      showToast('Pattern updated successfully!', 'success');
    } catch (error: any) {
      if (error.response?.data?.error) {
        showToast(error.response.data.error, 'error');
      } else {
        showToast('Failed to update pattern. Please try again.', 'error');
      }
    }
  };

  const handleDeletePattern = (pattern: WinPattern) => {
    setDeletingPattern(pattern);
    setShowDeleteModal(true);
  };

  const confirmDeletePattern = async () => {
    if (!deletingPattern?.id) return;
    
    try {
      await apiClient.deleteWinPattern(deletingPattern.id);
      removePattern(deletingPattern.id);
      setShowDeleteModal(false);
      setDeletingPattern(null);
      showToast('Pattern deleted successfully!', 'success');
    } catch (error) {
      showToast('Failed to delete pattern. Please try again.', 'error');
    }
  };

  const handleToggleActive = async (pattern: WinPattern) => {
    try {
      await apiClient.toggleWinPatternStatus(pattern.id, !pattern.isActive);
      showToast(`Pattern ${!pattern.isActive ? 'activated' : 'deactivated'} successfully!`, 'success');
    } catch (error) {
      showToast('Failed to update pattern status. Please try again.', 'error');
    }
  };

  const handleClearAllPatterns = async () => {
    if (!cashierId) return;
    
    try {
      for (const pattern of patterns) {
        await apiClient.deleteWinPattern(pattern.id);
      }
      clearAllPatterns();
    } catch (error) {
      showToast('Failed to clear patterns. Please try again.', 'error');
    }
  };

  const handleCellToggle = (rowIndex: number, colIndex: number) => {
    const newPattern = formData.pattern.map((row, i) =>
      row.map((cell, j) => i === rowIndex && j === colIndex ? !cell : cell)
    );
    updateFormData({ pattern: newPattern });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={openCreateModal}
            className="px-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Pattern</span>
          </button>
          {patterns.length > 0 && (
            <button
              onClick={handleClearAllPatterns}
              className="p-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg border border-red-200"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {patterns.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Win Patterns Found</h3>
        </div>
      )}

      {/* Patterns Grid */}
      {patterns.length > 0 && (
        <div className="max-h-96 overflow-y-auto border border-green-200 rounded-lg p-4 bg-green-50">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {patterns.map((pattern) => (
              <div
                key={pattern.id}
                className="bg-white border-2 border-green-200 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-200 hover:border-green-300"
              >
                <div className="flex gap-3">
                  {/* Left side - Pattern content */}
                  <div className="flex-1">
                    <div className="mb-2">
                      <h4 className="font-medium text-gray-900 text-sm truncate">{pattern.name}</h4>
                    </div>
                    
                    <div className="flex justify-center mb-3">
                      <WinPatternGrid 
                        pattern={pattern.pattern} 
                        interactive={false} 
                        size="small"
                      />
                    </div>
                    
                    <div className="text-xs text-gray-600 text-center">
                      {new Date(pattern.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {/* Right side - Vertical action buttons */}
                  <div className="flex flex-col justify-center space-y-2 w-16">
                    <button
                      onClick={() => handleToggleActive(pattern)}
                      className={`px-2 py-1 text-xs rounded-lg font-medium transition-all duration-200 ${
                        pattern.isActive
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {pattern.isActive ? 'Active' : 'Inactive'}
                    </button>
                    
                    <button
                      onClick={() => openEditModal(pattern)}
                      className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium transition-all duration-200"
                    >
                      Edit
                    </button>
                    
                    <button
                      onClick={() => handleDeletePattern(pattern)}
                      className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium transition-all duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-4 w-2/3 max-w-sm shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Create Win Pattern</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">
                  Pattern Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData({ name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder-gray-400 text-sm"
                  placeholder="Enter pattern name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Pattern Grid
                </label>
                <div className="flex justify-center mb-3">
                  <WinPatternGrid 
                    pattern={formData.pattern} 
                    interactive={true} 
                    size="medium"
                    onCellToggle={handleCellToggle}
                  />
                </div>
              </div>

              <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => updateFormData({ isActive: e.target.checked })}
                  className="mr-2 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-gray-900">
                  Active Pattern
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4 pt-3 border-t border-gray-200">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-all duration-200 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePattern}
                disabled={isCreating}
                className={`px-4 py-1.5 font-medium transition-all duration-200 shadow-md text-sm rounded-lg ${
                  isCreating
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-lg'
                }`}
              >
                {isCreating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingPattern && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-4 w-2/3 max-w-sm shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Edit Win Pattern</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">
                  Pattern Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData({ name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder-gray-400 text-sm"
                  placeholder="Enter pattern name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Pattern Grid
                </label>
                <div className="flex justify-center mb-3">
                  <WinPatternGrid 
                    pattern={formData.pattern} 
                    interactive={true} 
                    size="medium"
                    onCellToggle={handleCellToggle}
                  />
                </div>
              </div>

              <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={formData.isActive}
                  onChange={(e) => updateFormData({ isActive: e.target.checked })}
                  className="mr-2 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <label htmlFor="editIsActive" className="text-sm font-semibold text-gray-900">
                  Active Pattern
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4 pt-3 border-t border-gray-200">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-3 py-1.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-all duration-200 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePattern}
                className="px-4 py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-medium transition-all duration-200 shadow-md hover:shadow-lg text-sm"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && deletingPattern && (
        <DeleteModal
          item={deletingPattern}
          title="Delete Win Pattern"
          message="Are you sure you want to delete the pattern '{name}'? This action cannot be undone."
          itemName={(pattern) => pattern.name}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingPattern(null);
          }}
          onConfirm={confirmDeletePattern}
          confirmButtonText="Delete Pattern"
        />
      )}
    </div>
  );
} 