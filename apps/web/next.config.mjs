/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["emission-engine", "ruleset", "report-templates"],
  experimental: {
    outputFileTracingIncludes: {
      "/api/demo/calculate": [
        "../../packages/ruleset/factors/**/*",
        "../../packages/ruleset/factors(sample)/**/*",
      ],
      "/api/audit-ready/scan": [
        "../../packages/ruleset/factors/**/*",
        "../../packages/ruleset/factors(sample)/**/*",
        "../../packages/ruleset/regulations/**/*",
      ],
    },
  },
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      ".js": [".js", ".ts", ".tsx"],
    };
    return config;
  },
};

export default nextConfig;
