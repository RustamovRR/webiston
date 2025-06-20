import nextra from 'nextra'

const withNextra = nextra({
  latex: true,
  search: {
    codeblocks: false,
  },
})

export default withNextra({
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
})
