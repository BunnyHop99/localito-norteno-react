import { useState, useEffect } from 'react';
import { Users, UserPlus, Edit, Trash2, Shield, Mail, Phone, Calendar } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { usuariosService } from '../services/usuariosService';
import { useToast } from '../hooks/useToast';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    rol: 'vendedor',
    telefono: '',
    activo: true
  });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await usuariosService.getUsuarios();
      setUsuarios(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError(err.response?.data?.error || 'Error al cargar los usuarios');
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      toast.error('El nombre de usuario es requerido');
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailPattern.test(formData.email)) {
      toast.error('Email inválido');
      return false;
    }

    if (!formData.first_name.trim()) {
      toast.error('El nombre es requerido');
      return false;
    }

    if (!formData.last_name.trim()) {
      toast.error('El apellido es requerido');
      return false;
    }

    if (!selectedUsuario && (!formData.password || formData.password.length < 8)) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      
      const dataToSend = { ...formData };
      if (selectedUsuario && !dataToSend.password) {
        delete dataToSend.password;
      }

      if (selectedUsuario) {
        const updated = await usuariosService.updateUsuario(selectedUsuario.id, dataToSend);
        setUsuarios(usuarios.map(u => u.id === selectedUsuario.id ? updated : u));
        toast.success('Usuario actualizado correctamente');
      } else {
        const created = await usuariosService.createUsuario(dataToSend);
        setUsuarios([created, ...usuarios]);
        toast.success('Usuario creado correctamente');
      }
      
      setShowModal(false);
      setSelectedUsuario(null);
      resetForm();
    } catch (err) {
      console.error('Error al guardar usuario:', err);
      const errorMsg = err.response?.data?.error || 
                      err.response?.data?.detail ||
                      JSON.stringify(err.response?.data) ||
                      'Error al guardar el usuario';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (usuario) => {
    setSelectedUsuario(usuario);
    setFormData({
      username: usuario.username,
      email: usuario.email,
      first_name: usuario.first_name,
      last_name: usuario.last_name,
      password: '',
      rol: usuario.rol || 'vendedor',
      telefono: usuario.telefono || '',
      activo: usuario.activo
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const usuario = usuarios.find(u => u.id === id);
    if (!confirm(`¿Estás seguro de eliminar a ${usuario.first_name} ${usuario.last_name}?`)) {
      return;
    }

    try {
      await usuariosService.deleteUsuario(id);
      setUsuarios(usuarios.filter(u => u.id !== id));
      toast.success('Usuario eliminado correctamente');
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      toast.error(err.response?.data?.error || 'Error al eliminar el usuario');
    }
  };

  const handleCambiarEstado = async (id) => {
    try {
      const resultado = await usuariosService.cambiarEstado(id);
      setUsuarios(usuarios.map(u => 
        u.id === id ? { ...u, activo: resultado.activo } : u
      ));
      toast.success(`Usuario ${resultado.activo ? 'activado' : 'desactivado'} correctamente`);
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      toast.error('Error al cambiar el estado del usuario');
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      rol: 'vendedor',
      telefono: '',
      activo: true
    });
  };

  if (loading) {
    return <LoadingSpinner message="Cargando usuarios..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={cargarUsuarios} />;
  }

  const getRolBadge = (rol) => {
    const badges = {
      admin: { bg: 'bg-purple-100', text: 'text-purple-800' },
      vendedor: { bg: 'bg-blue-100', text: 'text-blue-800' },
      cajero: { bg: 'bg-green-100', text: 'text-green-800' }
    };

    const badge = badges[rol] || badges.vendedor;

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded capitalize ${badge.bg} ${badge.text}`}>
        {rol}
      </span>
    );
  };

  const columns = [
    {
      header: 'Usuario',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">
              {row.first_name?.[0]}{row.last_name?.[0]}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {row.first_name} {row.last_name}
            </p>
            <p className="text-sm text-gray-500">@{row.username}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Contacto',
      cell: (row) => (
        <div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Mail className="w-3 h-3" />
            {row.email}
          </div>
          {row.telefono && (
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
              <Phone className="w-3 h-3" />
              {row.telefono}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Rol',
      cell: (row) => getRolBadge(row.rol)
    },
    {
      header: 'Estado',
      cell: (row) => (
        <span className={`px-2 py-1 text-xs font-medium rounded ${
          row.activo 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {row.activo ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    {
      header: 'Fecha Registro',
      cell: (row) => (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Calendar className="w-3 h-3" />
          {new Date(row.date_joined).toLocaleDateString('es-MX')}
        </div>
      )
    },
    {
      header: 'Acciones',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-1.5 hover:bg-blue-50 text-blue-600 rounded transition-colors"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleCambiarEstado(row.id)}
            className="p-1.5 hover:bg-yellow-50 text-yellow-600 rounded transition-colors"
            title={row.activo ? 'Desactivar' : 'Activar'}
          >
            <Shield className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 hover:bg-red-50 text-red-600 rounded transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const usuariosActivos = usuarios.filter(u => u.activo).length;
  const usuariosInactivos = usuarios.filter(u => !u.activo).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-600 mt-1">Gestiona los accesos al sistema</p>
        </div>
        <Button 
          icon={UserPlus} 
          onClick={() => {
            resetForm();
            setSelectedUsuario(null);
            setShowModal(true);
          }}
        >
          Nuevo Usuario
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Usuarios</p>
              <h3 className="text-2xl font-bold text-gray-900">{usuarios.length}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Activos</p>
              <h3 className="text-2xl font-bold text-gray-900">{usuariosActivos}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Inactivos</p>
              <h3 className="text-2xl font-bold text-gray-900">{usuariosInactivos}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <Card>
        <Table columns={columns} data={usuarios} />
        {usuarios.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay usuarios registrados
          </div>
        )}
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedUsuario(null);
                }}
                className="text-gray-400 hover:text-gray-600"
                disabled={submitting}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usuario *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={submitting || selectedUsuario}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña {selectedUsuario ? '(dejar vacío para mantener)' : '*'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={!selectedUsuario}
                    minLength={8}
                    disabled={submitting}
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rol *
                  </label>
                  <select
                    value={formData.rol}
                    onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={submitting}
                  >
                    <option value="vendedor">Vendedor</option>
                    <option value="cajero">Cajero</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.value === 'true' })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={submitting}
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? 'Guardando...' : (selectedUsuario ? 'Actualizar' : 'Crear')} Usuario
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedUsuario(null);
                  }}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}