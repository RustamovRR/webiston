/** @type {import('next').NextConfig} */

import withNextra from "nextra";

const nextConfig = {
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.tsx",
  latex: true,
  i18n: {
    locales: ['uz'],
    defaultLocale: 'uz',
  }
};

export default withNextra(nextConfig);
