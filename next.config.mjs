/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      esmExternals: "loose",
      serverComponentsExternalPackages: ['@prisma/client', '@prisma/client/edge'],
    },
    webpack: (config) => {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        child_process: false,
      };
      config.module = config.module || {};
      config.module.exprContextCritical = false;
      return config;
    },
    productionBrowserSourceMaps: false,
  };

export default nextConfig;
