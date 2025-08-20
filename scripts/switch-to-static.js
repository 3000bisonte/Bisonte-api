// Script para cambiar de standalone a build estático
const fs = require('fs');
const path = require('path');

function switchToStatic() {
  console.log('🔄 CAMBIANDO A NEXT.JS STATIC EXPORT MODE\n');
  
  try {
    const nextConfigPath = path.join(__dirname, '../next.config.js');
    
    // Verificar si existe backup
    const backupPath = nextConfigPath + '.static.backup';
    if (fs.existsSync(backupPath)) {
      // Restaurar desde backup
      const backupContent = fs.readFileSync(backupPath, 'utf8');
      fs.writeFileSync(nextConfigPath, backupContent);
      console.log('📄 Configuración restaurada desde backup');
    } else {
      // Crear configuración estática nueva
      const staticConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para Capacitor (con output export)
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  distDir: 'out'
}

module.exports = nextConfig
`;
      
      fs.writeFileSync(nextConfigPath, staticConfig);
      console.log('📄 Nueva configuración estática creada');
    }
    
    console.log('✅ Configuración cambiada a static export');
    console.log('📝 Cambios realizados:');
    console.log('   - output: "export"');
    console.log('   - trailingSlash: true');
    console.log('   - distDir: "out"');
    console.log('   - Removidos headers CORS');
    console.log('\n⚠️  IMPORTANTE:');
    console.log('   - Las rutas /api/ NO funcionarán en modo estático');
    console.log('   - Usar API server separado en api-server/');
    console.log('   - Ejecuta: npm run build para generar archivos estáticos');
    console.log('   - Para usar APIs: node scripts/switch-to-standalone.js');
    
  } catch (error) {
    console.error('❌ Error cambiando configuración:', error);
    process.exit(1);
  }
}

switchToStatic();
