// Verificación de configuración AdMob y variables relacionadas
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    return {};
  }
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  const env = {};
  for (const line of lines) {
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx+1).trim();
    env[key] = val;
  }
  return env;
}

function testAdMobConfig() {
  console.log('📱 Verificando configuración AdMob...');
  const env = loadEnv();
  const required = [
    'NEXT_PUBLIC_ADMOB_APP_ID',
    'NEXT_PUBLIC_ADMOB_BANNER_ID',
    'NEXT_PUBLIC_ADMOB_REWARDED_ID'
  ];
  let pass = true;
  for (const key of required) {
    const val = process.env[key] || env[key];
    if (!val) {
      console.log(`❌ Falta variable ${key}`);
      pass = false;
    } else if (val.includes('test') || val.includes('394025')) {
      console.log(`⚠️ Variable ${key} parece ser de TEST: ${val}`);
    } else {
      console.log(`✅ ${key} OK`);
    }
  }

  console.log('\n🧪 Validando IDs de fallback en app.config.js');
  const configPath = path.join(process.cwd(), 'src', 'config', 'app.config.js');
  if (fs.existsSync(configPath)) {
    const content = fs.readFileSync(configPath,'utf8');
    const hasReal = /1352045169606160/.test(content);
    console.log(`IDs reales presentes en fallback: ${hasReal ? '✅' : '❌'}`);
  } else {
    console.log('⚠️ No se encontró app.config.js');
  }

  console.log('\nResultado:', pass ? '✅ Configuración mínima presente' : '❌ Faltan variables críticas');
  if (!pass) process.exitCode = 1;
}

if (require.main === module) {
  testAdMobConfig();
}
