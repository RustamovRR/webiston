import { describe, expect, it } from "vitest"

import { DETECTABLE_LANGUAGES, detectLanguage } from "./detect"
import { ALL_LANGUAGES, resolveLanguage } from "./highlight"

/**
 * The detector, against snippets that look like what people actually paste.
 *
 * Every sample here is idiomatic rather than minimal — a two-line toy proves
 * nothing about a scorer, because the whole design question is what happens
 * when several languages' marks fire at once. The cases that matter are the
 * confusable pairs: Python against Ruby (`def`), Go against Swift (`func`),
 * TypeScript against JavaScript (annotations), TS against TSX (JSX).
 */

const SAMPLES: readonly [string, string, string][] = [
  [
    "python",
    "python",
    `import os
from pathlib import Path

def collect(root: str) -> list[str]:
    found = []
    for entry in Path(root).iterdir():
        if entry.is_file():
            found.append(str(entry))
    return found
`
  ],
  [
    "ruby",
    "ruby",
    `require 'json'

class Report
  def initialize(rows)
    @rows = rows
  end

  def to_json
    @rows.map { |row| row.to_h }.to_json
  end
end
`
  ],
  [
    "go",
    "go",
    `package main

import (
	"fmt"
	"os"
)

func main() {
	data, err := os.ReadFile("input.txt")
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println(string(data))
}
`
  ],
  [
    "rust",
    "rust",
    `use std::collections::HashMap;

pub fn count(words: &[&str]) -> HashMap<String, usize> {
    let mut counts = HashMap::new();
    for word in words {
        *counts.entry(word.to_string()).or_insert(0) += 1;
    }
    counts
}
`
  ],
  [
    "java",
    "java",
    `import java.util.List;

public class Greeter {
    public static void main(String[] args) {
        List<String> names = List.of("Ali", "Vali");
        for (String name : names) {
            System.out.println("Salom, " + name);
        }
    }
}
`
  ],
  [
    "csharp",
    "csharp",
    `using System;
using System.Linq;

namespace Webiston.Tools
{
    public class Greeter
    {
        public void Run(string[] names)
        {
            foreach (var name in names.OrderBy(n => n))
            {
                Console.WriteLine($"Salom, {name}");
            }
        }
    }
}
`
  ],
  [
    "php",
    "php",
    `<?php

function greet(string $name): string
{
    return "Salom, " . $name;
}

echo greet($argv[1] ?? "dunyo");
`
  ],
  [
    "shell",
    "shellscript",
    `#!/usr/bin/env bash
set -euo pipefail

for file in "$@"; do
  if [[ -f "$file" ]]; then
    echo "found: \${file}"
  fi
done
`
  ],
  [
    "sql",
    "sql",
    `SELECT u.id, u.name, COUNT(o.id) AS orders
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.created_at > '2026-01-01'
GROUP BY u.id, u.name
ORDER BY orders DESC;
`
  ],
  [
    "html",
    "html",
    `<!DOCTYPE html>
<html lang="uz">
  <head>
    <meta charset="utf-8" />
    <title>Webiston</title>
  </head>
  <body>
    <div class="page"><p>Salom</p></div>
  </body>
</html>
`
  ],
  [
    "css",
    "css",
    `.card {
  display: flex;
  gap: 1rem;
  padding: 16px;
  border-radius: 12px;
}

@media (max-width: 768px) {
  .card {
    flex-direction: column;
  }
}
`
  ],
  [
    "yaml",
    "yaml",
    `---
name: build
on:
  push:
    branches:
      - main
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
`
  ],
  [
    "dockerfile",
    "docker",
    `FROM node:24-alpine

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
EXPOSE 3000
CMD ["pnpm", "start"]
`
  ],
  [
    "graphql",
    "graphql",
    `query GetTools($locale: String!) {
  tools(locale: $locale) {
    id
    title
    description
  }
}
`
  ],
  [
    "markdown",
    "markdown",
    `# Webiston

Bepul dasturchilar uchun vositalar to'plami.

- [Kitoblar](https://webiston.uz/books)
- [Vositalar](https://webiston.uz/tools)

Batafsil ma'lumot hujjatlarda.
`
  ],
  [
    "typescript",
    "typescript",
    `export interface ToolConfig {
  id: string
  title: string
  enabled: boolean
}

export function activate(tools: ToolConfig[]): string[] {
  return tools.filter((tool) => tool.enabled).map((tool) => tool.id)
}
`
  ],
  [
    "javascript",
    "javascript",
    `const fs = require("fs")

function readLines(path) {
  return fs.readFileSync(path, "utf8").split("\\n").filter(Boolean)
}

module.exports = { readLines }
`
  ],
  [
    "tsx",
    "tsx",
    `interface Props {
  name: string
}

export function Greeting({ name }: Props) {
  return <div className="greeting">Salom, {name}</div>
}
`
  ],
  [
    "json",
    "json",
    `{
  "name": "webiston",
  "version": "1.0.0",
  "scripts": { "dev": "next dev" },
  "dependencies": { "next": "16.3.0" }
}
`
  ]
]

/**
 * The guard that matters most, and the one that already caught a real bug.
 *
 * The detector's answer goes straight into the language picker's `value`. An
 * id that is not one of Shiki's CANONICAL ids leaves the picker showing an
 * empty box — no error, no warning, just a control that has silently lost its
 * selection. Two signatures shipped with `bash` and `dockerfile`, which are
 * Shiki ALIASES; the canonical ids are `shellscript` and `docker`.
 */
describe("the ids the detector can return", () => {
  it("are all real Shiki languages", () => {
    // Arrange
    const known = new Set(ALL_LANGUAGES.map((lang) => lang.id))

    // Act
    const unknown = DETECTABLE_LANGUAGES.filter((id) => !known.has(id))

    // Assert
    expect(unknown).toEqual([])
  })

  it("are all CANONICAL, not aliases", () => {
    // Arrange / Act — an alias resolves to something OTHER than itself, and
    // that difference is exactly what empties the picker.
    const aliases = DETECTABLE_LANGUAGES.filter(
      (id) => resolveLanguage(id) !== id
    )

    // Assert
    expect(aliases).toEqual([])
  })
})

describe("detectLanguage", () => {
  for (const [name, expected, code] of SAMPLES) {
    it(`recognises ${name}`, () => {
      // Arrange / Act
      const result = detectLanguage(code)

      // Assert
      expect(result).toBe(expected)
    })
  }

  it("says nothing on a snippet too short to be evidence", () => {
    // Arrange / Act / Assert — `const x = 1` is JavaScript, TypeScript, C#,
    // Java and Rust at once, and people paste one-liners to try the tool.
    expect(detectLanguage("const x = 1")).toBeNull()
    expect(detectLanguage("")).toBeNull()
    expect(detectLanguage("   \n  \n ")).toBeNull()
  })

  it("says nothing on prose, which is the most common wrong paste", () => {
    // Arrange
    const prose =
      "Bu oddiy matn, hech qanday dasturlash tiliga tegishli emas va " +
      "unda hech qanday sintaksis belgilari yo'q."

    // Act / Assert
    expect(detectLanguage(prose)).toBeNull()
  })

  it("keeps TypeScript and JavaScript apart by the annotations", () => {
    // Arrange — the SAME function, once typed and once not.
    const typed = `export function total(items: number[]): number {
  return items.reduce((sum: number, n: number) => sum + n, 0)
}`
    const untyped = `export function total(items) {
  return items.reduce((sum, n) => sum + n, 0)
}`

    // Act / Assert
    expect(detectLanguage(typed)).toBe("typescript")
    expect(detectLanguage(untyped)).not.toBe("typescript")
  })

  it("returns tsx rather than typescript when there is JSX", () => {
    // Arrange
    const withJsx = `const Badge = ({ count }: { count: number }) => (
  <span className="badge">{count}</span>
)`

    // Act / Assert — the grammar difference is real: `tsx` tokenises the tags,
    // `typescript` renders them as comparison operators.
    expect(detectLanguage(withJsx)).toBe("tsx")
  })

  it("recognises an untyped React component nothing else scores", () => {
    // Arrange — this loses on points to HTML (3) and scores 2 on JavaScript,
    // so the scorer alone says nothing and the visitor hunts through 360
    // entries for the most common paste this tool will ever see.
    const card = `export const Card = ({ title }) => (
  <div className="card">
    <h2>{title}</h2>
  </div>
)`

    // Act / Assert
    expect(detectLanguage(card)).toBe("jsx")
  })

  it("does not call a plain HTML fragment JSX", () => {
    // Arrange — the same closing tags, none of the JavaScript.
    const fragment = `<div class="card">
  <h2>Sarlavha</h2>
  <p>Matn</p>
</div>`

    // Act / Assert — `null` is the right answer here; guessing `jsx` at
    // markup would switch the grammar for no reason.
    expect(detectLanguage(fragment)).not.toBe("jsx")
    expect(detectLanguage(fragment)).not.toBe("tsx")
  })

  it("keeps SCSS out of the css bucket", () => {
    // Arrange
    const scss = `$primary: #0d6efd;

.button {
  background: $primary;
  &:hover {
    opacity: 0.8;
  }
}`

    // Act / Assert — labelling this `css` is not a crash, just a quietly
    // worse picture: `$primary` and `&:hover` lose their colours.
    expect(detectLanguage(scss)).toBe("scss")
  })

  it("recognises a Vue single-file component rather than jsx", () => {
    // Arrange — `</template>` matches the JSX pattern, so without a Vue
    // signature scoring first this came back as `jsx`.
    const sfc = `<template>
  <div class="app">{{ message }}</div>
</template>

<script setup>
const message = "Salom"
</script>`

    // Act / Assert
    expect(detectLanguage(sfc)).toBe("vue")
  })

  it("recognises a types-only Go file, which has no func at all", () => {
    // Arrange
    const go = `package store

type Repo interface {
	Get(id string) (*Item, error)
	Put(item *Item) error
}`

    // Act / Assert — `type X interface {` is Go; TypeScript writes
    // `type X = {`, with the equals sign.
    expect(detectLanguage(go)).toBe("go")
  })

  it("separates C from C++ on the standard library, not the includes", () => {
    // Arrange — both start with `#include <…>`.
    const c = `#include <stdio.h>

int main(void) {
    printf("salom\\n");
    return 0;
}`
    const cpp = `#include <iostream>

int main() {
    std::cout << "salom" << std::endl;
    return 0;
}`

    // Act / Assert
    expect(detectLanguage(c)).toBe("c")
    expect(detectLanguage(cpp)).toBe("cpp")
  })
})
