const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Configurar dotenv
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: ['http://localhost:3000', 'https://localhost:3000', 'capacitor://localhost', 'ionic://localhost', 'http://localhost', 'https://localhost'],
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
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Importar y usar las rutas de las APIs
const authRoutes = require('./routes/auth');
const enviosRoutes = require('./routes/envios');
const usuariosRoutes = require('./routes/usuarios');
const perfilRoutes = require('./routes/perfil');
const remitenteRoutes = require('./routes/remitente');
const destinatarioRoutes = require('./routes/destinatario');
const mercadopagoRoutes = require('./routes/mercadopago');
const contactoRoutes = require('./routes/contacto');
const adminRoutes = require('./routes/admin');

// Usar las rutas
app.use('/api/auth', authRoutes);
app.use('/api/envios', enviosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/perfil', perfilRoutes);
app.use('/api/remitente', remitenteRoutes);
app.use('/api/destinatario', destinatarioRoutes);
app.use('/api/mercadopago', mercadopagoRoutes);
app.use('/api/contacto', contactoRoutes);
app.use('/api/admin', adminRoutes);

// Ruta catch-all para APIs no encontradas
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor API ejecutándose en puerto ${PORT}`);
  console.log(`📱 Endpoint base: http://localhost:${PORT}/api`);
});

module.exports = app;
