import createMDX from '@next/mdx'
import createNextIntlPlugin from 'next-intl/plugin'

// MDX configuration with standard plugins
const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [['rehype-pretty-code']],
    // For use with rehype-pretty-code if we add it later
    providerImportSource: '@mdx-js/react',
  },
})

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig = {
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
