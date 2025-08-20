#!/usr/bin/env node
/**
 * Pre APK Readiness Check
 * - Verifica variables críticas
 * - API salud + endpoints claves
 * - Build Next.js (dry) + export verificación
 * - AdMob IDs / MercadoPago
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
// Cargar variables de entorno locales si existen
try { require('dotenv').config({ path: path.join(process.cwd(), '.env.local') }); } catch(_) {}

// Asegurar que la base de API termina en /api
let base = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_SERVER_URL || 'https://bisonte-api.vercel.app/api';
if(!/\/api\/?$/.test(base)) base = base.replace(/\/$/,'') + '/api';
const API_URL = base.replace(/\/$/,'');

async function fetchJson(url, opts={}) {
  const fetch = (...a) => import('node-fetch').then(({default:f})=>f(...a));
  try {
    const r = await fetch(url, opts);
    const t = await r.text();
    let j; try { j = JSON.parse(t); } catch { j = { raw:t }; }
    return { ok:r.ok, status:r.status, data:j };
  } catch(e) {
    return { ok:false, status:0, error:e.message };
  }
}

async function main(){
  console.log('🚀 PRE APK CHECK');
  let ok=true; const issues=[];

  // 1. Variables críticas
  const requiredEnv = ['JWT_SECRET','NEXT_PUBLIC_API_BASE_URL','NEXT_PUBLIC_INIT_MERCADOPAGO'];
  console.log('\n🔐 Variables críticas:');
  requiredEnv.forEach(v=>{
    if(!process.env[v]) { issues.push('Falta '+v); console.log('❌',v); ok=false; } else console.log('✅',v);
  });

  // 2. Health API
  console.log('\n🌐 API Health:');
  const health = await fetchJson(API_URL + '/health');
  if(health.ok) {
    console.log('✅ /api/health', health.status, 'uptime:', health.data.uptime);
  } else { console.log('❌ /api/health', health); ok=false; }

  // 3. Endpoints claves (sin auth)
  const publicPaths = ['/test','/mercadopago/status','/envios'];
  console.log('\n🧪 Endpoints públicos:');
  for(const p of publicPaths){
  const resp = await fetchJson(API_URL + p, p==='/envios'? {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({origen:'Bogota',destino:'Medellin',peso:1})}:{});
    if(resp.ok) console.log('✅',p,resp.status); else { console.log('❌',p,resp.status); ok=false; }
  }

  // 4. Login demo + admin
  console.log('\n🔑 Login demo:');
  const demoLogin = await fetchJson(API_URL + '/auth/login',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email:'demo@bisonte.com',password:'demo123'})});
  if(demoLogin.ok && demoLogin.data.token) console.log('✅ demo login'); else { console.log('❌ demo login'); ok=false; }

  console.log('🔑 Login admin:');
  const adminLogin = await fetchJson(API_URL + '/auth/login',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email:'3000bisonte@gmail.com',password:'admin123'})});
  if(adminLogin.ok && adminLogin.data.role==='admin') console.log('✅ admin login'); else { console.log('❌ admin login'); ok=false; }

  // 5. Refresh token test
  console.log('\n🔄 Refresh token:');
  if(demoLogin.data && demoLogin.data.refreshToken){
  const refresh = await fetchJson(API_URL + '/auth/refresh',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({refreshToken: demoLogin.data.refreshToken})});
    if(refresh.ok && refresh.data.token) console.log('✅ refresh funcionando'); else { console.log('❌ refresh fallo'); ok=false; }
  } else {
    console.log('⚠️ sin refresh token en login demo'); ok=false;
  }

  // 6. AdMob / MercadoPago
  console.log('\n📱 AdMob & MP:');
  if(process.env.NEXT_PUBLIC_ADMOB_APP_ID) console.log('✅ AdMob APP ID'); else console.log('⚠️ sin AdMob (ok si solo backend)');
  if(process.env.NEXT_PUBLIC_INIT_MERCADOPAGO?.startsWith('TEST-')) console.log('⚠️ MercadoPago test key');

  // 7. Build (sin next export manual – usamos output export opcional o servimos remoto)
  console.log('\n🏗️ Build Next.js:');
  let skipBuild = false;
  try {
    if(fs.existsSync('capacitor.config.ts')) {
      const capCfg = fs.readFileSync('capacitor.config.ts','utf8');
      if(/server:\s*{[\s\S]*?url:\s*['\"]https?:\/\//.test(capCfg)) {
        skipBuild = true;
        console.log('ℹ️ Detectado server.url en Capacitor. Se omite build web (app consumirá remoto).');
      }
    }
  } catch(_e) {}
  if(!skipBuild) {
    try {
      execSync('npm run build', {stdio:'inherit'});
      console.log('✅ build next');
    } catch(e){ ok=false; issues.push('Fallo build Next'); }
  } else {
    console.log('✅ Skip build web (remoto)');
  }

  // 8. Verificación opcional de carpeta out (solo si usamos output export para recursos locales)
  console.log('\n📦 Verificación carpeta out (opcional):');
  if(fs.existsSync('out')) {
    if(fs.existsSync('out/index.html')) {
      console.log('✅ out/index.html');
      if(fs.existsSync('fix-static-paths.js')) {
        try { execSync('node fix-static-paths.js', {stdio:'inherit'}); } catch(e){ console.log('⚠️ fix-static-paths fallo (no crítico)', e.message); }
      }
    } else {
      console.log('⚠️ out existe sin index.html (no bloqueante si app consumirá API remoto y usa server.url en Capacitor)');
    }
  } else {
    console.log('ℹ️ sin carpeta out (se usará server remoto en Capacitor)');
  }

  // 9. Resumen
  console.log('\n==============================');
  console.log('🧾 Resultado PRE APK:', ok? '✅ LISTO' : '❌ PENDIENTE');
  if(!ok){
    console.log('Problemas:');
    issues.forEach(i=>console.log(' -',i));
    process.exitCode = 1;
  }
}

main();
