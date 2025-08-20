@echo off
echo ===============================================
echo Construccion Capacitor - WebView Invisible
echo ===============================================

echo.
echo [1/5] Instalando dependencias...
call npm install

echo.
echo [2/5] Construyendo Next.js...
call npm run build

echo.
echo [3/5] Sincronizando con Capacitor...
call npx cap sync

echo.
echo [4/5] Construyendo APK de Android...
call npx cap build android

echo.
echo [5/5] Proceso completado
echo ===============================================
echo APK generado en: android/app/build/outputs/apk/debug/
echo ===============================================

pause
