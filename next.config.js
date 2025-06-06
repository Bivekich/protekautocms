/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {},
  },
  // Увеличиваем лимит заголовков для предотвращения ошибки 431
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ];
  },
  // Настройки для устранения проблем с большими заголовками
  serverRuntimeConfig: {
    maxHeaderSize: 32768, // 32KB
  },
};

module.exports = nextConfig; 