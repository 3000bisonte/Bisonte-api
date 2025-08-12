const express = require('express');
const router = express.Router();

// Ruta de status de MercadoPago
router.get('/status', (req, res) => {
  const publicKey = process.env.NEXT_PUBLIC_INIT_MERCADOPAGO;
  const isProduction = publicKey && publicKey.startsWith('APP_USR-');
  
  res.json({
    status: 'configurado',
    environment: isProduction ? 'production' : 'test',
    publicKey: isProduction ? 'PRODUCTION-key' : 'TEST-key',
    configured: true,
    timestamp: new Date().toISOString()
  });
});

// Ruta para crear preferencias de pago
router.post('/create-preference', (req, res) => {
  const { title, price, quantity = 1 } = req.body;
  
  // Simular respuesta de MercadoPago
  res.json({
    id: 'preference_' + Date.now(),
    init_point: `https://www.mercadopago.com.co/checkout/v1/redirect?pref_id=preference_${Date.now()}`,
    sandbox_init_point: `https://sandbox.mercadopago.com.co/checkout/v1/redirect?pref_id=preference_${Date.now()}`,
    status: 'active'
  });
});

router.get('/', (req, res) => {
  res.json({ message: "API de MercadoPago disponible" });
});

module.exports = router;
