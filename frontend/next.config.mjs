/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  trailingSlash: true,
  images: {
    loader: 'custom',
    loaderFile: './src/lib/imageLoader.ts',
  },
  async redirects() {
    return [
      { source: '/:lang/apadrina-gallina', destination: '/:lang/campanas/apadrina-gallina', permanent: true },
      { source: '/:lang/apadrina-gallina/', destination: '/:lang/campanas/apadrina-gallina/', permanent: true },
      { source: '/:lang/apadrina-oveja', destination: '/:lang/campanas/apadrina-oveja', permanent: true },
      { source: '/:lang/apadrina-oveja/', destination: '/:lang/campanas/apadrina-oveja/', permanent: true },
      // Enlace antiguo en contenido FR (auditoría SEO: 404)
      { source: '/fr/collaborez', destination: '/fr/colabora/', permanent: true },
      { source: '/fr/collaborez/', destination: '/fr/colabora/', permanent: true },
    ];
  },
  async rewrites() {
    const backendUrl = process.env.API_INTERNAL_URL
      || process.env.NEXT_PUBLIC_API_URL
      || 'http://localhost:3001';
    return [
      // llms.txt se genera en el backend (lib/llmsTxt.ts)
      { source: '/llms.txt', destination: `${backendUrl}/api/llms.txt` },
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
