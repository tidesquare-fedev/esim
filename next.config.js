const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_APP_BRAND: 'tourvis',
    NEXT_PUBLIC_APP_ENV: 'development'
  },
  webpack(config) {
    config.resolve.alias['@'] = path.resolve(__dirname);
    return config;
  }
}

module.exports = nextConfig;
