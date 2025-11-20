import { AlertCircle } from 'lucide-react';

export default function Input({
  label,
  error,
  hint,
  required = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  containerClassName = '',
  ...props
}) {
  const inputClasses = `
    w-full px-4 py-2.5 border rounded-lg 
    focus:outline-none focus:ring-2 transition-all
    disabled:bg-gray-100 disabled:cursor-not-allowed
    ${error 
      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
    }
    ${Icon && iconPosition === 'left' ? 'pl-10' : ''}
    ${Icon && iconPosition === 'right' ? 'pr-10' : ''}
    ${className}
  `;

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        )}
        
        <input
          className={inputClasses}
          {...props}
        />
        
        {Icon && iconPosition === 'right' && (
          <Icon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        )}
      </div>
      
      {error && (
        <div className="flex items-center gap-1 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
      
      {hint && !error && (
        <p className="text-sm text-gray-500">{hint}</p>
      )}
    </div>
  );
}

// Componente Select mejorado
export function Select({
  label,
  error,
  hint,
  required = false,
  options = [],
  placeholder = 'Seleccionar...',
  className = '',
  containerClassName = '',
  ...props
}) {
  const selectClasses = `
    w-full px-4 py-2.5 border rounded-lg 
    focus:outline-none focus:ring-2 transition-all
    disabled:bg-gray-100 disabled:cursor-not-allowed
    ${error 
      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
    }
    ${className}
  `;

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <select className={selectClasses} {...props}>
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <div className="flex items-center gap-1 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
      
      {hint && !error && (
        <p className="text-sm text-gray-500">{hint}</p>
      )}
    </div>
  );
}

// Componente Textarea mejorado
export function Textarea({
  label,
  error,
  hint,
  required = false,
  rows = 4,
  className = '',
  containerClassName = '',
  ...props
}) {
  const textareaClasses = `
    w-full px-4 py-2.5 border rounded-lg 
    focus:outline-none focus:ring-2 transition-all
    disabled:bg-gray-100 disabled:cursor-not-allowed resize-none
    ${error 
      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
    }
    ${className}
  `;

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        rows={rows}
        className={textareaClasses}
        {...props}
      />
      
      {error && (
        <div className="flex items-center gap-1 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
      
      {hint && !error && (
        <p className="text-sm text-gray-500">{hint}</p>
      )}
    </div>
  );
}

// Componente Checkbox mejorado
export function Checkbox({
  label,
  error,
  hint,
  className = '',
  containerClassName = '',
  ...props
}) {
  return (
    <div className={`space-y-1 ${containerClassName}`}>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          className={`
            w-5 h-5 text-blue-600 border-gray-300 rounded
            focus:ring-2 focus:ring-blue-500 focus:ring-offset-0
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors cursor-pointer
            ${className}
          `}
          {...props}
        />
        {label && (
          <span className="text-sm font-medium text-gray-700">{label}</span>
        )}
      </label>
      
      {error && (
        <div className="flex items-center gap-1 text-red-600 text-sm ml-7">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
      
      {hint && !error && (
        <p className="text-sm text-gray-500 ml-7">{hint}</p>
      )}
    </div>
  );
}

// Componente Radio mejorado
export function Radio({
  label,
  options = [],
  value,
  onChange,
  error,
  hint,
  name,
  containerClassName = '',
}) {
  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="space-y-2">
        {options.map((option, index) => (
          <label key={index} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-sm text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
      
      {error && (
        <div className="flex items-center gap-1 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
      
      {hint && !error && (
        <p className="text-sm text-gray-500">{hint}</p>
      )}
    </div>
  );
}