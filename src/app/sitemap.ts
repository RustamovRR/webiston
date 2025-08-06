import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://webiston.uz'

  // High priority pages
  const highPriorityPages = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
      alternates: {
        languages: {
          uz: `${baseUrl}`,
          en: `${baseUrl}/en`,
        },
      },
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
      alternates: {
        languages: {
          uz: `${baseUrl}/tools`,
          en: `${baseUrl}/en/tools`,
        },
      },
    },
  ]

  // Tool pages with high SEO value
  const toolPages = [
    'qr-generator',
    'password-generator',
    'json-formatter',
    'url-encoder',
    'base64-converter',
    'ip-info',
    'device-info',
    'screen-resolution',
    'website-status',
  ].map((tool) => ({
    url: `${baseUrl}/tools/${tool}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
    alternates: {
      languages: {
        uz: `${baseUrl}/tools/${tool}`,
        en: `${baseUrl}/en/tools/${tool}`,
      },
    },
  }))

  return [...highPriorityPages, ...toolPages]
}
