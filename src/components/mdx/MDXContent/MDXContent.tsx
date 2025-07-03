'use client'

import { ArrowUpIcon, LinkIcon } from 'lucide-react'
import { MDXRemote } from 'next-mdx-remote'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import React from 'react'
import Callout from '../Callout'
import CodeBlock from '../CodeBlock'
import VideoEmbed from '../VideoEmbed'

interface MDXContentProps {
  source: any
}

export default function MDXContent({ source }: MDXContentProps) {
  const { theme } = useTheme()
  const components = {
    // Custom components
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

    h2: (props: any) => (
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
    ),

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
      <h4 id={props.id} className="group m-0 mt-8 flex cursor-default items-center gap-2" {...props}>
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
      // Handle links inside paragraphs
      const children = React.Children.map(props.children, (child) => {
        // Check if the child is a link
        if (child && typeof child === 'object' && child.type === 'a') {
          const { href, children: linkChildren, ...linkProps } = child.props
          const isExternal = href?.startsWith('http') || href?.startsWith('https')

          if (isExternal) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center font-normal text-sky-500 transition-colors duration-200 hover:text-sky-400 [&:has(code)]:!no-underline [&>span>code]:!text-sky-500"
                {...linkProps}
              >
                <span>{linkChildren}</span>
                <ArrowUpIcon width={14} height={14} className="!stroke-sky-500 group-hover:!stroke-sky-400" />
              </a>
            )
          } else {
            return (
              <Link
                href={href || '#'}
                className="font-normal text-sky-500 underline transition-colors duration-200 hover:text-sky-400"
                {...linkProps}
              >
                {linkChildren}
              </Link>
            )
          }
        }
        return child
      })

      return (
        <p
          className="!m-0 !mt-6 [&>a]:font-normal [&>a]:text-sky-500 [&>a]:underline [&>a]:transition-colors [&>a]:duration-200 [&>a]:hover:text-sky-400"
          {...props}
        >
          {children}
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
      return (
        <li className="[&>p]:!m-0" {...props}>
          {props.children}
        </li>
      )
    },

    // Image customization
    img: ({ src, alt, ...props }: any) => {
      // Check if this is actually a video (special case in our Markdown)
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

      // Regular image
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
      return <pre className="w-full bg-inherit !p-0" {...props} />
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
  }
  return <MDXRemote {...source} components={components} />
}
