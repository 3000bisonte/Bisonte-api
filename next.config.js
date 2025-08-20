/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exportación estática para Capacitor
  output: 'export',
  trailingSlash: true,
  assetPrefix: '',
  basePath: '',
  images: { unoptimized: true },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  // Configuración específica para evitar errores de prerenderizado
  experimental: {
    isrMemoryCacheSize: 0,
  },
  // Headers para export estático
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
          // Security headers for production
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
