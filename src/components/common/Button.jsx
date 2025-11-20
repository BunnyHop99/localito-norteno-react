import { Loader2 } from 'lucide-react';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon: Icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  ariaLabel,
  ...props
}) {
  const baseStyles = `
    inline-flex items-center justify-center gap-2 font-medium rounded-lg 
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `;
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white focus:ring-blue-500 shadow-sm hover:shadow-md',
    secondary: 'bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800 focus:ring-gray-400 shadow-sm hover:shadow-md',
    success: 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white focus:ring-green-500 shadow-sm hover:shadow-md',
    danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white focus:ring-red-500 shadow-sm hover:shadow-md',
    warning: 'bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white focus:ring-yellow-500 shadow-sm hover:shadow-md',
    info: 'bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 text-white focus:ring-cyan-500 shadow-sm hover:shadow-md',
    outline: 'border-2 border-blue-600 text-blue-600 bg-white hover:bg-blue-50 active:bg-blue-100 focus:ring-blue-500',
    ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-400',
    link: 'text-blue-600 hover:text-blue-700 hover:underline focus:ring-blue-500 p-0'
  };
  
  const sizes = {
    xs: 'px-2.5 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };
  
  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  const isDisabled = disabled || loading;
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`.trim()}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className={`${iconSizes[size]} animate-spin`} />
          <span>{typeof loading === 'string' ? loading : 'Cargando...'}</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className={iconSizes[size]} />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className={iconSizes[size]} />}
        </>
      )}
    </button>
  );
}