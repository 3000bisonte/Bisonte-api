// Script para cambiar de build estático a standalone
const fs = require('fs');
const path = require('path');

function switchToStandalone() {
  console.log('🔄 CAMBIANDO A NEXT.JS STANDALONE MODE\n');
  
  try {
    const nextConfigPath = path.join(__dirname, '../next.config.js');
    
    // Leer configuración actual
    let configContent = fs.readFileSync(nextConfigPath, 'utf8');
    
    // Backup de la configuración actual
    const backupPath = nextConfigPath + '.static.backup';
    fs.writeFileSync(backupPath, configContent);
    console.log(`💾 Backup creado: ${backupPath}`);
    
    // Crear nueva configuración standalone
    const standaloneConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para modo standalone (con APIs integradas)
  output: 'standalone',
  trailingSlash: false,
  images: {
    unoptimized: true
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Configuración de headers para CORS
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
}

module.exports = nextConfig
`;
    
    // Escribir nueva configuración
    fs.writeFileSync(nextConfigPath, standaloneConfig);
    
    console.log('✅ Configuración cambiada a standalone');
    console.log('📝 Cambios realizados:');
    console.log('   - output: "standalone"');
    console.log('   - trailingSlash: false');
    console.log('   - Eliminado distDir');
    console.log('   - Agregados headers CORS');
    console.log('\n⚠️  IMPORTANTE:');
    console.log('   - Ahora puedes usar rutas /api/ directamente en Next.js');
    console.log('   - Ejecuta: npm run build para generar servidor standalone');
    console.log('   - El servidor incluirá APIs y frontend juntos');
    console.log(`   - Para revertir: node scripts/switch-to-static.js`);
    
  } catch (error) {
    console.error('❌ Error cambiando configuración:', error);
    process.exit(1);
  }
}

switchToStandalone();
