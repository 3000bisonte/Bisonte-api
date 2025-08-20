const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const base = 'https://bisonte-api.vercel.app';

const adminEmails = [
  '3000bisonte@gmail.com',
  'bisonteangela@gmail.com', 
  'bisonteoskar@gmail.com'
];

const regularUser = { email: 'demo@bisonte.com', password: 'demo123' };

async function testRoles() {
  console.log('🧪 Iniciando pruebas de sistema de roles...\n');

  // Probar usuario regular
  console.log('👤 Probando usuario regular (demo@bisonte.com)...');
  const regularLogin = await fetch(base + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(regularUser)
  });
  const regularData = await regularLogin.json();
  const regularToken = regularData.token;
  
  console.log(`Login regular: ${regularLogin.status}`);
  console.log(`Role: ${regularData.role || regularData.user?.role}`);
  console.log(`Token obtenido: ${!!regularToken}\n`);

  // Probar cada admin con Google Auth simulado
  for (const adminEmail of adminEmails) {
    console.log(`🔑 Probando admin (${adminEmail})...`);
    
    const adminLogin = await fetch(base + '/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: adminEmail,
        name: `Admin ${adminEmail.split('@')[0]}`,
        idToken: 'simulated_token'
      })
    });
    
    const adminData = await adminLogin.json();
    console.log(`Google Auth: ${adminLogin.status}`);
    console.log(`Role: ${adminData.role || adminData.user?.role}`);
    console.log(`Token obtenido: ${!!adminData.token}\n`);
  }

  // Probar endpoints admin con usuario regular (debe fallar)
  console.log('🔒 Probando acceso a endpoints admin con usuario regular...');
  const adminEndpoints = [
    '/api/admin/stats',
    '/api/admin/users', 
    '/api/admin/settings'
  ];

  for (const endpoint of adminEndpoints) {
    const response = await fetch(base + endpoint, {
      headers: { Authorization: `Bearer ${regularToken}` }
    });
    console.log(`${endpoint}: ${response.status} ${response.status === 403 ? '✅ (Acceso denegado correctamente)' : '❌ (Debería ser 403)'}`);
  }

  // Probar endpoints admin con token de admin
  console.log('\n🔓 Probando acceso a endpoints admin con token de admin...');
  
  // Obtener token de admin
  const adminLogin = await fetch(base + '/api/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: adminEmails[0],
      name: 'Admin Test',
      idToken: 'simulated_token'
    })
  });
  const adminData = await adminLogin.json();
  const adminToken = adminData.token;

  for (const endpoint of adminEndpoints) {
    const response = await fetch(base + endpoint, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`${endpoint}: ${response.status} ${response.status === 200 ? '✅ (Acceso permitido)' : '❌ (Debería ser 200)'}`);
  }

  // Probar POST admin settings
  console.log('\n📝 Probando POST admin settings...');
  const settingsUpdate = await fetch(base + '/api/admin/settings', {
    method: 'POST',
    headers: { 
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      setting: 'maintenance',
      value: false
    })
  });
  console.log(`POST /api/admin/settings: ${settingsUpdate.status} ${settingsUpdate.status === 200 ? '✅' : '❌'}`);

  console.log('\n🎯 Pruebas de roles completadas.');
}

testRoles().catch(console.error);
