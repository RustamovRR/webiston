import createMDX from '@next/mdx'

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

const nextConfig = {
  // Configure pageExtensions to include md and mdx
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  transpilePackages: ['next-mdx-remote'],
  reactStrictMode: true,
  output: 'standalone',
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

export default withMDX(nextConfig)
