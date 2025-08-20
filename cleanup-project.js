#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const projectRoot = __dirname;

// Archivos y carpetas a eliminar
const filesToDelete = [
    // Scripts de desarrollo temporales
    'ajustes-finales-vercel.js',
    'aplicar-estilos-originales.js',
    'apply-original-styles.js',
    'build-apk-simple.js',
    'build-static-for-capacitor.js',
    'build-working-apk.js',
    'check-mercadopago.js',
    'configure-mobile-production.js',
    'create-missing-css-modules.js',
    'extract-app-clean.js',
    'extract-app.js',
    'final-check.js',
    'final-repair-all-pages.js',
    'final-verification.js',
    'fix-all-problematic-pages.js',
    'fix-auth-imports.js',
    'fix-build-errors.js',
    'fix-cotizador.js',
    'fix-paths.js',
    'fix-static-pages.js',
    'generate-all-static-pages.js',
    'generate-css-modules.js',
    'generate-static-pages.js',
    'install-deps.js',
    'integrate-real-app.js',
    'limpiar-proyecto.js',
    'migrate-to-css-modules.js',
    'migrate-to-react-native.js',
    'monitor-compilacion.js',
    'organize-static-pages.js',
    'package-real-app.js',
    'quick-check.js',
    'recuperar-diseno-original.js',
    'test-api-separation.js',
    'test-mercadopago-prod.js',
    'test-prisma-connection.js',
    'test-quick.js',
    'test-single-api.js',
    'test-vercel-apis.js',
    'update-components-css-modules.js',
    'update-home-vercel.js',
    'update-vercel-design.js',
    'validate-production-app.js',
    'verificacion-final-vercel.js',
    'verificacion-mejorada.js',
    'verify-mercadopago-prod.js',
    'verify-vercel-functionality-clean.js',
    'verify-vercel-functionality.js',
    'test-ads-config.js',
    
    // Archivos de configuración temporales
    'css-modules-config.json',
    'package-scripts.json',
    'next.config.js.backup',
    'next.config.capacitor.js',
    'server.js',
    'validation_results.txt',
    
    // Archivos Java sueltos
    'LauncherActivity.java',
    'package com.google.ads.java'
];

// Documentos markdown temporales de desarrollo
const markdownFilesToDelete = [
    'ACTUALIZAR_IDS_ADMOB.md',
    'ADMOB_SETUP.md',
    'ADMOB_SETUP_GUIDE.md',
    'ANALISIS-COMPONENTES-ESTILOS.md',
    'ANALISIS_APIS_CAPACITOR.md',
    'APIS-VERCEL-FUNCIONANDO.md',
    'API_SEPARATION_DOCUMENTATION.md',
    'AUDITORIA_FRONTEND.md',
    'CSS-MODULES-README.md',
    'ESTRUCTURA_PROYECTO_COMPLETA.md',
    'FLUJO_TRABAJO_COMPLETO.md',
    'GUIA_DESPLIEGUE_PRODUCCION.md',
    'IMPLEMENTACION-GENERATESTATICPARAMS.md',
    'LIMPIEZA-ARCHIVOS-OBSOLETOS.md',
    'PRISMA_NEON_DOCUMENTATION.md',
    'PRODUCCION-LISTA.md',
    'REPORTE-FINAL-PRODUCCION-URLS.md',
    'REPORTE_APIS_FALTANTES.md',
    'REPORTE_VERIFICACION_COMPLETA.md',
    'RESUMEN_SOLUCION_COMPLETA.md',
    'SOLUCION-APIS-VERCEL.md',
    'SOLUCION-OAUTH.md',
    'STATIC-EXPORT-FIXED.md',
    'VERIFICACION-CAPACITOR.md',
    'VERIFICACION-DEPENDENCIAS.md'
];

// Scripts batch de desarrollo
const batchFilesToDelete = [
    'build-capacitor.bat',
    'build-mobile-apk.bat',
    'build-production-ready.bat',
    'build-simple-apk.bat',
    'deploy-api-production.bat',
    'deploy-api.bat',
    'deploy-new-api.bat',
    'fix-api-url.bat',
    'generar-apk.bat',
    'install-dependencies.bat',
    'start-mobile-test.bat',
    'start-servers.bat',
    'verificar-entornos.bat'
];

// Scripts shell de desarrollo
const shellFilesToDelete = [
    'build-production.sh',
    'deploy-api-production.sh',
    'verificar-entornos.sh'
];

// Carpetas de cache y temporales
const foldersToDelete = [
    '.next',
    'out',
    'api_backup_temp',
    'bisonte-vite-app',
    'expo-app',
    'BisonteNative',
    'adb'
];

function deleteFile(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`✅ Eliminado: ${path.basename(filePath)}`);
            return true;
        }
        return false;
    } catch (error) {
        console.log(`❌ Error eliminando ${path.basename(filePath)}: ${error.message}`);
        return false;
    }
}

function deleteFolder(folderPath) {
    try {
        if (fs.existsSync(folderPath)) {
            fs.rmSync(folderPath, { recursive: true, force: true });
            console.log(`🗂️ Carpeta eliminada: ${path.basename(folderPath)}`);
            return true;
        }
        return false;
    } catch (error) {
        console.log(`❌ Error eliminando carpeta ${path.basename(folderPath)}: ${error.message}`);
        return false;
    }
}

function cleanProject() {
    console.log('🧹 Iniciando limpieza del proyecto...\n');
    
    let deletedCount = 0;
    
    // Eliminar scripts de JavaScript
    console.log('📜 Limpiando scripts JavaScript...');
    filesToDelete.forEach(file => {
        const filePath = path.join(projectRoot, file);
        if (deleteFile(filePath)) deletedCount++;
    });
    
    console.log('\n📝 Limpiando documentos Markdown temporales...');
    markdownFilesToDelete.forEach(file => {
        const filePath = path.join(projectRoot, file);
        if (deleteFile(filePath)) deletedCount++;
    });
    
    console.log('\n🔧 Limpiando scripts Batch...');
    batchFilesToDelete.forEach(file => {
        const filePath = path.join(projectRoot, file);
        if (deleteFile(filePath)) deletedCount++;
    });
    
    console.log('\n🐧 Limpiando scripts Shell...');
    shellFilesToDelete.forEach(file => {
        const filePath = path.join(projectRoot, file);
        if (deleteFile(filePath)) deletedCount++;
    });
    
    console.log('\n🗂️ Limpiando carpetas de cache y temporales...');
    foldersToDelete.forEach(folder => {
        const folderPath = path.join(projectRoot, folder);
        if (deleteFolder(folderPath)) deletedCount++;
    });
    
    // Limpiar cache de node_modules específico
    console.log('\n🔄 Limpiando cache específico...');
    const nodeModulesCache = path.join(projectRoot, 'node_modules/.cache');
    if (deleteFolder(nodeModulesCache)) deletedCount++;
    
    console.log(`\n✨ Limpieza completada! Se eliminaron ${deletedCount} elementos.`);
    console.log('\n📋 Archivos importantes conservados:');
    console.log('   - README.md (documentación principal)');
    console.log('   - README-DESARROLLO.md (documentación de desarrollo)');
    console.log('   - package.json');
    console.log('   - next.config.js');
    console.log('   - tailwind.config.js');
    console.log('   - capacitor.config.ts');
    console.log('   - vercel.json');
    console.log('   - Carpetas src/, public/, scripts/, api-server/');
    console.log('   - Configuraciones de entorno (.env files)');
    
    console.log('\n🚀 Proyecto limpio y listo para producción!');
}

if (require.main === module) {
    cleanProject();
}

module.exports = { cleanProject };
