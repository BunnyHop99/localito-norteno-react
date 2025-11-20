import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export default function Alert({
  type = 'info',
  title,
  message,
  dismissible = false,
  onDismiss,
  action,
  className = ''
}) {
  const config = {
    success: {
      icon: CheckCircle,
      className: 'bg-green-50 border-green-200 text-green-800',
      iconClassName: 'text-green-500',
      titleClassName: 'text-green-900'
    },
    error: {
      icon: XCircle,
      className: 'bg-red-50 border-red-200 text-red-800',
      iconClassName: 'text-red-500',
      titleClassName: 'text-red-900'
    },
    warning: {
      icon: AlertCircle,
      className: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      iconClassName: 'text-yellow-500',
      titleClassName: 'text-yellow-900'
    },
    info: {
      icon: Info,
      className: 'bg-blue-50 border-blue-200 text-blue-800',
      iconClassName: 'text-blue-500',
      titleClassName: 'text-blue-900'
    }
  };

  const { icon: Icon, className: alertClassName, iconClassName, titleClassName } = config[type];

  return (
    <div className={`p-4 border rounded-lg ${alertClassName} ${className}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconClassName}`} />
        
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={`text-sm font-semibold mb-1 ${titleClassName}`}>
              {title}
            </h3>
          )}
          {message && (
            <p className="text-sm">{message}</p>
          )}
          {action && (
            <div className="mt-3">
              {action}
            </div>
          )}
        </div>

        {dismissible && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 hover:bg-black hover:bg-opacity-10 rounded p-1 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

// Alert con lista
export function AlertList({ type = 'info', title, items, dismissible, onDismiss }) {
  return (
    <Alert
      type={type}
      title={title}
      dismissible={dismissible}
      onDismiss={onDismiss}
      message={
        <ul className="list-disc list-inside space-y-1 mt-2">
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      }
    />
  );
}

// Banner alert (full width)
export function BannerAlert({ type = 'info', message, action, onDismiss }) {
  const config = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    warning: 'bg-yellow-600 text-white',
    info: 'bg-blue-600 text-white'
  };

  return (
    <div className={`${config[type]} px-4 py-3`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <p className="text-sm font-medium flex-1">{message}</p>
        <div className="flex items-center gap-3">
          {action}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}