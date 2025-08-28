export default function handler(req, res) {
  // Sunset this dev-only endpoint to prevent confusion in production
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Sunset', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString());
  if (req.method === 'OPTIONS') return res.status(200).end();
  res.status(410).json({
    success: false,
    deprecated: true,
    message: 'Deprecated test endpoint. Use the centralized backend at /api/* via proxy.',
    docs: 'Set API_BASE_URL and use scripts/test-endpoints.mjs for diagnostics.'
  });
}
