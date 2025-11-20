import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, ChevronDown, ChevronUp } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

export default function Table({ 
  columns, 
  data, 
  onRowClick,
  pagination = true,
  pageSize: initialPageSize = 10,
  loading = false,
  emptyMessage = 'No hay datos disponibles',
  searchable = false,
  searchPlaceholder = 'Buscar...',
  sortable = false,
  stickyHeader = false,
  striped = false,
  hoverable = true,
  compact = false
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Filtrar datos por búsqueda
  const filteredData = useMemo(() => {
    if (!searchable || !searchTerm) return data;

    return data.filter(row => {
      return columns.some(column => {
        const value = row[column.accessor];
        return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, searchTerm, searchable, columns]);

  // Ordenar datos
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortable) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'string') {
        return sortConfig.direction === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortConfig.direction === 'asc'
        ? aVal < bVal ? -1 : 1
        : bVal < aVal ? -1 : 1;
    });

    return sorted;
  }, [filteredData, sortConfig, sortable]);

  // Calcular paginación
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = pagination ? sortedData.slice(startIndex, endIndex) : sortedData;

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleSort = (key) => {
    if (!sortable) return;
    
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  // Cambiar página cuando cambian los datos filtrados
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  if (loading) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  return (
    <div className="space-y-4">
      {/* Búsqueda y controles */}
      {searchable && (
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {pagination && (
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5 por página</option>
              <option value={10}>10 por página</option>
              <option value={25}>25 por página</option>
              <option value={50}>50 por página</option>
              <option value={100}>100 por página</option>
            </select>
          )}
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full">
          <thead className={`bg-gray-50 ${stickyHeader ? 'sticky top-0 z-10' : ''}`}>
            <tr className="border-b border-gray-200">
              {columns.map((column, index) => (
                <th
                  key={index}
                  onClick={() => column.accessor && handleSort(column.accessor)}
                  className={`
                    px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider
                    ${sortable && column.accessor ? 'cursor-pointer hover:bg-gray-100 select-none' : ''}
                    ${compact ? 'py-2' : ''}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.header}</span>
                    {sortable && column.accessor && getSortIcon(column.accessor)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {currentData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                className={`
                  ${onRowClick ? 'cursor-pointer' : ''}
                  ${hoverable ? 'hover:bg-gray-50' : ''}
                  ${striped && rowIndex % 2 === 1 ? 'bg-gray-25' : ''}
                  transition-colors
                `}
              >
                {columns.map((column, colIndex) => (
                  <td 
                    key={colIndex} 
                    className={`px-6 text-sm text-gray-700 ${compact ? 'py-2' : 'py-4'}`}
                  >
                    {column.cell ? column.cell(row) : row[column.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {currentData.map((row, index) => (
          <div
            key={index}
            onClick={() => onRowClick && onRowClick(row)}
            className={`
              bg-white p-4 rounded-lg shadow border border-gray-200
              ${onRowClick ? 'cursor-pointer active:bg-gray-50' : ''}
            `}
          >
            {columns.map((col, colIndex) => (
              <div key={colIndex} className="flex justify-between py-2 border-b last:border-0">
                <span className="font-medium text-gray-600 text-sm">{col.header}:</span>
                <span className="text-gray-900 text-sm text-right">
                  {col.cell ? col.cell(row) : row[col.accessor]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
      
      {/* Empty State */}
      {sortedData.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">{emptyMessage}</p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      )}

      {/* Paginación */}
      {pagination && sortedData.length > 0 && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white border border-gray-200 rounded-lg">
          <div className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
            <span className="font-medium">{Math.min(endIndex, sortedData.length)}</span> de{' '}
            <span className="font-medium">{sortedData.length}</span> resultados
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Primera página"
            >
              <ChevronsLeft size={20} />
            </button>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Página anterior"
            >
              <ChevronLeft size={20} />
            </button>
            
            <span className="px-4 py-2 text-sm font-medium">
              Página {currentPage} de {totalPages}
            </span>
            
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Página siguiente"
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Última página"
            >
              <ChevronsRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}