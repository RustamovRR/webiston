/**
 * Tool-scoped constants.
 *
 * The sample payload used to live in the hook file and the accepted file types
 * were inline in a `useCallback`, which is how the 10 MB limit ended up
 * written twice — once as a number and once inside a hardcoded Uzbek `alert()`
 * string that no translation could reach.
 */

export type IndentOption = "2" | "4" | "8" | "\t"

/** What `JSON.stringify` is given. `\t` is a real option, not "8 spaces". */
export const INDENT_OPTIONS: readonly IndentOption[] = ["2", "4", "8", "\t"]

export const DEFAULT_INDENT: IndentOption = "2"

/** Comfortably larger than any hand-edited config, small enough to parse fast. */
export const MAX_FILE_BYTES = 10 * 1024 * 1024

export const ACCEPTED_FILE_TYPES = ".json,.txt"

const ACCEPTED_MIME = ["application/json", "text/plain", "text/json"]
const ACCEPTED_EXTENSIONS = [".json", ".txt"]

export function isAcceptedFile(file: File): boolean {
  return (
    ACCEPTED_MIME.includes(file.type) ||
    ACCEPTED_EXTENSIONS.some((extension) => file.name.endsWith(extension))
  )
}

/**
 * The sample. Uzbek keys on purpose — it is the one place a visitor sees what
 * the tool does before typing, and a Latin-alphabet Uzbek object is a fair
 * demonstration that the formatter handles the site's own content.
 */
export const SAMPLE_JSON = {
  foydalanuvchi: {
    id: 1,
    ism: "Ali Valiyev",
    email: "ali@example.com",
    yosh: 30,
    manzil: {
      viloyat: "Toshkent",
      tuman: "Chilonzor",
      "ko'cha": "Amir Temur ko'chasi",
      uy: "15"
    },
    telefon: ["+998901234567", "+998712345678"],
    faol: true,
    "ro'yxatdanOtganSana": "2024-01-15T10:30:00Z",
    sozlamalar: {
      til: "uz",
      xabarNomalar: true,
      "qorong'uRejim": false
    }
  }
}
