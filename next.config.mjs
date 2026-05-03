/** @type {import('next').NextConfig} */
const nextConfig = {
  /** Windows dev stability: flaky *.pack.gz ENOENT when webpack file cache races (AV, manual .next tweaks). */
  webpack(config, { dev }) {
    if (dev) {
      config.cache = { type: "memory" };
    }
    return config;
  },
};

export default nextConfig;
