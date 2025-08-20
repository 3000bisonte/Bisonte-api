@echo off
echo 🚀 GENERADOR DE APK BISONTE LOGISTICA
echo =====================================

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
echo 📱 Paso 1: Build estático Next.js...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error en build de Next.js
    pause
    exit /b 1
)

echo.
echo 🔧 Paso 2: Corrigiendo rutas...
node fix-static-paths.js
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error corrigiendo rutas
    pause
    exit /b 1
)

echo.
echo 📦 Paso 3: Sincronizando Capacitor...
call npx cap sync
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error sincronizando Capacitor
    pause
    exit /b 1
)

echo.
echo 🏗️ Paso 4: Build Android...
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
echo 📱 Para instalar en dispositivo:
echo    adb install android\app\build\outputs\apk\debug\app-debug.apk
echo.
pause
