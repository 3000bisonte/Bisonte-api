// Script para validar configuración de APIs separadas
const { API_CONFIG } = require('../src/config/api.js');

async function validateApiConfig() {
  console.log('🔍 VALIDANDO CONFIGURACIÓN DE APIs SEPARADAS\n');
  
  try {
    // Simular diferentes entornos
    const environments = [
      { name: 'Development', isCapacitor: false, hostname: 'localhost' },
      { name: 'Production Web', isCapacitor: false, hostname: 'tu-domain.com' },
      { name: 'Capacitor APK', isCapacitor: true, hostname: 'localhost' }
    ];
    
    environments.forEach(env => {
      // Simular window object
      global.window = {
        Capacitor: env.isCapacitor,
        location: { hostname: env.hostname, origin: `https://${env.hostname}` }
      };
      
      const apiUrl = API_CONFIG.getApiBaseURL();
      const frontendUrl = API_CONFIG.getFrontendBaseURL();
      const environment = API_CONFIG.getEnvironment();
      
      console.log(`📱 ${env.name}:`);
      console.log(`   API Base URL: ${apiUrl}`);
      console.log(`   Frontend URL: ${frontendUrl}`);
      console.log(`   Environment: ${environment}`);
      console.log('');
    });
    
    // Validar endpoints
    console.log('🔗 ENDPOINTS CONFIGURADOS:');
    Object.entries(API_CONFIG.endpoints).forEach(([category, endpoints]) => {
      console.log(`\n📂 ${category.toUpperCase()}:`);
      Object.entries(endpoints).forEach(([name, path]) => {
        console.log(`   ${name}: ${path}`);
      });
    });
    
    console.log('\n✅ Configuración validada correctamente');
    
  } catch (error) {
    console.error('❌ Error validando configuración:', error);
    process.exit(1);
  } finally {
    // Limpiar global
    delete global.window;
  }
}

validateApiConfig();
