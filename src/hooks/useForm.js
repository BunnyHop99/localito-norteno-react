import { useState, useCallback } from 'react';

export const useForm = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validar un campo individual
  const validateField = useCallback((fieldName, value) => {
    if (!validationRules[fieldName]) return '';

    const rules = validationRules[fieldName];
    
    // Required
    if (rules.required) {
      if (!value || (typeof value === 'string' && !value.trim())) {
        return rules.required.message || 'Este campo es requerido';
      }
    }

    // Si el campo está vacío y no es requerido, no validar más
    if (!value && !rules.required) return '';

    // Min length
    if (rules.minLength && value.length < rules.minLength.value) {
      return rules.minLength.message || `Mínimo ${rules.minLength.value} caracteres`;
    }

    // Max length
    if (rules.maxLength && value.length > rules.maxLength.value) {
      return rules.maxLength.message || `Máximo ${rules.maxLength.value} caracteres`;
    }

    // Min value
    if (rules.min !== undefined && Number(value) < rules.min.value) {
      return rules.min.message || `El valor mínimo es ${rules.min.value}`;
    }

    // Max value
    if (rules.max !== undefined && Number(value) > rules.max.value) {
      return rules.max.message || `El valor máximo es ${rules.max.value}`;
    }

    // Pattern (regex)
    if (rules.pattern && !rules.pattern.value.test(value)) {
      return rules.pattern.message || 'Formato inválido';
    }

    // Custom validation
    if (rules.custom) {
      const isValid = rules.custom.isValid(value, values);
      if (!isValid) {
        return rules.custom.message || 'Validación fallida';
      }
    }

    return '';
  }, [validationRules, values]);

  // Manejar cambio de input
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setValues(prev => ({ ...prev, [name]: newValue }));
    
    // Validar en tiempo real si el campo ya fue tocado
    if (touched[name]) {
      const error = validateField(name, newValue);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [touched, validateField]);

  // Manejar blur (cuando el usuario sale del campo)
  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [validateField]);

  // Validar todos los campos
  const validateAllFields = useCallback(() => {
    const newErrors = {};
    let hasErrors = false;

    Object.keys(validationRules).forEach(field => {
      const error = validateField(field, values[field]);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    setTouched(Object.keys(validationRules).reduce((acc, key) => ({ ...acc, [key]: true }), {}));

    return !hasErrors;
  }, [validationRules, values, validateField]);

  // Manejar submit
  const handleSubmit = useCallback((onSubmit) => {
    return async (e) => {
      if (e && e.preventDefault) {
        e.preventDefault();
      }
      
      // Validar todos los campos
      const isValid = validateAllFields();

      if (!isValid) {
        return;
      }

      // Enviar formulario
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Error en submit:', error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    };
  }, [values, validateAllFields]);

  // Resetear formulario
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Establecer valores manualmente
  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  // Establecer error manualmente
  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  // Establecer múltiples errores
  const setFieldErrors = useCallback((newErrors) => {
    setErrors(newErrors);
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValues,
    setFieldValue,
    setFieldError,
    setFieldErrors,
    validateField,
    validateAllFields
  };
};

// Validadores comunes predefinidos
export const validators = {
  required: (message = 'Este campo es requerido') => ({
    required: { message }
  }),

  email: (message = 'Email inválido') => ({
    required: { message: 'El email es requerido' },
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message
    }
  }),

  minLength: (length, message) => ({
    minLength: {
      value: length,
      message: message || `Mínimo ${length} caracteres`
    }
  }),

  maxLength: (length, message) => ({
    maxLength: {
      value: length,
      message: message || `Máximo ${length} caracteres`
    }
  }),

  number: (message = 'Debe ser un número') => ({
    pattern: {
      value: /^[0-9]+$/,
      message
    }
  }),

  decimal: (message = 'Debe ser un número decimal') => ({
    pattern: {
      value: /^[0-9]+(\.[0-9]+)?$/,
      message
    }
  }),

  phone: (message = 'Teléfono inválido') => ({
    pattern: {
      value: /^[0-9]{10}$/,
      message
    }
  }),

  rfc: (message = 'RFC inválido') => ({
    pattern: {
      value: /^([A-ZÑ&]{3,4})\d{6}([A-Z0-9]{3})$/,
      message
    }
  }),

  password: (message = 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número') => ({
    required: { message: 'La contraseña es requerida' },
    minLength: { value: 8, message: 'Mínimo 8 caracteres' },
    custom: {
      isValid: (value) => /[A-Z]/.test(value) && /[a-z]/.test(value) && /[0-9]/.test(value),
      message
    }
  }),

  match: (fieldName, fieldLabel, message) => ({
    custom: {
      isValid: (value, values) => value === values[fieldName],
      message: message || `Debe coincidir con ${fieldLabel}`
    }
  })
};