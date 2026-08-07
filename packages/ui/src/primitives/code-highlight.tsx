/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: colouring means
 * inserting `<span>`s, which React cannot express as children. Every branch
 * below escapes the source text BEFORE adding markup, so nothing from `code`
 * can reach the DOM as an element — see `escapeHtml`. */
"use client"

import { cn } from "../utils/cn"

/**
 * Syntax colouring for the tools' output panels.
 *
 * The books use Shiki, which is the right choice there: it runs on the server
 * over MDX that never changes after build. This one colours a string that
 * changes on every keystroke in the browser, so it is a small tokeniser
 * rather than a 1 MB grammar bundle downloaded to re-highlight twelve lines.
 *
 * Colour comes from the `--chart-*` tokens — the palette the design system
 * reserves for data visualisation, which is what syntax colouring is. Only the
 * JSON branch was converted when the JSON formatter was rebuilt; the HTML, CSS
 * and JavaScript branches kept fourteen hardcoded hues with a `dark:` twin
 * each, and the shell was `bg-zinc-100 dark:bg-zinc-900`, so this block was
 * the one panel on a tool page that did not match the card around it.
 *
 * Two of those branches were also broken. `[^&gt;]` is not "any character
 * except `>`" — it is a character CLASS containing `&`, `g`, `t` and `;`, so
 * the tag rule stopped at the first `t` in `<meta` and the comment rule could
 * not match a comment containing the letter `g`. Both are written against the
 * escaped text properly now.
 */

interface CodeHighlightProps {
  code: string
  language?:
    | "json"
    | "javascript"
    | "typescript"
    | "html"
    | "css"
    | "xml"
    | "text"
  className?: string
  showLineNumbers?: boolean
}

/** Everything is escaped before any markup is added. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

const KEY = "text-chart-4"
const STRING = "text-chart-2"
const NUMBER = "text-chart-1"
const KEYWORD = "text-chart-3"
const SPECIAL = "text-chart-5"
const PUNCTUATION = "text-muted-foreground"

const wrap = (cls: string, value: string) =>
  `<span class="${cls}">${value}</span>`

/**
 * JSON.
 *
 * The one branch that does not pre-escape: it is applied to output the JSON
 * formatter has already produced with `JSON.stringify`, whose only markup-
 * significant character is the `<` inside a string value. That is escaped
 * here for the same reason the rest are.
 */
function highlightJson(json: string): string {
  return escapeHtml(json)
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        if (match.startsWith('"')) {
          return wrap(match.endsWith(":") ? KEY : STRING, match)
        }
        if (/true|false/.test(match)) return wrap(KEYWORD, match)
        if (/null/.test(match)) return wrap(SPECIAL, match)
        return wrap(NUMBER, match)
      }
    )
    .replace(/([{}[\],])/g, (match) => wrap(PUNCTUATION, match))
}

/**
 * HTML, in one pass.
 *
 * Chained `String.replace` calls cannot colour markup: the second rule sees
 * the `class="text-chart-4"` the first rule just inserted and colours THAT as
 * an attribute. One regex over the escaped text, deciding per match, is the
 * only shape that stays correct.
 */
function highlightMarkup(html: string): string {
  const escaped = escapeHtml(html)

  // Quotes are NOT escaped by `escapeHtml` — they carry no meaning in text
  // content — so an attribute value is delimited by real `"` characters here,
  // even when the value itself contains the text `&quot;`.
  return escaped.replace(
    /(&lt;!--[\s\S]*?--&gt;)|(&lt;\/?)([a-zA-Z][\w:-]*)|([\w:-]+)=("[^"]*")|(\/?&gt;)/g,
    (match, comment, open, tag, attribute, value, close) => {
      if (comment) return wrap(PUNCTUATION, comment)
      if (tag) return wrap(PUNCTUATION, open) + wrap(KEYWORD, tag)
      if (attribute) return `${wrap(KEY, attribute)}=${wrap(STRING, value)}`
      if (close) return wrap(PUNCTUATION, close)
      return match
    }
  )
}

function highlightCss(css: string): string {
  return escapeHtml(css).replace(
    /(\/\*[\s\S]*?\*\/)|([.#][\w-]+)|([\w-]+)(\s*:)|:\s*([^;{}\n]+)/g,
    (match, comment, selector, property, colon, value) => {
      if (comment) return wrap(PUNCTUATION, comment)
      if (selector) return wrap(KEYWORD, selector)
      if (property) return wrap(KEY, property) + colon
      if (value) return `: ${wrap(STRING, value)}`
      return match
    }
  )
}

const JS_KEYWORDS =
  /\b(import|export|from|const|let|var|function|return|type|interface|as|default|await|async|new|class|extends|if|else|for|while)\b/

function highlightScript(js: string): string {
  return escapeHtml(js).replace(
    /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`[^`]*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)/g,
    (match, comment, string, number, word) => {
      if (comment) return wrap(PUNCTUATION, comment)
      if (string) return wrap(STRING, string)
      if (number) return wrap(NUMBER, number)
      if (word && JS_KEYWORDS.test(word)) return wrap(KEYWORD, word)
      return match
    }
  )
}

function highlight(code: string, language: string): string {
  if (!code) return ""
  switch (language) {
    case "json":
      return highlightJson(code)
    case "html":
    case "xml":
      return highlightMarkup(code)
    case "css":
      return highlightCss(code)
    case "javascript":
    case "typescript":
      return highlightScript(code)
    default:
      return escapeHtml(code)
  }
}

export function CodeHighlight({
  code,
  language = "text",
  className,
  showLineNumbers = false
}: CodeHighlightProps) {
  const highlighted = highlight(code, language)

  return (
    // No box of its own: this fills whatever panel it is given, which is what
    // makes it match the plain `<pre>` the JSON formatter falls back to above
    // its highlight limit. The old shell was `bg-zinc-100 dark:bg-zinc-900`,
    // so switching a large document to the fallback changed the look entirely.
    // A consumer that wants a card passes one through `className`.
    <pre
      className={cn(
        "overflow-auto p-4 font-mono text-foreground text-sm leading-relaxed",
        className
      )}
    >
      <code>
        {showLineNumbers ? (
          <span className="table w-full">
            {highlighted.split("\n").map((line, index) => (
              <span
                // The list is a re-render of one immutable string, never
                // reordered, so the line number IS the identity.
                key={`${index}-${line}`}
                className="table-row"
              >
                <span className="table-cell w-8 select-none pr-4 text-right text-muted-foreground">
                  {index + 1}
                </span>
                <span
                  className="table-cell"
                  dangerouslySetInnerHTML={{ __html: line || "&nbsp;" }}
                />
              </span>
            ))}
          </span>
        ) : (
          <span dangerouslySetInnerHTML={{ __html: highlighted }} />
        )}
      </code>
    </pre>
  )
}
