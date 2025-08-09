/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://webiston.uz',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ['/api/*', '/_next/*'],
  additionalPaths: async (config) => {
    const paths = []

    // Add static paths
    paths.push(
      await config.transform(config, '/'),
      await config.transform(config, '/tools'),
      await config.transform(config, '/books'),
    )

    // Add locale paths
    const locales = ['', 'en']
    for (const locale of locales) {
      paths.push(await config.transform(config, `/${locale}`), await config.transform(config, `/${locale}/tools`))

      // Add tools pages for each locale
      const toolsPages = [
        'json-formatter',
        'url-encoder',
        'base64-converter',
        'qr-generator',
        'password-generator',
        'color-converter',
        'hash-generator',
        'uuid-generator',
        'jwt-decoder',
        'latin-cyrillic',
        'lorem-ipsum',
        'og-meta-generator',
        'device-info',
        'screen-resolution',
        'camera-recorder',
      ]

      for (const tool of toolsPages) {
        paths.push(await config.transform(config, `/${locale}/tools/${tool}`))
      }
    }

    // Add books paths
    const fs = require('fs')
    const path = require('path')
    const booksDir = path.join(process.cwd(), 'content')

    if (fs.existsSync(booksDir)) {
      const addBookPaths = async (dirPath, bookName, currentPath = '') => {
        const files = fs.readdirSync(dirPath, { withFileTypes: true })

        for (const file of files) {
          const filePath = path.join(dirPath, file.name)
          const newPath = currentPath ? `${currentPath}/${file.name}` : file.name

          if (file.isDirectory()) {
            await addBookPaths(filePath, bookName, newPath)
          } else if (file.name.endsWith('.mdx')) {
            let urlPath = `/books/${bookName}/${currentPath ? currentPath + '/' : ''}${file.name.replace('.mdx', '')}`
              .replace(/\/+/g, '/')
              .replace(/\/$/, '')

            // Remove /page suffix if exists
            if (urlPath.endsWith('/page')) {
              urlPath = urlPath.replace('/page', '')
            }

            const transformedPath = await config.transform(config, urlPath)
            paths.push(transformedPath)
          }
        }
      }

      const bookFolders = fs
        .readdirSync(booksDir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name)

      for (const bookFolder of bookFolders) {
        const bookPath = path.join(booksDir, bookFolder)
        await addBookPaths(bookPath, bookFolder, '')
      }
    }

    return paths
  },
}
