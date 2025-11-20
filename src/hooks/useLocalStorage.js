import { useState, useEffect } from 'react';

export const useLocalStorage = (key, initialValue) => {
  // Obtener valor inicial del localStorage o usar el initialValue
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error al leer ${key} del localStorage:`, error);
      return initialValue;
    }
  });

  // Guardar en localStorage cuando cambia el valor
  const setValue = (value) => {
    try {
      // Permitir que value sea una función como useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      if (valueToStore === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error al guardar ${key} en localStorage:`, error);
    }
  };

  // Remover del localStorage
  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(undefined);
    } catch (error) {
      console.error(`Error al eliminar ${key} del localStorage:`, error);
    }
  };

  return [storedValue, setValue, removeValue];
};

// Hook para sessionStorage
export const useSessionStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error al leer ${key} del sessionStorage:`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      if (valueToStore === undefined) {
        window.sessionStorage.removeItem(key);
      } else {
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error al guardar ${key} en sessionStorage:`, error);
    }
  };

  const removeValue = () => {
    try {
      window.sessionStorage.removeItem(key);
      setStoredValue(undefined);
    } catch (error) {
      console.error(`Error al eliminar ${key} del sessionStorage:`, error);
    }
  };

  return [storedValue, setValue, removeValue];
};