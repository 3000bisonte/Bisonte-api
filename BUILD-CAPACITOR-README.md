# 🚀 Bisonte Logística - BUILD ESTÁTICO Y CAPACITOR OPTIMIZADO

## ✨ Estado del Proyecto
✅ **Proyecto limpio y optimizado**  
✅ **Build estático funcional**  
✅ **Configuración de Capacitor correcta**  
✅ **APIs configuradas para producción**  
✅ **Rutas relativas corregidas**  

---

## 📱 Comandos para APK

### Build completo y generar APK
```bash
npm run build:capacitor          # Build estático + sync Capacitor
npm run capacitor:build:android  # Build completo + generar APK
```

### Desarrollo y testing
```bash
npm run dev                      # Desarrollo local
npm run capacitor:android        # Abrir Android Studio
npx cap run android --device     # Instalar en dispositivo conectado
```

---

## 🔧 Configuración Actual

### Next.js (Estático)
- ✅ `output: 'export'` - Generación estática habilitada
- ✅ `assetPrefix: ''` - Rutas relativas corregidas
- ✅ `images.unoptimized: true` - Imágenes optimizadas para estático
- ✅ `trailingSlash: true` - URLs compatibles con Capacitor

### Capacitor
- ✅ `webDir: 'out'` - Apunta a build estático
- ✅ `appId: 'com.bisonte.logistica'` - ID de app configurado
- ✅ Assets sincronizados correctamente con Android

### APIs
- ✅ **apiClient** configurado para usar servidor remoto
- ✅ URLs de API apuntan a: `https://bisonte-hy3vbotjz-eduardos-projects-9d27e028.vercel.app`
- ✅ Detección automática de entorno (Capacitor/Web/Local)

---

## 📂 Estructura Limpia

```
bisonte-logistica-main/
├── src/                     # Código fuente
├── out/                     # Build estático (generado)
├── android/                 # Proyecto Android Capacitor
├── public/                  # Assets públicos
├── api-server/             # Backend separado
├── scripts/                # Scripts de utilidad
├── capacitor.config.ts     # Configuración Capacitor
├── next.config.js          # Configuración Next.js
├── fix-static-paths.js     # Script de corrección de rutas
└── package.json            # Scripts y dependencias
```

---

## 🛠️ Scripts Disponibles

### Desarrollo
- `npm run dev` - Servidor de desarrollo Next.js
- `npm run dev:mobile` - Desarrollo para móvil (host 0.0.0.0)

### Build y Deploy
- `npm run build` - Build estático básico
- `npm run build:capacitor` - Build + corrección de rutas + sync
- `npm run build:production` - Alias para build:capacitor

### Capacitor
- `npm run capacitor:sync` - Sincronizar assets con Capacitor
- `npm run capacitor:android` - Abrir Android Studio
- `npm run capacitor:run:android` - Ejecutar en Android
- `npm run capacitor:build:android` - Build completo + APK

### Utilidad
- `npm run mobile:complete` - Build + abrir Android Studio

---

## 🔄 Flujo de Trabajo Recomendado

### Para Generar APK:
1. **Build estático**: `npm run build:capacitor`
2. **Abrir Android Studio**: `npm run capacitor:android`
3. **Generar APK firmado** desde Android Studio

### Para Testing en Dispositivo:
1. **Conectar dispositivo Android** con USB debugging
2. **Ejecutar**: `npx cap run android --device`
3. **Ver logs**: `npx cap run android --device --consolelogs`

---

## ⚡ Optimizaciones Aplicadas

### Rendimiento
- ✅ 106 archivos obsoletos eliminados
- ✅ Cache limpiado (npm, Next.js)
- ✅ Scripts temporales removidos
- ✅ Rutas optimizadas para Capacitor

### Compatibilidad
- ✅ APIs funcionan en web y móvil
- ✅ Rutas relativas en todos los archivos
- ✅ Manifest.json configurado
- ✅ Service Worker compatible

### Mantenibilidad
- ✅ Código limpio y organizado
- ✅ Configuraciones centralizadas
- ✅ Scripts automatizados
- ✅ Documentación actualizada

---

## 🔍 Verificación del Build

Para verificar que todo está correcto:
```bash
# El build debe completarse sin errores
npm run build:capacitor

# Verificar archivos en ./out/
ls out/

# Verificar sync con Android
ls android/app/src/main/assets/public/
```

---

## 🚨 Solución de Problemas

### Error: "API not found"
- Verificar que `apiClient` esté importado en componentes
- Verificar configuración en `src/config/api.js`

### Error: "Assets not loading"
- Ejecutar `npm run build:capacitor` para corregir rutas
- Verificar que `fix-static-paths.js` se ejecutó correctamente

### Error en Android Build
- Limpiar: `cd android && ./gradlew clean`
- Rebuild: `npm run capacitor:build:android`

---

## 📞 URLs de API Configuradas

### Producción (APK)
- Backend: `https://bisonte-hy3vbotjz-eduardos-projects-9d27e028.vercel.app`

### Desarrollo Local
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`

---

**🎯 Proyecto listo para producción y generación de APK!**
