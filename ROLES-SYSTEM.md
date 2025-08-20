# 🔐 Sistema de Roles - Bisonte Logística API

## 📋 Resumen del Sistema de Roles

### 👥 **Usuarios Administradores**
Los siguientes correos electrónicos tienen permisos de administrador:
- `3000bisonte@gmail.com`
- `bisonteangela@gmail.com`
- `bisonteoskar@gmail.com`

### 🎯 **Tipos de Roles**
- **`admin`**: Acceso completo a todas las funcionalidades + endpoints administrativos
- **`user`**: Acceso a funcionalidades estándar (sin endpoints admin)

## 🔒 **Endpoints Solo para Administradores**

| Método | Endpoint | Descripción | Status Sin Admin | Status Con Admin |
|--------|----------|-------------|------------------|------------------|
| GET | `/api/admin/stats` | Estadísticas del sistema | 403 | 200 |
| GET | `/api/admin/users` | Lista de usuarios | 403 | 200 |
| GET | `/api/admin/settings` | Configuración del sistema | 403 | 200 |
| POST | `/api/admin/settings` | Actualizar configuración | 403 | 200 |

## 🧪 **Resultados de Pruebas de Roles**

### ✅ **Autenticación por Roles**
- **Usuario Regular** (`demo@bisonte.com`): Role = `user` ✅
- **Admin Google** (`3000bisonte@gmail.com`): Role = `admin` ✅
- **Admin Google** (`bisonteangela@gmail.com`): Role = `admin` ✅
- **Admin Google** (`bisonteoskar@gmail.com`): Role = `admin` ✅

### ✅ **Control de Acceso**
- **Usuario regular** accediendo a endpoints admin: `403 Forbidden` ✅
- **Usuario admin** accediendo a endpoints admin: `200 OK` ✅
- **POST admin settings** con admin: `200 OK` ✅

## 🔧 **Implementación Técnica**

### Middleware de Autorización
```javascript
// Requiere autenticación básica
function requireAuth(req, res, next)

// Requiere permisos de administrador
function requireAdmin(req, res, next)
```

### JWT Token con Roles
Los tokens JWT ahora incluyen información de rol:
```json
{
  "sub": "user_id",
  "email": "user@example.com", 
  "name": "User Name",
  "role": "admin|user",
  "provider": "google|credentials"
}
```

### Respuestas de Login Actualizadas
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "...",
    "name": "...",
    "role": "admin"
  },
  "token": "jwt_token",
  "role": "admin"
}
```

## 📊 **Datos de Endpoints Admin**

### `/api/admin/stats`
Estadísticas completas del sistema: usuarios, envíos, ventas, rendimiento.

### `/api/admin/users`
Lista de usuarios con información detallada:
- Información básica (email, nombre, rol)
- Fechas de registro y último login
- Contadores de envíos
- Estado de cuenta

### `/api/admin/settings`
Configuración del sistema:
- Información de versión y environment
- Estado de integraciones (MercadoPago, Resend, Google, DB)
- Configuraciones operativas

## 🛠️ **Comandos de Prueba**

### Probar sistema completo de roles:
```bash
npm run test:api:roles
```

### Probar todos los endpoints (incluyendo admin):
```bash
npm run test:api:full
```

## 🎯 **Casos de Uso**

### Acceso de Usuario Regular
- Login → Recibe role: "user"
- Puede acceder a endpoints de negocio normales
- NO puede acceder a `/api/admin/*`

### Acceso de Administrador
- Login con Google usando email admin → Recibe role: "admin"
- Puede acceder a todos los endpoints normales
- PUEDE acceder a `/api/admin/*`
- Puede gestionar usuarios y configuración

## 🔒 **Seguridad**

### Validaciones Implementadas
- ✅ Verificación de email en lista de admins
- ✅ Middleware de autorización por roles
- ✅ Respuestas HTTP apropiadas (403 para acceso denegado)
- ✅ Información de rol en JWT y respuestas
- ✅ Logging de accesos admin para auditoría

### Consideraciones de Seguridad
- Los emails admin están hardcodeados en el servidor
- Los tokens JWT incluyen rol y son verificados en cada request
- Middleware `requireAdmin` valida tanto autenticación como autorización
- Logs de auditoría para accesos administrativos

---
*Sistema implementado el: ${new Date().toISOString()}*
*Versión: 2.0.0*
