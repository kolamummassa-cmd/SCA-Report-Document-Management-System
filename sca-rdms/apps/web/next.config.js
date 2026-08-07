/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@sca-rdms/shared-schemas", "@sca-rdms/shared-types"],
};

module.exports = nextConfig;
