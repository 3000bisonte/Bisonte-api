const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: "API de admin disponible" });
});

module.exports = router;
