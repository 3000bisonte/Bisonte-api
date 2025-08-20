const fs = require('fs');
const path = require('path');

function fixStaticPaths() {
    const outDir = './out';
    
    // Función para reemplazar rutas absolutas por relativas
    function replaceAbsolutePaths(content, depth = 0) {
        const prefix = depth === 0 ? './' : '../'.repeat(depth);
        
        // Reemplazar todas las referencias a /_next/ por rutas relativas
        content = content.replace(/\/_next\//g, `${prefix}_next/`);
        
        // Reemplazar href="/" por href="./"
        content = content.replace(/href="\//g, `href="${prefix}`);
        
        // Reemplazar src="/" por src="./"
        content = content.replace(/src="\//g, `src="${prefix}`);
        
        // Para archivos JSON, también corregir las rutas
        if (content.includes('"/_next/')) {
            content = content.replace(/"\/\_next\//g, `"${prefix}_next/`);
        }
        
        return content;
    }
    
    // Función recursiva para procesar archivos
    function processDirectory(dirPath, depth = 0) {
        const items = fs.readdirSync(dirPath);
        
        items.forEach(item => {
            const itemPath = path.join(dirPath, item);
            const stat = fs.statSync(itemPath);
            
            if (stat.isDirectory()) {
                // Procesar subdirectorios
                processDirectory(itemPath, depth + 1);
            } else if (stat.isFile()) {
                const ext = path.extname(item).toLowerCase();
                
                // Procesar archivos HTML, CSS, JS, JSON
                if (['.html', '.css', '.js', '.json'].includes(ext)) {
                    try {
                        let content = fs.readFileSync(itemPath, 'utf8');
                        const originalContent = content;
                        
                        content = replaceAbsolutePaths(content, depth);
                        
                        // Solo escribir si hubo cambios
                        if (content !== originalContent) {
                            fs.writeFileSync(itemPath, content, 'utf8');
                            console.log(`✅ Corregido: ${itemPath}`);
                        }
                    } catch (error) {
                        console.log(`❌ Error procesando ${itemPath}: ${error.message}`);
                    }
                }
            }
        });
    }
    
    console.log('🔧 Corrigiendo rutas para compatibilidad con Capacitor...\n');
    
    if (!fs.existsSync(outDir)) {
        console.log('❌ La carpeta "out" no existe. Ejecuta "npm run build" primero.');
        return;
    }
    
    processDirectory(outDir);
    
    console.log('\n✨ Corrección de rutas completada!');
    console.log('📱 Los archivos estáticos ahora son compatibles con Capacitor');
}

if (require.main === module) {
    fixStaticPaths();
}

module.exports = { fixStaticPaths };
