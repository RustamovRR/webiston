/** @type {import('next').NextConfig} */

import withNextra from "nextra";

const nextConfig = {
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.tsx",
  latex: true
};

export default withNextra(nextConfig);
