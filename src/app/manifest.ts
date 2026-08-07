import type { MetadataRoute } from "next"
import { BROWSER_CHROME } from "./layout"

/**
 * The PWA manifest, served at `/manifest.webmanifest`.
 *
 * This file wins over anything a layout puts in `metadata.manifest`: Next
 * assigns the discovered manifest in `mergeStaticMetadata`
 * (`next/dist/lib/metadata/resolve-metadata.js:160`), which runs as the return
 * value of `mergeMetadata` at `:311` — i.e. after the metadata export has been
 * merged. There is exactly one `<link rel="manifest">` in the document.
 *
 * Three things were wrong here and all of them were invisible in a browser:
 *
 * 1. `/icons/qr-generator.png` and `/icons/password-generator.png` were listed
 *    as shortcut icons. **Neither file exists** — `public/icons/` has never
 *    existed. An installed PWA showed shortcuts with no icons.
 * 2. `purpose: "maskable"` sat on a full-bleed 192px icon. Android crops a
 *    maskable icon to a circle of radius 40% of the width, so the mark was
 *    being cut off at the edges. The maskable icon is now its OWN file with
 *    the artwork inside that safe zone — web.dev warns specifically against
 *    reusing one file for both purposes, because padding a plain icon shrinks
 *    it everywhere else for nothing.
 * 3. The 16px, 32px and apple-touch icons were listed as manifest icons. They
 *    are not: those are `<link>` tags, and Next now emits them from the file
 *    conventions in `src/app/`. A manifest describes the *installed app*.
 *
 * `theme_color` shares the constant the `<meta name="theme-color">` uses, so
 * the browser chrome and the PWA splash screen cannot drift apart. It was
 * `#3b82f6` — Tailwind's `blue-500`, which is not in `src/styles/tokens.css`
 * and is not the brand hue (217°).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Webiston — dasturchilar uchun bepul kitoblar va vositalar",
    short_name: "Webiston",
    description:
      "O'zbek tilidagi dasturlash kitoblari va brauzerda ishlaydigan bepul vositalar.",
    start_url: "/",
    display: "standalone",
    background_color: BROWSER_CHROME.light,
    theme_color: BROWSER_CHROME.light,
    orientation: "portrait",
    categories: ["productivity", "utilities", "developer"],
    lang: "uz",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png"
      },
      {
        // Artwork inside the central 80%, so Android's circular crop takes
        // only the margin. A separate file, never `purpose: "any maskable"`.
        src: "/icon-mask.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ],
    shortcuts: [
      {
        name: "Lotin-Kirill o'giruvchi",
        short_name: "Lotin-Kirill",
        description:
          "O'zbek matnini lotin va kirill yozuvlari orasida o'girish",
        url: "/tools/latin-cyrillic"
      },
      {
        name: "QR kod yaratish",
        short_name: "QR kod",
        description: "Bepul QR kod yaratish",
        url: "/tools/qr-generator"
      }
    ]
  }
}
