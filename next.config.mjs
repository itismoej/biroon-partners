/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                hostname: "storage.c2.liara.space",
            }
        ]
    }
};

export default nextConfig;
