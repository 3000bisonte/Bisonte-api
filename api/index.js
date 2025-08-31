module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  return res.status(200).json({
    success: true,
    message: "Bisonte API Backend",
    version: "1.0.0",
    endpoints: {
      "/api/status": "Health check",
      "/api/google": "Google OAuth",
      "/api/config": "Configuration"
    }
  });
};