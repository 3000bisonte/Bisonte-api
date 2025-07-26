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

// Importar rutas solo si las variables están configuradas
try {
  if (process.env.DATABASE_URL) {
    const authRoutes = require('./routes/auth');
    app.use('/api/auth', authRoutes);
    console.log('✅ Auth routes loaded');
  } else {
    console.log('❌ DATABASE_URL not configured');
  }
} catch (error) {
  console.error('❌ Error loading routes:', error.message);
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
