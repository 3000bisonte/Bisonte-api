# Bisonte API Server

Servidor API para la aplicación móvil de Bisonte Logística.

## 🚀 Deployment en Vercel

Este servidor está desplegado en Vercel y proporciona las APIs necesarias para:

- ✅ Autenticación de usuarios (login/register)
- ✅ Gestión de envíos
- ✅ Administración de usuarios
- ✅ Sistema de contacto
- ✅ Integración con MercadoPago

## 📋 Variables de Entorno Requeridas

```bash
DATABASE_URL=postgresql://...
JWT_SECRET=tu_jwt_secret_super_secreto
NODE_ENV=production
```

## 🛠️ Tecnologías

- **Express.js** - Framework web
- **Prisma** - ORM para base de datos
- **PostgreSQL** - Base de datos (Neon)
- **JWT** - Autenticación
- **bcrypt** - Encriptación de contraseñas

## 📱 Integración con App Móvil

Una vez desplegado, la app móvil se conectará a:
```
https://tu-deployment-url.vercel.app/api
```

## 🔧 Desarrollo Local

```bash
npm install
npm run dev
```

## 📦 Deployment

```bash
vercel
```
