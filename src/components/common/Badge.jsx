import { X } from 'lucide-react';

export default function Badge({
  children,
  variant = 'primary',
  size = 'md',
  rounded = 'full',
  icon: Icon,
  onRemove,
  className = ''
}) {
  const variants = {
    primary: 'bg-blue-100 text-blue-800 border-blue-200',
    secondary: 'bg-gray-100 text-gray-800 border-gray-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    info: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    pink: 'bg-pink-100 text-pink-800 border-pink-200',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  const roundedStyles = {
    none: 'rounded-none',
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 font-medium border
        ${variants[variant]}
        ${sizes[size]}
        ${roundedStyles[rounded]}
        ${className}
      `}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="hover:bg-black hover:bg-opacity-10 rounded-full p-0.5 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}

// Badge con punto de estado
export function StatusBadge({ status, label, size = 'md' }) {
  const statusColors = {
    active: 'bg-green-500',
    inactive: 'bg-gray-400',
    pending: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  return (
    <span className="inline-flex items-center gap-2">
      <span className={`${sizes[size]} ${statusColors[status]} rounded-full`} />
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </span>
  );
}

// Badge con número
export function NumberBadge({ count, variant = 'primary', max = 99 }) {
  const variants = {
    primary: 'bg-blue-600 text-white',
    success: 'bg-green-600 text-white',
    danger: 'bg-red-600 text-white',
    warning: 'bg-yellow-600 text-white',
  };

  const displayCount = count > max ? `${max}+` : count;

  return (
    <span
      className={`
        inline-flex items-center justify-center
        min-w-[1.25rem] h-5 px-1.5
        text-xs font-bold rounded-full
        ${variants[variant]}
      `}
    >
      {displayCount}
    </span>
  );
}