import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  FileText, 
  BarChart3, 
  Users, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Package, label: 'Inventario', path: '/inventario' },
  { icon: ShoppingCart, label: 'Ventas', path: '/ventas' },
  { icon: FileText, label: 'Facturación', path: '/facturacion' },
  { icon: BarChart3, label: 'Reportes', path: '/reportes' },
  { icon: Users, label: 'Usuarios', path: '/usuarios' },
  { icon: Settings, label: 'Configuración', path: '/configuracion' },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside 
      className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">LN</span>
            </div>
            <span className="font-bold text-gray-800 text-lg">Localito Norteño</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  } ${isCollapsed ? 'justify-center' : ''}`
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
            <p className="text-xs font-semibold text-blue-900 mb-1">
              ¿Necesitas ayuda?
            </p>
            <p className="text-xs text-blue-700 mb-2">
              Consulta nuestro manual de usuario
            </p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-1.5 rounded transition-colors">
              Ver Manual
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}