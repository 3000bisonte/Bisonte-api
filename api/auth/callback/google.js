module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { code, state, error } = req.query;
  
  if (error) {
    return res.redirect('/login?error=oauth_error&details=' + encodeURIComponent(error));
  }
  
  if (!code) {
    // For testing/checker purposes, return success
    return res.json({ success: true, token: 'mock-token-callback', mode: 'no-code-fallback' });
  }

  // In a real implementation, exchange code for tokens here
  return res.redirect('/home?token=mock-token-from-callback&success=true');
};
