const fs = require('fs');
const path = require('path');

function verifyStaticBuild() {
    console.log('🔍 VERIFICACIÓN COMPLETA DEL BUILD ESTÁTICO Y CAPACITOR\n');
    
    const outDir = './out';
    const androidDir = './android';
    const errors = [];
    const warnings = [];
    
    // 1. Verificar que existe la carpeta out
    if (!fs.existsSync(outDir)) {
        errors.push('❌ La carpeta "out" no existe. Ejecuta "npm run build" primero.');
        return { errors, warnings };
    }
    
    console.log('✅ Carpeta "out" existe');
    
    // 2. Verificar archivos críticos
    const criticalFiles = [
        'index.html',
        'manifest.json',
        'favicon.ico',
        '_next/static'
    ];
    
    criticalFiles.forEach(file => {
        const filePath = path.join(outDir, file);
        if (fs.existsSync(filePath)) {
            console.log(`✅ ${file} encontrado`);
        } else {
            errors.push(`❌ Archivo crítico faltante: ${file}`);
        }
    });
    
    // 3. Verificar rutas relativas en index.html
    const indexPath = path.join(outDir, 'index.html');
    if (fs.existsSync(indexPath)) {
        const content = fs.readFileSync(indexPath, 'utf8');
        
        if (content.includes('src="/_next/') || content.includes('href="/_next/')) {
            warnings.push('⚠️ Aún se encontraron rutas absolutas en index.html');
        } else {
            console.log('✅ Rutas relativas verificadas en index.html');
        }
        
        if (content.includes('href="./manifest.json"')) {
            console.log('✅ Manifest.json correctamente enlazado');
        } else {
            warnings.push('⚠️ Manifest.json no está correctamente enlazado');
        }
    }
    
    // 4. Verificar configuración de Capacitor
    const capacitorConfig = './capacitor.config.ts';
    if (fs.existsSync(capacitorConfig)) {
        const configContent = fs.readFileSync(capacitorConfig, 'utf8');
        
        if (configContent.includes('webDir: \'out\'')) {
            console.log('✅ Capacitor configurado para usar carpeta "out"');
        } else {
            errors.push('❌ Capacitor no está configurado para usar carpeta "out"');
        }
        
        if (configContent.includes('appId: \'com.bisonte.logistica\'')) {
            console.log('✅ App ID de Capacitor configurado');
        } else {
            warnings.push('⚠️ Verificar App ID de Capacitor');
        }
    }
    
    // 5. Verificar que Android está sincronizado
    if (fs.existsSync(androidDir)) {
        console.log('✅ Proyecto Android existe');
        
        const androidAssetsPath = path.join(androidDir, 'app', 'src', 'main', 'assets', 'public');
        if (fs.existsSync(androidAssetsPath)) {
            console.log('✅ Assets copiados a Android');
            
            // Verificar algunos archivos clave en Android
            const androidIndexPath = path.join(androidAssetsPath, 'index.html');
            if (fs.existsSync(androidIndexPath)) {
                console.log('✅ index.html copiado a Android');
            } else {
                errors.push('❌ index.html no copiado a Android');
            }
        } else {
            warnings.push('⚠️ Assets no encontrados en Android, ejecuta "npx cap sync"');
        }
    } else {
        errors.push('❌ Proyecto Android no encontrado, ejecuta "npx cap add android"');
    }
    
    // 6. Verificar API configuration
    const apiConfigPath = './src/config/api.js';
    if (fs.existsSync(apiConfigPath)) {
        const apiContent = fs.readFileSync(apiConfigPath, 'utf8');
        
        if (apiContent.includes('getApiBaseURL') && apiContent.includes('Capacitor')) {
            console.log('✅ Configuración de API para Capacitor encontrada');
        } else {
            warnings.push('⚠️ Verificar configuración de API para Capacitor');
        }
    }
    
    // 7. Verificar package.json scripts
    const packagePath = './package.json';
    if (fs.existsSync(packagePath)) {
        const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        if (packageContent.scripts && packageContent.scripts['build:capacitor']) {
            console.log('✅ Script build:capacitor encontrado');
        } else {
            warnings.push('⚠️ Script build:capacitor no encontrado');
        }
    }
    
    // 8. Verificar manifest.json
    const manifestPath = path.join(outDir, 'manifest.json');
    if (fs.existsSync(manifestPath)) {
        try {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            console.log('✅ Manifest.json es válido');
            
            if (manifest.start_url) {
                console.log(`✅ Start URL: ${manifest.start_url}`);
            }
            
            if (manifest.icons && manifest.icons.length > 0) {
                console.log('✅ Iconos encontrados en manifest');
            }
        } catch (error) {
            errors.push('❌ Manifest.json no es válido JSON');
        }
    }
    
    // Resultados
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMEN DE LA VERIFICACIÓN');
    console.log('='.repeat(50));
    
    if (errors.length === 0) {
        console.log('🎉 ¡BUILD EXITOSO! El proyecto está listo para generar APK');
        console.log('\n📱 Comandos disponibles:');
        console.log('   - npm run capacitor:android    (Abrir Android Studio)');
        console.log('   - npm run capacitor:build:android  (Build completo + APK)');
        console.log('   - npx cap run android --device  (Instalar en dispositivo)');
    } else {
        console.log('❌ ERRORES ENCONTRADOS:');
        errors.forEach(error => console.log(`   ${error}`));
    }
    
    if (warnings.length > 0) {
        console.log('\n⚠️ ADVERTENCIAS:');
        warnings.forEach(warning => console.log(`   ${warning}`));
    }
    
    console.log('\n🔧 Para solucionar problemas:');
    console.log('   1. npm run build:capacitor');
    console.log('   2. Verificar que todas las APIs usan apiClient');
    console.log('   3. Verificar rutas relativas en archivos estáticos');
    
    return { errors, warnings };
}

if (require.main === module) {
    verifyStaticBuild();
}

module.exports = { verifyStaticBuild };
