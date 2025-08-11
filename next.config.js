const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_APP_BRAND: 'tourvis',
    NEXT_PUBLIC_APP_ENV: 'development'
  },

  // ✅ basePath 추가
  basePath: "/marketing/esim",
  // ✅ experimental.serverActions.allowedOrigins 추가
  experimental: {
    serverActions: {
      allowedOrigins: [
        "d.tourvis.com",
        "tourvis.com" // 실제 도메인으로 변경
      ]
    }
  },

  webpack(config) {
    config.resolve.alias['@'] = path.resolve(__dirname);
    return config;
  }
}

module.exports = nextConfig;
