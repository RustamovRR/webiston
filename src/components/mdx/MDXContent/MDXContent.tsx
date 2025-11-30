import { MDXRemote } from 'next-mdx-remote/rsc'
import React from 'react'

// Plugins
import rehypeKatex from 'rehype-katex'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

// Custom components
import Callout from '../Callout'
import CodeBlock from '../CodeBlock'
import VideoEmbed from '../VideoEmbed'
import ImageViewer from '../ImageViewer'
import HeadingLink from './HeadingLink'
import CustomLink from './CustomLink'
import CustomParagraph from './CustomParagraph'

interface MDXContentProps {
  source: string
}

const components = {
  // Custom components passed to MDX
  Callout,
  CodeBlock,
  VideoEmbed,
  ImageViewer,

  // Headings with anchor links
  h1: (props: any) => (
    <HeadingLink level={1} id={props.id} className="max-sm:text-2xl">
      {props.children}
    </HeadingLink>
  ),
  h2: (props: any) => {
    if (props.id === 'footnote-label') return null
    return (
      <HeadingLink level={2} id={props.id} className="m-0 mt-8">
        {props.children}
      </HeadingLink>
    )
  },
  h3: (props: any) => (
    <HeadingLink level={3} id={props.id} className="m-0 mt-8">
      {props.children}
    </HeadingLink>
  ),
  h4: (props: any) => (
    <HeadingLink level={4} id={props.id} className="m-0 mt-8 text-lg">
      {props.children}
    </HeadingLink>
  ),
  h5: (props: any) => (
    <HeadingLink level={5} id={props.id} className="m-0 mt-8">
      {props.children}
    </HeadingLink>
  ),
  h6: (props: any) => (
    <HeadingLink level={6} id={props.id} className="m-0 mt-8">
      {props.children}
    </HeadingLink>
  ),
  p: (props: any) => <CustomParagraph {...props} />,
  ul: (props: any) => {
    return (
      <ul className="m-0 mt-6 list-disc pl-4" {...props}>
        {props.children}
      </ul>
    )
  },
  li: (props: any) => {
    if (props.id && props.id.includes('user-content')) {
      return <li className="[&_p]:!italic [&>p]:!mt-6" {...props} />
    }
    return <li className="[&>p]:!m-0" {...props} />
  },
  img: ({ src, alt, ...props }: any) => {
    const isVideoLink =
      src?.endsWith('.mp4') ||
      src?.endsWith('.webm') ||
      src?.endsWith('.mov') ||
      src?.includes('youtu.be') ||
      src?.includes('youtube.com') ||
      src?.includes('/video/upload/')

    if (isVideoLink) {
      return <VideoEmbed url={src} title={alt} />
    }
    return <ImageViewer src={src} alt={alt || ''} />
  },
  // Inline code with badge style
  code: ({ className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '')

    // If it's inline code (not a code block)
    if (!match) {
      return (
        <code
          className="relative rounded-sm border border-slate-200 bg-slate-100 px-[0.3rem] py-[0.2rem] text-[0.9em] font-normal !whitespace-nowrap text-rose-500 dark:border-[#ffffff1a] dark:bg-[#ffffff1a] dark:text-white [a_&]:text-inherit"
          {...props}
        >
          {children}
        </code>
      )
    }

    // For code blocks with syntax highlighting
    const codeString = String(children).replace(/\n$/, '')
    if (!codeString) return null

    return (
      <div className="prose m-0 mt-6 w-full max-w-none">
        <CodeBlock>{codeString}</CodeBlock>
      </div>
    )
  },

  pre: (props: any) => {
    return <pre className="w-full bg-inherit !p-0 dark:[&_pre]:!bg-[#0A0A0A]" {...props} />
  },

  // Handle video container divs produced by our custom processing
  div: (props: any) => {
    // Check if this is a video container
    if (props.className === 'video-container' || props.class === 'video-container') {
      return <VideoEmbed url={props['data-video-url'] || ''} title={props['data-video-title'] || 'Video'} />
    }

    // Check for video wrapper class (support both class and className)
    if (props.className === 'video-wrapper' || props.class === 'video-wrapper') {
      return (
        <div className="relative my-6 aspect-video w-full overflow-hidden rounded-lg shadow-lg">{props.children}</div>
      )
    }

    // Use span with block display to avoid <p> nesting issues
    return <span className="block w-full" {...props} />
  },

  // Handle video tag directly
  video: (props: any) => <VideoEmbed url={props.src} title={props.children || 'Video'} />,

  // Handle iframe for embedded videos
  iframe: (props: any) => <iframe className="absolute inset-0 h-full w-full object-cover" {...props} />,

  // Handle anchor tags directly
  a: (props: any) => <CustomLink {...props} />,

  sup: (props: any) => (
    <sup
      className="[&_a]:text-sky-500 [&_a]:underline [&_a]:transition-colors [&_a]:duration-200 [&_a]:hover:text-sky-400"
      {...props}
    />
  ),

  table: (props: any) => (
    <div className="-mb-4 w-full overflow-x-auto">
      <table {...props} className="min-w-full" />
    </div>
  ),

  th: (props: any) => (
    <th {...props} className="border border-[#ddd] py-3 !pl-2.5 text-left text-sm font-semibold tracking-wide" />
  ),

  td: (props: any) => <td {...props} className="border border-[#ddd] px-3 py-3 text-sm" />,

  blockquote: (props: any) => <blockquote {...props} className="[&_p]:font-normal" />,
}

export default async function MDXContent({ source }: MDXContentProps) {
  return (
    <MDXRemote
      source={source}
      components={components}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm, remarkMath],
          rehypePlugins: [rehypeSlug, rehypeKatex],
        },
      }}
    />
  )
}
