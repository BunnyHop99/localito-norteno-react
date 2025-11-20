import { useState, useEffect } from 'react';
import { Plus, Search, Calendar, DollarSign, ShoppingBag, TrendingUp, X, Minus, AlertCircle, ChevronDown, ChevronRight, Package } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { ventasService } from '../services/ventasService';
import { inventarioService } from '../services/inventarioService';
import { useToast } from '../hooks/useToast';

export default function Ventas() {
  const toast = useToast();
  const [sales, setSales] = useState([]);
  const [productos, setProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [estadisticas, setEstadisticas] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
  
  // Estados del carrito de venta
  const [carrito, setCarrito] = useState([]);
  const [clienteNombre, setClienteNombre] = useState('Público General');
  const [clienteRfc, setClienteRfc] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [buscarProducto, setBuscarProducto] = useState('');
  const [observaciones, setObservaciones] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [ventasData, productosData, estadisticasData] = await Promise.all([
        ventasService.getVentas(),
        inventarioService.getProductos(),
        ventasService.getEstadisticasHoy()
      ]);
      
      console.log('📊 Estadísticas recibidas:', estadisticasData);
      console.log('📦 Ventas recibidas:', ventasData);
      
      setSales(Array.isArray(ventasData) ? ventasData : ventasData.results || []);
      setProductos(Array.isArray(productosData) ? productosData : productosData.results || []);
      setEstadisticas(estadisticasData);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError(err.response?.data?.error || 'Error al cargar las ventas');
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (ventaId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(ventaId)) {
      newExpanded.delete(ventaId);
    } else {
      newExpanded.add(ventaId);
    }
    setExpandedRows(newExpanded);
  };

  const filteredSales = sales.filter(sale =>
    sale.folio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.cliente_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const productosFiltrados = productos.filter(p =>
    (p.nombre?.toLowerCase().includes(buscarProducto.toLowerCase()) ||
    p.codigo?.toLowerCase().includes(buscarProducto.toLowerCase())) &&
    p.stock > 0
  );

  const agregarAlCarrito = (producto) => {
    const itemExistente = carrito.find(item => item.producto.id === producto.id);
    
    if (itemExistente) {
      if (itemExistente.cantidad < producto.stock) {
        setCarrito(carrito.map(item =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        ));
        toast.success(`Cantidad actualizada: ${producto.nombre}`);
      } else {
        toast.error('No hay suficiente stock disponible');
      }
    } else {
      if (producto.stock > 0) {
        setCarrito([...carrito, {
          producto: producto,
          cantidad: 1,
          precio_unitario: parseFloat(producto.precio_venta)
        }]);
        toast.success(`Agregado al carrito: ${producto.nombre}`);
      } else {
        toast.error('Producto sin stock');
      }
    }
  };

  const eliminarDelCarrito = (productoId) => {
    const producto = carrito.find(item => item.producto.id === productoId);
    setCarrito(carrito.filter(item => item.producto.id !== productoId));
    toast.success(`Eliminado: ${producto.producto.nombre}`);
  };

  const actualizarCantidad = (productoId, nuevaCantidad) => {
    const item = carrito.find(i => i.producto.id === productoId);
    
    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(productoId);
      return;
    }
    
    if (nuevaCantidad > item.producto.stock) {
      toast.error(`Stock máximo disponible: ${item.producto.stock}`);
      return;
    }
    
    setCarrito(carrito.map(item =>
      item.producto.id === productoId
        ? { ...item, cantidad: nuevaCantidad }
        : item
    ));
  };

  const calcularSubtotal = () => {
    return carrito.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
  };

  const calcularIVA = () => {
    return calcularSubtotal() * 0.16;
  };

  const calcularTotal = () => {
    return calcularSubtotal() + calcularIVA();
  };

  const validarVenta = () => {
    if (carrito.length === 0) {
      toast.error('Agrega productos al carrito');
      return false;
    }

    if (!clienteNombre.trim()) {
      toast.error('Ingresa el nombre del cliente');
      return false;
    }

    if (clienteRfc && clienteRfc.trim()) {
      const rfcPattern = /^([A-ZÑ&]{3,4})\d{6}([A-Z0-9]{3})$/;
      if (!rfcPattern.test(clienteRfc.toUpperCase())) {
        toast.error('RFC inválido. Formato: XXXX######XXX');
        return false;
      }
    }

    return true;
  };

  const handleCompletarVenta = async () => {
    if (!validarVenta()) return;

    try {
      setSubmitting(true);
      
      const ventaData = {
        cliente_nombre: clienteNombre.trim(),
        cliente_rfc: clienteRfc?.trim() || null,
        metodo_pago: metodoPago,
        observaciones: observaciones.trim(),
        detalles: carrito.map(item => ({
          producto: item.producto.id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario
        }))
      };

      console.log('📤 Enviando venta:', ventaData);
      
      const nuevaVenta = await ventasService.createVenta(ventaData);
      
      console.log('📥 Respuesta del backend:', nuevaVenta);
      
      // Extraer folio de diferentes posibles ubicaciones
      const folio = nuevaVenta?.folio || 
                   nuevaVenta?.data?.folio || 
                   nuevaVenta?.id ||
                   'N/A';
      
      // Cerrar modal y limpiar PRIMERO
      setShowModal(false);
      limpiarFormulario();
      
      // Luego recargar datos
      await cargarDatos();
      
      // Mostrar éxito con folio
      toast.success(`✅ Venta completada - Folio: ${folio}`, 5000);
    } catch (err) {
      console.error('❌ Error al crear venta:', err);
      console.error('Error completo:', err.response?.data);
      
      const errorMsg = err.response?.data?.error || 
                      err.response?.data?.detail ||
                      err.response?.data?.message ||
                      'Error al completar la venta';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelarVenta = async (ventaId) => {
    if (!confirm('¿Estás seguro de cancelar esta venta? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await ventasService.cancelarVenta(ventaId);
      await cargarDatos();
      toast.success('Venta cancelada correctamente');
    } catch (err) {
      console.error('Error al cancelar venta:', err);
      toast.error(err.response?.data?.error || 'Error al cancelar la venta');
    }
  };

  const limpiarFormulario = () => {
    setCarrito([]);
    setClienteNombre('Público General');
    setClienteRfc('');
    setMetodoPago('efectivo');
    setObservaciones('');
    setBuscarProducto('');
  };

  if (loading) {
    return <LoadingSpinner message="Cargando ventas..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={cargarDatos} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ventas</h1>
          <p className="text-gray-600 mt-1">Gestiona las ventas de tu negocio</p>
        </div>
        <Button 
          icon={Plus} 
          onClick={() => {
            limpiarFormulario();
            setShowModal(true);
          }}
        >
          Nueva Venta
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ventas Hoy</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {estadisticas?.total_ventas_hoy || 0}
              </h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ingresos Hoy</p>
              <h3 className="text-2xl font-bold text-gray-900">
                ${(estadisticas?.total_ingresos_hoy || 0).toFixed(2)}
              </h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ticket Promedio</p>
              <h3 className="text-2xl font-bold text-gray-900">
                ${(estadisticas?.ticket_promedio || 0).toFixed(2)}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Búsqueda */}
      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por folio o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </Card>

      {/* Tabla de ventas */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-10"></th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Folio</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    No se encontraron ventas
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <>
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleRow(sale.id)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          {expandedRows.has(sale.id) ? (
                            <ChevronDown className="w-4 h-4 text-gray-600" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono font-semibold text-gray-900">
                          {sale.folio}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">
                            {new Date(sale.fecha).toLocaleDateString('es-MX', { 
                              day: '2-digit', 
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(sale.fecha).toLocaleTimeString('es-MX', { 
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">{sale.cliente_nombre}</div>
                          {sale.cliente_rfc && (
                            <div className="text-xs text-gray-500">{sale.cliente_rfc}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-green-600">
                          ${parseFloat(sale.total).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="capitalize px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                          {sale.metodo_pago}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          sale.cancelada 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {sale.cancelada ? 'Cancelada' : 'Completada'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {!sale.cancelada && (
                            <button
                              onClick={() => handleCancelarVenta(sale.id)}
                              className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    
                    {/* Fila expandida con detalles */}
                    {expandedRows.has(sale.id) && (
                      <tr>
                        <td colSpan="8" className="px-4 py-4 bg-gray-50">
                          <div className="max-w-4xl">
                            <div className="flex items-center gap-2 mb-3">
                              <Package className="w-4 h-4 text-gray-600" />
                              <h4 className="font-semibold text-gray-900">Productos vendidos:</h4>
                            </div>
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                              <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Producto</th>
                                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Cantidad</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Precio Unit.</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {sale.detalles && sale.detalles.length > 0 ? (
                                    sale.detalles.map((detalle, idx) => (
                                      <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-4 py-2">
                                          <div>
                                            <div className="font-medium text-gray-900">
                                              {detalle.producto_nombre || 'Producto'}
                                            </div>
                                            {detalle.producto_codigo && (
                                              <div className="text-xs text-gray-500">
                                                Código: {detalle.producto_codigo}
                                              </div>
                                            )}
                                          </div>
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                          <span className="font-semibold text-gray-900">
                                            {detalle.cantidad}
                                          </span>
                                        </td>
                                        <td className="px-4 py-2 text-right text-gray-600">
                                          ${parseFloat(detalle.precio_unitario).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                          <span className="font-semibold text-gray-900">
                                            ${(detalle.cantidad * parseFloat(detalle.precio_unitario)).toFixed(2)}
                                          </span>
                                        </td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td colSpan="4" className="px-4 py-4 text-center text-gray-500 text-sm">
                                        No hay detalles disponibles
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                            {sale.observaciones && (
                              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-gray-700">
                                  <span className="font-medium">Observaciones:</span> {sale.observaciones}
                                </p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de Nueva Venta */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Nueva Venta</h2>
              <button
                onClick={() => {
                  if (carrito.length > 0) {
                    if (confirm('¿Descartar venta actual?')) {
                      setShowModal(false);
                      limpiarFormulario();
                    }
                  } else {
                    setShowModal(false);
                  }
                }}
                className="text-gray-400 hover:text-gray-600"
                disabled={submitting}
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              {/* Panel de productos */}
              <div className="w-full md:w-1/2 p-6 border-r border-gray-200 flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Productos Disponibles
                </h3>
                
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar producto..."
                      value={buscarProducto}
                      onChange={(e) => setBuscarProducto(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
                  {productosFiltrados.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                      <Package className="w-12 h-12 text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500">
                        {buscarProducto ? 'No se encontraron productos' : 'No hay productos con stock'}
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {productosFiltrados.map((producto) => (
                        <div
                          key={producto.id}
                          onClick={() => agregarAlCarrito(producto)}
                          className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {producto.nombre}
                              </p>
                              <p className="text-sm text-gray-500">
                                Código: {producto.codigo}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-gray-500">
                                  Stock: {producto.stock}
                                </span>
                                <span className="text-sm font-semibold text-green-600">
                                  ${parseFloat(producto.precio_venta).toFixed(2)}
                                </span>
                              </div>
                            </div>
                            <Plus className="w-5 h-5 text-blue-600 flex-shrink-0 ml-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Panel del carrito */}
              <div className="w-full md:w-1/2 p-6 flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Resumen de Venta
                </h3>

                {/* Información del cliente */}
                <div className="mb-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cliente *
                    </label>
                    <input
                      type="text"
                      placeholder="Nombre del cliente"
                      value={clienteNombre}
                      onChange={(e) => setClienteNombre(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      RFC (opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: XAXX010101000"
                      value={clienteRfc}
                      onChange={(e) => setClienteRfc(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={13}
                      disabled={submitting}
                    />
                  </div>
                </div>

                {/* Carrito */}
                <div className="border border-gray-200 rounded-lg mb-4 flex-1 min-h-0 flex flex-col bg-white">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <p className="text-sm font-medium text-gray-700">
                      Productos en el carrito ({carrito.length})
                    </p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    {carrito.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center py-8">
                        <ShoppingBag className="w-12 h-12 text-gray-300 mb-2" />
                        <p className="text-sm text-gray-500">
                          No hay productos agregados
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Selecciona productos de la lista
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {carrito.map((item) => (
                          <div key={item.producto.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            {/* Nombre y precio unitario */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 min-w-0 pr-2">
                                <p className="font-medium text-sm text-gray-900 leading-tight">
                                  {item.producto.nombre}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  ${item.precio_unitario.toFixed(2)} c/u
                                </p>
                              </div>
                              <button
                                onClick={() => eliminarDelCarrito(item.producto.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                                disabled={submitting}
                                title="Eliminar"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            
                            {/* Controles de cantidad y subtotal */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => actualizarCantidad(item.producto.id, item.cantidad - 1)}
                                  className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 hover:bg-gray-100 rounded transition-colors"
                                  disabled={submitting}
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <input
                                  type="number"
                                  value={item.cantidad}
                                  onChange={(e) => actualizarCantidad(item.producto.id, parseInt(e.target.value) || 0)}
                                  className="w-16 text-center font-semibold border border-gray-300 rounded px-2 py-1.5 text-sm bg-white"
                                  min="1"
                                  max={item.producto.stock}
                                  disabled={submitting}
                                />
                                <button
                                  onClick={() => actualizarCantidad(item.producto.id, item.cantidad + 1)}
                                  className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 hover:bg-gray-100 rounded transition-colors"
                                  disabled={submitting}
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500 mb-0.5">Subtotal</p>
                                <p className="font-bold text-lg text-gray-900">
                                  ${(item.cantidad * item.precio_unitario).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Totales */}
                <div className="space-y-2 mb-4 bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">${calcularSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">IVA (16%):</span>
                    <span className="font-medium">${calcularIVA().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                    <span>Total:</span>
                    <span className="text-green-600">${calcularTotal().toFixed(2)}</span>
                  </div>
                </div>

                {/* Método de pago */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Método de Pago *
                  </label>
                  <select 
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={submitting}
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="transferencia">Transferencia</option>
                  </select>
                </div>

                {/* Observaciones */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones (opcional)
                  </label>
                  <textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Notas adicionales..."
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    disabled={submitting}
                  />
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <Button 
                    className="flex-1"
                    onClick={handleCompletarVenta}
                    disabled={carrito.length === 0 || submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Procesando...
                      </>
                    ) : (
                      <>Completar Venta</>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      if (carrito.length > 0) {
                        if (confirm('¿Descartar venta actual?')) {
                          setShowModal(false);
                          limpiarFormulario();
                        }
                      } else {
                        setShowModal(false);
                      }
                    }}
                    disabled={submitting}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
