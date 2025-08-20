const fs = require('fs');
const path = require('path');

function fixApiCalls() {
    const srcDir = './src';
    
    // Mapeo de endpoints para reemplazar
    const endpointMappings = {
        '"/api/contacto"': 'apiClient.post("/api/contacto", formData)',
        '"/api/envios"': 'apiClient.get("/api/envios")',
        '"/api/recuperar"': 'apiClient.post("/api/recuperar", body)',
        '"/api/register"': 'apiClient.post("/api/register", body)',
        '"/api/perfil"': 'apiClient.get("/api/perfil")',
        '"/api/recuperar/validar-token"': 'apiClient.post("/api/recuperar/validar-token", body)',
        '"/api/admin/stats"': 'apiClient.get("/api/admin/stats")',
        '"/api/mercadopago"': 'apiClient.post("/api/mercadopago", paymentData)',
        '"/api/guardarenvio"': 'apiClient.post("/api/guardarenvio", envioCompleto)'
    };
    
    // Función para procesar archivos recursivamente
    function processDirectory(dirPath) {
        const items = fs.readdirSync(dirPath);
        
        items.forEach(item => {
            const itemPath = path.join(dirPath, item);
            const stat = fs.statSync(itemPath);
            
            if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('.next')) {
                processDirectory(itemPath);
            } else if (stat.isFile() && /\.(js|jsx|ts|tsx)$/.test(item)) {
                processFile(itemPath);
            }
        });
    }
    
    function processFile(filePath) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let hasChanges = false;
            const originalContent = content;
            
            // Verificar si el archivo ya importa apiClient
            const hasApiClientImport = content.includes('import') && content.includes('apiClient');
            const hasApiConfigImport = content.includes('import') && content.includes('API_CONFIG');
            
            // Buscar patrones de fetch con /api/
            const fetchPatterns = [
                /fetch\(\s*["'](\/api\/[^"']+)["']\s*,\s*\{([^}]+)\}\s*\)/g,
                /fetch\(\s*["'](\/api\/[^"']+)["']\s*\)/g
            ];
            
            fetchPatterns.forEach(pattern => {
                const matches = content.matchAll(pattern);
                for (const match of matches) {
                    const endpoint = match[1];
                    const options = match[2] || '';
                    
                    let replacement;
                    
                    // Determinar el método HTTP basado en las opciones
                    if (options.includes('method:') && options.includes('POST')) {
                        // Es un POST
                        const bodyMatch = options.match(/body:\s*([^,}]+)/);
                        const bodyVar = bodyMatch ? bodyMatch[1].trim() : 'data';
                        replacement = `apiClient.post("${endpoint}", ${bodyVar})`;
                    } else if (options.includes('method:') && (options.includes('PUT') || options.includes('PATCH'))) {
                        // Es un PUT/PATCH
                        const bodyMatch = options.match(/body:\s*([^,}]+)/);
                        const bodyVar = bodyMatch ? bodyMatch[1].trim() : 'data';
                        replacement = `apiClient.put("${endpoint}", ${bodyVar})`;
                    } else if (options.includes('method:') && options.includes('DELETE')) {
                        // Es un DELETE
                        replacement = `apiClient.delete("${endpoint}")`;
                    } else {
                        // Por defecto es GET
                        replacement = `apiClient.get("${endpoint}")`;
                    }
                    
                    content = content.replace(match[0], replacement);
                    hasChanges = true;
                    console.log(`🔄 Reemplazado en ${filePath}: ${match[0]} -> ${replacement}`);
                }
            });
            
            // Agregar import de apiClient si es necesario y hay cambios
            if (hasChanges && !hasApiClientImport) {
                // Buscar donde insertar el import
                const importLines = content.split('\\n').filter(line => line.trim().startsWith('import'));
                
                if (importLines.length > 0) {
                    // Insertar después de otros imports
                    const lastImportIndex = content.lastIndexOf(importLines[importLines.length - 1]);
                    const insertPosition = content.indexOf('\\n', lastImportIndex) + 1;
                    
                    const importStatement = "import { apiClient } from '@/libs/api-client';\\n";
                    content = content.slice(0, insertPosition) + importStatement + content.slice(insertPosition);
                    console.log(`📦 Agregado import de apiClient en ${filePath}`);
                } else {
                    // Si no hay imports, agregarlo al principio
                    content = "import { apiClient } from '@/libs/api-client';\\n\\n" + content;
                    console.log(`📦 Agregado import de apiClient al principio de ${filePath}`);
                }
            }
            
            // Escribir solo si hubo cambios
            if (content !== originalContent) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`✅ Actualizado: ${filePath}`);
            }
            
        } catch (error) {
            console.log(`❌ Error procesando ${filePath}: ${error.message}`);
        }
    }
    
    console.log('🔧 Corrigiendo llamadas a API para usar apiClient...');
    console.log('📂 Procesando archivos en:', srcDir);
    
    if (!fs.existsSync(srcDir)) {
        console.log('❌ La carpeta src no existe.');
        return;
    }
    
    processDirectory(srcDir);
    
    console.log('\\n✨ Corrección de APIs completada!');
    console.log('📱 Todas las llamadas ahora usan el apiClient configurado para Capacitor');
}

if (require.main === module) {
    fixApiCalls();
}

module.exports = { fixApiCalls };
