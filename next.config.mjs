/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  devIndicators: {
    appIsrStatus: false,
  },
  // Allow cross-origin for dev resources and HMR
  experimental: {
    allowedDevOrigins: ['localhost', '127.0.0.1', 'localhost:3000', '127.0.0.1:3000'],
  },
};

export default nextConfig;
