/** @type {import('next').NextConfig} */
const remoteApi = process.env.NEXT_PUBLIC_API_URL || "";
const isRemoteApi = /^https?:\/\//.test(remoteApi) && !/localhost|127\.0\.0\.1/.test(remoteApi);

const nextConfig = {
  output: process.env.RAILWAY_ENVIRONMENT || process.env.VERCEL ? undefined : "standalone",
  reactStrictMode: true,
  async rewrites() {
    if (isRemoteApi) return [];
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:4000/api/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://web.telegram.org https://webk.telegram.org https://webz.telegram.org https://*.telegram.org https://telegram.org",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
