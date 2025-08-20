// =================== CLIENTE API SEPARADO DEL BUILD ESTÁTICO ===================
import { API_CONFIG } from '../config/api.js';
import logger from '../utils/logger.js';

// Cliente HTTP para las APIs - Usa backend separado
export const apiClient = {
  _unauthorizedHandler: null,
  // Configurar callback custom para 401
  setUnauthorizedHandler(fn) { this._unauthorizedHandler = fn; },
  // Obtener URL base del API dinámicamente
  getApiBaseUrl() { return API_CONFIG.getApiBaseURL(); },
  // Helper genérico
  async _request(method, endpoint, data, timeoutMs = 15000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const apiBaseUrl = this.getApiBaseUrl();
    const fullUrl = `${apiBaseUrl}${endpoint}`;
    const opts = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.getAuthHeader(),
      },
      signal: controller.signal
    };
    if (data !== undefined) opts.body = JSON.stringify(data);
    try {
      logger.api(method, fullUrl, data);
      const response = await fetch(fullUrl, opts);
      clearTimeout(timeoutId);
      if (response.status === 401) {
        // No limpiar ni redirigir automáticamente para evitar bucles de logout.
        // Dejar que el hook de sesión intente refresh o que el consumidor maneje el error.
        if (this._unauthorizedHandler) {
          try { this._unauthorizedHandler(); } catch {}
        }
        throw new Error('No autorizado (401)');
      }
      if (!response.ok) {
        let errText=''; try { errText = await response.text(); } catch {}
        logger.apiError(method, fullUrl, `${response.status} - ${response.statusText}${errText?` - ${errText.substring(0,100)}`:''}`);
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}${errText?` - ${errText.substring(0,300)}`:''}`);
      }
      // Algunos endpoints pueden devolver 204 sin contenido
      if (response.status === 204) return null;
      const ct = response.headers.get('content-type')||'';
      if (ct.includes('application/json')) {
        const result = await response.json();
        logger.apiSuccess(method, fullUrl, result);
        return result;
      }
      const text = await response.text();
      logger.apiSuccess(method, fullUrl, text.slice(0,120));
      return text;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - Verifica tu conexión a internet');
      }
      throw error;
    }
  },
  async get(e){ return this._request('GET', e); },
  async post(e,d){ return this._request('POST', e, d); },
  async put(e,d){ return this._request('PUT', e, d); },
  async patch(e,d){ return this._request('PATCH', e, d); },
  async delete(e){ return this._request('DELETE', e, undefined, 10000); },

  // Obtener header de autorización
  getAuthHeader() {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      return token ? `Bearer ${token}` : '';
    }
    return '';
  },

  // Guardar token en localStorage
  setAuthToken(token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  },

  // Eliminar token del localStorage
  removeAuthToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }
};

// APIs específicas
export const authAPI = {
  // Alinear con el backend real: prefijo /api
  login: (email, password) => apiClient.post('/api/auth/login', { email, password }),
  // Google Identity Services: enviar idToken (credential)
  googleLogin: (idToken, extra = {}) => {
    // Enviar varias claves para compatibilidad: algunos backends esperan 'credential' o 'id_token'
    const payload = {
      idToken,
      id_token: idToken,
      credential: idToken,
      clientId: (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) ? process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID : undefined,
      ...extra,
    };
    return apiClient.post('/api/auth/google', payload);
  },
  getSession: () => apiClient.get('/api/auth/session'),
};

export const enviosAPI = {
  getAll: () => apiClient.get('/api/envios'),
  getByUser: (userId) => apiClient.get(`/api/envios/${userId}`),
  create: (data) => apiClient.post('/api/envios', data),
  update: (id, data) => apiClient.put(`/api/envios/${id}`, data),
};

export const usuariosAPI = {
  getAll: () => apiClient.get('/api/usuarios'),
  getById: (id) => apiClient.get(`/api/usuarios/${id}`),
  create: (data) => apiClient.post('/api/usuarios', data),
  update: (id, data) => apiClient.put(`/api/usuarios/${id}`, data),
};

export const emailAPI = {
  sendContact: (data) => apiClient.post('/api/email', { type: 'contact', data }),
  sendShipmentNotification: (data) => apiClient.post('/api/email', { type: 'shipment', data }),
  testService: () => apiClient.get('/api/email'),
};

// Para compatibilidad con las funciones existentes de Next.js
export const compatibilityLogin = async (email, password) => {
  try {
    const result = await authAPI.login(email, password);
    
    if (result.success) {
      // Guardar token
      apiClient.setAuthToken(result.token);
      
      // Simular respuesta de NextAuth
      return {
        ok: true,
        error: null,
        user: result.user
      };
    } else {
      return {
        ok: false,
        error: result.error || 'Error de autenticación'
      };
    }
  } catch (error) {
    return {
      ok: false,
      error: error.message || 'Error de conexión'
    };
  }
};

export default apiClient;
