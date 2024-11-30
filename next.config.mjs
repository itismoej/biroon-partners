/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        hostname: "storage.c2.liara.space",
      },
    ],
  },
};

export default nextConfig;
