/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        port: '',
        pathname: '**'
      },
      {
        protocol: "http",
        hostname: "**",
        port: '',
        pathname: '**'
      }
    ]
  },
};

export default nextConfig;
