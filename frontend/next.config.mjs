/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      { source: '/:lang/apadrina-gallina', destination: '/:lang/campanas/apadrina-gallina', permanent: true },
      { source: '/:lang/apadrina-gallina/', destination: '/:lang/campanas/apadrina-gallina/', permanent: true },
      { source: '/:lang/apadrina-oveja', destination: '/:lang/campanas/apadrina-oveja', permanent: true },
      { source: '/:lang/apadrina-oveja/', destination: '/:lang/campanas/apadrina-oveja/', permanent: true },
    ];
  },
  async rewrites() {
    const backendUrl = process.env.API_INTERNAL_URL
      || process.env.NEXT_PUBLIC_API_URL
      || 'http://localhost:3001';
    return [
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
