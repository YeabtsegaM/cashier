'use client';

export interface DeleteModalProps<T> {
  item: T;
  title: string;
  message: string;
  itemName: (item: T) => string;
  onClose: () => void;
  onConfirm: () => void;
  confirmButtonText?: string;
  cancelButtonText?: string;
  className?: string;
}

export function DeleteModal<T>({
  item,
  title,
  message,
  itemName,
  onClose,
  onConfirm,
  confirmButtonText = 'Delete',
  cancelButtonText = 'Cancel',
  className = ''
}: DeleteModalProps<T>) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Modal */}
      <div className={`bg-white rounded-lg shadow-2xl w-full max-w-md sm:max-w-lg border border-gray-200 ${className}`}>
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{title}</h3>
        </div>
        
        {/* Content */}
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center mb-4">
            <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm sm:text-base font-medium text-gray-900">Confirm Deletion</p>
              <p className="text-xs sm:text-sm text-gray-500">This action cannot be undone</p>
            </div>
          </div>
          
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            {message.replace('{name}', itemName(item))}
          </p>
          
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              {cancelButtonText}
            </button>
            <button
              onClick={onConfirm}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
            >
              {confirmButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 