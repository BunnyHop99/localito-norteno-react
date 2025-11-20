// Clase de error personalizada para la API
export class APIError extends Error {
  constructor(message, statusCode, data = null, originalError = null) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.data = data;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }
}

// Mensajes de error por código de estado
const ERROR_MESSAGES = {
  400: 'Solicitud inválida. Por favor verifica la información.',
  401: 'No autorizado. Tu sesión ha expirado.',
  403: 'No tienes permisos para realizar esta acción.',
  404: 'Recurso no encontrado.',
  409: 'Conflicto. El recurso ya existe.',
  422: 'Error de validación. Verifica los datos ingresados.',
  429: 'Demasiadas solicitudes. Por favor espera un momento.',
  500: 'Error interno del servidor. Intenta nuevamente.',
  502: 'Error de conexión con el servidor.',
  503: 'Servicio temporalmente no disponible.',
  504: 'Tiempo de espera agotado. Intenta nuevamente.'
};

// Función principal para manejar errores de la API
export const handleAPIError = (error) => {
  // Error de respuesta del servidor
  if (error.response) {
    const { status, data } = error.response;
    
    // Obtener mensaje del error
    let message = data?.message || data?.error || data?.detail;
    
    // Si no hay mensaje específico, usar mensaje por defecto
    if (!message) {
      message = ERROR_MESSAGES[status] || 'Error desconocido';
    }
    
    throw new APIError(message, status, data, error);
  }
  
  // Error de red (sin respuesta del servidor)
  if (error.request) {
    throw new APIError(
      'Error de conexión. Por favor verifica tu internet.',
      0,
      null,
      error
    );
  }
  
  // Error en la configuración de la petición
  throw new APIError(
    'Error al procesar la solicitud.',
    0,
    null,
    error
  );
};

// Validar errores de campo específicos
export const getFieldErrors = (error) => {
  if (error instanceof APIError && error.data) {
    // Django Rest Framework devuelve errores así: {field: ['error1', 'error2']}
    const fieldErrors = {};
    
    Object.keys(error.data).forEach(field => {
      const errors = error.data[field];
      if (Array.isArray(errors)) {
        fieldErrors[field] = errors[0]; // Tomar el primer error
      } else if (typeof errors === 'string') {
        fieldErrors[field] = errors;
      }
    });
    
    return fieldErrors;
  }
  
  return {};
};

// Determinar si el error es de autenticación
export const isAuthError = (error) => {
  return error instanceof APIError && (error.statusCode === 401 || error.statusCode === 403);
};

// Determinar si el error es de validación
export const isValidationError = (error) => {
  return error instanceof APIError && (error.statusCode === 400 || error.statusCode === 422);
};

// Determinar si es error de red
export const isNetworkError = (error) => {
  return error instanceof APIError && error.statusCode === 0;
};

// Log de errores para debugging
export const logError = (error, context = {}) => {
  if (process.env.NODE_ENV === 'development') {
    console.group('🔴 Error Log');
    console.error('Error:', error);
    console.log('Context:', context);
    console.log('Timestamp:', new Date().toISOString());
    
    if (error instanceof APIError) {
      console.log('Status Code:', error.statusCode);
      console.log('Data:', error.data);
      console.log('Original Error:', error.originalError);
    }
    
    console.groupEnd();
  }
  
  // Aquí podrías enviar el error a un servicio de tracking como Sentry
  // sendToErrorTracking(error, context);
};

// Función helper para retry de peticiones
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // No reintentar en errores de autenticación o validación
      if (isAuthError(error) || isValidationError(error)) {
        throw error;
      }
      
      // Si es el último intento, lanzar el error
      if (i === maxRetries - 1) {
        throw error;
      }
      
      // Esperar antes de reintentar (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  
  throw lastError;
};

// Wrapper para manejar errores en async/await
export const tryAsync = async (fn, errorMessage = 'Ha ocurrido un error') => {
  try {
    return [await fn(), null];
  } catch (error) {
    const handledError = error instanceof APIError 
      ? error 
      : new APIError(errorMessage, 0, null, error);
    
    return [null, handledError];
  }
};

// Función para mostrar mensajes de error amigables
export const getErrorMessage = (error) => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof APIError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Ha ocurrido un error inesperado';
};

export default {
  APIError,
  handleAPIError,
  getFieldErrors,
  isAuthError,
  isValidationError,
  isNetworkError,
  logError,
  retryRequest,
  tryAsync,
  getErrorMessage
};