import createMDX from '@next/mdx'
import { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

// MDX configuration with standard plugins
const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
    providerImportSource: '@mdx-js/react',
  },
})

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig:NextConfig = {
  // Configure pageExtensions to include md and mdx
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  transpilePackages: ['next-mdx-remote'],
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/docs/:path*',
        destination: '/books/:path*',
        permanent: true,
      },
    ]
  },
  // Add webpack configuration to handle require-in-the-middle
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push('require-in-the-middle')
    }
    return config
  },
}

export default withMDX(withNextIntl(nextConfig))
