/**
 * Format tutorial ID into a readable name
 */
export function formatTutorialName(id: string): string {
  return id
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Process video syntax in markdown content
 */
export function processContentForVideos(content: string): string {
  if (!content) return ''

  try {
    // Process custom !video[] syntax - we replace these with regular markdown image syntax
    // because we'll handle them as videos in the img component
    let processedContent = content

    // First try custom !video[] syntax
    const customVideoRegex = /!video\[(.*?)\]\((.*?)\)/g
    processedContent = processedContent.replace(customVideoRegex, (match, alt, url) => {
      // Convert to standard markdown image with the same URL
      return `![${alt || 'Video'}](${url})`
    })

    return processedContent
  } catch (error) {
    console.error('Error processing videos:', error)
    return content
  }
}

/**
 * Determine if content is MD or MDX based on path
 */
export function isMarkdownContent(slug: string[]): boolean {
  // Check the original path for .md extensions
  const lastSlugPart = slug[slug.length - 1]
  return (
    lastSlugPart?.endsWith('.md') || lastSlugPart?.includes('/article.md') || slug.some((part) => part.endsWith('.md'))
  )
}

/**
 * Flatten nested navigation into a flat array
 */
export function flattenNavigation(navigationData: any[]): { title: string; path: string; fullPath: string }[] {
  const flattenedNavigation: {
    title: string
    path: string
    fullPath: string
  }[] = []

  function flattenNav(items: any[]) {
    if (!items || !Array.isArray(items)) return

    items.forEach((item) => {
      if (!item) return

      // Add the current item first
      if (item.title && item.path) {
        flattenedNavigation.push({
          title: item.title,
          path: item.path,
          fullPath: item.fullPath || item.path,
        })
      }

      // Then process its list if it exists
      if (item.list && Array.isArray(item.list) && item.list.length > 0) {
        flattenNav(item.list)
      }
    })
  }

  flattenNav(navigationData)
  return flattenedNavigation
}
