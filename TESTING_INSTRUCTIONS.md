# 📱 Instrucciones de Instalación y Testing del APK

## 🎯 APK Generado
**Ubicación**: `android\app\build\outputs\apk\debug\app-debug.apk`
**Fecha**: $(Get-Date -Format "yyyy-MM-dd HH:mm")
**Versión**: Con Google Sign-In fixes para Capacitor WebView

## 📋 Preparación del Dispositivo

### 1. Habilitar Depuración USB
```
Settings > Developer Options > USB Debugging = ON
```

### 2. Permitir Instalación de Apps Desconocidas
```
Settings > Security > Unknown Sources = ON
```

### 3. Conectar Dispositivo
- Conectar vía USB al PC
- Autorizar depuración cuando pregunte el dispositivo

## 💾 Instalación del APK

### Método 1: ADB (Recomendado)
```bash
cd c:\Users\Yesica\Downloads\Bisonte\bisonte-logistica-main-Modificado\bisonte-logistica-main
adb install android\app\build\outputs\apk\debug\app-debug.apk
```

### Método 2: Manual
1. Copiar APK al dispositivo (USB/email/cloud)
2. Abrir archivo APK en el dispositivo
3. Permitir instalación cuando pregunte

### Método 3: Wireless ADB (si configurado)
```bash
adb connect [IP_DISPOSITIVO]:5555
adb install android\app\build\outputs\apk\debug\app-debug.apk
```

## 🧪 Protocolo de Testing

### Test 1: Inicio de App
- [ ] App abre sin crashes
- [ ] Splash screen aparece correctamente
- [ ] Carga página de login

### Test 2: Google Sign-In (CRÍTICO)
- [ ] Botón "Continuar con Google" es visible
- [ ] Clicking abre Google OAuth (browser/webview)
- [ ] Proceso de autenticación completa sin errores
- [ ] Regresa a la app logueado
- [ ] Usuario aparece en `/home/`

### Test 3: Funcionalidades Core
- [ ] Navegación entre páginas funciona
- [ ] Cotizador carga y calcula precios
- [ ] MercadoPago se inicializa correctamente
- [ ] AdMob muestra ads (si configurado)

### Test 4: Conectividad
- [ ] APIs responden correctamente
- [ ] Manejo de errores de red
- [ ] Página "No conexión" funciona

## 🔧 Comandos Útiles de Testing

### Ver logs del dispositivo:
```bash
adb logcat | grep -i "chromium\|capacitor\|google"
```

### Inspeccionar WebView (Chrome DevTools):
1. Abrir Chrome en PC
2. Ir a `chrome://inspect`
3. Conectar dispositivo
4. Inspeccionar WebView de la app

### Reinstalar APK:
```bash
adb uninstall com.bisontelogistica.app
adb install android\app\build\outputs\apk\debug\app-debug.apk
```

### Ver apps instaladas:
```bash
adb shell pm list packages | grep bisonte
```

## 🐛 Debugging Google Sign-In

### Si Google Sign-In no funciona:

#### 1. Verificar console logs
- Abrir Chrome DevTools en WebView
- Buscar errores relacionados con Google OAuth
- Verificar si GIS carga correctamente

#### 2. Verificar configuración
```javascript
// En browser console de la app:
console.log('Client ID:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
console.log('Capacitor:', window.Capacitor?.isNativePlatform());
console.log('Google SDK:', window.google?.accounts?.id);
```

#### 3. Test manual OAuth
- Si aparece botón "Método alternativo", clickearlo
- Debe abrir browser con Google OAuth
- Completar autenticación
- Verificar redirect a `/auth/google/callback`

#### 4. Verificar network
```bash
adb shell am start -a android.intent.action.VIEW -d "https://www.bisonteapp.com"
```

## 📊 Criterios de Éxito

### ✅ APK Aceptable si:
- App abre sin crashes
- Google Sign-In funciona (GIS o fallback)
- Navegación básica operativa
- APIs responden correctamente

### ⚠️ Requiere fixes si:
- Crashes al abrir
- Google Sign-In completamente roto
- APIs no responden
- Navegación no funciona

### 🚨 Crítico si:
- App no instala
- Black screen permanente
- No hay conectividad a backend

## 📱 Testing en Diferentes Dispositivos

### Android mínimo recomendado:
- **OS**: Android 7.0 (API 24)
- **RAM**: 2GB
- **Storage**: 100MB libre
- **Red**: WiFi o datos móviles

### Dispositivos ideales para testing:
- Samsung Galaxy (diferentes modelos)
- Google Pixel
- Xiaomi/Redmi
- Huawei (sin Google Services)

## 🔄 Regenerar APK si necesario

Si encuentras issues críticos:

```bash
# Fix código
# Luego regenerar:
cd c:\Users\Yesica\Downloads\Bisonte\bisonte-logistica-main-Modificado\bisonte-logistica-main
.\generate-apk.bat
```

---

**Ready para testing**: ✅ SÍ
**Google Sign-In**: ✅ FIXED con fallback
**Backend**: ✅ APIs funcionando
**Build**: ✅ Sin errores
