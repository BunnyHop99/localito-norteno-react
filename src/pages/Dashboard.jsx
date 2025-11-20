import { useState, useEffect } from 'react';
import { DollarSign, Package, ShoppingCart, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { reportesService } from '../services/reportesService';
import { inventarioService } from '../services/inventarioService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [metricas, setMetricas] = useState(null);
  const [productosStockBajo, setProductosStockBajo] = useState([]);
  const [ventasMensuales, setVentasMensuales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    cargarDatos();
    
    // Actualizar cada 5 minutos
    const interval = setInterval(() => {
      cargarDatos(true);
    }, 300000);
    
    return () => clearInterval(interval);
  }, []);

  const cargarDatos = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Cargar métricas del dashboard
      const metricasData = await reportesService.getDashboardMetricas();
      setMetricas(metricasData);

      // Cargar productos con stock bajo
      const stockBajo = await inventarioService.getProductosStockBajo();
      setProductosStockBajo(Array.isArray(stockBajo) ? stockBajo : stockBajo.results || []);

      // Cargar datos de ventas mensuales para gráfica
      const fechaFin = new Date();
      const fechaInicio = new Date();
      fechaInicio.setMonth(fechaInicio.getMonth() - 6);

      const ventasData = await reportesService.getVentasGeneral({
        fecha_inicio: fechaInicio.toISOString().split('T')[0],
        fecha_fin: fechaFin.toISOString().split('T')[0]
      });

      // Transformar datos para la gráfica
      const ventasTransformadas = (ventasData.ventas_por_dia || []).map(v => ({
        fecha: new Date(v.dia).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }),
        ventas: parseFloat(v.total || 0),
        cantidad: v.cantidad || 0
      }));

      setVentasMensuales(ventasTransformadas);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError(err.response?.data?.error || 'Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    cargarDatos(true);
  };

  if (loading) {
    return <LoadingSpinner message="Cargando dashboard..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={() => cargarDatos()} />;
  }

  // Calcular tendencias
  const calcularTendencia = (actual, anterior) => {
    if (!anterior || anterior === 0) return 0;
    return ((actual - anterior) / anterior * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Resumen general de tu negocio - {new Date().toLocaleDateString('es-MX', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium">Actualizar</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Ventas del Mes"
          value={`$${(metricas?.mes_actual?.ventas || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
          trend="up"
          trendValue={`${metricas?.mes_actual?.num_ventas || 0} ventas`}
          color="green"
        />
        <StatCard
          title="Productos en Stock"
          value={metricas?.inventario?.total_productos || 0}
          icon={Package}
          subtitle={`${metricas?.inventario?.stock_bajo || 0} con stock bajo`}
          color="blue"
        />
        <StatCard
          title="Ventas Hoy"
          value={metricas?.hoy?.num_ventas || 0}
          icon={ShoppingCart}
          trend="up"
          trendValue={`$${(metricas?.hoy?.ventas || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          color="purple"
        />
        <StatCard
          title="Utilidad del Mes"
          value={`$${(metricas?.mes_actual?.utilidad || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={TrendingUp}
          trend="up"
          trendValue={`${metricas?.mes_actual?.num_ventas || 0} transacciones`}
          color="orange"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card title="Ventas Últimos 6 Meses">
          {ventasMensuales.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ventasMensuales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="fecha" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value) => [`$${value.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 'Ventas']}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="ventas" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  name="Ventas"
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No hay datos disponibles
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card title="Acciones Rápidas">
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => navigate('/ventas')}
              className="p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all hover:shadow-md text-left group"
            >
              <ShoppingCart className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-900">Nueva Venta</p>
              <p className="text-xs text-gray-600 mt-1">Registrar venta</p>
            </button>
            <button 
              onClick={() => navigate('/inventario')}
              className="p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-all hover:shadow-md text-left group"
            >
              <Package className="w-8 h-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-900">Nuevo Producto</p>
              <p className="text-xs text-gray-600 mt-1">Agregar al inventario</p>
            </button>
            <button 
              onClick={() => navigate('/reportes')}
              className="p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-all hover:shadow-md text-left group"
            >
              <DollarSign className="w-8 h-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-900">Ver Reportes</p>
              <p className="text-xs text-gray-600 mt-1">Análisis detallado</p>
            </button>
            <button 
              onClick={() => navigate('/facturacion')}
              className="p-4 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-all hover:shadow-md text-left group"
            >
              <TrendingUp className="w-8 h-8 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-900">Facturación</p>
              <p className="text-xs text-gray-600 mt-1">Emitir CFDI</p>
            </button>
          </div>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {productosStockBajo.length > 0 && (
        <Card 
          title="Alertas de Inventario"
          action={
            <span className="text-sm text-red-600 font-medium">
              {productosStockBajo.length} producto{productosStockBajo.length !== 1 ? 's' : ''} con stock bajo
            </span>
          }
        >
          <div className="space-y-3">
            {productosStockBajo.slice(0, 5).map((producto) => (
              <div 
                key={producto.id} 
                className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-800">{producto.nombre}</p>
                    <p className="text-sm text-gray-600">
                      Código: {producto.codigo} | Stock actual: <span className="font-semibold text-red-600">{producto.stock}</span> | 
                      Mínimo: {producto.stock_minimo}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/inventario`)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                >
                  Reabastecer
                </button>
              </div>
            ))}
            {productosStockBajo.length > 5 && (
              <button 
                onClick={() => navigate('/inventario')}
                className="w-full py-2 text-center text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Ver todos los productos con stock bajo ({productosStockBajo.length})
              </button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}