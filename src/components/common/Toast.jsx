import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { createPortal } from 'react-dom';

export function Toast({ type = 'info', message, onClose, duration = 5000, position = 'top-right' }) {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const config = {
    success: {
      icon: CheckCircle,
      className: 'bg-green-50 border-green-200 text-green-800',
      iconClassName: 'text-green-500'
    },
    error: {
      icon: XCircle,
      className: 'bg-red-50 border-red-200 text-red-800',
      iconClassName: 'text-red-500'
    },
    warning: {
      icon: AlertCircle,
      className: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      iconClassName: 'text-yellow-500'
    },
    info: {
      icon: Info,
      className: 'bg-blue-50 border-blue-200 text-blue-800',
      iconClassName: 'text-blue-500'
    }
  };

  const { icon: Icon, className, iconClassName } = config[type];

  const positions = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  return (
    <div 
      className={`
        ${className} 
        border rounded-lg p-4 shadow-lg 
        flex items-start gap-3 min-w-[300px] max-w-md
        animate-slide-in
      `}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconClassName}`} />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 hover:bg-black hover:bg-opacity-10 rounded p-1 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}

// Componente para el contenedor de toasts
export function ToastContainer({ toasts, removeToast, position = 'top-right' }) {
  const positions = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  const content = (
    <div className={`fixed ${positions[position]} z-50 space-y-2`}>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );

  return createPortal(content, document.body);
}