const fs = require('fs');
const path = require('path');

function fixCSSPaths() {
    console.log('🎨 Corrigiendo rutas de CSS para Capacitor...\n');
    
    const outDir = './out';
    const cssDir = path.join(outDir, '_next', 'static', 'css');
    
    if (!fs.existsSync(cssDir)) {
        console.log('❌ Directorio CSS no encontrado');
        return;
    }
    
    // Buscar archivos CSS
    const cssFiles = fs.readdirSync(cssDir).filter(file => file.endsWith('.css'));
    
    cssFiles.forEach(cssFile => {
        const cssPath = path.join(cssDir, cssFile);
        console.log(`🔍 Procesando: ${cssFile}`);
        
        try {
            let content = fs.readFileSync(cssPath, 'utf8');
            const originalContent = content;
            
            // Corregir rutas de fuentes y assets
            // De: url(../../../_next/static/media/...)
            // A: url(../../media/...)
            content = content.replace(/url\(\.\.\/\.\.\/\.\.\/\_next\/static\/media\//g, 'url(../../media/');
            
            // También corregir rutas relativas que van muy arriba
            content = content.replace(/url\(\.\.\/\.\.\/\.\.\/\.\.\/\_next\/static\/media\//g, 'url(../../../media/');
            
            // Corregir cualquier referencia a _next absoluta
            content = content.replace(/url\(['"]*\/\_next\/static\/media\//g, 'url(../../media/');
            
            if (content !== originalContent) {
                fs.writeFileSync(cssPath, content, 'utf8');
                console.log(`✅ Corregido: ${cssFile}`);
            } else {
                console.log(`ℹ️ Sin cambios: ${cssFile}`);
            }
            
        } catch (error) {
            console.log(`❌ Error procesando ${cssFile}: ${error.message}`);
        }
    });
    
    console.log('\n✨ Corrección de CSS completada!');
}

// También vamos a verificar y corregir rutas de manifest y otros assets en HTML
function fixHTMLManifestPaths() {
    console.log('\n🔧 Corrigiendo rutas de manifest en HTML...\n');
    
    const outDir = './out';
    
    function processHTMLFiles(dirPath, depth = 0) {
        const items = fs.readdirSync(dirPath);
        
        items.forEach(item => {
            const itemPath = path.join(dirPath, item);
            const stat = fs.statSync(itemPath);
            
            if (stat.isDirectory() && !item.startsWith('_')) {
                processHTMLFiles(itemPath, depth + 1);
            } else if (item === 'index.html') {
                try {
                    let content = fs.readFileSync(itemPath, 'utf8');
                    const originalContent = content;
                    
                    // Corregir rutas del manifest que aún están absolutas
                    const prefix = depth === 0 ? './' : '../'.repeat(depth);
                    
                    // Corregir manifest.json, favicon, iconos que aún están con /
                    content = content.replace(/href="\/manifest\.json"/g, `href="${prefix}manifest.json"`);
                    content = content.replace(/href="\/icon-/g, `href="${prefix}icon-`);
                    content = content.replace(/href="\/favicon\.ico"/g, `href="${prefix}favicon.ico"`);
                    
                    if (content !== originalContent) {
                        fs.writeFileSync(itemPath, content, 'utf8');
                        console.log(`✅ Corregido manifest en: ${itemPath.replace(outDir, '')}`);
                    }
                    
                } catch (error) {
                    console.log(`❌ Error procesando HTML ${itemPath}: ${error.message}`);
                }
            }
        });
    }
    
    processHTMLFiles(outDir);
    console.log('\n✨ Corrección de manifest completada!');
}

function fixCapacitorStyles() {
    console.log('🚀 CORRECTOR DE ESTILOS PARA CAPACITOR\n');
    console.log('=====================================\n');
    
    fixCSSPaths();
    fixHTMLManifestPaths();
    
    console.log('\n🎉 ¡Corrección completa de estilos finalizada!');
    console.log('📱 Los estilos ahora deberían verse correctamente en Capacitor');
    console.log('\n📋 Próximos pasos:');
    console.log('   1. npx cap sync');
    console.log('   2. Rebuild en Android Studio');
    console.log('   3. Probar en dispositivo/emulador');
}

if (require.main === module) {
    fixCapacitorStyles();
}

module.exports = { fixCapacitorStyles };
