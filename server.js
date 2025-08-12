const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Configurar dotenv
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: '*', // Permitir todos los orígenes para móvil
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Bisonte API Server', 
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'Configured' : 'Missing'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Importar rutas de manera más robusta
console.log('🔧 Cargando rutas...');

// Ruta de prueba básica que siempre funciona
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API funcionando', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// Ruta de auth demo que siempre funciona (sin base de datos)
app.post('/api/auth/demo-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔍 Demo login attempt:', email);
    
    if (email === 'demo@bisonte.com' && password === 'demo123') {
      res.json({
        success: true,
        user: { id: 1, name: 'Usuario Demo', email: 'demo@bisonte.com' },
        token: 'demo-token-123'
      });
    } else {
      res.status(401).json({ error: 'Credenciales incorrectas' });
    }
  } catch (error) {
    console.error('❌ Error en demo login:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Cargar rutas reales
async function loadRoutes() {
  console.log('🔧 Iniciando carga de rutas...');
  
  try {
    // Verificar si DATABASE_URL está configurada
    if (!process.env.DATABASE_URL) {
      console.log('❌ DATABASE_URL no configurada - usando rutas demo únicamente');
      
      // Ruta de auth básica sin DB
      app.post('/api/auth/login', (req, res) => {
        const { email, password } = req.body;
        if (email === 'demo@bisonte.com' && password === 'demo123') {
          res.json({
            success: true,
            user: { id: 1, name: 'Usuario Demo', email: 'demo@bisonte.com' },
            token: 'demo-token-123'
          });
        } else {
          res.status(401).json({ error: 'Credenciales incorrectas' });
        }
      });
      
      return;
    }

    console.log('✅ DATABASE_URL encontrada:', process.env.DATABASE_URL.substring(0, 30) + '...');

    // Intentar cargar cada ruta individualmente
    const routes = [
      { name: 'auth', path: './routes/auth', mount: '/api/auth' },
      { name: 'envios', path: './routes/envios', mount: '/api/envios' },
      { name: 'usuarios', path: './routes/usuarios', mount: '/api/usuarios' },
      { name: 'perfil', path: './routes/perfil', mount: '/api/perfil' },
      { name: 'remitente', path: './routes/remitente', mount: '/api/remitente' },
      { name: 'destinatario', path: './routes/destinatario', mount: '/api/destinatario' },
      { name: 'mercadopago', path: './routes/mercadopago', mount: '/api/mercadopago' },
      { name: 'contacto', path: './routes/contacto', mount: '/api/contacto' },
      { name: 'admin', path: './routes/admin', mount: '/api/admin' }
    ];

    let loadedCount = 0;
    
    for (const route of routes) {
      try {
        const routeModule = require(route.path);
        app.use(route.mount, routeModule);
        console.log(`✅ ${route.name} routes loaded successfully`);
        loadedCount++;
      } catch (err) {
        console.error(`❌ Error loading ${route.name} routes:`, err.message);
        
        // Crear ruta de fallback para auth si falla
        if (route.name === 'auth') {
          app.post('/api/auth/login', (req, res) => {
            res.status(500).json({ 
              error: 'Auth service temporarily unavailable', 
              details: err.message,
              fallback: 'Use demo@bisonte.com / demo123'
            });
          });
        }
      }
    }
    
    console.log(`📊 Total rutas cargadas: ${loadedCount}/${routes.length}`);
    
  } catch (error) {
    console.error('❌ Error general cargando rutas:', error);
    
    // Ruta de auth de emergencia
    app.post('/api/auth/login', (req, res) => {
      res.status(500).json({ 
        error: 'Server configuration error', 
        details: error.message 
      });
    });
  }
  
  // Ruta catch-all para APIs no encontradas (debe ir al final)
  app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
  });
}

// Cargar rutas
async function startServer() {
  await loadRoutes();
  
  // Para Vercel, exportar la app en lugar de hacer listen
  // Para desarrollo local, siempre hacer listen
  if (process.env.VERCEL !== '1') {
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor API ejecutándose en puerto ${PORT}`);
      console.log(`📱 Endpoint base: http://localhost:${PORT}/api`);
      console.log(`🌐 Accesible en: http://0.0.0.0:${PORT}/api`);
    });
    
    server.on('error', (err) => {
      console.error('❌ Error del servidor:', err);
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Puerto ${PORT} ya está en uso`);
      }
    });
  }
}

// Iniciar servidor
startServer();

module.exports = app;
