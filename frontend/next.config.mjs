/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export solo en producción (npm run build).
  // En desarrollo (npm run dev) se usa renderizado dinámico normal.
  ...(process.env.NODE_ENV === 'production' && {
    output: 'export',
    trailingSlash: true,
  }),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
