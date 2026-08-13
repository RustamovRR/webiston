import { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

/**
 * No `@next/mdx`.
 *
 * It was wrapped around this config to compile `.mdx` files at BUILD time —
 * and this app has none. `find src -name "*.mdx"` returns nothing: all 226
 * chapters live in `content/`, are read from disk at request time by
 * `src/lib/mdx.ts`, and are compiled by `next-mdx-remote/rsc` inside
 * `MDXContent`. The bundler never saw an `.mdx` file.
 *
 * What it cost: a Turbopack webpack-loader rule, `pageExtensions` carrying
 * `md`/`mdx` so Next scanned the app tree for page files that cannot exist,
 * `@mdx-js/loader` as a dependency, and `providerImportSource: '@mdx-js/react'`
 * pointing at a package that was never a declared dependency at all.
 */
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  /**
   * Pin the workspace root to this directory.
   *
   * Without it Next.js infers the root by walking UP from here collecting
   * lockfiles and taking the HIGHEST one (`lib/find-root.js`
   * `findRootDirAndLockFiles`). A stray `package-lock.json` sits in the home
   * directory, so the inferred root was `/Users/<user>` — and `rootPath` is
   * what Turbopack mounts its filesystem and file watcher on
   * (`server/dev/hot-reloader-turbopack.js`). The dev server was therefore
   * rooted on the entire home directory: ~190 GB, 24 sibling `node_modules`
   * trees, `Library/`. It is also `outputFileTracingRoot`, which is why
   * `next build` emitted `.next/standalone/Desktop/Next_projects/webiston/`.
   *
   * Upstream: vercel/next.js#92978.
   */
  turbopack: { root: __dirname },
  reactCompiler: true,
  experimental: {
    useTypeScriptCli: true,
    /**
     * Run the React Compiler in Rust, inside Turbopack.
     *
     * `reactCompiler: true` alone runs it as a Babel transform, and Turbopack
     * executes Babel loaders in a pool of Node child processes sized to the
     * core count. Measured on this machine (10 cores, 11-route sweep):
     * 11 child processes holding 1,827 MB at peak, 498 MB at idle. With the
     * Rust path the pool drops to 1 process / 117 MB and the whole dev
     * process tree goes 3,477 MB → 2,220 MB at peak.
     *
     * Experimental in 16.3 (`next-16-3#rust-based-react-compiler`), so the
     * Babel path is one line away if output ever differs.
     */
    turbopackRustReactCompiler: true
  },
  // `pageExtensions` is gone with @next/mdx — the default is already
  // ts/tsx/js/jsx, and `md`/`mdx` only ever widened Next's route scan.
  transpilePackages: ['next-mdx-remote'],
  reactStrictMode: true,
  /**
   * No `output: 'standalone'`.
   *
   * It is a SELF-HOSTING option — it bundles a `server.js` plus a traced
   * `node_modules` so the app can run from a bare Node image. There is no
   * Dockerfile and no self-host target in this repo; the only deploy target is
   * Vercel, which builds its own function bundles and ignores the standalone
   * tree entirely.
   *
   * It also BROKE the build on Next 16.3. Under Turbopack, `collectBuildTraces`
   * never runs (`build/index.js` gates it on `bundler !== Turbopack`), so
   * `.next/next-server.js.nft.json` is not written when Vercel's adapter is
   * active — but `writeStandaloneDirectory` → `copyTracedFiles`
   * (`build/utils.js`) reads that exact path unconditionally:
   *
   *   Error: ENOENT: no such file or directory, open
   *   '/vercel/path0/.next/next-server.js.nft.json'
   *
   * Next's own source calls the combination out: "in the future output:
   * standalone might not be allowed if an adapter with onBuildComplete is
   * configured". On 16.2.12 the adapter path was not taken and it built fine;
   * 16.3.0 is where it started failing.
   *
   * Removing it also drops ~270 MB of duplicated `node_modules` from `.next`.
   */
  images: {
    unoptimized: true,
  },
  /**
   * Keep Vercel's own hostnames out of the search index.
   *
   * The project answers on SIX hostnames — webiston.uz, www.webiston.uz and
   * four `*.vercel.app` aliases — and every one of them served the complete
   * site. Yandex indexed one of them: a search for "сумма прописью онлайн на
   * узбекском" returned
   * `webiston-git-main-rustamovrrs-projects.vercel.app/tools/number-to-words`
   * instead of the real domain. That is not a cosmetic problem — it is the
   * canonical domain competing against a copy of itself, and the copy winning.
   *
   * `X-Robots-Tag` rather than a redirect, deliberately: redirecting
   * `*.vercel.app` to webiston.uz would also kill the preview deployments the
   * owner checks work on. Rather than "any host that is not webiston.uz",
   * which would also catch localhost and any future custom domain, this
   * matches Vercel's hostnames precisely.
   *
   * `noindex` removes the page from the index; `nofollow` stops the copy's
   * internal links from being crawled as a second site. Both Google and
   * Yandex honour the header. Already-indexed URLs still need removing by
   * hand in Yandex Webmaster / Search Console — a header only stops the next
   * crawl, it does not retract the last one.
   */
  async headers() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: '.*\\.vercel\\.app' }],
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
    ]
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

export default withNextIntl(nextConfig)
