/** @type {import('next').NextConfig} */
import nextra from 'nextra'
import createNextIntlPlugin from 'next-intl/plugin'
import { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Only process MDX and TSX files for specific directories
  pageExtensions: ['ts', 'tsx', 'mdx'],
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

const withNextra = nextra({
  latex: true,
  search: {
    codeblocks: false,
  },
  contentDirBasePath: "/books",
  

})
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

// Apply middleware in correct order: NextIntl first, then Nextra
export default withNextIntl(withNextra(nextConfig))
