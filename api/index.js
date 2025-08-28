const apiBase = process.env.NEXT_PUBLIC_API_BASE || process.env.API_BASE_URL || 'https://bisonte-api.vercel.app';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const path = req.url.replace(/^\/api/, '');
  const target = ['/config', '/public/config'].includes(path) ? `/api${path}` : '/';

  try {
    const url = `${apiBase}${target}`;
    const r = await fetch(url, { headers: { 'x-forwarded-origin': req.headers.origin || '' } });
    const data = await r.json().catch(() => ({}));
    res.status(r.status || 200).json(data);
  } catch (e) {
    res.status(502).json({ success: false, error: 'Bad gateway', message: e.message });
  }
}
