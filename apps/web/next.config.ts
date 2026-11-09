import type { NextConfig } from 'next';

const config: NextConfig = {
  // Workspace packages ship TypeScript source.
  transpilePackages: ['@amt/shared', '@amt/sim', '@amt/content'],
  reactStrictMode: true,
};
export default config;
