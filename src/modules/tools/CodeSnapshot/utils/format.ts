import type { Plugin } from "prettier"

/**
 * Prettier in the browser, a plugin at a time.
 *
 * ray.so ships a Format Code button, so this is **parity, not advantage** —
 * but its absence is the kind of gap a visitor notices immediately, because
 * the code they paste is usually the code they were about to clean up.
 *
 * Nothing here is loaded until the button is pressed, and then only the
 * chunks that language needs. Measured, gzipped, from `node_modules`:
 *
 * | chunk | gzip |
 * | --- | --- |
 * | `standalone` | 27 KB |
 * | `estree` | 61 KB |
 * | `babel` | 82 KB |
 * | `postcss` | 46 KB |
 * | `html` | 51 KB |
 * | `markdown` | 94 KB |
 * | `yaml` | 44 KB |
 * | `graphql` | 12 KB |
 *
 * **`babel-ts`, not the `typescript` plugin.** Both parse TypeScript and TSX;
 * the dedicated plugin is 213 KB gzipped against babel's 82 KB, and TS/TSX is
 * the most common thing anyone will format here. Verified on real input,
 * generics and JSX included, before the map below was written.
 */

type PluginId =
  | "estree"
  | "babel"
  | "postcss"
  | "html"
  | "markdown"
  | "yaml"
  | "graphql"

/**
 * One dynamic import per plugin.
 *
 * Written out rather than built from a template literal: a bundler can only
 * code-split an `import()` whose specifier it can read statically, and
 * `import(\`prettier/plugins/${id}\`)` would make it bundle all seven or none.
 */
const PLUGIN_LOADERS: Record<PluginId, () => Promise<Plugin>> = {
  estree: () => import("prettier/plugins/estree").then((m) => m.default),
  babel: () => import("prettier/plugins/babel").then((m) => m.default),
  postcss: () => import("prettier/plugins/postcss").then((m) => m.default),
  html: () => import("prettier/plugins/html").then((m) => m.default),
  markdown: () => import("prettier/plugins/markdown").then((m) => m.default),
  yaml: () => import("prettier/plugins/yaml").then((m) => m.default),
  graphql: () => import("prettier/plugins/graphql").then((m) => m.default)
}

interface Recipe {
  parser: string
  plugins: PluginId[]
}

/**
 * Shiki's CANONICAL language id → what Prettier needs.
 *
 * Keyed on the canonical id because that is what `resolveLanguage` returns —
 * `js`, `ts`, `md`, `yml` and `gql` are aliases Shiki folds away before this
 * map is ever consulted, so they resolve correctly without appearing here.
 *
 * Every entry was run against real input; `estree` is mandatory alongside
 * `babel` and is the single easiest thing to leave out, because the failure is
 * a runtime "Couldn't resolve parser" rather than a type error.
 */
const RECIPES: Record<string, Recipe> = {
  javascript: { parser: "babel", plugins: ["estree", "babel"] },
  jsx: { parser: "babel", plugins: ["estree", "babel"] },
  typescript: { parser: "babel-ts", plugins: ["estree", "babel"] },
  tsx: { parser: "babel-ts", plugins: ["estree", "babel"] },
  json: { parser: "json", plugins: ["estree", "babel"] },
  jsonc: { parser: "json", plugins: ["estree", "babel"] },
  json5: { parser: "json5", plugins: ["estree", "babel"] },
  css: { parser: "css", plugins: ["postcss"] },
  scss: { parser: "scss", plugins: ["postcss"] },
  less: { parser: "less", plugins: ["postcss"] },
  html: { parser: "html", plugins: ["html"] },
  vue: { parser: "vue", plugins: ["html"] },
  "angular-html": { parser: "angular", plugins: ["html"] },
  "angular-ts": { parser: "babel-ts", plugins: ["estree", "babel"] },
  markdown: { parser: "markdown", plugins: ["markdown"] },
  mdx: { parser: "mdx", plugins: ["markdown"] },
  yaml: { parser: "yaml", plugins: ["yaml"] },
  graphql: { parser: "graphql", plugins: ["graphql"] }
}

/**
 * Can this language be formatted at all?
 *
 * 18 of Shiki's 360 grammars, which is not a shortfall — Prettier has parsers
 * for the web stack and nothing else. The button is DISABLED for the other
 * 342 rather than hidden: a control that vanishes as you change a dropdown is
 * harder to understand than one that is visibly unavailable.
 */
export function canFormat(language: string): boolean {
  return language in RECIPES
}

/**
 * Format, or throw with a message the caller can show.
 *
 * Prettier rejects on a syntax error and that rejection is the useful case:
 * half-pasted code is the normal state of a snippet, and "this does not parse"
 * is worth saying. The caller must not swallow it.
 */
export async function formatCode(
  code: string,
  language: string
): Promise<string> {
  const recipe = RECIPES[language]
  if (!recipe) return code

  const [{ format }, ...plugins] = await Promise.all([
    import("prettier/standalone"),
    ...recipe.plugins.map((id) => PLUGIN_LOADERS[id]())
  ])

  const formatted = await format(code, { parser: recipe.parser, plugins })

  // Prettier always ends with a newline; the layout trims a trailing one
  // anyway, but returning it would put a phantom empty line in the editor's
  // textarea, which the visitor CAN see and put their caret on.
  return formatted.replace(/\n$/, "")
}
