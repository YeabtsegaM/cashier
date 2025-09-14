'use client';

import React, { useEffect, useCallback } from 'react';
import { apiClient } from '../../../utils/api';
import { useCartelaSocket } from '../../../hooks/useCartelaSocket';
import { useCartelaState } from '../../../hooks/useCartelaState';
import { useToast } from '../../../contexts/ToastContext';
import { DeleteModal } from '../../ui/DeleteModal';
import { CartelaGrid } from '../../cartela/CartelaGrid';
import { Cartela } from '../../../types/cartela';

interface CartelaTabProps {
  cashierId?: string;
}

export function CartelaTab({ cashierId }: CartelaTabProps) {
  const { showToast } = useToast();
  
  const {
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
    setDeletingCartela
  } = useCartelaState({
    onError: (message) => showToast(message, 'error'),
    onSuccess: (message) => showToast(message, 'success')
  });

  // Socket for real-time updates
  const { isConnected } = useCartelaSocket({
    cashierId,
    onCartelaCreated: addCartela,
    onCartelaUpdated: updateCartela,
    onCartelaDeleted: removeCartela,
    onCartelaStatusChanged: updateCartela
  });

  // Fetch cartelas on component mount
  useEffect(() => {
    fetchCartelas();
  }, [cashierId]);

  const fetchCartelas = useCallback(async () => {
    if (!cashierId) return;
    
    setLoading(true);
    try {
      const response = await apiClient.getCartelas(cashierId);
      // Update state with fetched cartelas
      response.data.forEach(addCartela);
    } catch (error) {
      showToast('Failed to fetch cartelas', 'error');
    } finally {
      setLoading(false);
    }
  }, [cashierId, setLoading, addCartela, showToast]);

  // API handlers
  const handleCreateCartela = async () => {
    if (!cashierId || isCreating) return;
    
    if (!validateForm(formData)) return;
    
    setIsCreating(true);
    try {
      await apiClient.createCartela({
        ...formData,
        cashierId
      });
      
      setShowCreateModal(false);
      resetForm();
      showToast('Cartela created successfully!', 'success');
    } catch (error: any) {
      if (error.response?.data?.error) {
        showToast(error.response.data.error, 'error');
      } else {
        showToast('Failed to create cartela. Please try again.', 'error');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateCartela = async () => {
    if (!editingCartela?.id) return;
    
    if (!validateForm(formData, editingCartela.id)) return;
    
    try {
      const response = await apiClient.updateCartela(editingCartela.id, formData);
      updateCartela(response.data);
      setShowEditModal(false);
      setEditingCartela(null);
      resetForm();
      showToast('Cartela updated successfully!', 'success');
    } catch (error: any) {
      if (error.response?.data?.error) {
        showToast(error.response.data.error, 'error');
      } else {
        showToast('Failed to update cartela. Please try again.', 'error');
      }
    }
  };

  const handleDeleteCartela = (cartela: Cartela) => {
    setDeletingCartela(cartela);
    setShowDeleteModal(true);
  };

  const confirmDeleteCartela = async () => {
    if (!deletingCartela?.id) return;
    
    try {
      await apiClient.deleteCartela(deletingCartela.id);
      removeCartela(deletingCartela.id);
      setShowDeleteModal(false);
      setDeletingCartela(null);
      showToast('Cartela deleted successfully!', 'success');
    } catch (error) {
      showToast('Failed to delete cartela. Please try again.', 'error');
    }
  };

  const handleToggleActive = async (cartela: Cartela) => {
    try {
      await apiClient.toggleCartelaStatus(cartela.id, !cartela.isActive);
      showToast(`Cartela ${!cartela.isActive ? 'activated' : 'deactivated'} successfully!`, 'success');
    } catch (error) {
      showToast('Failed to update cartela status. Please try again.', 'error');
    }
  };

  const handleClearAllCartelas = async () => {
    if (!cashierId) return;
    
    try {
      for (const cartela of cartelas) {
        await apiClient.deleteCartela(cartela.id);
      }
      clearAllCartelas();
    } catch (error) {
      showToast('Failed to clear cartelas. Please try again.', 'error');
    }
  };

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value);
    const newPattern = formData.pattern.map((row, r) =>
      row.map((cell, c) => {
        if (r === rowIndex && c === colIndex) {
          return numValue;
        }
        return cell;
      })
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
            <span>Add Cartela</span>
          </button>

          {cartelas.length > 0 && (
            <button
              onClick={handleClearAllCartelas}
              className="p-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg border border-red-200"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {cartelas.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Cartelas Found</h3>
        </div>
      )}

      {/* Cartelas Grid */}
      {cartelas.length > 0 && (
        <div className="max-h-96 overflow-y-auto border border-green-200 rounded-lg p-4 bg-green-50">
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
            {cartelas
              .sort((a, b) => a.cartelaId - b.cartelaId)
              .map((cartela) => (
          <div
            key={cartela.id}
            onClick={() => openDetailModal(cartela)}
                className="bg-white border-2 border-green-200 rounded-lg p-2 shadow-sm hover:shadow-md transition-all duration-200 hover:border-green-300 cursor-pointer"
          >
            <div className="text-center">
                  <h4 className="font-bold text-gray-900 text-sm mb-1">Cartela {cartela.cartelaId}</h4>
                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                cartela.isActive
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {cartela.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-2/3 max-w-sm shadow-2xl border border-green-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Create Cartela</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex gap-6">
              {/* Left side - Cartela content */}
              <div className="flex-1">
                <div className="flex justify-center mb-4">
                  <CartelaGrid 
                    pattern={formData.pattern} 
                    interactive={true} 
                    size="large"
                    onCellChange={handleCellChange}
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-semibold text-gray-900">Cartela ID:</label>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => {
                            const newId = Math.max(1, formData.cartelaId - 1);
                            updateFormData({ cartelaId: newId });
                          }}
                          className="px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-sm transition-colors"
                        >
                          -
                        </button>
                <input
                  type="number"
                  min="1"
                  max="210"
                  value={formData.cartelaId}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (!isNaN(value) && value >= 1 && value <= 210) {
                              updateFormData({ cartelaId: value });
                            }
                          }}
                          className={`w-16 px-2 py-1 border rounded text-center text-sm text-gray-900 focus:outline-none focus:ring-2 ${
                            formData.cartelaId < 1 || formData.cartelaId > 210
                              ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500'
                              : 'border-green-200 focus:ring-green-500 focus:border-green-500'
                          }`}
                        />
                        <button
                          onClick={() => {
                            const newId = Math.min(210, formData.cartelaId + 1);
                            updateFormData({ cartelaId: newId });
                          }}
                          className="px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-sm transition-colors"
                        >
                          +
                        </button>
                      </div>
              </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => updateFormData({ isActive: e.target.checked })}
                        className="w-4 h-4 text-green-600 border-green-300 rounded focus:ring-green-500"
                      />
                      <label htmlFor="isActive" className="text-sm font-semibold text-gray-900">
                        Active
                </label>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right side - Vertical action buttons */}
              <div className="flex flex-col justify-center space-y-2 w-16">
                <button
                  type="button"
                  onClick={generatePattern}
                  className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium transition-all duration-200"
                >
                  Generate
                </button>
                
              <button
                  type="button"
                  onClick={clearPattern}
                  className="px-2 py-1 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium transition-all duration-200"
              >
                  Clear
              </button>
                
              <button
                  onClick={handleCreateCartela}
                disabled={isCreating}
                  className={`px-2 py-1 text-xs rounded-lg font-medium transition-all duration-200 ${
                  isCreating
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {isCreating ? 'Creating...' : 'Create'}
              </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingCartela && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-2/3 max-w-sm shadow-2xl border border-green-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Edit Cartela</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex gap-6">
              {/* Left side - Cartela content */}
              <div className="flex-1">
                <div className="flex justify-center mb-4">
                  <CartelaGrid 
                    pattern={formData.pattern} 
                    interactive={true} 
                    size="large"
                    onCellChange={handleCellChange}
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-semibold text-gray-900">Cartela ID:</label>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => {
                            const newId = Math.max(1, formData.cartelaId - 1);
                            updateFormData({ cartelaId: newId });
                          }}
                          className="px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-sm transition-colors"
                        >
                          -
                        </button>
                <input
                  type="number"
                  min="1"
                  max="210"
                  value={formData.cartelaId}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (!isNaN(value) && value >= 1 && value <= 210) {
                              updateFormData({ cartelaId: value });
                            }
                          }}
                          className={`w-16 px-2 py-1 border rounded text-center text-sm text-gray-900 focus:outline-none focus:ring-2 ${
                            formData.cartelaId < 1 || formData.cartelaId > 210
                              ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500'
                              : 'border-green-200 focus:ring-green-500 focus:border-green-500'
                          }`}
                        />
                        <button
                          onClick={() => {
                            const newId = Math.min(210, formData.cartelaId + 1);
                            updateFormData({ cartelaId: newId });
                          }}
                          className="px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-sm transition-colors"
                        >
                          +
                        </button>
                      </div>
              </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="editIsActive"
                        checked={formData.isActive}
                        onChange={(e) => updateFormData({ isActive: e.target.checked })}
                        className="w-4 h-4 text-green-600 border-green-300 rounded focus:ring-green-500"
                      />
                      <label htmlFor="editIsActive" className="text-sm font-semibold text-gray-900">
                        Active
                </label>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right side - Vertical action buttons */}
              <div className="flex flex-col justify-center space-y-2 w-16">
                <button
                  type="button"
                  onClick={generatePattern}
                  className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium transition-all duration-200"
                >
                  Generate
                </button>
                
              <button
                  type="button"
                  onClick={clearPattern}
                  className="px-2 py-1 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium transition-all duration-200"
              >
                  Clear
              </button>
                
              <button
                onClick={handleUpdateCartela}
                  disabled={isCreating}
                  className={`px-2 py-1 text-xs rounded-lg font-medium transition-all duration-200 ${
                    isCreating
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {isCreating ? 'Updating...' : 'Update'}
              </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedCartela && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-2/3 max-w-sm shadow-2xl border border-green-200">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-2xl font-bold text-gray-900">Cartela {selectedCartela.cartelaId}</h4>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
                        <div className="flex gap-4">
              {/* Left side - Cartela content */}
              <div className="flex-1">
                <div className="flex justify-center mb-3">
                  <CartelaGrid 
                    pattern={selectedCartela.pattern} 
                    interactive={false} 
                    size="medium"
                  />
              </div>
              
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1.5 rounded-lg font-medium text-sm ${
                    selectedCartela.isActive
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}>
                    {selectedCartela.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-sm text-gray-600">
                    Created: {new Date(selectedCartela.createdAt).toLocaleDateString()}
                  </span>
                  </div>
                </div>
              </div>
              
              {/* Right side - Vertical action buttons */}
              <div className="flex flex-col justify-center space-y-2 w-14">
                <button
                  onClick={async () => {
                    await handleToggleActive(selectedCartela);
                    setShowDetailModal(false);
                  }}
                  className={`px-1.5 py-0.5 text-xs rounded font-medium transition-all duration-200 ${
                    selectedCartela.isActive
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {selectedCartela.isActive ? 'Active' : 'Inactive'}
                </button>
                
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    openEditModal(selectedCartela);
                  }}
                  className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 font-medium transition-all duration-200"
                >
                  Edit
                </button>
                
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleDeleteCartela(selectedCartela);
                  }}
                  className="px-1.5 py-0.5 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium transition-all duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && deletingCartela && (
        <DeleteModal
          item={deletingCartela}
          title="Delete Cartela"
          message="Are you sure you want to delete Cartela"  
          itemName={(cartela) => `Cartela ${cartela.cartelaId}`}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingCartela(null);
          }}
          onConfirm={confirmDeleteCartela}
          confirmButtonText="Delete Cartela"
        />
      )}
    </div>
  );
} 