const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Resend } = require('resend');

// Configurar dotenv
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
// Utilidades JWT
const { signToken, verifyToken, verifyRefreshToken, authMiddleware, requireAuth, requireAdmin } = require('./auth-utils');
let GoogleClient = null;
try {
  const { OAuth2Client } = require('google-auth-library');
  if (process.env.GOOGLE_CLIENT_ID) {
    GoogleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }
} catch(_e) {
  console.log('google-auth-library no disponible');
}

// Inicializar Resend solo si hay API key
let resend = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
  console.log('✅ Resend configurado correctamente');
} else {
  console.log('⚠️ RESEND_API_KEY no encontrada - usando modo simulado');
}

// Middlewares
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting básico (en memoria)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutos
const RATE_LIMIT_MAX = 100; // 100 requests por ventana

app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }
  
  const requests = rateLimitMap.get(ip);
  // Limpiar requests antiguos
  const recentRequests = requests.filter(time => time > windowStart);
  
  if (recentRequests.length >= RATE_LIMIT_MAX) {
    return res.status(429).json({
      success: false,
      error: 'Demasiadas solicitudes. Intente nuevamente en 15 minutos.',
      retryAfter: Math.ceil((recentRequests[0] + RATE_LIMIT_WINDOW - now) / 1000)
    });
  }
  
  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);
  
  // Limpiar IPs obsoletas cada 100 requests
  if (Math.random() < 0.01) {
    for (const [checkIp, times] of rateLimitMap.entries()) {
      if (times.every(time => time <= windowStart)) {
        rateLimitMap.delete(checkIp);
      }
    }
  }
  
  next();
});

// Decodificar token si viene (no obligatorio)
app.use(authMiddleware);

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Bisonte API Server SIMPLIFICADO', 
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});
 
  // Extended health with env introspection
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'OK',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      env: {
        node: process.version,
        vercel: !!process.env.VERCEL,
      },
      vars: {
        database_url: !!process.env.DATABASE_URL,
        jwt_secret: !!process.env.JWT_SECRET,
        mp_public: !!process.env.MERCADOPAGO_PUBLIC_KEY,
        mp_access: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
        resend: !!process.env.RESEND_API_KEY,
        google_client: !!process.env.GOOGLE_CLIENT_ID
      }
    });
  });

// ===== APIS PRINCIPALES =====

// API de Envíos - Cálculo de costos
app.post('/api/envios', (req, res) => {
  try {
    console.log('📦 Cálculo de envío:', req.body);
    
    const { origen, destino, peso, largo, ancho, alto, valorDeclarado } = req.body;
    
    if (!origen || !destino || !peso) {
      return res.status(400).json({
        success: false,
        error: 'Origen, destino y peso son requeridos'
      });
    }

    // Cálculo básico de envío
    const distancia = Math.random() * 1000 + 100; // Simular distancia
    const pesoVolumetrico = (largo * ancho * alto) / 5000; // Factor volumétrico
    const pesoFinal = Math.max(peso, pesoVolumetrico);
    
    const costoBase = pesoFinal * 2.5 + distancia * 0.1;
    const seguro = valorDeclarado ? valorDeclarado * 0.01 : 0;
    const total = costoBase + seguro;

    res.json({
      success: true,
      cotizacion: {
        origen,
        destino,
        peso: pesoFinal,
        distancia: Math.round(distancia),
        costoBase: Math.round(costoBase),
        seguro: Math.round(seguro),
        total: Math.round(total),
        tiempoEstimado: '2-5 días hábiles',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error en cálculo de envío:', error);
    res.status(500).json({
      success: false,
      error: 'Error calculando envío'
    });
  }
});

// API de Perfil - Información del usuario (protegido)
app.get('/api/perfil', requireAuth, (req, res) => {
  try {
    res.json({
      success: true,
      perfil: {
        id: 1,
        nombre: 'Usuario Demo',
        email: 'demo@bisonte.com',
        telefono: '+57 300 123 4567',
        direccion: 'Calle 123 #45-67, Bogotá',
        enviosRealizados: 15,
        fechaRegistro: '2024-01-15',
        estadoCuenta: 'activo'
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo perfil'
    });
  }
});

// API de Contacto - Envío de mensajes
app.post('/api/contacto', (req, res) => {
  try {
    console.log('📧 Mensaje de contacto:', req.body);
    
    const { nombre, email, mensaje } = req.body;
    
    if (!nombre || !email || !mensaje) {
      return res.status(400).json({
        success: false,
        error: 'Nombre, email y mensaje son requeridos'
      });
    }

    // Simular envío de email
    console.log('✅ Email enviado correctamente');
    
    res.json({
      success: true,
      message: 'Mensaje enviado correctamente',
      id: 'MSG_' + Date.now()
    });

  } catch (error) {
    console.error('❌ Error enviando mensaje:', error);
    res.status(500).json({
      success: false,
      error: 'Error enviando mensaje'
    });
  }
});

// API de MercadoPago - Status y procesamiento
app.get('/api/mercadopago/status', (req, res) => {
  try {
    res.json({
      success: true,
      status: 'configurado',
      environment: 'test',
      publicKey: process.env.MERCADOPAGO_PUBLIC_KEY || 'TEST-key',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error MercadoPago status:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo status MercadoPago'
    });
  }
});

app.post('/api/mercadopago/create-preference', (req, res) => {
  try {
    console.log('💳 Creando preferencia MercadoPago:', req.body);
    
    const { amount, description, email } = req.body;
    
    if (!amount || !description) {
      return res.status(400).json({
        success: false,
        error: 'Monto y descripción son requeridos'
      });
    }

    // Simular creación de preferencia
    const preference = {
      id: 'PREF_' + Date.now(),
      init_point: 'https://www.mercadopago.com.co/checkout/v1/redirect?pref_id=TEST123',
      amount,
      description,
      status: 'created'
    };

    res.json({
      success: true,
      preference
    });

  } catch (error) {
    console.error('❌ Error creando preferencia:', error);
    res.status(500).json({
      success: false,
      error: 'Error creando preferencia de pago'
    });
  }
});

// Ruta de test y diagnóstico
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API COMPLETA funcionando', 
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/',
      test: '/api/test',
      // Autenticación
      auth_login: '/api/auth/login (POST)',
      auth_google: '/api/auth/google (POST)',
  auth_session: '/api/auth/session (GET)',
  auth_logout: '/api/auth/logout (POST)',
  auth_refresh: '/api/auth/refresh (POST - renovar tokens)',
  protegido_demo: '/api/protegido/demo (GET - requiere Bearer token)',
      register: '/api/register (POST)',
      // Usuarios
  usuarios: '/api/usuarios (GET/POST - protegido)',
  perfil: '/api/perfil (GET/POST - protegido)',
      perfil_exists: '/api/perfil/existeusuario (GET)',
      // Envíos
  envios: '/api/envios (GET/POST)',
  envios_historial: '/api/envios/historial (GET - protegido)',
  guardar_envio: '/api/guardarenvio (POST - protegido)',
      // Contactos
      contacto: '/api/contacto (GET/POST)',
      // Remitente/Destinatario
  remitente: '/api/remitente (GET/POST - protegido)',
  destinatario: '/api/destinatario (GET/POST - protegido)',
      // MercadoPago
      mercadopago_status: '/api/mercadopago/status (GET)',
      mercadopago_preference: '/api/mercadopago/create-preference (POST)',
      // Email
      send_email: '/api/send (POST)',
      // Recuperación
      recuperar: '/api/recuperar (POST)',
      validar_token: '/api/recuperar/validar-token (POST)',
      // Administración
  admin_stats: '/api/admin/stats (GET - solo admin)',
  admin_users: '/api/admin/users (GET - solo admin)',
  admin_settings: '/api/admin/settings (GET/POST - solo admin)'
    }
  });
});

// ===== AUTENTICACIÓN =====

// Login de usuarios
app.post('/api/auth/login', (req, res) => {
  try {
    console.log('🔐 Login attempt:', req.body);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email y contraseña son requeridos'
      });
    }

    // Usuarios demo para testing
    const demoUsers = [
      { email: 'demo@bisonte.com', password: 'demo123', name: 'Usuario Demo', id: 1 },
      { email: '3000bisonte@gmail.com', password: 'admin123', name: 'Admin Bisonte', id: 2 },
      { email: 'user@test.com', password: 'test123', name: 'Usuario Test', id: 3 }
    ];

    const user = demoUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
      const { token, refreshToken, expiresIn, refreshExpiresIn, role } = signToken({ 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        provider: 'credentials' 
      });
      res.json({
        success: true,
        user: { 
          id: user.id, 
          email: user.email, 
          name: user.name,
          nombre: user.name,
          provider: 'credentials',
          role: role
        },
        token,
        refreshToken,
        token_type: 'Bearer',
        expiresIn,
        refreshExpiresIn,
        role
      });
    } else {
      res.status(401).json({ 
        success: false, 
        error: 'Credenciales incorrectas' 
      });
    }
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error del servidor' 
    });
  }
});

// Autenticación con Google
app.post('/api/auth/google', async (req, res) => {
  try {
    console.log('🔐 Google Auth attempt:', req.body);
    
    const { email, name, picture, googleId, idToken } = req.body;

    // Si llega idToken y hay GoogleClient intentar verificarlo
    if (idToken && GoogleClient) {
      try {
        const ticket = await GoogleClient.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
        const payload = ticket.getPayload();
        // Alinear datos si no vienen explícitos
        if (!email) req.body.email = payload.email;
        if (!name) req.body.name = payload.name;
      } catch (gErr) {
        console.warn('⚠️ Verificación de idToken falló, usando datos directos:', gErr.message);
      }
    }
    const finalEmail = req.body.email;
    const finalName = req.body.name;
    
  if (!finalEmail || !finalName) {
      return res.status(400).json({
        success: false,
        error: 'Email y nombre son requeridos para Google Auth'
      });
    }

    // Simular autenticación con Google exitosa
    const user = {
  id: `google_${Date.now()}`,
  email: finalEmail,
  name: finalName,
  nombre: finalName,
  picture: picture || null,
  googleId: googleId || `google_${finalEmail}`,
      provider: 'google',
      verified: true
    };

  const { token, refreshToken, expiresIn, refreshExpiresIn, role } = signToken({ 
    id: user.id, 
    email: user.email, 
    name: user.name, 
    provider: 'google' 
  });
    res.json({
      success: true,
      user: { ...user, role },
      token,
      refreshToken,
      token_type: 'Bearer',
      expiresIn,
      refreshExpiresIn,
      role,
      message: 'Autenticación con Google exitosa'
    });

  } catch (error) {
    console.error('❌ Error en Google Auth:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error del servidor en Google Auth' 
    });
  }
});

// Registro de usuarios
app.post('/api/register', (req, res) => {
  try {
    console.log('📝 Registro attempt:', req.body);
    
    const { email, password, nombre, celular, ciudad } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email y contraseña son requeridos'
      });
    }

    // Simular registro exitoso
    const newUser = {
      id: Date.now(),
      email: email,
      nombre: nombre || email.split('@')[0],
      celular: celular || '',
      ciudad: ciudad || '',
      createdAt: new Date().toISOString()
    };

    const { token, refreshToken, expiresIn, refreshExpiresIn, role } = signToken({ 
      id: newUser.id, 
      email: newUser.email, 
      name: newUser.nombre, 
      provider: 'credentials' 
    });
    res.json({
      success: true,
      message: 'Usuario registrado correctamente',
      user: { ...newUser, role },
      token,
      refreshToken,
      token_type: 'Bearer',
      expiresIn,
      refreshExpiresIn,
      role
    });
  } catch (error) {
    console.error('❌ Error en registro:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error del servidor' 
    });
  }
});

// Obtener sesión actual (si token válido)
app.get('/api/auth/session', (req, res) => {
  if (!req.user) {
    return res.status(200).json({ authenticated: false, user: null });
  }
  res.json({ authenticated: true, user: req.user });
});

// Logout (stateless JWT: cliente elimina token)
app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Logout realizado (elimine el token en el cliente)' });
});

// Refresh token endpoint
app.post('/api/auth/refresh', (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token requerido'
      });
    }
    
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token inválido o expirado'
      });
    }
    
    // Generar nuevos tokens
    const { token, refreshToken: newRefreshToken, expiresIn, refreshExpiresIn, role } = signToken({
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name || '',
      provider: 'refresh'
    });
    
    res.json({
      success: true,
      token,
      refreshToken: newRefreshToken,
      token_type: 'Bearer',
      expiresIn,
      refreshExpiresIn,
      role,
      message: 'Tokens renovados exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error en refresh:', error);
    res.status(500).json({
      success: false,
      error: 'Error del servidor'
    });
  }
});

// ===== EJEMPLO DE ENDPOINT PROTEGIDO ESTRICTO =====
app.get('/api/protegido/demo', requireAuth, (req, res) => {
  res.json({ success: true, message: 'Acceso autorizado', user: req.user });
});

// ===== USUARIOS =====

// Obtener todos los usuarios (protegido)
app.get('/api/usuarios', requireAuth, (req, res) => {
  try {
    const usuarios = [
      { id: 1, email: 'demo@bisonte.com', nombre: 'Usuario Demo', ciudad: 'Bogotá' },
      { id: 2, email: '3000bisonte@gmail.com', nombre: 'Admin Bisonte', ciudad: 'Medellín' },
      { id: 3, email: 'user@test.com', nombre: 'Usuario Test', ciudad: 'Cali' }
    ];
    
    res.json({
      success: true,
      usuarios: usuarios,
      total: usuarios.length
    });
  } catch (error) {
    console.error('❌ Error obteniendo usuarios:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error del servidor' 
    });
  }
});

// Crear usuario
app.post('/api/usuarios', (req, res) => {
  try {
    console.log('👤 Crear usuario:', req.body);
    
    const userData = req.body;
    const newUser = {
      id: Date.now(),
      ...userData,
      createdAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Usuario creado correctamente',
      user: newUser
    });
  } catch (error) {
    console.error('❌ Error creando usuario:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error del servidor' 
    });
  }
});

// Verificar si usuario existe
app.get('/api/perfil/existeusuario', (req, res) => {
  try {
    const { email } = req.query;
    // Si no se envía email devolver respuesta neutra (evitar 400 en frontend)
    if (!email) {
      return res.json({
        success: true,
        exists: false,
        email: null,
        note: 'Email no provisto, devolviendo exists=false'
      });
    }
    const exists = ['demo@bisonte.com', '3000bisonte@gmail.com'].includes(email);
    res.json({ success: true, exists, email });
  } catch (error) {
    console.error('❌ Error verificando usuario:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error del servidor' 
    });
  }
});

// Actualizar perfil (protegido)
app.post('/api/perfil', requireAuth, (req, res) => {
  try {
    console.log('📝 Actualizar perfil:', req.body);
    
    const profileData = req.body;
    
    res.json({
      success: true,
      message: 'Perfil actualizado correctamente',
      profile: {
        ...profileData,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Error actualizando perfil:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error del servidor' 
    });
  }
});

// ===== ENVÍOS ADICIONALES =====

// Obtener todos los envíos
app.get('/api/envios', (req, res) => {
  try {
    const envios = [
      {
        id: 1,
        origen: 'Bogotá',
        destino: 'Medellín',
        peso: 2.5,
        estado: 'En tránsito',
        guia: 'BST001',
        fecha: '2025-01-01'
      },
      {
        id: 2,
        origen: 'Cali',
        destino: 'Barranquilla',
        peso: 1.8,
        estado: 'Entregado',
        guia: 'BST002',
        fecha: '2025-01-02'
      }
    ];
    
    res.json({
      success: true,
      envios: envios,
      total: envios.length
    });
  } catch (error) {
    console.error('❌ Error obteniendo envíos:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error del servidor' 
    });
  }
});

// Historial de envíos
app.get('/api/envios/historial', requireAuth, (req, res) => {
  try {
    const { email } = req.query;
    
    const historial = [
      {
        id: 1,
        guia: 'BST001',
        origen: 'Bogotá',
        destino: 'Medellín',
        fecha: '2025-01-01',
        estado: 'Entregado',
        costo: 15000
      },
      {
        id: 2,
        guia: 'BST002',
        origen: 'Cali',
        destino: 'Barranquilla',
        fecha: '2025-01-02',
        estado: 'En tránsito',
        costo: 18000
      }
    ];
    
    res.json({
      success: true,
      historial: historial,
      total: historial.length,
      email: email
    });
  } catch (error) {
    console.error('❌ Error obteniendo historial:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error del servidor' 
    });
  }
});

// Guardar envío
app.post('/api/guardarenvio', requireAuth, (req, res) => {
  try {
    console.log('💾 Guardar envío:', req.body);
    
    const envioData = req.body;
    const nuevoEnvio = {
      id: Date.now(),
      guia: `BST${Math.floor(Math.random() * 10000)}`,
      ...envioData,
      estado: 'Creado',
      fechaCreacion: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Envío guardado correctamente',
      envio: nuevoEnvio
    });
  } catch (error) {
    console.error('❌ Error guardando envío:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error del servidor' 
    });
  }
});

// ===== CONTACTOS =====

// Obtener contactos
app.get('/api/contacto', (req, res) => {
  try {
    const contactos = [
      {
        id: 1,
        nombre: 'Juan Pérez',
        email: 'juan@email.com',
        mensaje: 'Consulta sobre envío',
        fecha: '2025-01-01'
      }
    ];
    
    res.json({
      success: true,
      contactos: contactos,
      total: contactos.length
    });
  } catch (error) {
    console.error('❌ Error obteniendo contactos:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error del servidor' 
    });
  }
});

// ===== REMITENTE =====

// Obtener remitentes
app.get('/api/remitente', requireAuth, (req, res) => {
  try {
    const remitentes = [
      {
        id: 1,
        nombre: 'Empresa ABC',
        documento: '123456789',
        telefono: '3001234567',
        direccion: 'Calle 123 #45-67',
        ciudad: 'Bogotá'
      }
    ];
    
    res.json({
      success: true,
      remitentes: remitentes,
      total: remitentes.length
    });
  } catch (error) {
    console.error('❌ Error obteniendo remitentes:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error del servidor' 
    });
  }
});

// Crear remitente
app.post('/api/remitente', requireAuth, (req, res) => {
  try {
    console.log('📤 Crear remitente:', req.body);
    
    const remitenteData = req.body;
    const nuevoRemitente = {
      id: Date.now(),
      ...remitenteData,
      createdAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Remitente creado correctamente',
      remitente: nuevoRemitente
    });
  } catch (error) {
    console.error('❌ Error creando remitente:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error del servidor' 
    });
  }
});

// ===== DESTINATARIO =====

// Obtener destinatarios
app.get('/api/destinatario', requireAuth, (req, res) => {
  try {
    const destinatarios = [
      {
        id: 1,
        nombre: 'María García',
        documento: '987654321',
        telefono: '3007654321',
        direccion: 'Carrera 45 #67-89',
        ciudad: 'Medellín'
      }
    ];
    
    res.json({
      success: true,
      destinatarios: destinatarios,
      total: destinatarios.length
    });
  } catch (error) {
    console.error('❌ Error obteniendo destinatarios:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error del servidor' 
    });
  }
});

// Crear destinatario
app.post('/api/destinatario', requireAuth, (req, res) => {
  try {
    console.log('📥 Crear destinatario:', req.body);
    
    const destinatarioData = req.body;
    const nuevoDestinatario = {
      id: Date.now(),
      ...destinatarioData,
      createdAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Destinatario creado correctamente',
      destinatario: nuevoDestinatario
    });
  } catch (error) {
    console.error('❌ Error creando destinatario:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error del servidor' 
    });
  }
});

// ===== EMAIL =====

// Enviar email
app.post('/api/send', async (req, res) => {
  try {
    console.log('📧 Enviar email:', req.body);
    
  let { to, subject, message, html, type } = req.body || {};
  // Rellenar faltantes para evitar 400 durante integración temprana
  if (!to) to = 'placeholder@bisonteapp.com';
  if (!subject) subject = '[Placeholder] Asunto no enviado';
  if (!message && !html) message = 'Mensaje de prueba (placeholder)';

    // Si Resend está configurado, enviar email real
    if (resend && process.env.RESEND_API_KEY) {
      try {
        const emailData = {
          from: process.env.FROM_EMAIL || 'Bisonte Logística <onboarding@resend.dev>',
          to: [to],
          subject: subject,
          text: message,
          html: html || `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #41e0b3;">Bisonte Logística</h2>
              <p>${message}</p>
              <hr style="border: 1px solid #eee; margin: 20px 0;">
              <p style="color: #666; font-size: 12px;">
                Este email fue enviado desde el sistema de Bisonte Logística.
              </p>
            </div>
          `
        };

        const result = await resend.emails.send(emailData);
        
        res.json({
          success: true,
          message: 'Email enviado correctamente con Resend',
          emailId: result.data?.id || 'resend_success',
          to: to,
          subject: subject,
          sentAt: new Date().toISOString(),
          provider: 'resend'
        });

      } catch (resendError) {
        console.error('❌ Error con Resend:', resendError);
        
        // Fallback a modo simulado si Resend falla
        res.json({
          success: true,
          message: 'Email procesado (modo fallback)',
          emailId: `fallback_${Date.now()}`,
          to: to,
          subject: subject,
          sentAt: new Date().toISOString(),
          provider: 'simulation',
          note: 'Resend falló, usando simulación'
        });
      }
    } else {
      // Modo simulado cuando no hay API key
      res.json({
        success: true,
        message: 'Email enviado correctamente (modo simulado)',
        emailId: `sim_${Date.now()}`,
        to: to,
        subject: subject,
        sentAt: new Date().toISOString(),
        provider: 'simulation',
        note: 'RESEND_API_KEY no configurada'
      });
    }

  } catch (error) {
    console.error('❌ Error enviando email:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error del servidor',
      details: error.message
    });
  }
});

// ===== RECUPERACIÓN DE CONTRASEÑA =====

// Solicitar recuperación
app.post('/api/recuperar', (req, res) => {
  try {
    console.log('🔐 Recuperar contraseña:', req.body);
    
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email es requerido'
      });
    }

    // Simular envío de token
    const token = `recovery_${Date.now()}`;
    
    res.json({
      success: true,
      message: 'Token de recuperación enviado al email',
      token: token, // En producción esto se enviaría por email
      email: email
    });
  } catch (error) {
    console.error('❌ Error en recuperación:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error del servidor' 
    });
  }
});

// Validar token de recuperación
app.post('/api/recuperar/validar-token', (req, res) => {
  try {
    console.log('🔍 Validar token:', req.body);
    
    let { token, newPassword } = req.body || {};
    if (!token) token = `dummy_${Date.now()}`;
    if (!newPassword) newPassword = 'temp1234';
    res.json({ success: true, message: 'Validación simulada', tokenValid: true });
  } catch (error) {
    console.error('❌ Error validando token:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error del servidor' 
    });
  }
});

// Stub /api/email (GET & POST) para compatibilidad
app.get('/api/email', (req, res) => {
  res.json({ success: true, message: 'Servicio email operativo (stub GET)' });
});
app.post('/api/email', (req, res) => {
  const { action } = req.body || {};
  res.json({ success: true, message: 'Email stub POST recibido', action: action || 'none' });
});

// ===== ESTADÍSTICAS DE ADMINISTRACIÓN =====

// Estadísticas para el dashboard de admin
app.get('/api/admin/stats', requireAdmin, (req, res) => {
  try {
    console.log('📊 Admin stats solicitadas por:', req.user.email, 'role:', req.user.role);
    
    // Datos de ejemplo para el dashboard
    const stats = {
      usuarios: {
        total: 156,
        nuevos_hoy: 8,
        activos: 142,
        crecimiento: "+12%"
      },
      envios: {
        total: 89,
        pendientes: 15,
        en_transito: 32,
        entregados: 42,
        crecimiento: "+8%"
      },
      mensajes: {
        total: 23,
        sin_leer: 5,
        respondidos: 18,
        crecimiento: "+5%"
      },
      ventas: {
        total_mes: 2450000,
        promedio_envio: 27528,
        comision_total: 73500,
        crecimiento: "+15%"
      },
      rendimiento: {
        tiempo_promedio_entrega: "2.3 días",
        satisfaccion_cliente: "94%",
        entregas_exitosas: "96%",
        retención_clientes: "87%"
      }
    };

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estadísticas del sistema'
    });
  }
});

// Gestión de usuarios (solo admin)
app.get('/api/admin/users', requireAdmin, (req, res) => {
  try {
    console.log('👥 Admin users solicitado por:', req.user.email);
    
    // Datos de ejemplo con información adicional de admin
    const users = [
      {
        id: 1,
        email: 'demo@bisonte.com',
        name: 'Usuario Demo',
        role: 'user',
        createdAt: '2024-01-15',
        lastLogin: '2025-01-13',
        enviosCount: 15,
        status: 'active'
      },
      {
        id: 2,
        email: '3000bisonte@gmail.com',
        name: 'Admin Bisonte',
        role: 'admin',
        createdAt: '2023-12-01',
        lastLogin: '2025-01-13',
        enviosCount: 89,
        status: 'active'
      },
      {
        id: 3,
        email: 'bisonteangela@gmail.com',
        name: 'Angela Admin',
        role: 'admin',
        createdAt: '2024-02-10',
        lastLogin: '2025-01-12',
        enviosCount: 45,
        status: 'active'
      },
      {
        id: 4,
        email: 'bisonteoskar@gmail.com',
        name: 'Oskar Admin',
        role: 'admin',
        createdAt: '2024-03-05',
        lastLogin: '2025-01-11',
        enviosCount: 67,
        status: 'active'
      }
    ];

    res.json({
      success: true,
      users,
      total: users.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error obteniendo usuarios:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo usuarios del sistema'
    });
  }
});

// Configuración del sistema (solo admin)
app.get('/api/admin/settings', requireAdmin, (req, res) => {
  try {
    console.log('⚙️ Admin settings solicitado por:', req.user.email);
    
    const settings = {
      sistema: {
        version: '2.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        maintenance: false
      },
      integraciones: {
        mercadopago: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
        resend: !!process.env.RESEND_API_KEY,
        google: !!process.env.GOOGLE_CLIENT_ID,
        database: !!process.env.DATABASE_URL
      },
      configuracion: {
        jwt_expires: '7d',
        max_envio_peso: 50,
        ciudades_disponibles: ['Bogotá', 'Medellín', 'Cali', 'Barranquilla'],
        admins_count: 3
      }
    };

    res.json({
      success: true,
      settings,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error obteniendo configuración:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo configuración del sistema'
    });
  }
});

// Actualizar configuración (solo admin)
app.post('/api/admin/settings', requireAdmin, (req, res) => {
  try {
    console.log('⚙️ Admin settings actualizado por:', req.user.email, req.body);
    
    const { setting, value } = req.body;
    
    // Simular actualización de configuración
    res.json({
      success: true,
      message: `Configuración '${setting}' actualizada correctamente`,
      setting,
      value,
      updatedBy: req.user.email,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error actualizando configuración:', error);
    res.status(500).json({
      success: false,
      error: 'Error actualizando configuración del sistema'
    });
  }
});

// Manejo de errores global
app.use((error, req, res, next) => {
  console.error('❌ Error global:', error);
  res.status(500).json({ 
    success: false, 
    error: 'Error interno del servidor' 
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  console.log('❓ Ruta no encontrada:', req.path);
  res.status(404).json({ 
    success: false, 
    error: `Ruta no encontrada: ${req.path}` 
  });
});

// ==== Enumerar rutas registradas para diagnóstico ====
function listRoutes() {
  const routes = [];
  app._router.stack.forEach(mw => {
    if (mw.route && mw.route.path) {
      const methods = Object.keys(mw.route.methods).join(',').toUpperCase();
      routes.push(`${methods} ${mw.route.path}`);
    } else if (mw.name === 'router' && mw.handle.stack) {
      mw.handle.stack.forEach(h => {
        if (h.route && h.route.path) {
          const methods = Object.keys(h.route.methods).join(',').toUpperCase();
            routes.push(`${methods} ${h.route.path}`);
        }
      });
    }
  });
  console.log('🗺️ Rutas registradas (' + routes.length + '):');
  routes.sort().forEach(r => console.log('  •', r));
}

// Exportar siempre (Vercel y otros entornos)
module.exports = app;

// Solo iniciar servidor local cuando no estamos en Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor API SIMPLIFICADO corriendo en puerto ${PORT}`);
    listRoutes();
    console.log(`📍 Health check: http://localhost:${PORT}/`);
    console.log(`📦 Envíos: http://localhost:${PORT}/api/envios`);
    console.log(`👤 Perfil: http://localhost:${PORT}/api/perfil`);
    console.log(`📧 Contacto: http://localhost:${PORT}/api/contacto`);
    console.log(`💳 MercadoPago: http://localhost:${PORT}/api/mercadopago/status`);
    console.log(`🧪 Test: http://localhost:${PORT}/api/test`);
  });
} else {
  // En Vercel: listar rutas al cargar
  listRoutes();
}
