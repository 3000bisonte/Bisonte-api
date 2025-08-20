const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const BASE = 'https://bisonte-api.vercel.app';

// Admin emails configurados
const ADMIN_EMAILS = [
  '3000bisonte@gmail.com',
  'bisonteangela@gmail.com',
  'bisonteoskar@gmail.com'
];

async function login(email, password='admin123') {
  const res = await fetch(BASE + '/api/auth/login', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ email, password })
  });
  const data = await res.json().catch(()=>({}));
  return { status: res.status, data };
}

async function testAdminEndpoints() {
  console.log('🛡️ Pruebas de endpoints ADMIN');
  console.log('--------------------------------');

  const adminEmail = ADMIN_EMAILS[0];
  console.log('🔐 Login como admin:', adminEmail);
  const { status, data } = await login(adminEmail);
  if (status !== 200) {
    console.error('❌ No se pudo autenticar admin, status', status, data.error);
    process.exit(1);
  }
  if (!data.token || data.role !== 'admin') {
    console.error('❌ Rol no es admin o token ausente', data.role);
    process.exit(1);
  }
  const token = data.token;
  console.log('✅ Admin autenticado, rol:', data.role);

  const endpoints = [
    ['GET','/api/admin/stats'],
    ['GET','/api/admin/users'],
    ['GET','/api/admin/settings'],
    ['POST','/api/admin/settings',{ setting: 'testFlag', value: 'on' }]
  ];

  const results = [];
  for (const [method, path, body] of endpoints) {
    const res = await fetch(BASE + path, {
      method,
      headers: { 'Content-Type':'application/json', Authorization: 'Bearer ' + token },
      body: body ? JSON.stringify(body) : undefined
    });
    const ok = res.ok;
    const code = res.status;
    results.push({ method, path, code, ok });
    console.log(`${ok ? '✅' : '❌'} ${method} ${path} -> ${code}`);
  }

  const failed = results.filter(r => !r.ok);
  console.log('\n📊 Resumen admin:');
  console.log('Total:', results.length, 'Fallidos:', failed.length);
  if (failed.length) {
    console.error('❌ Endpoints admin con fallos');
    process.exitCode = 1;
  } else {
    console.log('🎉 Todos los endpoints admin funcionan');
  }
}

if (require.main === module) {
  testAdminEndpoints().catch(e => { console.error(e); process.exit(1); });
}
