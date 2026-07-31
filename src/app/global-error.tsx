"use client"

/**
 * The last line of defence: this replaces the ROOT layout when the root layout
 * itself throws, so it has to render its own `<html>` and `<body>`.
 *
 * Which is also why it carries inline styles rather than Tailwind classes. The
 * stylesheet is imported by `app/layout.tsx` — the very file whose failure gets
 * us here — so a token-driven design cannot be relied on at this point. Every
 * other surface on the site uses tokens; this one deliberately does not, and
 * that is the whole reason it exists.
 *
 * There was no `global-error.tsx` before, meaning a root-layout failure showed
 * Next's unstyled default with no way back and nothing reported.
 *
 * `prefers-color-scheme` rather than the `.dark` class: `next-themes` sets that
 * class from a script in the layout that did not survive.
 */
/**
 * The ONE documented hardcoded palette in the app, and `pnpm tokens` is right
 * to flag it — which is why it lives in a named constant rather than scattered
 * through the CSS string below.
 *
 * Tokens are unusable here by definition: `--background`/`--foreground` are
 * declared in `tokens.css`, which is imported by `app/layout.tsx` — the file
 * whose failure is what renders this component. A token reference would resolve
 * to nothing and leave black text on a black page at the exact moment the user
 * most needs to read something.
 *
 * Values mirror `tokens.css`'s `--background` / `--foreground` in both schemes,
 * rounded to hex. If those tokens are re-tuned, re-tune these to match — they
 * cannot be derived, only kept in sync.
 */
const FALLBACK_PALETTE = {
  lightSurface: "#ffffff",
  lightInk: "#0a0a0a",
  darkSurface: "#060809",
  darkInk: "#f5f7f8"
} as const

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="uz">
      <head>
        <title>Xatolik — Webiston</title>
        <meta name="robots" content="noindex" />
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: no stylesheet is guaranteed here — the root layout, which imports it, is what failed */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root { color-scheme: light dark; }
              body {
                margin: 0;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                background: ${FALLBACK_PALETTE.lightSurface};
                color: ${FALLBACK_PALETTE.lightInk};
                font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
                text-align: center;
                padding: 1.5rem;
              }
              @media (prefers-color-scheme: dark) {
                body {
                  background: ${FALLBACK_PALETTE.darkSurface};
                  color: ${FALLBACK_PALETTE.darkInk};
                }
              }
              .m { max-width: 32rem; }
              h1 { font-size: 1.75rem; font-weight: 700; margin: 0 0 .75rem; letter-spacing: -.02em; }
              p { margin: 0 0 1.75rem; line-height: 1.6; opacity: .72; }
              button {
                font: inherit; cursor: pointer; border: 0; border-radius: .5rem;
                padding: .7rem 1.25rem;
                background: ${FALLBACK_PALETTE.lightInk};
                color: ${FALLBACK_PALETTE.lightSurface};
              }
              @media (prefers-color-scheme: dark) {
                button {
                  background: ${FALLBACK_PALETTE.darkInk};
                  color: ${FALLBACK_PALETTE.darkSurface};
                }
              }
              code { font-family: ui-monospace, SFMono-Regular, monospace; font-size: .75rem; opacity: .5; }
            `
          }}
        />
      </head>
      <body>
        <div className="m">
          <h1>Kutilmagan xatolik</h1>
          <p>
            Sahifani yuklashda xatolik yuz berdi. Qayta urinib ko'ring — muammo
            takrorlansa, birozdan so'ng qayta kiring.
          </p>
          <button type="button" onClick={() => reset()}>
            Qayta urinish
          </button>
          {/* The digest is the only handle on a production error — without it a
              report is "something broke somewhere". */}
          {error.digest && (
            <p style={{ marginTop: "1.5rem", marginBottom: 0 }}>
              <code>{error.digest}</code>
            </p>
          )}
        </div>
      </body>
    </html>
  )
}
