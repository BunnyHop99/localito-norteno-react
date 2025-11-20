import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './common/Button';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Aquí podrías enviar el error a un servicio de logging como Sentry
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // Usar componente personalizado si se proporciona
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      // UI por defecto
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Oops! Algo salió mal
            </h2>
            
            <p className="text-gray-600 mb-6">
              Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={this.handleReset}
                variant="primary"
                icon={RefreshCw}
              >
                Reintentar
              </Button>
              
              <Button
                onClick={() => window.location.reload()}
                variant="secondary"
              >
                Recargar Página
              </Button>
            </div>

            {/* Mostrar detalles en desarrollo */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900 font-medium">
                  Ver detalles técnicos
                </summary>
                <div className="mt-3 p-4 bg-red-50 rounded-lg">
                  <p className="text-sm font-mono text-red-900 mb-2">
                    <strong>Error:</strong> {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="text-xs text-red-800 overflow-auto max-h-48">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook para usar en componentes funcionales
export class AsyncErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error asíncrono capturado:', error, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">
            Error al cargar el componente. Por favor, recarga la página.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}