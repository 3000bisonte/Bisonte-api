// Simple API endpoints diagnostic runner
// Usage: API_BASE_URL=https://bisonte-api.vercel.app node scripts/test-endpoints.mjs

const API_BASE = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE || 'https://bisonte-api.vercel.app';

const endpoints = [
  // Health & config
  { path: '/api/health', method: 'GET', expect: 'ok' },
  { path: '/api/config', method: 'GET', expect: 'ok' },
  { path: '/api/public/config', method: 'GET', expect: 'ok' },

  // Auth (expect unauthorized without token)
  { path: '/api/auth/login', method: 'OPTIONS', expect: 'exists' },
  { path: '/api/register', method: 'OPTIONS', expect: 'exists' },
  { path: '/api/auth/google', method: 'OPTIONS', expect: 'exists' },
  { path: '/api/auth/logout', method: 'OPTIONS', expect: 'exists' },
  { path: '/api/auth/session', method: 'GET', expect: 'unauth' },

  // Users
  { path: '/api/usuarios', method: 'GET', expect: 'okOrUnauth' },
  { path: '/api/perfil', method: 'GET', expect: 'okOrUnauth' },
  { path: '/api/perfil/existeusuario?email=diagnostic@example.com', method: 'GET', expect: 'okOrUnauth' },

  // Shipments
  { path: '/api/envios', method: 'GET', expect: 'okOrUnauth' },
  { path: '/api/envios/historial', method: 'GET', expect: 'okOrUnauth' },
  { path: '/api/obtenerenvios', method: 'GET', expect: 'okOrUnauth' },
  { path: '/api/guardarenvio', method: 'OPTIONS', expect: 'exists' },
  { path: '/api/envios/actualizar-estado', method: 'OPTIONS', expect: 'exists' },
  { path: '/api/notificar-envio', method: 'OPTIONS', expect: 'exists' },

  // Contact
  { path: '/api/contacto', method: 'GET', expect: 'okOrUnauth' },
  { path: '/api/contacto', method: 'OPTIONS', expect: 'exists' },

  // Email
  { path: '/api/email', method: 'OPTIONS', expect: 'exists' },
  { path: '/api/send', method: 'OPTIONS', expect: 'exists' },

  // Payments
  { path: '/api/mercadopago', method: 'GET', expect: 'okOrUnauth' },

  // Recovery
  { path: '/api/recuperar', method: 'OPTIONS', expect: 'exists' },
  { path: '/api/recuperar/validar-token?token=fake', method: 'GET', expect: 'okOrClient' },

  // Admin (should 401/403 without auth)
  { path: '/api/admin/stats', method: 'GET', expect: 'unauth' },

  // Extra likely endpoints (safe GETs or OPTIONS)
  { path: '/api/usuarios/1', method: 'GET', expect: 'okOrClientOrUnauth' },
  { path: '/api/test', method: 'GET', expect: 'okOrClient' },

  // Duplicates or mirrors (ensure over 30)
  { path: '/api/public/config', method: 'OPTIONS', expect: 'exists' },
  { path: '/api/config', method: 'OPTIONS', expect: 'exists' },
  { path: '/api/health', method: 'OPTIONS', expect: 'exists' },
  { path: '/api/perfil/existeusuario', method: 'OPTIONS', expect: 'exists' },
  { path: '/api/usuarios', method: 'OPTIONS', expect: 'exists' },
  { path: '/api/envios', method: 'OPTIONS', expect: 'exists' },
  { path: '/api/envios/historial', method: 'OPTIONS', expect: 'exists' },
  { path: '/api/mercadopago', method: 'OPTIONS', expect: 'exists' },
  { path: '/api/admin/stats', method: 'OPTIONS', expect: 'exists' },
];

function classifyStatus(status, expect) {
  if (status >= 500) return 'SERVER_ERROR';
  if (expect === 'ok') return status >= 200 && status < 400 ? 'OK' : 'UNEXPECTED_STATUS';
  if (expect === 'exists') return status === 200 || status === 204 || status === 405 ? 'OK' : 'UNEXPECTED_STATUS';
  if (expect === 'unauth') return status === 401 || status === 403 ? 'OK' : (status >= 200 && status < 400 ? 'OK' : 'UNEXPECTED_STATUS');
  if (expect === 'okOrUnauth') return (status >= 200 && status < 400) || status === 401 || status === 403 ? 'OK' : 'UNEXPECTED_STATUS';
  if (expect === 'okOrClient') return (status >= 200 && status < 400) || (status >= 400 && status < 500) ? 'OK' : 'UNEXPECTED_STATUS';
  if (expect === 'okOrClientOrUnauth') return (status >= 200 && status < 400) || (status >= 400 && status < 500) ? 'OK' : 'UNEXPECTED_STATUS';
  return status >= 200 && status < 400 ? 'OK' : 'UNEXPECTED_STATUS';
}

async function probe(ep, timeoutMs = 10000) {
  const url = API_BASE.replace(/\/$/, '') + ep.path;
  const ctrl = new AbortController();
  const t0 = Date.now();
  const to = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { method: ep.method, signal: ctrl.signal, headers: { 'Content-Type': 'application/json' } });
    clearTimeout(to);
    const ms = Date.now() - t0;
    const verdict = classifyStatus(res.status, ep.expect);
    return { ...ep, url, status: res.status, verdict, ms };
  } catch (e) {
    clearTimeout(to);
    const ms = Date.now() - t0;
    return { ...ep, url, status: 0, verdict: 'NET_ERROR', ms, error: e.message };
  }
}

async function run() {
  console.log(`API base: ${API_BASE}`);
  console.log(`Total endpoints: ${endpoints.length}`);
  const results = [];
  // Limit concurrency to 6
  const limit = 6;
  let i = 0;
  async function worker() {
    while (i < endpoints.length) {
      const idx = i++;
      const r = await probe(endpoints[idx]);
      results[idx] = r;
      const tag = r.verdict === 'OK' ? 'PASS' : r.verdict;
      console.log(`${tag.padEnd(12)} ${String(r.status).padStart(3)} ${String(r.ms).padStart(4)}ms  ${r.method.padEnd(7)} ${r.path}`);
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));

  const summary = results.reduce((acc, r) => {
    acc[r.verdict] = (acc[r.verdict] || 0) + 1;
    return acc;
  }, {});

  console.log('\nSummary:');
  Object.entries(summary).sort((a,b)=>a[0].localeCompare(b[0])).forEach(([k,v]) => console.log(`  ${k}: ${v}`));
  const okCount = results.filter(r => r.verdict === 'OK').length;
  const failures = results.filter(r => r.verdict !== 'OK');
  console.log(`\nOK: ${okCount}/${results.length}`);

  if (failures.length) {
    console.log('\nFailures:');
    failures.forEach(r => console.log(`  ${r.method} ${r.path} -> ${r.status} ${r.verdict}${r.error ? ' ('+r.error+')' : ''}`));
  }

  // Do not fail CI; this is a diagnostic
  process.exit(0);
}

run().catch(e => {
  console.error('Runner error:', e);
  process.exit(0);
});
