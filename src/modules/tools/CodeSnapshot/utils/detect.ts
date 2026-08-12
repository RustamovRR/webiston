import {
  LANGUAGE_SIGNATURES,
  type LanguageSignature
} from "../constants/language-signatures"

/**
 * Guess the language of a pasted snippet.
 *
 * Finding one entry in a list of 360 is the worst moment in this tool, and it
 * happens before anything else does — the picture is wrong until the grammar
 * is right. So the paste itself is the signal: people paste whole files or
 * whole functions, and those carry unmistakable marks.
 *
 * The marks themselves are a table in `constants/language-signatures.ts`; this
 * file is only the arithmetic over it.
 *
 * **It is allowed to say "I don't know", and that is the point.** A wrong
 * switch is worse than no switch: it silently replaces a choice the visitor
 * made. Below the confidence floor this returns `null` and nothing happens.
 * The caller also shows what it did, with an undo — see `StylePanel`.
 */

/**
 * The score a winner must reach.
 *
 * Four means either one decisive mark, or at least two independent strong
 * ones — never a single `WEAK` coincidence like a stray brace.
 */
const CONFIDENCE_FLOOR = 4

/**
 * JSX is a modifier, not a language.
 *
 * A closing tag next to an arrow function is JSX; whether the result is `tsx`
 * or `jsx` depends on whether the same snippet also has type annotations, and
 * that question is already answered by the TypeScript score.
 */
const JSX = /<\/[A-Za-z][\w.]*>|<[A-Z]\w*[\s/>]|<>[\s\S]*<\/>/

/**
 * Enough JavaScript around the tags to rule out a plain HTML fragment.
 *
 * The JSX pattern alone is not sufficient: `</div>` is as much HTML as it is
 * React. A bare fragment with no bindings stays `null`, which is the right
 * answer — nobody is served by guessing `jsx` at an HTML snippet.
 */
const JS_AROUND_JSX = /\b(const|let|function|export|import|return)\b/

/** Type annotations, which is the only thing separating `tsx` from `jsx`. */
const TYPED =
  /:\s*(string|number|boolean|void|unknown|never|any)\b|^\s*(export\s+)?(interface|type)\s+\w+/m

/** Every id this module can return, for the test that checks they are real. */
export const DETECTABLE_LANGUAGES: readonly string[] = [
  ...LANGUAGE_SIGNATURES.map((signature) => signature.id),
  "json",
  "jsx",
  "tsx"
]

/** JSON is decided by the parser, not by patterns — it either parses or not. */
function isJson(code: string): boolean {
  const trimmed = code.trim()
  if (!/^[[{]/.test(trimmed)) return false
  try {
    JSON.parse(trimmed)
    return true
  } catch {
    return false
  }
}

function score(code: string, signature: LanguageSignature): number {
  let total = 0
  for (const [pattern, weight] of signature.marks) {
    if (pattern.test(code)) total += weight
  }
  return total
}

/**
 * The canonical Shiki id for this snippet, or `null` when unsure.
 *
 * Returning `null` is a real answer and the caller must treat it as one: a
 * wrong guess silently discards a choice the visitor made, which is worse
 * than leaving the picker alone.
 */
export function detectLanguage(code: string): string | null {
  // Two lines of anything is not evidence; people paste one-liners to test
  // the tool, and a single `const x = 1` is JavaScript, TypeScript, C#, Java
  // and Rust at once.
  if (code.trim().length < 24) return null

  if (isJson(code)) return "json"

  const ranked = LANGUAGE_SIGNATURES.map((signature) => ({
    id: signature.id,
    points: score(code, signature)
  })).sort((a, b) => b.points - a.points)

  const [best, runnerUp] = ranked
  const jsx = JSX.test(code)

  // A tie is not a guess. Two languages scoring the same means the marks that
  // fired are the ones they share, which is exactly when leaving the picker
  // alone is right.
  const decided =
    best &&
    best.points >= CONFIDENCE_FLOOR &&
    (!runnerUp || best.points !== runnerUp.points)

  if (decided) {
    if (jsx && (best.id === "typescript" || best.id === "javascript")) {
      return best.id === "typescript" ? "tsx" : "jsx"
    }
    return best.id
  }

  /**
   * No winner — but a React component is still unmistakable.
   *
   * `export const Card = ({ title }) => <div className="card">…</div>` scores
   * 2 on JavaScript and 3 on HTML: below the floor on both, so the scorer
   * rightly says nothing, and the visitor is left hunting for "JSX" in a list
   * of 360. Tags PLUS JavaScript keywords is not ambiguous, and every
   * language that legitimately owns tags — HTML, Vue, Markdown — has already
   * had its chance to win above.
   */
  if (jsx && JS_AROUND_JSX.test(code)) return TYPED.test(code) ? "tsx" : "jsx"

  return null
}
