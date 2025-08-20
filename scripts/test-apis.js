#!/usr/bin/env node

const https = require('https');
const http = require('http');

console.log('🧪 TESTING BISONTE LOGÍSTICA APIs');
console.log('==================================');
console.log('');

// Configuración de tests
const BASE_URL = 'https://bisonte-modificado.vercel.app';
const LOCAL_URL = 'http://localhost:3000';

// Lista de APIs a probar
const API_ENDPOINTS = [
  // APIs públicas (sin autenticación)
  { path: '/api/auth/status', method: 'GET', name: 'Auth Status' },
  { path: '/api/health', method: 'GET', name: 'Health Check' },
  
  // APIs de usuario
  { path: '/api/usuarios', method: 'GET', name: 'Usuarios List' },
  { path: '/api/envios', method: 'GET', name: 'Envíos List' },
  
  // APIs de mercadopago
  { path: '/api/mercadopago/status', method: 'GET', name: 'MercadoPago Status' },
  
  // APIs de email
  { path: '/api/email/test', method: 'GET', name: 'Email Test' },
];

// Función para hacer requests HTTP/HTTPS
function makeRequest(url, options = {}) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const lib = urlObj.protocol === 'https:' ? https : http;
    
    const req = lib.request(url, {
      method: options.method || 'GET',
      timeout: 10000,
      headers: {
        'User-Agent': 'Bisonte-API-Tester/1.0',
        'Accept': 'application/json',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data,
          success: res.statusCode >= 200 && res.statusCode < 400
        });
      });
    });
    
    req.on('error', (err) => {
      resolve({
        status: 0,
        error: err.message,
        success: false
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        status: 408,
        error: 'Request timeout',
        success: false
      });
    });
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Función para probar una API
async function testAPI(baseUrl, endpoint) {
  const url = `${baseUrl}${endpoint.path}`;
  const startTime = Date.now();
  
  try {
    const result = await makeRequest(url, {
      method: endpoint.method
    });
    
    const duration = Date.now() - startTime;
    const status = result.status || 0;
    const success = result.success;
    
    // Formato del resultado
    const statusIcon = success ? '✅' : '❌';
    const statusCode = status || 'ERR';
    const timing = `${duration}ms`;
    
    console.log(`${statusIcon} ${endpoint.name.padEnd(20)} | ${statusCode.toString().padStart(3)} | ${timing.padStart(6)} | ${endpoint.path}`);
    
    return {
      name: endpoint.name,
      path: endpoint.path,
      status: statusCode,
      success: success,
      duration: duration,
      error: result.error
    };
  } catch (error) {
    console.log(`❌ ${endpoint.name.padEnd(20)} | ERR | ERROR  | ${endpoint.path} (${error.message})`);
    return {
      name: endpoint.name,
      path: endpoint.path,
      status: 0,
      success: false,
      error: error.message
    };
  }
}

// Función para probar conectividad básica
async function testConnectivity(url) {
  console.log(`🌐 Testing connectivity to: ${url}`);
  const result = await makeRequest(url);
  
  if (result.success) {
    console.log(`✅ Server is reachable (${result.status})`);
    return true;
  } else {
    console.log(`❌ Server unreachable: ${result.error || 'Unknown error'}`);
    return false;
  }
}

// Función principal
async function main() {
  console.log('📍 Testing Production Server (Vercel)');
  console.log('-------------------------------------');
  
  const prodConnected = await testConnectivity(BASE_URL);
  
  if (prodConnected) {
    console.log('');
    console.log('API Endpoint'.padEnd(22) + '| Status | Time   | Path');
    console.log('─'.repeat(65));
    
    const results = [];
    
    for (const endpoint of API_ENDPOINTS) {
      const result = await testAPI(BASE_URL, endpoint);
      results.push(result);
      
      // Pequeña pausa entre requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('─'.repeat(65));
    
    // Resumen
    const successful = results.filter(r => r.success).length;
    const total = results.length;
    const avgTime = results.reduce((sum, r) => sum + r.duration, 0) / total;
    
    console.log('');
    console.log('📊 RESUMEN DE TESTING:');
    console.log(`   ✅ Exitosos: ${successful}/${total} (${Math.round(successful/total*100)}%)`);
    console.log(`   ⏱️  Tiempo promedio: ${Math.round(avgTime)}ms`);
    console.log(`   🌐 Servidor: ${BASE_URL}`);
    
    if (successful === total) {
      console.log('');
      console.log('🎉 ¡Todos los tests pasaron exitosamente!');
      console.log('   El backend está completamente operativo.');
    } else {
      console.log('');
      console.log('⚠️  Algunos tests fallaron:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`   ❌ ${r.name}: ${r.error || 'Status ' + r.status}`);
      });
    }
  }
  
  console.log('');
  console.log('🔧 Testing Local Development Server');
  console.log('-----------------------------------');
  
  const localConnected = await testConnectivity(LOCAL_URL);
  
  if (!localConnected) {
    console.log('💡 Para probar localmente, ejecuta: npm run dev');
  }
  
  console.log('');
  console.log('✅ Testing completado');
  console.log('===================');
  
  // Exit code basado en los resultados
  process.exit(prodConnected ? 0 : 1);
}

// Manejo de errores globales
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});

// Ejecutar
main().catch(error => {
  console.error('❌ Error fatal:', error.message);
  process.exit(1);
});
