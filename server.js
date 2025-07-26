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

// Ruta de prueba para auth
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔍 Login attempt:', email);
    
    // Respuesta demo para pruebas
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
    console.error('❌ Error en login:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Cargar rutas si las variables están configuradas
try {
  if (process.env.DATABASE_URL) {
    console.log('✅ DATABASE_URL encontrada, cargando rutas completas...');
    
    // Cargar rutas una por una con manejo de errores
    try {
      const authRoutes = require('./routes/auth');
      app.use('/api/auth', authRoutes);
      console.log('✅ Auth routes loaded');
    } catch (err) {
      console.error('❌ Error loading auth routes:', err.message);
    }
    
    try {
      const enviosRoutes = require('./routes/envios');
      app.use('/api/envios', enviosRoutes);
      console.log('✅ Envios routes loaded');
    } catch (err) {
      console.error('❌ Error loading envios routes:', err.message);
    }
    
    try {
      const usuariosRoutes = require('./routes/usuarios');
      app.use('/api/usuarios', usuariosRoutes);
      console.log('✅ Usuarios routes loaded');
    } catch (err) {
      console.error('❌ Error loading usuarios routes:', err.message);
    }
    
  } else {
    console.log('❌ DATABASE_URL not configured - using demo routes only');
  }
} catch (error) {
  console.error('❌ Error general loading routes:', error.message);
}

// Ruta catch-all para APIs no encontradas
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Para Vercel, exportar la app en lugar de hacer listen
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor API ejecutándose en puerto ${PORT}`);
    console.log(`📱 Endpoint base: http://localhost:${PORT}/api`);
  });
}

module.exports = app;
