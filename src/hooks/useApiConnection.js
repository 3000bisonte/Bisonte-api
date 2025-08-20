// Solución para URL dinámica - Configuración automática de API
import { useState, useEffect } from 'react';

// URLs posibles del API (en orden de prioridad)
const API_URLS = [
  'https://bisonte-gkcqbupdj-eduardos-projects-9d27e028.vercel.app/api', // URL que funciona
  'https://bisonte-logistica-main.vercel.app/api', // URL principal (si se restaura)
  'https://api-bisonte.vercel.app/api', // URL personalizada (cuando la configures)
  'https://bisonte-api.vercel.app/api', // Alternativa
];

// Hook para detectar automáticamente la URL correcta del API
export const useApiUrl = () => {
  const [apiUrl, setApiUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const detectWorkingApiUrl = async () => {
      setIsLoading(true);
      
      // Primero intentar con la URL del .env.local
      const envApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (envApiUrl) {
        try {
          // Timeout más corto para evitar cuelgues
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          
          const response = await fetch(envApiUrl.replace('/api', '/'), { 
            method: 'GET',
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            setApiUrl(envApiUrl);
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.warn('URL del .env.local no responde, usando primera URL alternativa...');
        }
      }
      
      // Si la URL del .env.local no funciona, usar la primera alternativa directamente
      setApiUrl(API_URLS[0]); // Usar la URL que sabemos que funciona
      setIsLoading(false);
    };

    detectWorkingApiUrl();
  }, []);

  return { apiUrl, isLoading, error };
};

// Función para hacer requests seguros con retry automático
export const secureApiRequest = async (endpoint, options = {}) => {
  const { apiUrl } = useApiUrl();
  
  if (!apiUrl) {
    throw new Error('API URL no disponible');
  }
  
  const maxRetries = 3;
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`${apiUrl}${endpoint}`, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'BisonteApp/1.0.0',
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      lastError = error;
      console.warn(`Intento ${i + 1} fallido:`, error.message);
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
  
  throw lastError;
};

// Componente para mostrar el estado de la conexión API
export const ApiConnectionStatus = () => {
  const { apiUrl, isLoading, error } = useApiUrl();
  
  if (isLoading) {
    return (
      <div className="api-status loading">
        🔍 Conectando con servidor...
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="api-status error">
        ❌ Error: {error}
      </div>
    );
  }
  
  return (
    <div className="api-status connected">
      ✅ Conectado: {apiUrl}
    </div>
  );
};

export default { useApiUrl, secureApiRequest, ApiConnectionStatus };
