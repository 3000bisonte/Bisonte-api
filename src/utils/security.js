// Sistema de validación y seguridad para la aplicación
import CONFIG from '../config/app.config.js';

export class SecurityValidator {
  
  // Validar email
  static validateEmail(email) {
    if (!email || typeof email !== 'string') {
      return { valid: false, error: 'Email es requerido' };
    }
    
    if (!CONFIG.VALIDATION.EMAIL_REGEX.test(email)) {
      return { valid: false, error: 'Formato de email inválido' };
    }
    
    return { valid: true };
  }
  
  // Validar teléfono
  static validatePhone(phone) {
    if (!phone || typeof phone !== 'string') {
      return { valid: false, error: 'Teléfono es requerido' };
    }
    
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    if (!CONFIG.VALIDATION.PHONE_REGEX.test(cleanPhone)) {
      return { valid: false, error: 'Formato de teléfono inválido' };
    }
    
    return { valid: true };
  }
  
  // Validar datos de envío
  static validateShipment(data) {
    const errors = [];
    
    if (!data.origen || data.origen.trim().length < 3) {
      errors.push('Origen debe tener al menos 3 caracteres');
    }
    
    if (!data.destino || data.destino.trim().length < 3) {
      errors.push('Destino debe tener al menos 3 caracteres');
    }
    
    if (!data.peso || data.peso <= 0 || data.peso > 1000) {
      errors.push('Peso debe estar entre 0.1 y 1000 kg');
    }
    
    if (data.largo && (data.largo <= 0 || data.largo > 300)) {
      errors.push('Largo debe estar entre 1 y 300 cm');
    }
    
    if (data.ancho && (data.ancho <= 0 || data.ancho > 300)) {
      errors.push('Ancho debe estar entre 1 y 300 cm');
    }
    
    if (data.alto && (data.alto <= 0 || data.alto > 300)) {
      errors.push('Alto debe estar entre 1 y 300 cm');
    }
    
    if (data.valorDeclarado && (data.valorDeclarado < 0 || data.valorDeclarado > 50000000)) {
      errors.push('Valor declarado debe estar entre $0 y $50.000.000');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  }
  
  // Sanitizar input para prevenir XSS
  static sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/[<>]/g, '') // Remover < y >
      .replace(/javascript:/gi, '') // Remover javascript:
      .replace(/on\w+=/gi, '') // Remover event handlers
      .trim();
  }
  
  // Validar datos de contacto
  static validateContact(data) {
    const errors = [];
    
    const emailValidation = this.validateEmail(data.email);
    if (!emailValidation.valid) {
      errors.push(emailValidation.error);
    }
    
    if (!data.nombre || data.nombre.trim().length < 2) {
      errors.push('Nombre debe tener al menos 2 caracteres');
    }
    
    if (!data.mensaje || data.mensaje.trim().length < 10) {
      errors.push('Mensaje debe tener al menos 10 caracteres');
    }
    
    if (data.mensaje && data.mensaje.length > 1000) {
      errors.push('Mensaje no puede exceder 1000 caracteres');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  }
  
  // Validar configuración antes de usar APIs
  static validateConfiguration() {
    const issues = [];
    
    // Verificar AdMob
    if (!CONFIG.ADMOB.APP_ID || CONFIG.ADMOB.APP_ID.includes('test')) {
      issues.push('AdMob: IDs de test detectados en producción');
    }
    
    // Verificar MercadoPago
    if (!CONFIG.MERCADOPAGO.PUBLIC_KEY || CONFIG.MERCADOPAGO.PUBLIC_KEY.includes('TEST')) {
      issues.push('MercadoPago: Credenciales de test detectadas en producción');
    }
    
    // Verificar API
    if (!CONFIG.API.BASE_URL || CONFIG.API.BASE_URL.includes('localhost')) {
      issues.push('API: URL localhost detectada en producción');
    }
    
    return {
      valid: issues.length === 0,
      issues: issues
    };
  }
}

// Función para logs seguros (no mostrar datos sensibles)
export const secureLog = (message, data = {}) => {
  if (CONFIG.APP.DEBUG) {
    const sanitizedData = { ...data };
    
    // Ocultar datos sensibles
    if (sanitizedData.password) sanitizedData.password = '***';
    if (sanitizedData.token) sanitizedData.token = '***';
    if (sanitizedData.accessToken) sanitizedData.accessToken = '***';
    
    console.log(`[${CONFIG.APP.NAME}] ${message}`, sanitizedData);
  }
};

// Función para reportar errores de forma segura
export const reportError = (error, context = {}) => {
  const errorReport = {
    message: error.message,
    timestamp: new Date().toISOString(),
    context: context,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'Unknown'
  };
  
  // En producción, enviar a servicio de monitoreo
  if (CONFIG.APP.ENVIRONMENT === 'production') {
    // Aquí puedes integrar con Sentry, LogRocket, etc.
    console.error('[PRODUCTION ERROR]', errorReport);
  } else {
    console.error('[DEVELOPMENT ERROR]', errorReport);
  }
};

export default SecurityValidator;
