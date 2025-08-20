/* Quick API probe script */
const https = require('https');
const { URL } = require('url');

const base = process.env.API_BASE_URL || 'https://bisonte-logistica-main.vercel.app/api';
const paths = ['/', '/health', '/status', '/auth/me'];

function head(u) {
  return new Promise((resolve) => {
    const req = https.request(new URL(u), { method: 'GET', timeout: 8000 }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        resolve({ url: u, status: res.statusCode, headers: res.headers, body: body.slice(0, 300) });
      });
    });
    req.on('error', (err) => resolve({ url: u, error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ url: u, error: 'timeout' }); });
    req.end();
  });
}

(async () => {
  for (const p of paths) {
    const u = base.replace(/\/$/, '') + p;
    const r = await head(u);
    console.log('\n--', r.url);
    if (r.error) console.log('ERROR:', r.error);
    else console.log('Status:', r.status, '\
Headers:', Object.keys(r.headers).slice(0,5).reduce((o,k)=> (o[k]=r.headers[k], o), {}), '\
Body:', r.body.replace(/\n/g,' '));
  }
})();
