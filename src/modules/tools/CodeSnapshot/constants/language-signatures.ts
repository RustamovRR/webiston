/**
 * The marks that give a pasted snippet away, and what each one is worth.
 *
 * A table, not logic — which is why it lives here rather than in
 * `utils/detect.ts` (`code-rules.md` §14). The scorer that reads it is thirty
 * lines; this is the two hundred and fifty it used to be buried in.
 *
 * **Scored, not first-match.** A ladder of `if` statements gets the common
 * cases right and the interesting ones wrong, because the strongest evidence
 * is rarely on the first line: `def` is Python and also Ruby, `class` is six
 * languages, `func` is Go and Swift. Weighing several marks and taking the
 * best total is what separates them.
 */

/** Weight for a mark that decides the language on its own. */
export const DECISIVE = 10
/** A mark that is strong evidence but appears in neighbouring languages. */
export const STRONG = 3
/** A mark that only counts alongside others. */
export const WEAK = 1

export interface LanguageSignature {
  /** Shiki's CANONICAL id, so it can be handed straight to the picker. */
  id: string
  marks: readonly (readonly [RegExp, number])[]
}

/**
 * Ordered only for reading; scoring is order-independent.
 *
 * Every `DECISIVE` mark here is one that cannot legally appear in another
 * language in the list — `<?php`, `package main`, `using System;`. Anything
 * that merely *usually* means a language is `STRONG` at most.
 *
 * **Canonical ids only.** Two entries once answered with Shiki ALIASES —
 * `bash` and `dockerfile`, whose grammars are `shellscript` and `docker` — so
 * the detector switched the language to a value the picker could not select
 * and the field went blank. `detect.test.ts` guards every id in this table.
 */
export const LANGUAGE_SIGNATURES: readonly LanguageSignature[] = [
  {
    id: "python",
    marks: [
      [/^#!.*\bpython/m, DECISIVE],
      [/^\s*def\s+\w+\s*\(.*\)\s*(->.*)?:\s*$/m, STRONG],
      [/^\s*(from\s+[\w.]+\s+)?import\s+[\w.]+/m, STRONG],
      [/^\s*(if|elif|else|for|while|try|except|with|class)\b.*:\s*$/m, WEAK],
      [/\bself\b/, WEAK],
      [/\b(True|False|None)\b/, WEAK],
      [/\bprint\s*\(/, WEAK]
    ]
  },
  {
    id: "php",
    marks: [
      [/<\?php/, DECISIVE],
      [/^#!.*\bphp/m, DECISIVE],
      [/\$\w+\s*=/, WEAK],
      [/\becho\s+/, WEAK],
      [/->\w+\s*\(/, WEAK]
    ]
  },
  {
    id: "go",
    marks: [
      [/^\s*package\s+\w+\s*$/m, STRONG],
      // `type X struct {` and `type X interface {` are Go and nothing else —
      // TypeScript writes `type X = {`, with the equals sign. A types-only
      // Go file has no `func` and no `:=`, so without this it scored 3
      // against a floor of 4 and came back as nothing at all.
      [/^\s*type\s+\w+\s+(struct|interface)\s*\{/m, DECISIVE],
      [/^\s*func\s+(\(\w+\s+\*?\w+\)\s*)?\w+\s*\(/m, STRONG],
      [/^\s*import\s+\(/m, STRONG],
      [/:=/, WEAK],
      [/\bfmt\.\w+/, WEAK],
      [/\berr\s*!=\s*nil\b/, STRONG]
    ]
  },
  {
    id: "rust",
    marks: [
      // `pub`, `async` and `unsafe` all sit in front of `fn`, and idiomatic
      // Rust puts one there far more often than not — anchoring on a bare
      // `fn` missed every public function in the file.
      [/^\s*(pub(\(\w+\))?\s+)?(async\s+|unsafe\s+)*fn\s+\w+/m, STRONG],
      [/\blet\s+mut\s+\w+/, STRONG],
      [/^\s*(pub\s+)?(impl|trait|enum)\s+\w+/m, STRONG],
      [/\buse\s+[\w:]+(::\{|;)/, STRONG],
      [/println!\s*\(/, STRONG],
      [/&(mut\s+)?self\b/, WEAK],
      [/->\s*(Result|Option|Vec|String|\w+)</, WEAK]
    ]
  },
  {
    id: "java",
    marks: [
      [/\bSystem\.out\.print/, DECISIVE],
      [
        /^\s*(public|private|protected)\s+(static\s+)?(final\s+)?(class|interface|enum)\s+\w+/m,
        STRONG
      ],
      [/^\s*import\s+(java|javax)\./m, DECISIVE],
      [/public\s+static\s+void\s+main/, DECISIVE],
      [/\bnew\s+\w+\s*\(/, WEAK]
    ]
  },
  {
    id: "csharp",
    marks: [
      [/^\s*using\s+System(\.\w+)*\s*;/m, DECISIVE],
      [/^\s*namespace\s+[\w.]+/m, STRONG],
      [/\bConsole\.Write(Line)?\s*\(/, DECISIVE],
      [/\bpublic\s+(async\s+)?(Task|void|string|int|bool)\b/, WEAK],
      [/\bvar\s+\w+\s*=/, WEAK]
    ]
  },
  {
    id: "ruby",
    marks: [
      [/^#!.*\bruby/m, DECISIVE],
      [/^\s*def\s+\w+[?!]?(\s*\(.*\))?\s*$/m, STRONG],
      [/^\s*(require|require_relative)\s+['"]/m, STRONG],
      [/^\s*end\s*$/m, STRONG],
      [/\bputs\s+/, WEAK],
      [/\bdo\s*\|\w+/, WEAK],
      [/:\w+\s*=>/, WEAK]
    ]
  },
  {
    id: "shellscript",
    marks: [
      [/^#!.*\b(bash|sh|zsh)\b/m, DECISIVE],
      [/^\s*(if|while)\s+\[\[?\s/m, STRONG],
      [/\$\{\w+\}/, WEAK],
      [/^\s*(echo|export|source)\s+/m, WEAK],
      [/\bfi\s*$/m, STRONG]
    ]
  },
  {
    id: "sql",
    marks: [
      [/\bSELECT\b[\s\S]*\bFROM\b/i, STRONG],
      [/\b(INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM)\b/i, STRONG],
      [/\bCREATE\s+(TABLE|INDEX|VIEW)\b/i, STRONG],
      [/\b(INNER|LEFT|RIGHT|FULL)\s+JOIN\b/i, WEAK],
      [/\bGROUP\s+BY\b/i, WEAK]
    ]
  },
  {
    id: "html",
    marks: [
      [/<!DOCTYPE\s+html/i, DECISIVE],
      [/<html[\s>]/i, DECISIVE],
      [/<\/(div|body|head|section|span|p|ul|li)>/i, STRONG],
      [/<meta\s|<link\s/i, WEAK]
    ]
  },
  {
    // Ahead of `css` in evidence, not in order: SCSS shares every CSS mark,
    // so it can only win on the marks CSS cannot have. Without this the tool
    // labelled a Sass file `css` and dropped the highlighting for `$variable`
    // and `&:hover` — not a crash, just a quietly worse picture.
    id: "scss",
    marks: [
      [/^\s*\$[\w-]+\s*:\s*[^;]+;/m, DECISIVE],
      [/@(mixin|include|extend|use|forward)\b/, DECISIVE],
      [/&(:|\.|\s*\{|-)/, STRONG],
      [/^\s*@each\s|\s*@if\s/m, STRONG]
    ]
  },
  {
    id: "css",
    marks: [
      [/^[.#]?[\w-]+(\s*[,>+~]\s*[\w.#:-]+)*\s*\{[\s\S]*?\}/m, STRONG],
      [/[\w-]+\s*:\s*[^;{}]+;/, STRONG],
      [/@(media|import|keyframes|supports|font-face)\b/, STRONG],
      [/(px|rem|em|vh|vw|%)\s*[;}]/, WEAK]
    ]
  },
  {
    // A single-file component is `<template>` plus a `<script>`, and nothing
    // else in this list looks like that. It has to be scored, not left to the
    // JSX fallback below, because `</template>` matches the JSX pattern and
    // would otherwise come back as `jsx`.
    id: "vue",
    marks: [
      [/<template>[\s\S]*<\/template>/, DECISIVE],
      [/<script\s+setup/, DECISIVE],
      [/\sv-(if|else|for|model|bind|on|show)\b|@click=|:\w+="/, STRONG]
    ]
  },
  {
    id: "c",
    marks: [
      [/^\s*#include\s*<[\w./]+>/m, DECISIVE],
      [/\bint\s+main\s*\(/, STRONG],
      [/\bprintf\s*\(/, STRONG],
      [/\b(malloc|free|sizeof)\s*\(/, WEAK]
    ]
  },
  {
    id: "cpp",
    marks: [
      // NOT a bare `std::`. Rust's standard library is spelled the same way,
      // and `use std::collections::HashMap;` scored a decisive 10 for C++ on
      // a Rust file — the detector confidently returned the wrong language.
      // Only the members C++ actually owns count.
      [
        /\bstd::(cout|cin|cerr|endl|vector|unique_ptr|shared_ptr|make_unique|make_shared|to_string)\b/,
        DECISIVE
      ],
      [/\bcout\s*<</, DECISIVE],
      [/\busing\s+namespace\s+std\s*;/, DECISIVE],
      [/^\s*#include\s*<[\w./]+>/m, STRONG],
      [/\btemplate\s*</, STRONG]
    ]
  },
  {
    id: "yaml",
    marks: [
      [/^---\s*$/m, STRONG],
      [/^\s*[\w-]+:\s*(\S.*)?$/m, WEAK],
      [/^\s*-\s+[\w-]+:\s/m, STRONG],
      [/^\s{2,}[\w-]+:\s/m, WEAK]
    ]
  },
  {
    id: "docker",
    marks: [
      [/^\s*FROM\s+\S+/m, STRONG],
      [/^\s*(RUN|CMD|ENTRYPOINT|COPY|WORKDIR|EXPOSE|ENV)\s+/m, STRONG]
    ]
  },
  {
    id: "graphql",
    marks: [
      // Decisive, not merely strong: a line that begins `query Name(…) {` is
      // not valid in any other language here — JavaScript would need
      // `query: {`, and the named form is a syntax error everywhere else. An
      // operation is often the WHOLE paste, so this mark has to carry it
      // alone; at STRONG it scored 3 against a floor of 4 and the detector
      // stayed silent on a perfectly obvious GraphQL query.
      [/^\s*(query|mutation|subscription)\s+\w*\s*(\(.*\))?\s*\{/m, DECISIVE],
      [/^\s*(type|input|enum|interface)\s+\w+\s*\{/m, STRONG],
      [/^\s*fragment\s+\w+\s+on\s+\w+/m, DECISIVE]
    ]
  },
  {
    id: "markdown",
    marks: [
      [/^#{1,6}\s+\S/m, STRONG],
      [/^\s*[-*+]\s+\S/m, WEAK],
      [/^```/m, STRONG],
      [/\[[^\]]+\]\([^)]+\)/, STRONG]
    ]
  },
  {
    id: "typescript",
    marks: [
      [/^\s*(export\s+)?(interface|type)\s+\w+\s*[=<{]/m, STRONG],
      [/:\s*(string|number|boolean|void|unknown|never|any)\b/, STRONG],
      [/\bas\s+const\b/, STRONG],
      [/^\s*(export\s+)?(const|let|function|class)\s/m, WEAK],
      [/\b(import|export)\b.*\bfrom\s+['"]/, WEAK],
      [/=>/, WEAK]
    ]
  },
  {
    id: "javascript",
    marks: [
      [/^#!.*\bnode\b/m, DECISIVE],
      [/\b(const|let)\s+\w+\s*=/, WEAK],
      [/\b(module\.exports|require\s*\()/, STRONG],
      [/\bfunction\s*\*?\s*\w*\s*\(/, WEAK],
      [/\b(import|export)\b.*\bfrom\s+['"]/, WEAK],
      [/=>/, WEAK],
      [/\bconsole\.\w+\s*\(/, WEAK]
    ]
  }
]
