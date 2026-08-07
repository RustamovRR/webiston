// The engine is the single source of truth — the app re-exports, never
// re-implements. There used to be a 115-line copy of the script detector here
// that no file imported and that disagreed with the engine actually running.

export {
  convert,
  detectScript,
  isCyrillicText,
  resolveDirection,
  toCyrillic,
  toLatin
} from "@webiston/transliteration"
