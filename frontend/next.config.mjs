/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      { source: '/:lang/apadrina-gallina', destination: '/:lang/campanas/apadrina-gallina', permanent: true },
      { source: '/:lang/apadrina-gallina/', destination: '/:lang/campanas/apadrina-gallina/', permanent: true },
      { source: '/:lang/apadrina-oveja', destination: '/:lang/campanas/apadrina-oveja', permanent: true },
      { source: '/:lang/apadrina-oveja/', destination: '/:lang/campanas/apadrina-oveja/', permanent: true },
    ];
  },
};

export default nextConfig;
