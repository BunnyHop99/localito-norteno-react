import { useState, useEffect } from 'react';
import { Plus, Search, FileText, Download, Send, X, Check, XCircle, Clock, AlertTriangle, TestTube, Eye } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { facturacionService } from '../services/facturacionService';
import { ventasService } from '../services/ventasService';
import { useToast } from '../hooks/useToast';

export default function Facturacion() {
  const toast = useToast();
  const [facturas, setFacturas] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [modoPrueba, setModoPrueba] = useState(true); // Modo sandbox por defecto
  const [previewData, setPreviewData] = useState(null);

  const [formData, setFormData] = useState({
    venta: '',
    cliente_nombre: '',
    cliente_rfc: '',
    cliente_email: '',
    cliente_codigo_postal: '',
    uso_cfdi: 'G01',
    metodo_pago: 'PUE',
    forma_pago: '01'
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [facturasData, ventasData, estadisticasData] = await Promise.all([
        facturacionService.getFacturas(),
        ventasService.getVentas(),
        facturacionService.getEstadisticas().catch(() => null)
      ]);
      
      setFacturas(Array.isArray(facturasData) ? facturasData : facturasData.results || []);
      setVentas(Array.isArray(ventasData) ? ventasData : ventasData.results || []);
      setEstadisticas(estadisticasData);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError(err.response?.data?.error || 'Error al cargar las facturas');
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const filteredFacturas = facturas.filter(factura => {
    const matchesSearch = factura.folio_fiscal?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         factura.cliente_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         factura.cliente_rfc?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || factura.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const validateRFC = (rfc) => {
    // RFC Persona Física: 13 caracteres
    const rfcPersonaFisica = /^[A-ZÑ&]{4}\d{6}[A-Z0-9]{3}$/;
    // RFC Persona Moral: 12 caracteres
    const rfcPersonaMoral = /^[A-ZÑ&]{3}\d{6}[A-Z0-9]{3}$/;
    
    return rfcPersonaFisica.test(rfc) || rfcPersonaMoral.test(rfc);
  };

  const validateForm = () => {
    if (!formData.venta) {
      toast.error('Debes seleccionar una venta');
      return false;
    }

    if (!formData.cliente_nombre.trim()) {
      toast.error('El nombre del cliente es requerido');
      return false;
    }

    if (!formData.cliente_rfc.trim()) {
      toast.error('El RFC es requerido');
      return false;
    }

    if (!validateRFC(formData.cliente_rfc.toUpperCase())) {
      toast.error('RFC inválido. Debe ser 12 (moral) o 13 caracteres (física)');
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.cliente_email.trim() || !emailPattern.test(formData.cliente_email)) {
      toast.error('Email inválido');
      return false;
    }

    if (!formData.cliente_codigo_postal.trim() || formData.cliente_codigo_postal.length !== 5) {
      toast.error('Código postal inválido (5 dígitos)');
      return false;
    }

    return true;
  };

  const handlePreview = () => {
    if (!validateForm()) return;

    const ventaSeleccionada = ventas.find(v => v.id === parseInt(formData.venta));
    
    setPreviewData({
      ...formData,
      venta_info: ventaSeleccionada,
      modo_prueba: modoPrueba
    });
    
    setShowPreviewModal(true);
  };

  const handleCrearFactura = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      console.log('📄 Creando factura:', {
        ...formData,
        modo_prueba: modoPrueba
      });

      const facturaData = {
        ...formData,
        cliente_rfc: formData.cliente_rfc.toUpperCase(),
        modo_prueba: modoPrueba
      };

      const nuevaFactura = await facturacionService.createFactura(facturaData);
      
      console.log('✅ Factura creada:', nuevaFactura);

      toast.success(
        modoPrueba 
          ? '✅ Factura de prueba creada (Modo Sandbox)' 
          : '✅ Factura creada exitosamente'
      );

      await cargarDatos();
      setShowModal(false);
      setShowPreviewModal(false);
      setFormData({
        venta: '',
        cliente_nombre: '',
        cliente_rfc: '',
        cliente_email: '',
        cliente_codigo_postal: '',
        uso_cfdi: 'G01',
        metodo_pago: 'PUE',
        forma_pago: '01'
      });
    } catch (err) {
      console.error('❌ Error al crear factura:', err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Error al crear la factura';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTimbrar = async (facturaId) => {
    if (!confirm(
      modoPrueba 
        ? '¿Timbrar esta factura en modo PRUEBA?\n\nEsto no consumirá timbres reales.' 
        : '⚠️ ¿Timbrar esta factura en modo PRODUCCIÓN?\n\nEsto consumirá un timbre real del PAC.'
    )) return;

    try {
      console.log('🔐 Timbrando factura:', facturaId, { modo_prueba: modoPrueba });

      toast.promise(
        facturacionService.timbrarFactura(facturaId),
        {
          loading: modoPrueba ? 'Timbrando en modo prueba...' : 'Timbrando factura...',
          success: (data) => {
            console.log('✅ Factura timbrada:', data);
            cargarDatos();
            return modoPrueba 
              ? '✅ Factura timbrada (Modo Sandbox)'
              : '✅ Factura timbrada exitosamente';
          },
          error: (err) => {
            console.error('❌ Error al timbrar:', err);
            const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Error al timbrar';
            return `❌ ${errorMsg}`;
          }
        }
      );
    } catch (err) {
      console.error('❌ Error:', err);
    }
  };

  const handleCancelar = async (facturaId) => {
    const motivo = prompt('Motivo de cancelación (opcional):');
    if (motivo === null) return; // Usuario canceló

    try {
      console.log('❌ Cancelando factura:', facturaId, { motivo });

      await facturacionService.cancelarFactura(facturaId, motivo);
      toast.success('Factura cancelada exitosamente');
      await cargarDatos();
    } catch (err) {
      console.error('❌ Error al cancelar:', err);
      toast.error(err.response?.data?.error || 'Error al cancelar la factura');
    }
  };

  const handleDescargar = async (facturaId, tipo) => {
    try {
      if (tipo === 'xml') {
        const data = await facturacionService.descargarXML(facturaId);
        // Crear blob y descargar
        const blob = new Blob([data], { type: 'application/xml' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `factura_${facturaId}.xml`;
        a.click();
      } else {
        const data = await facturacionService.descargarPDF(facturaId);
        // Crear blob y descargar
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `factura_${facturaId}.pdf`;
        a.click();
      }
      toast.success(`${tipo.toUpperCase()} descargado`);
    } catch (err) {
      console.error(`Error al descargar ${tipo}:`, err);
      toast.error(`Error al descargar ${tipo.toUpperCase()}`);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      borrador: 'bg-gray-100 text-gray-800',
      timbrada: 'bg-green-100 text-green-800',
      cancelada: 'bg-red-100 text-red-800',
      error: 'bg-red-100 text-red-800'
    };

    const icons = {
      borrador: Clock,
      timbrada: Check,
      cancelada: XCircle,
      error: AlertTriangle
    };

    const Icon = icons[status] || Clock;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.borrador}`}>
        <Icon className="w-3 h-3" />
        {status?.toUpperCase() || 'BORRADOR'}
      </span>
    );
  };

  const columns = [
    {
      header: 'Folio',
      accessorKey: 'id',
      cell: (row) => (
        <div>
          <div className="font-medium text-gray-900">#{row.id}</div>
          {row.folio_fiscal && (
            <div className="text-xs text-gray-500 font-mono">{row.folio_fiscal.substring(0, 8)}...</div>
          )}
        </div>
      )
    },
    {
      header: 'Cliente',
      accessorKey: 'cliente_nombre',
      cell: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.cliente_nombre}</div>
          <div className="text-xs text-gray-500">{row.cliente_rfc}</div>
        </div>
      )
    },
    {
      header: 'Monto',
      accessorKey: 'total',
      cell: (row) => (
        <span className="font-semibold text-gray-900">
          ${parseFloat(row.total || 0).toFixed(2)}
        </span>
      )
    },
    {
      header: 'Fecha',
      accessorKey: 'fecha_emision',
      cell: (row) => (
        <span className="text-sm text-gray-600">
          {new Date(row.fecha_emision).toLocaleDateString('es-MX')}
        </span>
      )
    },
    {
      header: 'Estado',
      accessorKey: 'status',
      cell: (row) => getStatusBadge(row.status)
    },
    {
      header: 'Acciones',
      cell: (row) => (
        <div className="flex gap-2">
          {row.status === 'borrador' && (
            <button
              onClick={() => handleTimbrar(row.id)}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Timbrar"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
          {row.status === 'timbrada' && (
            <>
              <button
                onClick={() => handleDescargar(row.id, 'xml')}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                title="Descargar XML"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDescargar(row.id, 'pdf')}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Descargar PDF"
              >
                <FileText className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleCancelar(row.id)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Cancelar"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  if (loading) {
    return <LoadingSpinner message="Cargando facturas..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={cargarDatos} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facturación Electrónica</h1>
          <p className="text-gray-600 mt-1">Gestiona tus facturas CFDI 4.0</p>
        </div>
        <div className="flex gap-3">
          {/* Toggle Modo Prueba */}
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg">
            <TestTube className={`w-4 h-4 ${modoPrueba ? 'text-orange-600' : 'text-gray-400'}`} />
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={modoPrueba}
                onChange={(e) => setModoPrueba(e.target.checked)}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-700">
                {modoPrueba ? 'Modo Prueba' : 'Producción'}
              </span>
            </label>
          </div>
          <Button onClick={() => setShowModal(true)} icon={Plus}>
            Nueva Factura
          </Button>
        </div>
      </div>

      {/* Alerta Modo Prueba */}
      {modoPrueba && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <TestTube className="w-5 h-5 text-orange-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-orange-900">Modo Sandbox Activo</p>
              <p className="text-sm text-orange-700 mt-1">
                Las facturas se timbrarán en modo prueba. No se consumirán timbres reales del PAC.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="text-center p-4">
            <p className="text-sm text-gray-600">Total Facturado</p>
            <p className="text-2xl font-bold text-blue-600">
              ${parseFloat(estadisticas.total_facturado || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
          </Card>
          <Card className="text-center p-4">
            <p className="text-sm text-gray-600">Timbradas</p>
            <p className="text-2xl font-bold text-green-600">{estadisticas.timbradas || 0}</p>
          </Card>
          <Card className="text-center p-4">
            <p className="text-sm text-gray-600">Borradores</p>
            <p className="text-2xl font-bold text-gray-600">{estadisticas.borradores || 0}</p>
          </Card>
          <Card className="text-center p-4">
            <p className="text-sm text-gray-600">Canceladas</p>
            <p className="text-2xl font-bold text-red-600">{estadisticas.canceladas || 0}</p>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por folio, cliente o RFC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="borrador">Borradores</option>
            <option value="timbrada">Timbradas</option>
            <option value="cancelada">Canceladas</option>
          </select>
        </div>
      </Card>

      {/* Tabla */}
      <Card>
        <Table
          data={filteredFacturas}
          columns={columns}
          emptyMessage="No hay facturas registradas"
        />
      </Card>
      {/* Modal Crear Factura */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Nueva Factura</h2>
                {modoPrueba && (
                  <p className="text-sm text-orange-600 mt-1 flex items-center gap-1">
                    <TestTube className="w-3 h-3" />
                    Modo Sandbox
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
                disabled={submitting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCrearFactura} className="p-6 space-y-6">
              {/* Selección de Venta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venta a Facturar *
                </label>
                <select
                  value={formData.venta}
                  onChange={(e) => setFormData({ ...formData, venta: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={submitting}
                >
                  <option value="">Seleccionar venta...</option>
                  {ventas.filter(v => !v.cancelada).map(venta => (
                    <option key={venta.id} value={venta.id}>
                      {venta.folio} - ${parseFloat(venta.total).toFixed(2)} - {venta.cliente_nombre}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Solo se muestran ventas no canceladas
                </p>
              </div>

              {/* Datos del Cliente */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 border-b pb-2">Datos del Cliente</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre o Razón Social *
                  </label>
                  <input
                    type="text"
                    value={formData.cliente_nombre}
                    onChange={(e) => setFormData({ ...formData, cliente_nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={submitting}
                    placeholder="Ej: Juan Pérez o Empresa SA de CV"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      RFC *
                    </label>
                    <input
                      type="text"
                      value={formData.cliente_rfc}
                      onChange={(e) => setFormData({ ...formData, cliente_rfc: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase font-mono"
                      required
                      disabled={submitting}
                      placeholder="XAXX010101000"
                      maxLength="13"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      12 caracteres (moral) o 13 (física)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código Postal *
                    </label>
                    <input
                      type="text"
                      value={formData.cliente_codigo_postal}
                      onChange={(e) => setFormData({ ...formData, cliente_codigo_postal: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={submitting}
                      placeholder="85000"
                      maxLength="5"
                      pattern="[0-9]{5}"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.cliente_email}
                    onChange={(e) => setFormData({ ...formData, cliente_email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={submitting}
                    placeholder="cliente@ejemplo.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Se enviará el XML y PDF a este correo
                  </p>
                </div>
              </div>

              {/* Datos Fiscales */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 border-b pb-2">Datos Fiscales</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Uso de CFDI *
                    </label>
                    <select
                      value={formData.uso_cfdi}
                      onChange={(e) => setFormData({ ...formData, uso_cfdi: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={submitting}
                    >
                      <option value="G01">G01 - Adquisición de mercancías</option>
                      <option value="G03">G03 - Gastos en general</option>
                      <option value="D01">D01 - Honorarios médicos</option>
                      <option value="D02">D02 - Gastos médicos</option>
                      <option value="D03">D03 - Gastos funerales</option>
                      <option value="D04">D04 - Donativos</option>
                      <option value="D10">D10 - Pagos por servicios educativos</option>
                      <option value="P01">P01 - Por definir</option>
                      <option value="S01">S01 - Sin efectos fiscales</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Método de Pago *
                    </label>
                    <select
                      value={formData.metodo_pago}
                      onChange={(e) => setFormData({ ...formData, metodo_pago: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={submitting}
                    >
                      <option value="PUE">PUE - Pago en una sola exhibición</option>
                      <option value="PPD">PPD - Pago en parcialidades o diferido</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Forma de Pago *
                  </label>
                  <select
                    value={formData.forma_pago}
                    onChange={(e) => setFormData({ ...formData, forma_pago: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={submitting}
                  >
                    <option value="01">01 - Efectivo</option>
                    <option value="02">02 - Cheque nominativo</option>
                    <option value="03">03 - Transferencia electrónica</option>
                    <option value="04">04 - Tarjeta de crédito</option>
                    <option value="28">28 - Tarjeta de débito</option>
                    <option value="99">99 - Por definir</option>
                  </select>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreview}
                  disabled={submitting}
                  icon={Eye}
                  className="flex-1"
                >
                  Vista Previa
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? 'Creando...' : 'Crear Factura'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Preview */}
      {showPreviewModal && previewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Vista Previa de Factura</h2>
                {previewData.modo_prueba && (
                  <p className="text-sm text-orange-600 mt-1 flex items-center gap-1">
                    <TestTube className="w-3 h-3" />
                    Esta factura se timbrará en modo prueba
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Info de Venta */}
              {previewData.venta_info && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Información de la Venta</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Folio:</span>
                      <span className="font-semibold text-blue-900">{previewData.venta_info.folio}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Total:</span>
                      <span className="font-semibold text-blue-900">
                        ${parseFloat(previewData.venta_info.total).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Fecha:</span>
                      <span className="font-semibold text-blue-900">
                        {new Date(previewData.venta_info.fecha).toLocaleDateString('es-MX')}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Datos del Cliente */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Receptor (Cliente)</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-600">Nombre:</span>
                    <span className="col-span-2 font-medium">{previewData.cliente_nombre}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-600">RFC:</span>
                    <span className="col-span-2 font-mono font-medium">{previewData.cliente_rfc}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-600">CP:</span>
                    <span className="col-span-2 font-medium">{previewData.cliente_codigo_postal}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-600">Email:</span>
                    <span className="col-span-2 font-medium">{previewData.cliente_email}</span>
                  </div>
                </div>
              </div>

              {/* Datos Fiscales */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Datos Fiscales</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-600">Uso CFDI:</span>
                    <span className="col-span-2 font-medium">{previewData.uso_cfdi}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-600">Método Pago:</span>
                    <span className="col-span-2 font-medium">{previewData.metodo_pago}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-600">Forma Pago:</span>
                    <span className="col-span-2 font-medium">{previewData.forma_pago}</span>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-900">Verifica los datos antes de continuar</p>
                    <p className="text-yellow-700 mt-1">
                      {previewData.modo_prueba 
                        ? 'Esta factura se creará en modo SANDBOX (no consumirá timbres reales).'
                        : '⚠️ Esta factura se creará en modo PRODUCCIÓN y consumirá un timbre real.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={handleCrearFactura}
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? 'Creando...' : 'Confirmar y Crear'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowPreviewModal(false)}
                  disabled={submitting}
                >
                  Volver a Editar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
