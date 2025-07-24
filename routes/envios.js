const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/envios - Obtener todos los envíos
router.get('/', async (req, res) => {
  try {
    const envios = await prisma.historialEnvio.findMany({
      orderBy: { FechaSolicitud: "desc" },
      include: {
        usuario: {
          select: {
            nombre: true,
            email: true,
            celular: true,
          },
        },
      },
    });

    console.log("Envíos obtenidos:", envios.length);
    res.json(envios);
  } catch (error) {
    console.error("Error al obtener envíos:", error);
    res.status(500).json({ 
      error: "Error al obtener envíos", 
      detalle: error.message 
    });
  }
});

// GET /api/envios/:userId - Obtener envíos por usuario
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const envios = await prisma.historialEnvio.findMany({
      where: { usuarioId: parseInt(userId) },
      orderBy: { FechaSolicitud: "desc" },
      include: {
        usuario: {
          select: {
            nombre: true,
            email: true,
            celular: true,
          },
        },
      },
    });

    res.json(envios);
  } catch (error) {
    console.error("Error al obtener envíos del usuario:", error);
    res.status(500).json({ 
      error: "Error al obtener envíos del usuario", 
      detalle: error.message 
    });
  }
});

// POST /api/envios - Crear nuevo envío
router.post('/', async (req, res) => {
  try {
    const envioData = req.body;
    
    const nuevoEnvio = await prisma.historialEnvio.create({
      data: envioData,
      include: {
        usuario: {
          select: {
            nombre: true,
            email: true,
            celular: true,
          },
        },
      },
    });

    console.log("Nuevo envío creado:", nuevoEnvio.id);
    res.status(201).json(nuevoEnvio);
  } catch (error) {
    console.error("Error al crear envío:", error);
    res.status(500).json({ 
      error: "Error al crear envío", 
      detalle: error.message 
    });
  }
});

// PUT /api/envios/:id - Actualizar estado del envío
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, observaciones } = req.body;
    
    const envioActualizado = await prisma.historialEnvio.update({
      where: { id: parseInt(id) },
      data: { 
        estado,
        observaciones,
        FechaActualizacion: new Date()
      },
      include: {
        usuario: {
          select: {
            nombre: true,
            email: true,
            celular: true,
          },
        },
      },
    });

    console.log("Envío actualizado:", envioActualizado.id);
    res.json(envioActualizado);
  } catch (error) {
    console.error("Error al actualizar envío:", error);
    res.status(500).json({ 
      error: "Error al actualizar envío", 
      detalle: error.message 
    });
  }
});

module.exports = router;
