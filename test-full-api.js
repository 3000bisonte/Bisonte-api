const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const base = 'https://bisonte-api.vercel.app';

// Credenciales base (usuario normal)
const credentials = { email:'demo@bisonte.com', password:'demo123' };
// Credenciales admin para pruebas de endpoints protegidos con rol
const adminCredentials = { email: '3000bisonte@gmail.com', password: 'admin123' };
const newUserEmail = 'user'+Date.now()+'@test.com';

const endpoints = [
// [method, path, body, protected?]
['GET','/'],
['GET','/api/health'],
['GET','/api/test'],
['POST','/api/auth/login', credentials],
['POST','/api/register', { email:newUserEmail, password:'x12345' }],
['POST','/api/envios',{origen:'Bogotá',destino:'Medellín',peso:2,largo:10,ancho:10,alto:10,valorDeclarado:50000}],
['GET','/api/envios'],
['GET','/api/perfil/existeusuario?email=demo@bisonte.com'],
['POST','/api/contacto',{nombre:'Tester',email:'tester@example.com',mensaje:'Hola'}],
['GET','/api/contacto'],
['GET','/api/mercadopago/status'],
['POST','/api/mercadopago/create-preference',{amount:10000,description:'Prueba',email:'demo@bisonte.com'}],
['POST','/api/send',{to:'test@example.com',subject:'Test',message:'Hola'}],
['POST','/api/recuperar',{email:'demo@bisonte.com'}],
['POST','/api/recuperar/validar-token',{token:'abc',newPassword:'nuevo123'}],
['GET','/api/email'],
['POST','/api/email',{action:'ping'}],
// Protegidos
['GET','/api/perfil',null,true],
['POST','/api/perfil',{nombre:'Nombre Actualizado'},true],
['GET','/api/envios/historial',null,true],
['POST','/api/guardarenvio',{origen:'Bogotá',destino:'Cali',peso:1.2},true],
['GET','/api/usuarios',null,true],
['GET','/api/remitente',null,true],
['POST','/api/remitente',{nombre:'Remit SA'},true],
['GET','/api/destinatario',null,true],
['POST','/api/destinatario',{nombre:'Destinatario X'},true],
['GET','/api/admin/stats',null,true],
['GET','/api/admin/users',null,true],
['GET','/api/admin/settings',null,true],
['POST','/api/admin/settings',{setting:'test',value:'value'},true],
['GET','/api/protegido/demo',null,true],
['GET','/api/auth/session',null,false], // Special case - test with and without token
['POST','/api/auth/logout',{},false]
];

async function short(res){
  if (!res || res.status === 0) return { status: 0, ok: false, msg: 'network error' };
  const status = res.status;
  let txt = '';
  try { txt = await res.text(); } catch {}
  let js;
  try { js = JSON.parse(txt); } catch {}
  return {
    status,
    ok: res.ok,
    msg: js?.message || js?.error || js?.note || js?.status || txt.slice(0,80)
  };
}

(async ()=>{
  console.log('🧪 Iniciando pruebas completas del API...\n');
  
  // Obtener token base (login usuario normal)
  console.log('🔐 Obteniendo token (usuario estándar)...');
  const loginResp = await fetch(base+'/api/auth/login',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(credentials)
  }).catch(e => ({ status: 0, text: () => Promise.resolve(e.message), ok: false }));
  const loginData = await loginResp.json().catch(()=>({}));
  const token = loginData.token;
  console.log(`Login user status: ${loginResp.status}, token: ${!!token}`);

  // Obtener token admin (para endpoints de rol)
  console.log('🔐 Obteniendo token (administrador)...');
  const adminLoginResp = await fetch(base+'/api/auth/login',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(adminCredentials)
  }).catch(e => ({ status: 0, text: () => Promise.resolve(e.message), ok: false }));
  const adminLoginData = await adminLoginResp.json().catch(()=>({}));
  const adminToken = adminLoginData.token;
  console.log(`Login admin status: ${adminLoginResp.status}, token: ${!!adminToken}, role: ${adminLoginData.role}`);

  if (!token || !adminToken) {
    console.error('❌ No se pudieron obtener los tokens necesarios. Abortando.');
    process.exit(1);
  }

  const results = [];
  let testCount = 0;
  
  for(const [method,path,body,prot] of endpoints){
    testCount++;
    process.stdout.write(`\r[${testCount}/${endpoints.length}] Probando ${method} ${path}...`);
    
    const headersBase = {'Content-Type':'application/json'};
    
    // Prueba sin token
    const rNo = await fetch(base+path,{
      method,
      headers: headersBase,
      body: body ? JSON.stringify(body) : undefined
    }).catch(e => ({ status: 0, text: () => Promise.resolve(e.message), ok: false }));
    
    // Pruebas con tokens (usuario y admin si aplica)
    let rUser = null;
    let rAdmin = null;
    if (token){
      const headersAuthUser = {...headersBase, Authorization:'Bearer '+token};
      rUser = await fetch(base+path,{
        method,
        headers: headersAuthUser,
        body: body ? JSON.stringify(body) : undefined
      }).catch(e => ({ status: 0, text: () => Promise.resolve(e.message), ok: false }));
    }
    // Si es endpoint admin usar token admin además
    const isAdminEndpoint = path.startsWith('/api/admin');
    if (isAdminEndpoint && adminToken) {
      const headersAuthAdmin = {...headersBase, Authorization:'Bearer '+adminToken};
      rAdmin = await fetch(base+path,{
        method,
        headers: headersAuthAdmin,
        body: body ? JSON.stringify(body) : undefined
      }).catch(e => ({ status: 0, text: () => Promise.resolve(e.message), ok: false }));
    }

    const noToken = await short(rNo);
    const withUser = rUser ? await short(rUser) : null;
    const withAdmin = rAdmin ? await short(rAdmin) : null;

    // Lógica de aprobación
    let pass;
    if (prot) {
      if (path.startsWith('/api/admin')) {
        pass = (noToken.status === 401 && withUser && withUser.status === 403 && withAdmin && withAdmin.ok);
      } else {
        pass = (noToken.status === 401 && withUser && withUser.ok);
      }
    } else {
      pass = noToken.ok; // público debe funcionar sin token
    }

    results.push({method,path,protected:!!prot,admin:isAdminEndpoint,noToken,withUser,withAdmin,pass});
  }
  
  console.log('\n\n📊 Resultados de las pruebas:\n');
  
  // Tabla de resultados
  const tableData = results.map(r => ({
    Método: r.method,
    Endpoint: r.path.length > 30 ? r.path.slice(0,27)+'...' : r.path,
    Tipo: r.admin ? 'ADMIN' : (r.protected ? 'PROT' : 'PUB'),
    'NoTok': r.noToken.status,
    'User': r.withUser ? r.withUser.status : '-',
    'Admin': r.withAdmin ? r.withAdmin.status : '-',
    OK: r.pass ? '✅' : '❌'
  }));
  
  console.table(tableData);
  
  // Resumen
  const totalTests = results.length;
  const passedTests = results.filter(r => r.pass).length;
  const failedTests = totalTests - passedTests;
  
  console.log(`\n📈 Resumen:`);
  console.log(`Total de pruebas: ${totalTests}`);
  console.log(`Exitosas: ${passedTests} ✅`);
  console.log(`Fallidas: ${failedTests} ${failedTests > 0 ? '❌' : '✅'}`);
  
  // Detalles de fallas
  const fails = results.filter(r => !r.pass);
  if (fails.length) {
    console.log('\n❌ Detalles de fallas:');
    fails.forEach(f => {
      console.log(`\n${f.method} ${f.path}:`);
      console.log(`  - Tipo: ${f.admin ? 'ADMIN' : (f.protected ? 'PROTEGIDO' : 'PUBLICO')}`);
      console.log(`  - Sin token: ${f.noToken.status} (${f.noToken.msg})`);
      if (f.withUser) console.log(`  - Con token usuario: ${f.withUser.status} (${f.withUser.msg})`);
      if (f.withAdmin) console.log(`  - Con token admin: ${f.withAdmin.status} (${f.withAdmin.msg})`);
    });
    process.exitCode = 1;
  } else {
    console.log('\n🎉 ¡Todos los endpoints funcionan correctamente!');
  }
  
  // Prueba especial para /api/auth/session con token
  if (token) {
    console.log('\n🔍 Prueba especial: /api/auth/session con token...');
    const sessionRes = await fetch(base+'/api/auth/session',{
      headers:{Authorization:'Bearer '+token}
    });
    const sessionData = await sessionRes.json().catch(()=>({}));
    console.log(`Session response: ${sessionRes.status}`);
    console.log(`Authenticated: ${sessionData.authenticated}`);
    console.log(`User: ${sessionData.user ? 'Presente' : 'Ausente'}`);
  }
  
})().catch(err => {
  console.error('\n💥 Error ejecutando pruebas:', err);
  process.exit(1);
});
