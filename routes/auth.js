const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const router = express.Router();

// Configuración de la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Función auxiliar para obtener usuario por email
async function getUserByEmail(email) {
  try {
    const res = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
    return res.rows[0] || null;
  } catch (error) {
    console.error("Error en getUserByEmail:", error);
    return null;
  }
}

// Función para crear usuario demo si no existe
async function createDemoUsers() {
  try {
    const demoUsers = [
      { email: "demo@bisonte.com", password: "123456", nombre: "Usuario Demo" },
      { email: "3000bisonte@gmail.com", password: "admin123", nombre: "Admin Bisonte" }
    ];

    for (const user of demoUsers) {
      const existingUser = await getUserByEmail(user.email);
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await pool.query(
          "INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3)",
          [user.nombre, user.email, hashedPassword]
        );
        console.log(`✅ Usuario demo creado: ${user.email}`);
      }
    }
  } catch (error) {
    console.error("❌ Error creando usuarios demo:", error);
  }
}

// Crear usuarios demo al inicio
createDemoUsers();

// Ruta de login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log("🔍 Intentando login:", email);
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña son requeridos" });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (!user.password) {
      return res.status(400).json({ error: "Usuario registrado con Google, use login social" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Generar JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        name: user.nombre 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    console.log("✅ Login exitoso:", user.email);
    
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.nombre,
        email: user.email,
      },
      token
    });

  } catch (error) {
    console.error("❌ Error en login:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Ruta de Google login (simplificada)
router.post('/google', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email es requerido" });
    }

    // Buscar o crear usuario
    let user = await getUserByEmail(email);
    
    if (!user) {
      // Crear nuevo usuario de Google
      const insertRes = await pool.query(
        "INSERT INTO usuarios (nombre, email) VALUES ($1, $2) RETURNING *",
        [name || null, email]
      );
      user = insertRes.rows[0];
    }

    // Generar JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        name: user.nombre 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    console.log("✅ Google login exitoso:", user.email);
    
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.nombre,
        email: user.email,
      },
      token
    });

  } catch (error) {
    console.error("❌ Error en Google login:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Middleware para verificar JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token inválido" });
    }
    req.user = user;
    next();
  });
};

// Ruta para registrar nuevo usuario
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña son requeridos" });
    }

    // Verificar si el usuario ya existe
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "El usuario ya existe" });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear nuevo usuario
    const insertRes = await pool.query(
      "INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING id, nombre, email",
      [name || null, email, hashedPassword]
    );
    
    const newUser = insertRes.rows[0];

    // Generar JWT
    const token = jwt.sign(
      { 
        id: newUser.id, 
        email: newUser.email, 
        name: newUser.nombre 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    console.log("✅ Usuario registrado:", newUser.email);
    
    res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.nombre,
        email: newUser.email,
      },
      token
    });

  } catch (error) {
    console.error("❌ Error en registro:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Ruta para crear usuario de prueba
router.post('/create-test-user', async (req, res) => {
  try {
    const testEmail = "test@bisonte.com";
    const testPassword = "123456";
    const testName = "Usuario de Prueba";

    // Verificar si ya existe
    const existingUser = await getUserByEmail(testEmail);
    if (existingUser) {
      return res.json({
        success: true,
        message: "Usuario de prueba ya existe",
        credentials: { email: testEmail, password: testPassword }
      });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(testPassword, 12);

    // Crear usuario de prueba
    const insertRes = await pool.query(
      "INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING id, nombre, email",
      [testName, testEmail, hashedPassword]
    );

    const testUser = insertRes.rows[0];

    console.log("✅ Usuario de prueba creado:", testUser.email);
    
    res.json({
      success: true,
      message: "Usuario de prueba creado exitosamente",
      user: testUser,
      credentials: { email: testEmail, password: testPassword }
    });

  } catch (error) {
    console.error("❌ Error creando usuario de prueba:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Ruta para verificar sesión
router.get('/session', verifyToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

module.exports = router;
