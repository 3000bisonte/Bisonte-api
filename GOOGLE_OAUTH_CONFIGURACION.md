# 🔐 CONFIGURACIÓN GOOGLE OAUTH PARA MÓVIL

## ❌ PROBLEMA ACTUAL
Error: "Acceso bloqueado - Error de autenticación" al usar Google Sign-In en APK.

## 🎯 CAUSA
El Client ID actual no está configurado para permitir:
1. **Deep Links** (com.bisonte.logistica://)
2. **Package Name** de la app Android
3. **SHA1 Fingerprint** del certificado

## 📋 INFORMACIÓN REQUERIDA PARA GOOGLE CLOUD CONSOLE

### 🔧 Para APK Debug (desarrollo):
```
Package Name: com.bisonte.logistica
SHA1 Fingerprint: EB:3A:10:10:BC:CF:C7:F8:13:2B:7E:E4:FB:7E:C8:2D:8A:43:A2:97
Redirect URI: com.bisonte.logistica://auth/google/callback
```

### 🚀 Para APK Release (producción):
```
Package Name: com.bisonte.logistica
SHA1 Fingerprint: 52:7D:83:B1:B4:B9:3F:00:3D:A1:9A:9F:53:0C:A0:F4:B4:8A:16:96
Redirect URI: com.bisonte.logistica://auth/google/callback
```

## 🛠️ PASOS PARA CONFIGURAR GOOGLE CLOUD CONSOLE

1. **Ir a Google Cloud Console**: https://console.cloud.google.com/
2. **Seleccionar el proyecto** que contiene el Client ID: `108242889910-n3ptem16orktkl0klv8onlttfl83r1ul.apps.googleusercontent.com`
3. **Ir a APIs & Services > Credentials**
4. **Editar el OAuth 2.0 Client ID**
5. **En "Application type"** - verificar que sea "Web application" O crear uno nuevo de tipo "Android"
6. **Añadir URIs de redirección autorizados:**
   - `https://www.bisonteapp.com`
   - `https://bisonte-api.vercel.app/auth/google/callback`
   - `com.bisonte.logistica://auth/google/callback`
7. **Si es tipo Android, añadir:**
   - Package name: `com.bisonte.logistica`
   - SHA1 fingerprints: Los dos listados arriba
8. **Guardar cambios**

## 🔄 ALTERNATIVA: CREAR NUEVO CLIENT ID PARA ANDROID

Si no puedes modificar el existente:

1. **Crear nuevo OAuth 2.0 Client ID**
2. **Tipo: Android application**
3. **Package name:** `com.bisonte.logistica`
4. **SHA1 certificate fingerprints:** Añadir ambos (debug y release)
5. **Copiar el nuevo Client ID**
6. **Actualizar .env.local con el nuevo Client ID**

## 📱 CURRENT CLIENT ID
```
Web/Actual: 108242889910-n3ptem16orktkl0klv8onlttfl83r1ul.apps.googleusercontent.com
Necesita: Configuración para Android + Deep Links
```

## ✅ VERIFICACIÓN POST-CONFIGURACIÓN

Después de configurar Google Cloud Console:
1. Esperar 5-10 minutos para propagación
2. Regenerar APK
3. Probar Google Sign-In
4. Verificar logs en Chrome DevTools si persiste error

## 🚨 NOTA IMPORTANTE
Los cambios en Google Cloud Console pueden tardar algunos minutos en propagarse.
