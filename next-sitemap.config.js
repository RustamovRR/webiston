/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://webiston.uz',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  // A sitemap lists indexable *pages*. /manifest.webmanifest is a PWA metadata
  // file that next-sitemap auto-discovers from the app router — submitting it
  // just spends crawl budget on something Google will never index.
  //
  // `/uz/*` is excluded because it is not a real URL. `localePrefix` is
  // "as-needed" (src/i18n/routing.ts), so the default locale is served
  // unprefixed and the middleware 307-redirects /uz/x -> /x. Those paths only
  // appear here because `generateStaticParams` prerenders the tools pages under
  // /uz, and next-sitemap auto-discovers the prerender manifest. Listing a
  // redirecting URL in a sitemap earns a "Page with redirect" error in Search
  // Console and contradicts the canonical each page declares.
  exclude: ['/api/*', '/_next/*', '/manifest.webmanifest', '/uz', '/uz/*'],

  // Do NOT stamp <lastmod> with the build time.
  //
  // The default (true) writes `new Date()` into every entry, so each build
  // rewrote all 268 URLs — a 268-insertion/268-deletion diff on every commit,
  // for no information gain. Worse, it told Google that every page changed on
  // every deploy; once a lastmod proves unreliable Google stops trusting it at
  // all, so the field was actively harmful.
  //
  // Omitting lastmod is better than lying about it. To reintroduce it, derive
  // the value from real content — the MDX file's git commit date — not the clock.
  autoLastmod: false,

  additionalPaths: async (config) => {
    // Deduplicate by URL. `/` and `/tools` were previously pushed twice: once as
    // static paths, then again by the locale loop, whose empty-string locale
    // reproduces the same two URLs. A sitemap must not list a URL twice.
    const seen = new Set()
    const paths = []
    const add = async (url) => {
      const normalized = url.replace(/\/+/g, '/').replace(/\/$/, '') || '/'
      if (seen.has(normalized)) return
      seen.add(normalized)
      paths.push(await config.transform(config, normalized))
    }

    await add('/')
    await add('/tools')
    await add('/books')

    // Locale paths. '' is the default locale (uz), which is served unprefixed.
    const locales = ['', 'en']
    const toolsPages = require('./tools-list.json')

    for (const locale of locales) {
      await add(`/${locale}`)
      await add(`/${locale}/tools`)
      for (const tool of toolsPages) {
        await add(`/${locale}/tools/${tool}`)
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

            // Route through add() so book URLs are deduplicated too.
            await add(urlPath)
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
