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
  reactCompiler: true,
  // Configure pageExtensions to include md and mdx
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  transpilePackages: ['next-mdx-remote'],
  reactStrictMode: true,
  output: 'standalone',
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
 
}

export default withMDX(withNextIntl(nextConfig))
