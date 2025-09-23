import { MDXRemote } from 'next-mdx-remote/rsc'
import Link from 'next/link'
import { LinkIcon } from 'lucide-react'
import React from 'react'

// Plugins
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'

// Custom components
import Callout from '../Callout'
import CodeBlock from '../CodeBlock'
import VideoEmbed from '../VideoEmbed'
import LinkifyChildren from './LinkifyChildren'

interface MDXContentProps {
  source: string
}

const components = {
  // Custom components passed to MDX
  Callout,
  CodeBlock,
  VideoEmbed,

  // Headings with anchor links
  h1: (props: any) => (
    <h1 id={props.id} className="group flex !cursor-default items-center gap-2 max-sm:text-2xl" {...props}>
      {props.children}
      {props.id && (
        <Link
          href={`#${props.id}`}
          aria-hidden="true"
          tabIndex={-1}
          className="opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        >
          <LinkIcon className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:text-slate-300 dark:hover:text-slate-100" />
        </Link>
      )}
    </h1>
  ),
  h2: (props: any) => {
    if (props.id === 'footnote-label') {
      return null
    }
    return (
      <h2 id={props.id} className="group m-0 mt-8 flex items-center gap-2" {...props}>
        {props.children}
        {props.id && (
          <Link
            href={`#${props.id}`}
            aria-hidden="true"
            tabIndex={-1}
            className="opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          >
            <LinkIcon className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:text-slate-300 dark:hover:text-slate-100" />
          </Link>
        )}
      </h2>
    )
  },
  h3: (props: any) => (
    <h3 id={props.id} className="group m-0 mt-8 flex items-center gap-2" {...props}>
      {props.children}
      {props.id && (
        <Link
          href={`#${props.id}`}
          aria-hidden="true"
          tabIndex={-1}
          className="opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        >
          <LinkIcon className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:text-slate-300 dark:hover:text-slate-100" />
        </Link>
      )}
    </h3>
  ),
  h4: (props: any) => (
    <h4 id={props.id} className="group m-0 mt-8 flex cursor-default items-center gap-2 text-lg" {...props}>
      {props.children}
      {props.id && (
        <Link
          href={`#${props.id}`}
          aria-hidden="true"
          tabIndex={-1}
          className="opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        >
          <LinkIcon className="h-3 w-3 text-slate-400 hover:text-slate-600 dark:text-slate-300 dark:hover:text-slate-100" />
        </Link>
      )}
    </h4>
  ),
  h5: (props: any) => (
    <h5 id={props.id} className="group m-0 mt-8 flex items-center gap-2" {...props}>
      {props.children}
      {props.id && (
        <Link
          href={`#${props.id}`}
          aria-hidden="true"
          tabIndex={-1}
          className="opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        >
          <LinkIcon className="h-2 w-2 text-slate-400 hover:text-slate-600 dark:text-slate-300 dark:hover:text-slate-100" />
        </Link>
      )}
    </h5>
  ),
  h6: (props: any) => (
    <h6 id={props.id} className="group m-0 mt-8 flex items-center gap-2" {...props}>
      {props.children}
      {props.id && (
        <Link
          href={`#${props.id}`}
          aria-hidden="true"
          tabIndex={-1}
          className="opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        >
          <LinkIcon className="h-2 w-2 text-slate-400 hover:text-slate-600 dark:text-slate-300 dark:hover:text-slate-100" />
        </Link>
      )}
    </h6>
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
    return <img className="m-0 mt-8 w-full rounded-md shadow-lg" src={src} alt={alt || ''} {...props} />
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

    return <div className="w-full" {...props} />
  },

  // Handle video tag directly
  video: (props: any) => <VideoEmbed url={props.src} title={props.children || 'Video'} />,

  // Handle iframe for embedded videos
  iframe: (props: any) => <iframe className="absolute inset-0 h-full w-full object-cover" {...props} />,

  sup: (props: any) => (
    <sup
      className="[&_a]:text-sky-500 [&_a]:underline [&_a]:transition-colors [&_a]:duration-200 [&_a]:hover:text-sky-400"
      {...props}
    />
  ),

  table: (props: any) => <table {...props} className="w-full" />,

  th: (props: any) => (
    <th {...props} className="border border-[#ddd] p-3 text-left text-sm font-semibold tracking-wide" />
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
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'wrap' }]],
        },
      }}
    />
  )
}
