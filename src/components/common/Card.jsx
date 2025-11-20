export default function Card({ 
  children, 
  className = '', 
  title, 
  subtitle,
  action,
  footer,
  padding = true,
  hoverable = false,
  bordered = true
}) {
  return (
    <div 
      className={`
        bg-white rounded-lg shadow-sm
        ${bordered ? 'border border-gray-200' : ''}
        ${hoverable ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}
        ${className}
      `}
    >
      {(title || subtitle || action) && (
        <div className="px-6 py-4 border-b border-gray-200 flex items-start justify-between">
          <div className="flex-1">
            {title && <h2 className="text-lg font-semibold text-gray-800">{title}</h2>}
            {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          </div>
          {action && <div className="flex-shrink-0 ml-4">{action}</div>}
        </div>
      )}
      
      <div className={padding ? 'p-6' : ''}>
        {children}
      </div>

      {footer && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          {footer}
        </div>
      )}
    </div>
  );
}

// Variantes de Card
export function CardGrid({ children, columns = 3, gap = 6, className = '' }) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const gapClass = `gap-${gap}`;

  return (
    <div className={`grid ${gridCols[columns]} ${gapClass} ${className}`}>
      {children}
    </div>
  );
}

export function CardSkeleton({ lines = 3 }) {
  return (
    <Card>
      <div className="animate-pulse space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-gray-200 rounded"
            style={{ width: `${Math.random() * 40 + 60}%` }}
          />
        ))}
      </div>
    </Card>
  );
}