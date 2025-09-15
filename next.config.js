/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['chart.js', 'react-chartjs-2'],
  },
};

module.exports = nextConfig;
