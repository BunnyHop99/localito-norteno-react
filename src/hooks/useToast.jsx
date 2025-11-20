import { createContext, useContext, useState, useCallback } from 'react';
import { ToastContainer } from '../components/common/Toast';

const ToastContext = createContext(null);

export const ToastProvider = ({ children, position = 'top-right', defaultDuration = 5000 }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = defaultDuration) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, duration }]);
    return id;
  }, [defaultDuration]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const toast = {
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    warning: (message, duration) => addToast(message, 'warning', duration),
    info: (message, duration) => addToast(message, 'info', duration),
    dismiss: removeToast,
    dismissAll: () => setToasts([])
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer 
        toasts={toasts} 
        removeToast={removeToast}
        position={position}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe usarse dentro de ToastProvider');
  }
  return context;
};