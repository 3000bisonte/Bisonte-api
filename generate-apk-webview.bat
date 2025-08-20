@echo off
echo 🚀 GENERADOR DE APK BISONTE LOGISTICA (WebView Remoto)
echo ====================================================

REM Configurar JAVA_HOME temporal
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
echo ✅ JAVA_HOME configurado: %JAVA_HOME%

REM Verificar que Java funciona
"%JAVA_HOME%\bin\java.exe" -version
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error: Java no encontrado
    pause
    exit /b 1
)

echo.
echo 🌐 Configuración: APK con WebView apuntando a https://www.bisonteapp.com
echo 📋 Capacitor está configurado para usar servidor remoto

echo.
echo 📦 Sincronizando Capacitor...
call npx cap sync android
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error sincronizando Capacitor
    pause
    exit /b 1
)

echo.
echo 🏗️ Generando APK...
cd android
call gradlew.bat assembleDebug
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error en build de Android
    echo.
    echo 📋 Instrucciones manuales:
    echo 1. Abrir Android Studio
    echo 2. Build ^> Build Bundle^(s^) / APK^(s^) ^> Build APK^(s^)
    echo 3. El APK estará en: android\app\build\outputs\apk\debug\
    pause
    exit /b 1
)

echo.
echo 🎉 ¡APK GENERADO EXITOSAMENTE!
echo 📂 Ubicación: android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo 🌐 Este APK cargará la aplicación desde: https://www.bisonteapp.com
echo 📱 Google Sign-In debería funcionar con la configuración optimizada
echo.
echo 📱 Para instalar en dispositivo:
echo    adb install android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo 🔧 Para debug del WebView (Chrome DevTools):
echo    chrome://inspect/#devices
echo.
pause
