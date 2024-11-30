/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://webiston.uz',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: 'daily',
  priority: 0.7,
  exclude: ['/404'],
  robotsTxtOptions: {
    additionalSitemaps: ['https://webiston.uz/server-sitemap.xml'],
  },
}
