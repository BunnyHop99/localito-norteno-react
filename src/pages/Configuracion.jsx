import { Settings, Building2, DollarSign, Shield, Save, Key, Database } from 'lucide-react';
import { useState } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useToast } from '../hooks/useToast';

export default function Configuracion() {
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('fiscal');

  // Estados para cada sección
  const [datosFiscales, setDatosFiscales] = useState({
    razon_social: 'Localito Norteño S.A. de C.V.',
    rfc: 'LNO901201XXX',
    regimen_fiscal: '601',
    direccion: 'Calle Principal #123, Col. Centro',
    codigo_postal: '85000',
    telefono: '644-123-4567'
  });

  const [impuestos, setImpuestos] = useState({
    iva: '16',
    retencion_isr: '0',
    retencion_iva: '0'
  });

  const [facturacion, setFacturacion] = useState({
    proveedor: 'facturapi',
    api_key: '',
    api_secret: '',
    sandbox: true
  });

  const [respaldo, setRespaldo] = useState({
    auto_backup: true,
    backup_frequency: 'daily',
    backup_time: '03:00',
    last_backup: '2025-10-26T03:00:00'
  });

  const handleSaveDatosFiscales = async (e) => {
    e.preventDefault();
    
    const rfcPattern = /^([A-ZÑ&]{3,4})\d{6}([A-Z0-9]{3})$/;
    if (!rfcPattern.test(datosFiscales.rfc)) {
      toast.error('RFC inválido');
      return;
    }

    if (!datosFiscales.codigo_postal || datosFiscales.codigo_postal.length !== 5) {
      toast.error('Código postal inválido');
      return;
    }

    try {
      setSaving(true);
      
      // Simular guardado en API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Datos fiscales guardados correctamente');
    } catch (err) {
      toast.error('Error al guardar los datos fiscales');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveImpuestos = async (e) => {
    e.preventDefault();
    
    if (parseFloat(impuestos.iva) < 0 || parseFloat(impuestos.iva) > 100) {
      toast.error('El IVA debe estar entre 0 y 100%');
      return;
    }

    try {
      setSaving(true);
      
      // Simular guardado en API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Configuración de impuestos guardada correctamente');
    } catch (err) {
      toast.error('Error al guardar la configuración de impuestos');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFacturacion = async (e) => {
    e.preventDefault();
    
    if (!facturacion.api_key.trim()) {
      toast.error('La API Key es requerida');
      return;
    }

    try {
      setSaving(true);
      
      // Simular guardado en API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Configuración de facturación guardada correctamente');
    } catch (err) {
      toast.error('Error al guardar la configuración de facturación');
    } finally {
      setSaving(false);
    }
  };

  const handleTestFacturapi = async () => {
    if (!facturacion.api_key.trim()) {
      toast.error('Configura tu API Key primero');
      return;
    }

    try {
      toast.loading('Probando conexión...', { id: 'test' });
      
      // Simular prueba de conexión
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('¡Conexión exitosa con Facturapi!', { id: 'test' });
    } catch (err) {
      toast.error('Error al conectar con Facturapi', { id: 'test' });
    }
  };

  const handleCrearRespaldo = async () => {
    try {
      toast.loading('Creando respaldo...', { id: 'backup' });
      
      // Simular creación de respaldo
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setRespaldo({
        ...respaldo,
        last_backup: new Date().toISOString()
      });
      
      toast.success('Respaldo creado exitosamente', { id: 'backup' });
    } catch (err) {
      toast.error('Error al crear respaldo', { id: 'backup' });
    }
  };

  const handleExportarDatos = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Exportando datos...',
        success: '¡Datos exportados! (funcionalidad en desarrollo)',
        error: 'Error al exportar datos'
      }
    );
  };

  const tabs = [
    { id: 'fiscal', label: 'Datos Fiscales', icon: Building2 },
    { id: 'impuestos', label: 'Impuestos', icon: DollarSign },
    { id: 'facturacion', label: 'Facturación', icon: Settings },
    { id: 'respaldo', label: 'Respaldo', icon: Shield }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-1">Ajusta los parámetros del sistema</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Datos Fiscales */}
      {activeTab === 'fiscal' && (
        <Card title="Datos Fiscales de la Empresa">
          <form onSubmit={handleSaveDatosFiscales} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Razón Social *
              </label>
              <input
                type="text"
                value={datosFiscales.razon_social}
                onChange={(e) => setDatosFiscales({ ...datosFiscales, razon_social: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={saving}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RFC *
                </label>
                <input
                  type="text"
                  value={datosFiscales.rfc}
                  onChange={(e) => setDatosFiscales({ ...datosFiscales, rfc: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={13}
                  required
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Régimen Fiscal *
                </label>
                <select
                  value={datosFiscales.regimen_fiscal}
                  onChange={(e) => setDatosFiscales({ ...datosFiscales, regimen_fiscal: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={saving}
                >
                  <option value="601">601 - General de Ley Personas Morales</option>
                  <option value="603">603 - Personas Morales con Fines no Lucrativos</option>
                  <option value="605">605 - Sueldos y Salarios e Ingresos Asimilados a Salarios</option>
                  <option value="606">606 - Arrendamiento</option>
                  <option value="612">612 - Personas Físicas con Actividades Empresariales</option>
                  <option value="621">621 - Incorporación Fiscal</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección Fiscal
              </label>
              <input
                type="text"
                value={datosFiscales.direccion}
                onChange={(e) => setDatosFiscales({ ...datosFiscales, direccion: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código Postal *
                </label>
                <input
                  type="text"
                  value={datosFiscales.codigo_postal}
                  onChange={(e) => setDatosFiscales({ ...datosFiscales, codigo_postal: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={5}
                  required
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={datosFiscales.telefono}
                  onChange={(e) => setDatosFiscales({ ...datosFiscales, telefono: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={saving}
                />
              </div>
            </div>

            <Button type="submit" icon={Save} className="w-full" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </form>
        </Card>
      )}

      {/* Impuestos */}
      {activeTab === 'impuestos' && (
        <Card title="Configuración de Impuestos">
          <form onSubmit={handleSaveImpuestos} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IVA (%) *
              </label>
              <input
                type="number"
                step="0.01"
                value={impuestos.iva}
                onChange={(e) => setImpuestos({ ...impuestos, iva: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                max="100"
                required
                disabled={saving}
              />
              <p className="text-sm text-gray-500 mt-1">
                Impuesto al Valor Agregado aplicado a las ventas
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Retención ISR (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={impuestos.retencion_isr}
                  onChange={(e) => setImpuestos({ ...impuestos, retencion_isr: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Retención IVA (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={impuestos.retencion_iva}
                  onChange={(e) => setImpuestos({ ...impuestos, retencion_iva: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Estos porcentajes se aplicarán automáticamente en las facturas.
              </p>
            </div>

            <Button type="submit" icon={Save} className="w-full" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </form>
        </Card>
      )}

      {/* Facturación */}
      {activeTab === 'facturacion' && (
        <div className="space-y-6">
          <Card title="API de Facturación Electrónica">
            <form onSubmit={handleSaveFacturacion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proveedor de Facturación *
                </label>
                <select
                  value={facturacion.proveedor}
                  onChange={(e) => setFacturacion({ ...facturacion, proveedor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={saving}
                >
                  <option value="facturapi">Facturapi</option>
                  <option value="facturama">Facturama</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key (Secret Key) *
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={facturacion.api_key}
                    onChange={(e) => setFacturacion({ ...facturacion, api_key: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="sk_live_xxxxxxxxxxxxx"
                    required
                    disabled={saving}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Tu API Key de {facturacion.proveedor}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sandbox"
                  checked={facturacion.sandbox}
                  onChange={(e) => setFacturacion({ ...facturacion, sandbox: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={saving}
                />
                <label htmlFor="sandbox" className="text-sm text-gray-700">
                  Usar modo de pruebas (Sandbox)
                </label>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Importante:</strong> Mantén tu API Key segura. Nunca la compartas públicamente.
                </p>
              </div>

              <div className="flex gap-3">
                <Button type="submit" icon={Save} className="flex-1" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar Configuración'}
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={handleTestFacturapi}
                  disabled={saving}
                >
                  Probar Conexión
                </Button>
              </div>
            </form>
          </Card>

          <Card title="Información de Facturapi">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Facturapi es la plataforma de facturación electrónica más fácil de usar en México.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm text-gray-700">
                  <strong>Paso 1:</strong> Crea una cuenta en{' '}
                  <a 
                    href="https://www.facturapi.io" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    facturapi.io
                  </a>
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Paso 2:</strong> Obtén tu API Key desde el panel de control
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Paso 3:</strong> Pégala en el campo de arriba
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Respaldo */}
      {activeTab === 'respaldo' && (
        <div className="space-y-6">
          <Card title="Respaldo Automático">
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <Shield className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-green-900 mb-1">Respaldo Automático Activo</h4>
                  <p className="text-sm text-green-700 mb-2">
                    Último respaldo: {new Date(respaldo.last_backup).toLocaleString('es-MX')}
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="auto_backup"
                      checked={respaldo.auto_backup}
                      onChange={(e) => setRespaldo({ ...respaldo, auto_backup: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="auto_backup" className="text-sm text-green-800">
                      Habilitar respaldo automático
                    </label>
                  </div>
                </div>
              </div>

              {respaldo.auto_backup && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frecuencia
                    </label>
                    <select
                      value={respaldo.backup_frequency}
                      onChange={(e) => setRespaldo({ ...respaldo, backup_frequency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="daily">Diario</option>
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensual</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora de ejecución
                    </label>
                    <input
                      type="time"
                      value={respaldo.backup_time}
                      onChange={(e) => setRespaldo({ ...respaldo, backup_time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button icon={Database} className="flex-1" onClick={handleCrearRespaldo}>
                  Crear Respaldo Manual
                </Button>
                <Button variant="outline" onClick={handleExportarDatos}>
                  Exportar Datos
                </Button>
              </div>
            </div>
          </Card>

          <Card title="Historial de Respaldos">
            <div className="space-y-2">
              {[
                { fecha: '2025-10-26 03:00', tamano: '45.2 MB', estado: 'Exitoso' },
                { fecha: '2025-10-25 03:00', tamano: '44.8 MB', estado: 'Exitoso' },
                { fecha: '2025-10-24 03:00', tamano: '44.5 MB', estado: 'Exitoso' },
              ].map((backup, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{backup.fecha}</p>
                    <p className="text-xs text-gray-500">{backup.tamano}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                      {backup.estado}
                    </span>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      Descargar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}