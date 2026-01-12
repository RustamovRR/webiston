#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

// Read the TOOLS_LIST from constants/ui.ts
const uiConstantsPath = path.join(__dirname, "../src/constants/ui.ts")
const uiConstants = fs.readFileSync(uiConstantsPath, "utf8")

// Extract tool hrefs using regex
const toolsMatch = uiConstants.match(/export const TOOLS_LIST.*?=\s*\[(.*?)\]/s)
if (!toolsMatch) {
  console.error("Could not find TOOLS_LIST in ui.ts")
  process.exit(1)
}

// Extract href values
const hrefMatches = [...toolsMatch[1].matchAll(/href:\s*['"`]([^'"`]+)['"`]/g)]
let toolsPages = hrefMatches.map((match) => match[1].replace("/tools/", ""))

// Filter out tools that start with __ (Next.js ignores these folders)
toolsPages = toolsPages.filter((tool) => !tool.startsWith("__"))

// Also check if actual folders exist in the app directory
const toolsDir = path.join(__dirname, "../src/app/(app)/[locale]/tools")
if (fs.existsSync(toolsDir)) {
  const existingFolders = fs
    .readdirSync(toolsDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .filter((name) => !name.startsWith("__")) // Filter out __ folders

  // Only include tools that have actual folders
  toolsPages = toolsPages.filter((tool) => existingFolders.includes(tool))

  console.log(
    `📁 Found ${existingFolders.length} tool folders (excluding __ folders)`
  )
  console.log(`🔗 Found ${toolsPages.length} tools in TOOLS_LIST`)
}

// Write to tools-list.json
const outputPath = path.join(__dirname, "../tools-list.json")
fs.writeFileSync(outputPath, JSON.stringify(toolsPages, null, 2))

console.log(`✅ Updated tools-list.json with ${toolsPages.length} tools:`)
toolsPages.forEach((tool) => console.log(`  - ${tool}`))
