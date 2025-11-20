import { useState, useEffect } from 'react';
import { BarChart3, Download, Calendar, TrendingUp, DollarSign, Package, RefreshCw } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { reportesService } from '../services/reportesService';
import { useToast } from '../hooks/useToast';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'];

export default function Reportes() {
  const toast = useToast();
  const [ventasGeneral, setVentasGeneral] = useState(null);
  const [productosMasVendidos, setProductosMasVendidos] = useState([]);
  const [categoriasRendimiento, setCategoriasRendimiento] = useState([]);
  const [analisisFinanciero, setAnalisisFinanciero] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [periodo, setPeriodo] = useState('30'); // días
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);

  // Cargar datos al montar y cuando cambia el periodo
  useEffect(() => {
    cargarDatos();
  }, [periodo]);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      cargarDatos(true); // true = es refresh automático
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [periodo]);

  const cargarDatos = async (esAutoRefresh = false) => {
    try {
      if (!esAutoRefresh) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);
      
      // CRÍTICO: Asegurar que incluya el día actual
      const fechaFin = new Date();
      // Agregar un día para asegurar que incluya HOY
      fechaFin.setDate(fechaFin.getDate() + 1);
      
      const fechaInicio = new Date();
      
      if (periodo === '7') {
        fechaInicio.setDate(fechaInicio.getDate() - 7);
      } else if (periodo === '30') {
        fechaInicio.setDate(fechaInicio.getDate() - 30);
      } else if (periodo === '90') {
        fechaInicio.setDate(fechaInicio.getDate() - 90);
      } else if (periodo === '180') {
        fechaInicio.setDate(fechaInicio.getDate() - 180);
      }

      // Función para convertir fecha a formato YYYY-MM-DD en zona horaria local
      const formatearFechaLocal = (fecha) => {
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const fechaInicioStr = formatearFechaLocal(fechaInicio);
      const fechaFinStr = formatearFechaLocal(fechaFin);

      console.log('📅 Cargando reportes:', {
        periodo: `${periodo} días`,
        fechaInicio: fechaInicioStr,
        fechaFin: fechaFinStr,
        esAutoRefresh
      });

      const [ventasData, productosData, categoriasData, financieroData] = await Promise.all([
        reportesService.getVentasGeneral({
          fecha_inicio: fechaInicioStr,
          fecha_fin: fechaFinStr
        }),
        reportesService.getProductosMasVendidos({ dias: parseInt(periodo) }),
        reportesService.getRendimientoCategorias({ dias: parseInt(periodo) }),
        reportesService.getAnalisisFinanciero({ meses: periodo === '180' ? 6 : 3 })
      ]);
      
      console.log('📊 Datos recibidos:', {
        ventas: ventasData,
        productos: productosData,
        categorias: categoriasData,
        financiero: financieroData
      });

      setVentasGeneral(ventasData);
      setProductosMasVendidos(Array.isArray(productosData) ? productosData : []);
      setCategoriasRendimiento(Array.isArray(categoriasData) ? categoriasData : []);
      setAnalisisFinanciero(financieroData);
      setUltimaActualizacion(new Date());

      if (esAutoRefresh) {
        console.log('🔄 Datos actualizados automáticamente');
      }
    } catch (err) {
      console.error('❌ Error al cargar reportes:', err);
      setError(err.response?.data?.error || 'Error al cargar los reportes');
      if (!esAutoRefresh) {
        toast.error('Error al cargar los datos');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    toast.promise(
      cargarDatos(),
      {
        loading: 'Actualizando datos...',
        success: '✅ Datos actualizados',
        error: '❌ Error al actualizar'
      }
    );
  };

  const handleExportar = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: 'Generando reporte...',
        success: '¡Reporte generado! (funcionalidad en desarrollo)',
        error: 'Error al generar reporte'
      }
    );
  };

  if (loading) {
    return <LoadingSpinner message="Cargando reportes..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={cargarDatos} />;
  }

  // Transformar datos para las gráficas
  const ventasPorDia = (ventasGeneral?.ventas_por_dia || []).map(v => ({
    fecha: new Date(v.dia).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }),
    ventas: parseFloat(v.total || 0),
    cantidad: v.cantidad || 0
  }));

  const categoriasPie = categoriasRendimiento
    .filter(cat => parseFloat(cat.ventas_total || 0) > 0)
    .map(cat => ({
      nombre: cat.nombre,
      valor: parseFloat(cat.ventas_total || 0)
    }));

  const ventasMensuales = (analisisFinanciero?.ventas_mensuales || []).map(v => ({
    mes: new Date(v.mes).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' }),
    ingresos: parseFloat(v.ingresos || 0),
    ticket_promedio: parseFloat(v.ticket_promedio || 0),
    num_ventas: v.num_ventas || 0
  }));

  const formatCurrency = (value) => {
    return `$${value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-1">{label}</p>
          {payload.map((entry, index) => {
            const entryName = String(entry.name || '');
            const shouldFormatCurrency = 
              entryName.toLowerCase().includes('$') || 
              entryName.toLowerCase().includes('venta') || 
              entryName.toLowerCase().includes('ingreso') ||
              entryName.toLowerCase().includes('precio') ||
              entryName.toLowerCase().includes('total');
            
            return (
              <p key={index} style={{ color: entry.color }} className="text-sm">
                {entry.name}: {shouldFormatCurrency 
                  ? formatCurrency(entry.value) 
                  : entry.value}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-600">Análisis y estadísticas de tu negocio</p>
            {ultimaActualizacion && (
              <span className="text-xs text-gray-500">
                • Actualizado: {ultimaActualizacion.toLocaleTimeString('es-MX', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Actualizar datos"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Últimos 7 días</option>
            <option value="30">Últimos 30 días</option>
            <option value="90">Últimos 3 meses</option>
            <option value="180">Últimos 6 meses</option>
          </select>
          <Button icon={Download} onClick={handleExportar}>
            Exportar
          </Button>
        </div>
      </div>

      {/* Resumen Financiero */}
      <Card title="Resumen Financiero">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="w-6 h-6 text-blue-600 mr-2" />
              <p className="text-sm text-blue-600 font-medium">Ingresos Totales</p>
            </div>
            <h3 className="text-3xl font-bold text-blue-900">
              {formatCurrency(ventasGeneral?.estadisticas?.monto_total || 0)}
            </h3>
            <p className="text-sm text-blue-700 mt-2">
              {ventasGeneral?.estadisticas?.total_ventas || 0} transacciones
            </p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-6 h-6 text-green-600 mr-2" />
              <p className="text-sm text-green-600 font-medium">Utilidad Total</p>
            </div>
            <h3 className="text-3xl font-bold text-green-900">
              {formatCurrency(ventasGeneral?.estadisticas?.total_utilidad || 0)}
            </h3>
            <p className="text-sm text-green-700 mt-2">
              Margen promedio: {ventasGeneral?.estadisticas?.monto_total > 0 
                ? ((ventasGeneral?.estadisticas?.total_utilidad / ventasGeneral?.estadisticas?.monto_total) * 100).toFixed(1)
                : 0}%
            </p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Package className="w-6 h-6 text-purple-600 mr-2" />
              <p className="text-sm text-purple-600 font-medium">Ticket Promedio</p>
            </div>
            <h3 className="text-3xl font-bold text-purple-900">
              {formatCurrency(ventasGeneral?.estadisticas?.ticket_promedio || 0)}
            </h3>
            <p className="text-sm text-purple-700 mt-2">Por transacción</p>
          </div>
        </div>
      </Card>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ventas Diarias */}
        <Card title="Ventas Diarias">
          {ventasPorDia.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ventasPorDia}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="ventas" fill="#3b82f6" name="Ventas ($)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No hay datos de ventas para este período
            </div>
          )}
        </Card>

        {/* Productos Más Vendidos */}
        <Card title="Top 5 Productos">
          {productosMasVendidos.length > 0 ? (
            <div className="space-y-3">
              {productosMasVendidos.slice(0, 5).map((producto, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-700 font-bold text-sm">{idx + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{producto.nombre}</p>
                      <p className="text-sm text-gray-600">
                        {producto.cantidad_vendida} unidades
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(parseFloat(producto.total_ventas || 0))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No hay productos vendidos en este período
            </div>
          )}
        </Card>

        {/* Ventas por Categoría */}
        <Card title="Ventas por Categoría">
          {categoriasPie.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoriasPie}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ nombre, percent }) => `${nombre} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {categoriasPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No hay ventas por categoría en este período
            </div>
          )}
        </Card>

        {/* Tendencia Mensual */}
        <Card title="Tendencia de Ingresos">
          {ventasMensuales.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ventasMensuales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="ingresos" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Ingresos ($)" 
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No hay datos mensuales disponibles
            </div>
          )}
        </Card>
      </div>

      {/* Tabla de Categorías */}
      {categoriasRendimiento.length > 0 && (
        <Card title="Rendimiento por Categoría">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unidades
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ventas Totales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Productos Activos
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categoriasRendimiento.map((cat, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{cat.nombre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{cat.cantidad_vendida || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(parseFloat(cat.ventas_total || 0))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{cat.num_productos || 0}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
