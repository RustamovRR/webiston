"use client"

import React from "react"
import { cn } from "../utils/cn"

interface CodeHighlightProps {
  code: string
  language?: "json" | "javascript" | "html" | "css" | "xml" | "text"
  className?: string
  showLineNumbers?: boolean
}

export function CodeHighlight({
  code,
  language = "text",
  className,
  showLineNumbers = false
}: CodeHighlightProps) {
  const highlightCode = (code: string, lang: string) => {
    if (!code) return ""

    switch (lang) {
      case "json":
        return highlightJSON(code)
      case "html":
      case "xml":
        return highlightHTML(code)
      case "css":
        return highlightCSS(code)
      case "javascript":
        return highlightJS(code)
      default:
        return code
    }
  }

  const highlightJSON = (json: string) => {
    return json
      .replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
        (match) => {
          let cls = "text-blue-600 dark:text-blue-400" // numbers
          if (match.startsWith('"')) {
            if (match.endsWith(":")) {
              cls = "text-purple-600 dark:text-purple-400" // keys
            } else {
              cls = "text-green-600 dark:text-green-400" // strings
            }
          } else if (/true|false/.test(match)) {
            cls = "text-orange-600 dark:text-orange-400" // booleans
          } else if (/null/.test(match)) {
            cls = "text-red-600 dark:text-red-400" // null
          }
          return `<span class="${cls}">${match}</span>`
        }
      )
      .replace(
        /([{}[\],])/g,
        '<span class="text-gray-600 dark:text-gray-400">$1</span>'
      ) // punctuation
  }

  const highlightHTML = (html: string) => {
    // First escape HTML to prevent rendering
    const escaped = html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")

    return escaped
      .replace(
        /(&lt;\/?[^&gt;]+&gt;)/g,
        '<span class="text-blue-600 dark:text-blue-400">$1</span>'
      ) // tags
      .replace(
        /(\w+)=/g,
        '<span class="text-purple-600 dark:text-purple-400">$1</span>='
      ) // attributes
      .replace(
        /&quot;([^&]*)&quot;/g,
        '&quot;<span class="text-green-600 dark:text-green-400">$1</span>&quot;'
      ) // attribute values
      .replace(
        /(&lt;!--[^&]*--&gt;)/g,
        '<span class="text-gray-500 dark:text-gray-500">$1</span>'
      ) // comments
  }

  const highlightCSS = (css: string) => {
    return css
      .replace(
        /([\w-]+)(\s*:)/g,
        '<span class="text-purple-600 dark:text-purple-400">$1</span>$2'
      ) // properties
      .replace(
        /:\s*([^;}\n]+)/g,
        ': <span class="text-green-600 dark:text-green-400">$1</span>'
      ) // values
      .replace(
        /([.#][\w-]+)/g,
        '<span class="text-blue-600 dark:text-blue-400">$1</span>'
      ) // selectors
  }

  const highlightJS = (js: string) => {
    return js
      .replace(
        /\b(function|var|let|const|if|else|for|while|return|import|export|from|class|extends)\b/g,
        '<span class="text-purple-600 dark:text-purple-400">$1</span>'
      ) // keywords
      .replace(
        /"([^"]*)"/g,
        '"<span class="text-green-600 dark:text-green-400">$1</span>"'
      ) // strings
      .replace(
        /'([^']*)'/g,
        "'<span class=\"text-green-600 dark:text-green-400\">$1</span>'"
      ) // strings
      .replace(/\/\*[\s\S]*?\*\//g, '<span class="text-gray-500">$&</span>') // comments
      .replace(/\/\/.*$/gm, '<span class="text-gray-500">$&</span>') // line comments
  }

  const lines = code.split("\n")
  const highlightedCode = highlightCode(code, language)
  const highlightedLines = highlightedCode.split("\n")

  return (
    <div className={cn("relative", className)}>
      <pre className="overflow-auto rounded-lg bg-zinc-100 p-4 text-sm dark:bg-zinc-900">
        <code className="font-mono">
          {showLineNumbers ? (
            <div className="table w-full">
              {highlightedLines.map((line, index) => (
                <div key={index} className="table-row">
                  <span className="table-cell w-8 pr-4 text-right text-zinc-400 select-none dark:text-zinc-500">
                    {index + 1}
                  </span>
                  <span
                    className="table-cell text-zinc-800 dark:text-zinc-200"
                    dangerouslySetInnerHTML={{ __html: line || "&nbsp;" }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div
              className="text-zinc-800 dark:text-zinc-200"
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
          )}
        </code>
      </pre>
    </div>
  )
}
