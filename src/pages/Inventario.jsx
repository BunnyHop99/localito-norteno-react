import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Trash2, Package, PackagePlus, PackageMinus, AlertCircle, TrendingUp, TrendingDown, History, X, Calendar } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { inventarioService } from '../services/inventarioService';
import { useToast } from '../hooks/useToast';

export default function Inventario() {
    const toast = useToast();
    const [products, setProducts] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [movimientos, setMovimientos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState('');
    const [stockFiltro, setStockFiltro] = useState('todos');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showCategoriaModal, setShowCategoriaModal] = useState(false);
    const [showEntradaModal, setShowEntradaModal] = useState(false);
    const [showSalidaModal, setShowSalidaModal] = useState(false);
    const [showHistorialModal, setShowHistorialModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [loadingHistorial, setLoadingHistorial] = useState(false);

    const [formData, setFormData] = useState({
        codigo: '',
        nombre: '',
        descripcion: '',
        categoria: '',
        stock: '',
        stock_minimo: '',
        precio_venta: '',
        precio_costo: ''
    });

    const [entradaFormData, setEntradaFormData] = useState({
        cantidad: '',
        precio_compra: '',
        motivo: 'compra',
        observaciones: ''
    });

    const [salidaFormData, setSalidaFormData] = useState({
        cantidad: '',
        motivo: 'ajuste',
        observaciones: ''
    });

    const [nuevaCategoria, setNuevaCategoria] = useState({
        nombre: '',
        descripcion: ''
    });

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            setError(null);

            const [productosData, categoriasData] = await Promise.all([
                inventarioService.getProductos(),
                inventarioService.getCategorias()
            ]);

            const productos = Array.isArray(productosData) ? productosData : productosData.results || [];

            setProducts(productos);
            setCategorias(Array.isArray(categoriasData) ? categoriasData : categoriasData.results || []);
        } catch (err) {
            console.error('Error al cargar datos:', err);
            setError(err.response?.data?.error || 'Error al cargar los productos');
            toast.error('Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    const cargarHistorial = async (productoId) => {
        try {
            setLoadingHistorial(true);
            const movimientosData = await inventarioService.getMovimientos({ producto: productoId });
            const movimientosArray = Array.isArray(movimientosData) ? movimientosData : movimientosData.results || [];
            setMovimientos(movimientosArray);
        } catch (err) {
            console.error('Error al cargar historial:', err);
            toast.error('Error al cargar el historial');
        } finally {
            setLoadingHistorial(false);
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.codigo?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategoria = !categoriaFiltro || product.categoria === parseInt(categoriaFiltro);

        const matchesStock = stockFiltro === 'todos' ||
            (stockFiltro === 'bajo' && product.stock_bajo) ||
            (stockFiltro === 'sin_stock' && product.stock === 0);

        return matchesSearch && matchesCategoria && matchesStock;
    });

    const validateProductForm = () => {
        if (!formData.codigo.trim()) {
            toast.error('El código es requerido');
            return false;
        }

        if (!formData.nombre.trim()) {
            toast.error('El nombre es requerido');
            return false;
        }

        if (!formData.categoria) {
            toast.error('La categoría es requerida');
            return false;
        }

        const stock = parseInt(formData.stock);
        if (isNaN(stock) || stock < 0) {
            toast.error('El stock debe ser un número mayor o igual a 0');
            return false;
        }

        const stockMinimo = parseInt(formData.stock_minimo);
        if (isNaN(stockMinimo) || stockMinimo < 0) {
            toast.error('El stock mínimo debe ser un número mayor o igual a 0');
            return false;
        }

        const precioVenta = parseFloat(formData.precio_venta);
        if (isNaN(precioVenta) || precioVenta <= 0) {
            toast.error('El precio de venta debe ser mayor a 0');
            return false;
        }

        const precioCosto = parseFloat(formData.precio_costo);
        if (isNaN(precioCosto) || precioCosto <= 0) {
            toast.error('El precio de costo debe ser mayor a 0');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateProductForm()) return;

        try {
            setSubmitting(true);

            const productData = {
                ...formData,
                stock: parseInt(formData.stock),
                stock_minimo: parseInt(formData.stock_minimo),
                precio_venta: parseFloat(formData.precio_venta),
                precio_costo: parseFloat(formData.precio_costo),
                categoria: parseInt(formData.categoria)
            };

            await inventarioService.createProducto(productData);

            toast.success('Producto creado exitosamente');
            await cargarDatos();
            setShowModal(false);
            setFormData({
                codigo: '',
                nombre: '',
                descripcion: '',
                categoria: '',
                stock: '',
                stock_minimo: '',
                precio_venta: '',
                precio_costo: ''
            });
        } catch (err) {
            console.error('Error al crear producto:', err);
            const errorData = err.response?.data;

            if (errorData?.codigo) {
                toast.error('El código ya existe. Por favor usa uno diferente.');
            } else {
                toast.error(errorData?.error || 'Error al crear el producto');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;

        try {
            await inventarioService.deleteProducto(id);
            toast.success('Producto eliminado correctamente');
            await cargarDatos();
        } catch (err) {
            console.error('Error al eliminar producto:', err);
            toast.error(err.response?.data?.error || 'Error al eliminar el producto');
        }
    };

    const handleCrearCategoria = async (e) => {
        e.preventDefault();

        if (!nuevaCategoria.nombre.trim()) {
            toast.error('El nombre de la categoría es requerido');
            return;
        }

        try {
            setSubmitting(true);
            await inventarioService.createCategoria(nuevaCategoria);
            toast.success('Categoría creada exitosamente');

            const categoriasData = await inventarioService.getCategorias();
            setCategorias(Array.isArray(categoriasData) ? categoriasData : categoriasData.results || []);

            setShowCategoriaModal(false);
            setNuevaCategoria({ nombre: '', descripcion: '' });
        } catch (err) {
            console.error('Error al crear categoría:', err);
            toast.error(err.response?.data?.error || 'Error al crear la categoría');
        } finally {
            setSubmitting(false);
        }
    };

    // ENTRADA DE INVENTARIO
    const handleAbrirEntrada = (producto) => {
        setSelectedProduct(producto);
        setEntradaFormData({
            cantidad: '',
            precio_compra: producto.precio_costo || '',
            motivo: 'compra',
            observaciones: ''
        });
        setShowEntradaModal(true);
    };

    const handleSubmitEntrada = async (e) => {
        e.preventDefault();

        if (!entradaFormData.cantidad || parseInt(entradaFormData.cantidad) <= 0) {
            toast.error('La cantidad debe ser mayor a 0');
            return;
        }

        if (!entradaFormData.precio_compra || parseFloat(entradaFormData.precio_compra) <= 0) {
            toast.error('El precio de compra debe ser mayor a 0');
            return;
        }

        try {
            setSubmitting(true);

            const cantidad = parseInt(entradaFormData.cantidad);
            const precioCompra = parseFloat(entradaFormData.precio_compra);

            await inventarioService.createMovimiento({
                producto: selectedProduct.id,
                tipo: 'entrada',
                cantidad: cantidad,
                precio_unitario: precioCompra,
                motivo: entradaFormData.motivo,
                observaciones: entradaFormData.observaciones || `Entrada de ${cantidad} unidades a $${precioCompra} c/u`
            });

            const productoActualizado = await inventarioService.getProducto(selectedProduct.id);
            setProducts(products.map(p => p.id === selectedProduct.id ? productoActualizado : p));

            toast.success(`✅ Entrada registrada. Nuevo stock: ${productoActualizado.stock}`, 5000);

            setShowEntradaModal(false);
            setSelectedProduct(null);
            setEntradaFormData({
                cantidad: '',
                precio_compra: '',
                motivo: 'compra',
                observaciones: ''
            });
        } catch (err) {
            console.error('❌ Error al registrar entrada:', err);
            toast.error(err.response?.data?.error || 'Error al registrar la entrada');
        } finally {
            setSubmitting(false);
        }
    };

    // SALIDA DE INVENTARIO
    const handleAbrirSalida = (producto) => {
        setSelectedProduct(producto);
        setSalidaFormData({
            cantidad: '',
            motivo: 'ajuste',
            observaciones: ''
        });
        setShowSalidaModal(true);
    };

    const handleSubmitSalida = async (e) => {
        e.preventDefault();

        const cantidad = parseInt(salidaFormData.cantidad);

        if (!cantidad || cantidad <= 0) {
            toast.error('La cantidad debe ser mayor a 0');
            return;
        }

        if (cantidad > selectedProduct.stock) {
            toast.error(`Stock insuficiente. Disponible: ${selectedProduct.stock}`);
            return;
        }

        try {
            setSubmitting(true);

            await inventarioService.createMovimiento({
                producto: selectedProduct.id,
                tipo: 'salida',
                cantidad: cantidad,
                precio_unitario: selectedProduct.precio_costo || 0,
                motivo: salidaFormData.motivo,
                observaciones: salidaFormData.observaciones || `Salida de ${cantidad} unidades`
            });

            const productoActualizado = await inventarioService.getProducto(selectedProduct.id);
            setProducts(products.map(p => p.id === selectedProduct.id ? productoActualizado : p));

            toast.success(`✅ Salida registrada. Nuevo stock: ${productoActualizado.stock}`, 5000);

            setShowSalidaModal(false);
            setSelectedProduct(null);
            setSalidaFormData({
                cantidad: '',
                motivo: 'ajuste',
                observaciones: ''
            });
        } catch (err) {
            console.error('❌ Error al registrar salida:', err);
            toast.error(err.response?.data?.error || 'Error al registrar la salida');
        } finally {
            setSubmitting(false);
        }
    };

    // HISTORIAL
    const handleAbrirHistorial = async (producto) => {
        setSelectedProduct(producto);
        setShowHistorialModal(true);
        await cargarHistorial(producto.id);
    };

    // Columnas de la tabla
    const columns = [
        {
            header: 'Código',
            accessorKey: 'codigo',
            cell: (row) => (
                <span className="font-mono text-sm font-medium text-gray-900">
                    {row.codigo}
                </span>
            )
        },
        {
            header: 'Producto',
            accessorKey: 'nombre',
            cell: (row) => (
                <div>
                    <div className="font-medium text-gray-900">{row.nombre}</div>
                    {row.categoria_nombre && (
                        <div className="text-xs text-gray-500">{row.categoria_nombre}</div>
                    )}
                </div>
            )
        },
        {
            header: 'Stock',
            accessorKey: 'stock',
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <span className={`font-semibold ${row.stock === 0 ? 'text-red-600' :
                        row.stock_bajo ? 'text-orange-600' :
                            'text-green-600'
                        }`}>
                        {row.stock}
                    </span>
                    {row.stock === 0 && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded">
                            Sin stock
                        </span>
                    )}
                    {row.stock_bajo && row.stock > 0 && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-800 rounded">
                            Bajo
                        </span>
                    )}
                </div>
            )
        },
        {
            header: 'Precio Costo',
            accessorKey: 'precio_costo',
            cell: (row) => (
                <span className="text-gray-700">
                    ${parseFloat(row.precio_costo).toFixed(2)}
                </span>
            )
        },
        {
            header: 'Precio Venta',
            accessorKey: 'precio_venta',
            cell: (row) => (
                <span className="font-medium text-gray-900">
                    ${parseFloat(row.precio_venta).toFixed(2)}
                </span>
            )
        },
        {
            header: 'Acciones',
            cell: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleAbrirEntrada(row); }}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded transition-colors flex items-center gap-1"
                        title="Registrar entrada"
                    >
                        <PackagePlus className="w-3.5 h-3.5" />
                        Entrada
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleAbrirSalida(row); }}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors flex items-center gap-1"
                        title="Registrar salida"
                    >
                        <PackageMinus className="w-3.5 h-3.5" />
                        Salida
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleAbrirHistorial(row); }}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors flex items-center gap-1"
                        title="Ver historial"
                    >
                        <History className="w-3.5 h-3.5" />
                        Historial
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Eliminar"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <ErrorMessage message={error} />
            </div>
        );
    }

    const productosBajoStock = products.filter(p => p.stock_bajo).length;
    const productosSinStock = products.filter(p => p.stock === 0).length;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Inventario</h1>
                    <p className="text-gray-600 mt-1">Gestiona tus productos y movimientos de inventario</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={() => setShowCategoriaModal(true)}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Nueva Categoría
                    </Button>
                    <Button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Nuevo Producto
                    </Button>
                </div>
            </div>

            {/* Alertas de stock */}
            {(productosBajoStock > 0 || productosSinStock > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {productosSinStock > 0 && (
                        <Card className="border-l-4 border-red-500 bg-red-50">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                                <div>
                                    <p className="font-medium text-red-900">
                                        {productosSinStock} {productosSinStock === 1 ? 'producto sin stock' : 'productos sin stock'}
                                    </p>
                                    <p className="text-sm text-red-700">Requiere atención inmediata</p>
                                </div>
                            </div>
                        </Card>
                    )}
                    {productosBajoStock > 0 && (
                        <Card className="border-l-4 border-orange-500 bg-orange-50">
                            <div className="flex items-center gap-3">
                                <TrendingDown className="w-5 h-5 text-orange-600" />
                                <div>
                                    <p className="font-medium text-orange-900">
                                        {productosBajoStock} {productosBajoStock === 1 ? 'producto con stock bajo' : 'productos con stock bajo'}
                                    </p>
                                    <p className="text-sm text-orange-700">Considera reabastecer pronto</p>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            )}

            {/* Filtros */}
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o código..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <select
                        value={categoriaFiltro}
                        onChange={(e) => setCategoriaFiltro(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Todas las categorías</option>
                        {categorias.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                        ))}
                    </select>

                    <select
                        value={stockFiltro}
                        onChange={(e) => setStockFiltro(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="todos">Todos los productos</option>
                        <option value="bajo">Stock bajo</option>
                        <option value="sin_stock">Sin stock</option>
                    </select>
                </div>
            </Card>

            {/* Tabla de productos */}
            <Card>
                <Table
                    data={filteredProducts}
                    columns={columns}
                    emptyMessage="No hay productos registrados"
                />
            </Card>

            {/* Modal Crear Producto */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Nuevo Producto
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                                disabled={submitting}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Código *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.codigo}
                                        onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                        disabled={submitting}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Categoría *
                                    </label>
                                    <select
                                        value={formData.categoria}
                                        onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                        disabled={submitting}
                                    >
                                        <option value="">Seleccionar...</option>
                                        {categorias.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre del Producto *
                                </label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    disabled={submitting}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Descripción
                                </label>
                                <textarea
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    rows="3"
                                    disabled={submitting}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Stock Inicial *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        min="0"
                                        required
                                        disabled={submitting}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Stock Mínimo *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.stock_minimo}
                                        onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        min="0"
                                        required
                                        disabled={submitting}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Precio de Costo *
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.precio_costo}
                                            onChange={(e) => setFormData({ ...formData, precio_costo: e.target.value })}
                                            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            min="0.01"
                                            required
                                            disabled={submitting}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Precio de Venta *
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.precio_venta}
                                            onChange={(e) => setFormData({ ...formData, precio_venta: e.target.value })}
                                            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            min="0.01"
                                            required
                                            disabled={submitting}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="submit" className="flex-1" disabled={submitting}>
                                    {submitting ? 'Creando...' : 'Crear Producto'}
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

            {/* Modal Crear Categoría */}
            {showCategoriaModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Nueva Categoría
                            </h2>
                            <button
                                onClick={() => setShowCategoriaModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                                disabled={submitting}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCrearCategoria} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre *
                                </label>
                                <input
                                    type="text"
                                    value={nuevaCategoria.nombre}
                                    onChange={(e) => setNuevaCategoria({ ...nuevaCategoria, nombre: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    disabled={submitting}
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Descripción
                                </label>
                                <textarea
                                    value={nuevaCategoria.descripcion}
                                    onChange={(e) => setNuevaCategoria({ ...nuevaCategoria, descripcion: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    rows="3"
                                    disabled={submitting}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="submit" className="flex-1" disabled={submitting}>
                                    {submitting ? 'Creando...' : 'Crear Categoría'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowCategoriaModal(false)}
                                    disabled={submitting}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Entrada */}
            {showEntradaModal && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Entrada de Inventario
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    {selectedProduct.nombre}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowEntradaModal(false);
                                    setSelectedProduct(null);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                                disabled={submitting}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitEntrada} className="p-6 space-y-4">
                            {/* Info actual */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Stock actual:</span>
                                    <span className="font-semibold text-gray-900">{selectedProduct.stock} unidades</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Precio costo actual:</span>
                                    <span className="font-semibold text-gray-900">
                                        ${parseFloat(selectedProduct.precio_costo || 0).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Cantidad */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cantidad a ingresar *
                                </label>
                                <input
                                    type="number"
                                    value={entradaFormData.cantidad}
                                    onChange={(e) => setEntradaFormData({ ...entradaFormData, cantidad: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="1"
                                    required
                                    disabled={submitting}
                                    autoFocus
                                    placeholder="Ej: 10"
                                />
                            </div>

                            {/* Precio de compra */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Precio de compra unitario *
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={entradaFormData.precio_compra}
                                        onChange={(e) => setEntradaFormData({ ...entradaFormData, precio_compra: e.target.value })}
                                        className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        min="0.01"
                                        required
                                        disabled={submitting}
                                        placeholder="0.00"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    Se calculará el costo promedio ponderado
                                </p>
                            </div>

                            {/* Motivo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Motivo de entrada
                                </label>
                                <select
                                    value={entradaFormData.motivo}
                                    onChange={(e) => setEntradaFormData({ ...entradaFormData, motivo: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={submitting}
                                >
                                    <option value="compra">Compra a proveedor</option>
                                    <option value="devolucion">Devolución de cliente</option>
                                    <option value="ajuste">Ajuste de inventario</option>
                                    <option value="produccion">Producción interna</option>
                                    <option value="otro">Otro</option>
                                </select>
                            </div>

                            {/* Observaciones */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Observaciones
                                </label>
                                <textarea
                                    value={entradaFormData.observaciones}
                                    onChange={(e) => setEntradaFormData({ ...entradaFormData, observaciones: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    rows="2"
                                    disabled={submitting}
                                    placeholder="Opcional: proveedor, factura, etc."
                                />
                            </div>

                            {/* Cálculo previo */}
                            {entradaFormData.cantidad && entradaFormData.precio_compra && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                                    <p className="text-sm font-medium text-gray-700">Vista previa:</p>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Nuevo stock:</span>
                                        <span className="font-semibold text-gray-900">
                                            {selectedProduct.stock + parseInt(entradaFormData.cantidad || 0)} unidades
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Nuevo costo promedio:</span>
                                        <span className="font-semibold text-gray-900">
                                            ${(() => {
                                                const stockActual = selectedProduct.stock;
                                                const costoActual = parseFloat(selectedProduct.precio_costo) || 0;
                                                const stockNuevo = parseInt(entradaFormData.cantidad || 0);
                                                const costoNuevo = parseFloat(entradaFormData.precio_compra || 0);
                                                const promedio = ((stockActual * costoActual) + (stockNuevo * costoNuevo)) / (stockActual + stockNuevo);
                                                return promedio.toFixed(2);
                                            })()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Total inversión:</span>
                                        <span className="font-semibold text-green-600">
                                            ${(parseInt(entradaFormData.cantidad || 0) * parseFloat(entradaFormData.precio_compra || 0)).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <Button type="submit" className="flex-1" disabled={submitting}>
                                    {submitting ? 'Procesando...' : 'Confirmar Entrada'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowEntradaModal(false);
                                        setSelectedProduct(null);
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

            {/* Modal de Salida */}
            {showSalidaModal && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Salida de Inventario
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    {selectedProduct.nombre}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowSalidaModal(false);
                                    setSelectedProduct(null);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                                disabled={submitting}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitSalida} className="p-6 space-y-4">
                            {/* Info actual */}
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Stock actual:</span>
                                    <span className="font-semibold text-gray-900">{selectedProduct.stock} unidades</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Precio costo:</span>
                                    <span className="font-semibold text-gray-900">
                                        ${parseFloat(selectedProduct.precio_costo || 0).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Cantidad */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cantidad a descontar *
                                </label>
                                <input
                                    type="number"
                                    value={salidaFormData.cantidad}
                                    onChange={(e) => setSalidaFormData({ ...salidaFormData, cantidad: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    min="1"
                                    max={selectedProduct.stock}
                                    required
                                    disabled={submitting}
                                    autoFocus
                                    placeholder="Ej: 5"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Máximo disponible: {selectedProduct.stock}
                                </p>
                            </div>

                            {/* Motivo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Motivo de salida *
                                </label>
                                <select
                                    value={salidaFormData.motivo}
                                    onChange={(e) => setSalidaFormData({ ...salidaFormData, motivo: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    disabled={submitting}
                                    required
                                >
                                    <option value="ajuste">Ajuste de inventario</option>
                                    <option value="merma">Merma/pérdida</option>
                                    <option value="donacion">Donación</option>
                                    <option value="destruccion">Destrucción</option>
                                    <option value="otro">Otro</option>
                                </select>
                            </div>

                            {/* Observaciones */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Observaciones
                                </label>
                                <textarea
                                    value={salidaFormData.observaciones}
                                    onChange={(e) => setSalidaFormData({ ...salidaFormData, observaciones: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                                    rows="2"
                                    disabled={submitting}
                                    placeholder="Opcional: motivo específico, responsable, etc."
                                />
                            </div>

                            {/* Vista previa */}
                            {salidaFormData.cantidad && parseInt(salidaFormData.cantidad) > 0 && (
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-2">
                                    <p className="text-sm font-medium text-gray-700">Vista previa:</p>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Nuevo stock:</span>
                                        <span className="font-semibold text-gray-900">
                                            {selectedProduct.stock - parseInt(salidaFormData.cantidad || 0)} unidades
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Valor de salida:</span>
                                        <span className="font-semibold text-red-600">
                                            ${(parseInt(salidaFormData.cantidad || 0) * parseFloat(selectedProduct.precio_costo || 0)).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700" disabled={submitting}>
                                    {submitting ? 'Procesando...' : 'Confirmar Salida'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowSalidaModal(false);
                                        setSelectedProduct(null);
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

            {/* Modal de Historial */}
            {showHistorialModal && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Historial de Movimientos
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    {selectedProduct.nombre} - Stock actual: {selectedProduct.stock} unidades
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowHistorialModal(false);
                                    setSelectedProduct(null);
                                    setMovimientos([]);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {loadingHistorial ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="ml-3 text-gray-600">Cargando historial...</span>
                                </div>
                            ) : movimientos.length === 0 ? (
                                <div className="text-center py-12">
                                    <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-600">No hay movimientos registrados</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {movimientos.map((mov, idx) => (
                                        <div
                                            key={mov.id || idx}
                                            className={`border-l-4 ${mov.tipo === 'entrada'
                                                    ? 'border-green-500 bg-green-50'
                                                    : 'border-red-500 bg-red-50'
                                                } rounded-lg p-4`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3 flex-1">
                                                    <div className={`p-2 rounded-full ${mov.tipo === 'entrada'
                                                            ? 'bg-green-100'
                                                            : 'bg-red-100'
                                                        }`}>
                                                        {mov.tipo === 'entrada' ? (
                                                            <PackagePlus className="w-5 h-5 text-green-600" />
                                                        ) : (
                                                            <PackageMinus className="w-5 h-5 text-red-600" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h4 className={`font-semibold ${mov.tipo === 'entrada'
                                                                    ? 'text-green-900'
                                                                    : 'text-red-900'
                                                                }`}>
                                                                {mov.tipo === 'entrada' ? '↑ ENTRADA' : '↓ SALIDA'}
                                                            </h4>
                                                            <span className="text-xs text-gray-500">
                                                                <Calendar className="w-3 h-3 inline mr-1" />
                                                                {new Date(mov.fecha).toLocaleDateString('es-MX', {
                                                                    day: '2-digit',
                                                                    month: 'short',
                                                                    year: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </span>
                                                        </div>
                                                        <div className="space-y-1 text-sm">
                                                            <p className="text-gray-700">
                                                                <span className="font-medium">Cantidad:</span> {mov.cantidad} unidades
                                                            </p>
                                                            {mov.motivo && (
                                                                <p className="text-gray-700">
                                                                    <span className="font-medium">Motivo:</span> {mov.motivo}
                                                                </p>
                                                            )}
                                                            {mov.tipo === 'entrada' && mov.precio_unitario && (
                                                                <p className="text-gray-700">
                                                                    <span className="font-medium">Precio:</span> ${parseFloat(mov.precio_unitario).toFixed(2)} c/u
                                                                </p>
                                                            )}
                                                            {mov.observaciones && (
                                                                <p className="text-gray-600 italic mt-2">
                                                                    "{mov.observaciones}"
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-lg font-bold ${mov.tipo === 'entrada'
                                                            ? 'text-green-600'
                                                            : 'text-red-600'
                                                        }`}>
                                                        {mov.tipo === 'entrada' ? '+' : '-'}{mov.cantidad}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200">
                            <Button
                                onClick={() => {
                                    setShowHistorialModal(false);
                                    setSelectedProduct(null);
                                    setMovimientos([]);
                                }}
                                className="w-full"
                            >
                                Cerrar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}