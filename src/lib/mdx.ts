import { serialize } from 'next-mdx-remote/serialize'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'

/**
 * Serializes markdown content to MDX
 */
export async function serializeMarkdown(content: string) {
  try {
    // Use more permissive config for regular markdown with rehype-raw
    return await serialize(content, {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeRaw, // Allow HTML in markdown
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: 'wrap' }],
        ],
        // Do not use MDX-specific features for regular markdown
        format: 'md',
        development: process.env.NODE_ENV === 'development',
      },
    })
  } catch (mdError) {
    console.error('Error parsing markdown:', mdError)
    // Fallback to simpler parsing if needed
    return await serialize(content, {
      parseFrontmatter: false,
    })
  }
}

/**
 * Serializes MDX content
 */
export async function serializeMdx(content: string) {
  try {
    // Use full MDX compilation
    return await serialize(content, {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'wrap' }]],
        development: process.env.NODE_ENV === 'development',
      },
    })
  } catch (mdxError) {
    console.error('Error parsing MDX, falling back to markdown parser:', mdxError)
    // If MDX parsing fails, try with markdown parser
    return await serialize(content, {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeRaw, // Allow HTML in markdown
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: 'wrap' }],
        ],
        format: 'md',
      },
      parseFrontmatter: false,
    })
  }
}

/**
 * Serializes content based on type (markdown or MDX)
 */
export async function serializeContent(content: string, isMarkdown: boolean) {
  if (isMarkdown) {
    console.log('Using plain markdown parser for .md file')
    return serializeMarkdown(content)
  } else {
    console.log('Using MDX parser')
    return serializeMdx(content)
  }
}
