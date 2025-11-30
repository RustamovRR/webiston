import { MDXRemote } from 'next-mdx-remote/rsc'
import Link from 'next/link'
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
import LinkifyChildren from './LinkifyChildren'

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
  p: (props: any) => {
    return (
      <p
        className="!m-0 !mt-6 [&>a]:font-normal [&>a]:text-sky-500 [&>a]:underline [&>a]:transition-colors [&>a]:duration-200 [&>a]:hover:text-sky-400"
        {...props}
      >
        <LinkifyChildren>{props.children}</LinkifyChildren>
      </p>
    )
  },
  ul: (props: any) => {
    return (
      <ul className="m-0 mt-6 list-disc pl-4" {...props}>
        {props.children}
      </ul>
    )
  },
  li: (props: any) => {
    if (props.id && props.id.includes('user-content')) {
      return (
        <li className="[&_p]:!italic [&>p]:!mt-6" {...props}>
          <LinkifyChildren>{props.children}</LinkifyChildren>
        </li>
      )
    }
    return (
      <li className="[&>p]:!m-0" {...props}>
        <LinkifyChildren>{props.children}</LinkifyChildren>
      </li>
    )
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
          className="relative rounded-sm border border-slate-200 bg-slate-100 px-[0.3rem] py-[0.2rem] text-[0.9em] font-normal text-rose-500 dark:border-[#ffffff1a] dark:bg-[#ffffff1a] dark:text-white"
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

    // For regular divs, apply LinkifyChildren to handle links
    return (
      <div className="w-full" {...props}>
        <LinkifyChildren>{props.children}</LinkifyChildren>
      </div>
    )
  },

  // Handle video tag directly
  video: (props: any) => <VideoEmbed url={props.src} title={props.children || 'Video'} />,

  // Handle iframe for embedded videos
  iframe: (props: any) => <iframe className="absolute inset-0 h-full w-full object-cover" {...props} />,

  // Handle anchor tags directly
  a: ({ href, children, ...props }: any) => {
    // Skip heading anchor links (they have aria-hidden)
    if (props['aria-hidden'] === 'true' || props['aria-hidden'] === true) {
      return (
        <a href={href} {...props}>
          {children}
        </a>
      )
    }

    const isExternal = href?.startsWith('http') || href?.startsWith('https')

    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center !font-normal text-sky-500 transition-colors duration-200 hover:text-sky-400"
          {...props}
        >
          <span className="!font-normal">{children}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-arrow-up-right !stroke-sky-500 duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:!stroke-sky-400"
          >
            <path d="M7 7h10v10" />
            <path d="M7 17 17 7" />
          </svg>
        </a>
      )
    }

    return (
      <Link
        href={href || '#'}
        className="!font-normal text-sky-500 underline transition-colors duration-200 hover:text-sky-400"
        {...props}
      >
        {children}
      </Link>
    )
  },

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

  td: (props: any) => (
    <td {...props} className="border border-[#ddd] px-3 py-3 text-sm">
      <LinkifyChildren>{props.children}</LinkifyChildren>
    </td>
  ),

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
