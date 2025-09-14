'use client';

import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  showBalance?: boolean;
  balance?: string;
}

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true,
  showBalance = false,
  balance
}: ModalProps) => {
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-2xl w-11/12 h-5/6';
      case 'md':
        return 'max-w-4xl w-11/12 h-5/6';
      case 'lg':
        return 'max-w-6xl w-11/12 h-5/6';
      case 'xl':
        return 'max-w-7xl w-11/12 h-5/6';
      default:
        return 'max-w-4xl w-11/12 h-5/6';
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Modal */}
      <div className="flex min-h-full items-start justify-center p-2 pt-8 ">
        <div className={`relative ${getSizeClasses()} bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col`}>
          {/* Header */}
                     <div className="bg-green-50 text-green-500 px-6 py-4 rounded-t-lg flex items-start justify-between">
             <h2 className="text-lg font-semibold">{title}</h2>
             <div className="flex flex-col items-end">
               {showCloseButton && (
                 <button
                   onClick={onClose}
                   className="text-green-500 hover:text-green-700 transition-colors duration-200 mb-1"
                 >
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                   </svg>
                 </button>
               )}
               {showBalance && (
                 <div className="text-green-700 text-sm">
                   Balance: <span className="font-medium">{balance || '0.00'}</span>
                 </div>
               )}
             </div>
           </div>
          
          {/* Content */}
          <div className="px-6 py-4 flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Modal; 