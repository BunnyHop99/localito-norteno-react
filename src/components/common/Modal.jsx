import { X } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Button from './Button';

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  footer,
  className = ''
}) {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4'
  };

  // Cerrar con ESC
  useEffect(() => {
    if (!closeOnEscape) return;
    
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        onClick={closeOnOverlayClick ? onClose : undefined}
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm"
        aria-hidden="true"
      />
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          onClick={(e) => e.stopPropagation()}
          className={`
            relative bg-white rounded-xl shadow-2xl w-full ${sizes[size]}
            transform transition-all
            max-h-[90vh] flex flex-col
            animate-modal-in
            ${className}
          `}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 id="modal-title" className="text-xl font-semibold text-gray-900">
              {title}
            </h3>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Cerrar modal"
              >
                <X size={20} />
              </button>
            )}
          </div>
          
          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1">
            {children}
          </div>

          {/* Footer (opcional) */}
          {footer && (
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

// Componente auxiliar para confirmar acciones
export function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = '¿Estás seguro?',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  loading = false
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button 
            variant={variant} 
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="text-gray-700">{message}</p>
    </Modal>
  );
}