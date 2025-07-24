const express = require('express');
const router = express.Router();

// Placeholder para otras rutas - se pueden migrar gradualmente
router.get('/', (req, res) => {
  res.json({ message: "API de usuarios disponible" });
});

module.exports = router;
