import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allows a production verification build without disturbing the dev preview.
  distDir: process.env.NEXT_BUILD_DIR || '.next',
  // better-sqlite3 is a native module: keep it external to the server bundle.
  serverExternalPackages: ['better-sqlite3'],
};

export default nextConfig;
