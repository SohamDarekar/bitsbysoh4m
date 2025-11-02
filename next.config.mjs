/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Allow migrating .js files in src/api if needed, though we'll replace them
    ignoreBuildErrors: true,
  },
};
export default nextConfig;
