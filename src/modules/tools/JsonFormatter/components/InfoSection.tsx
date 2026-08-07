import { useTranslations } from "next-intl"

/**
 * The explanatory block under the tool. Kept, because it is the only indexable
 * prose on the page and this route has to rank for something.
 *
 * The two code examples now come from the message bundle. They were hardcoded
 * here as `"name": "John", "city": "New York"` while
 * `Info.formatExample.simpleJson` and `nestedJson` sat translated and unused in
 * BOTH locales — an English placeholder shipped to an Uzbek audience.
 *
 * They are read with `t.raw`, and that is required rather than a shortcut: a
 * message goes through ICU MessageFormat, where `{` opens an argument, so a
 * JSON snippet is a malformed message. Reading it normally threw
 * `INVALID_MESSAGE: MALFORMED_ARGUMENT` and rendered the key path instead.
 * `raw` skips the parser, which is exactly right for a literal code sample.
 */

/** Kicker + label, the same section identity the rest of the site uses. */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-5 flex items-center gap-2.5 font-medium text-base text-foreground">
      <span
        aria-hidden="true"
        className="size-[6px] shrink-0 rounded-[2px] bg-primary"
      />
      {children}
    </h2>
  )
}

function Example({ title, code }: { title: string; code: string }) {
  return (
    // `min-w-0`: a grid item's default `min-width: auto` lets the scrolling
    // `<pre>` inside push the track wider than the column. Measured at 375px,
    // the page scrolled 377 — two pixels, but a sideways-scrolling page all
    // the same.
    <div className="min-w-0 rounded-lg border border-border bg-muted/40 p-4">
      <div className="mb-3 font-mono text-[11px] text-muted-foreground">
        {title}
      </div>
      <pre className="overflow-x-auto rounded-md bg-background p-3 font-mono text-foreground text-sm">
        <code>{code}</code>
      </pre>
    </div>
  )
}

export function InfoSection() {
  const t = useTranslations("JsonFormatterPage.Info")

  return (
    <div className="mt-10 space-y-6">
      <section className="rounded-xl border border-border bg-card p-6">
        <SectionHeading>{t("formatExample.title")}</SectionHeading>
        <div className="grid gap-4 md:grid-cols-2">
          <Example
            title={t("formatExample.simpleObject")}
            code={String(t.raw("formatExample.simpleJson"))}
          />
          <Example
            title={t("formatExample.nestedObject")}
            code={String(t.raw("formatExample.nestedJson"))}
          />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <SectionHeading>{t("title")}</SectionHeading>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <h3 className="font-medium text-foreground text-sm">
              {t("whatIsJson.title")}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t("whatIsJson.description")}
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-foreground text-sm">
              {t("features.title")}
            </h3>
            <ul className="space-y-1 text-muted-foreground text-sm leading-relaxed">
              <li>{t("features.feature1")}</li>
              <li>{t("features.feature2")}</li>
              <li>{t("features.feature3")}</li>
              <li>{t("features.feature4")}</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-foreground text-sm">
              {t("usage.title")}
            </h3>
            <ul className="space-y-1 text-muted-foreground text-sm leading-relaxed">
              <li>{t("usage.usage1")}</li>
              <li>{t("usage.usage2")}</li>
              <li>{t("usage.usage3")}</li>
              <li>{t("usage.usage4")}</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
