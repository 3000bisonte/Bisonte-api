# Bisonte API (Backend Standalone)

Documentación consolidada para el repositorio `bisonte-api` (extraído del monorepo). Incluye endpoints, autenticación, roles, variables de entorno y ejemplos.

## 🔐 Autenticación y Roles
- JWT Access Token: expira en 15m (Bearer token en `Authorization`)
- JWT Refresh Token: expira en 7d (`/api/auth/refresh` genera nuevos tokens)
- Roles soportados: `user`, `admin`
- Admin se determina por email (hardcode en auth-utils.js):
  - 3000bisonte@gmail.com
  - bisonteangela@gmail.com
  - bisonteoskar@gmail.com
- Endpoints admin requieren header `Authorization: Bearer <token>` con rol `admin`.

## ⚠️ Rate Limiting
- Básico en memoria: 100 peticiones / 15 minutos por IP (configurable en `server-simple.js`).

## 📁 Estructura Principal (repo backend)
```
api-server/
  server-simple.js
  auth-utils.js
  ...otros helpers
.env.example
package.json
README.md (este archivo recomendado como base)
Scripts de prueba:
  test-full-api.js
  test-admin-endpoints.js
  test-advanced-features.js
```

## 🌱 Variables de Entorno (.env / .env.production)
| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| PORT | Puerto del servidor local | 3001 |
| JWT_SECRET | Clave JWT (>=32 chars) | super-secreto-... |
| RESEND_API_KEY | API Key Resend (emails) | re_xxx |
| MERCADOPAGO_PUBLIC_KEY | Public key MP | APP_USR-xxx |
| MERCADOPAGO_ACCESS_TOKEN | Access token MP | APP_USR-xxx |
| GOOGLE_CLIENT_ID | OAuth Client ID | xxx.apps.googleusercontent.com |
| GOOGLE_CLIENT_SECRET | OAuth secret | (secreto) |
| NEXTAUTH_URL | (si se usa NextAuth externo) | https://app.domain.com |
| NEXTAUTH_SECRET | (si aplica) | cadena-larga |

(Opcional DB / Neon si integras persistencia):
```
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
```

## 🔎 Endpoints (36)
Clasificados en: Public (P), Protegidos (Auth requer.) (A), Admin (ADM)

### Salud y Utilidad
| Método | Ruta | Tipo | Descripción |
|--------|------|------|-------------|
| GET | / | P | Root simple |
| GET | /api/health | P | Health check / uptime |
| GET | /api/test | P | Lista de endpoints registrados |

### Autenticación
| Método | Ruta | Tipo | Descripción |
|--------|------|------|-------------|
| POST | /api/auth/login | P | Login credenciales demo |
| POST | /api/auth/google | P | Login simulado Google |
| POST | /api/register | P | Registro usuario demo |
| GET | /api/auth/session | P | Verifica sesión si se envía token |
| POST | /api/auth/logout | P | Logout stateless (cliente borra token) |
| POST | /api/auth/refresh | P | Renueva tokens (requiere refreshToken) |

### Perfil / Usuario
| Método | Ruta | Tipo | Descripción |
|--------|------|------|-------------|
| GET | /api/perfil | A | Perfil básico mock |
| POST | /api/perfil | A | Actualiza perfil mock |
| GET | /api/perfil/existeusuario | P | Verifica existencia por email |
| GET | /api/usuarios | A | Lista usuarios mock |

### Envíos / Logística
| Método | Ruta | Tipo | Descripción |
|--------|------|------|-------------|
| POST | /api/envios | P | Cotizar envío (cálculo) |
| GET | /api/envios | P | Lista de envíos mock |
| GET | /api/envios/historial | A | Historial usuario |
| POST | /api/guardarenvio | A | Guarda envío (mock) |

### Remitente / Destinatario
| Método | Ruta | Tipo | Descripción |
|--------|------|------|-------------|
| GET | /api/remitente | A | Obtiene remitente |
| POST | /api/remitente | A | Crea/actualiza remitente |
| GET | /api/destinatario | A | Lista destinatarios |
| POST | /api/destinatario | A | Crea destinatario |

### Contacto / Email / Recuperación
| Método | Ruta | Tipo | Descripción |
|--------|------|------|-------------|
| POST | /api/contacto | P | Envía formulario contacto |
| GET | /api/contacto | P | Lista mensajes mock |
| POST | /api/recuperar | P | Inicia flujo recuperación password |
| POST | /api/recuperar/validar-token | P | Valida token recuperación |
| GET | /api/email | P | Info servicio email |
| POST | /api/email | P | Acción email (ping) |
| POST | /api/send | P | Envía email Resend (mock) |

### MercadoPago
| Método | Ruta | Tipo | Descripción |
|--------|------|------|-------------|
| GET | /api/mercadopago/status | P | Estado MP / credenciales |
| POST | /api/mercadopago/create-preference | P | Crea preferencia test |

### Seguridad / Demo
| Método | Ruta | Tipo | Descripción |
|--------|------|------|-------------|
| GET | /api/protegido/demo | A | Endpoint protegido demo |

### Admin (rol admin requerido)
| Método | Ruta | Tipo | Descripción |
|--------|------|------|-------------|
| GET | /api/admin/stats | ADM | Métricas básicas mock |
| GET | /api/admin/users | ADM | Lista usuarios |
| GET | /api/admin/settings | ADM | Configuración mock |
| POST | /api/admin/settings | ADM | Actualiza setting mock |

## 📘 Ejemplos de Uso
### Login (credenciales demo)
```bash
curl -X POST https://bisonte-api.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@bisonte.com","password":"demo123"}'
```

### Petición protegida
```bash
curl https://bisonte-api.vercel.app/api/perfil \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Refresh Token
```bash
curl -X POST https://bisonte-api.vercel.app/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<REFRESH_TOKEN>"}'
```

## 🔁 Flujo de Tokens
1. Login => Access (15m) + Refresh (7d)
2. Cliente guarda ambos (secure storage / httpOnly cookie si implementas)
3. Antes de expirar (o 401) => POST /api/auth/refresh
4. Reemplaza ambos tokens
5. Logout => cliente elimina tokens

## 🧪 Scripts de Prueba (recomendado mantener)
| Script | Propósito |
|--------|----------|
| test-full-api.js | Recorre 33 endpoints (usuario + admin) |
| test-admin-endpoints.js | Valida endpoints admin con rol |
| test-advanced-features.js | Refresh, rate limit, errores |

Ejecutar (Node 18+):
```bash
node test-full-api.js
node test-admin-endpoints.js
node test-advanced-features.js
```

## ❗ Códigos de Error Clave
| Código | Causa |
|--------|-------|
| 400 | Parámetros faltantes / refresh token ausente |
| 401 | No autorizado (falta/expira token) |
| 403 | Rol insuficiente (admin requerido) |
| 429 | Rate limit superado |
| 500 | Error interno (catch genérico) |

## ✅ Checklist Producción
- [ ] JWT_SECRET robusto (>= 64 chars)
- [ ] TLS (Vercel / HTTPS)
- [ ] Limitar origins CORS si se expande
- [ ] Sustituir datos DEMO por persistencia real (DB / Prisma)
- [ ] Implementar almacenamiento durable de refresh tokens (opcional)
- [ ] Considerar Redis para rate limiting escalable

## 🗺️ Evolución Futura (sugerencias)
- OpenAPI/Swagger (generar spec desde server-simple.js)
- Logging estructurado (pino / winston)
- Auditoría de acciones admin
- Tests automatizados CI (GitHub Actions)

---
Generado para facilitar la separación backend. Copia este archivo como `README.md` en el repo `bisonte-api`.
