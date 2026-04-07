const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    // cache API routes for 60s (stale-while-revalidate)
    {
      urlPattern: /^\/api\/.*/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'api-cache',
        expiration: { maxEntries: 50, maxAgeSeconds: 60 },
      },
    },
    // cache static assets
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff2?)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: { maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
    },
    // cache pages
    {
      urlPattern: /^\//,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages',
        expiration: { maxEntries: 20, maxAgeSeconds: 60 },
        networkTimeoutSeconds: 5,
      },
    },
  ],
});

const nextConfig = { reactStrictMode: true };
module.exports = withPWA(nextConfig);
