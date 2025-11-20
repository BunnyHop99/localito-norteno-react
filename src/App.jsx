import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './hooks/useToast';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './components/auth/Login';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Inventario from './pages/Inventario';
import Ventas from './pages/Ventas';
import Facturacion from './pages/Facturacion';
import Reportes from './pages/Reportes';
import Usuarios from './pages/Usuarios';
import Configuracion from './pages/Configuracion';

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider position="top-right">
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Ruta pública */}
              <Route path="/login" element={<Login />} />

              {/* Rutas protegidas */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="inventario" element={<Inventario />} />
                <Route path="ventas" element={<Ventas />} />
                <Route path="facturacion" element={<Facturacion />} />
                <Route path="reportes" element={<Reportes />} />
                <Route path="usuarios" element={<Usuarios />} />
                <Route path="configuracion" element={<Configuracion />} />
              </Route>

              {/* Redirección para rutas no encontradas */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;