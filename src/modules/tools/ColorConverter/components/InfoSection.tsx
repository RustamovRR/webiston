"use client"

import { useTranslations } from "next-intl"

/**
 * The reference section under the tool: format examples and what each format
 * is for. Example swatches are colour DATA (the documented token exception)
 * and are painted from their own hex values — the code sample next to a
 * swatch should be the literal truth about it.
 */

const EXAMPLE_COLORS = ["#ef4444", "#3b82f6", "#10b981"] as const

const EXAMPLE_FORMATS: ReadonlyArray<{
  key: "hex" | "rgb" | "hsl"
  values: readonly string[]
}> = [
  { key: "hex", values: ["#EF4444", "#3B82F6", "#10B981"] },
  {
    key: "rgb",
    values: ["rgb(239, 68, 68)", "rgb(59, 130, 246)", "rgb(16, 185, 129)"]
  },
  {
    key: "hsl",
    values: ["hsl(0, 84%, 60%)", "hsl(217, 91%, 60%)", "hsl(160, 84%, 39%)"]
  }
]

const ABOUT_KEYS = ["hex", "rgb", "hsl"] as const

export function InfoSection() {
  const t = useTranslations("ColorConverterPage.Info")

  return (
    <>
      <section className="mt-8 rounded-xl border border-border bg-card p-6">
        <h3 className="mb-5 font-semibold text-foreground text-lg">
          {t("examples.title")}
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          {EXAMPLE_FORMATS.map((format) => (
            <div
              key={format.key}
              className="rounded-lg border border-border bg-muted/40 p-4"
            >
              <div className="mb-3 font-medium text-muted-foreground text-xs">
                {t(`examples.${format.key}`)}
              </div>
              <div className="space-y-2">
                {format.values.map((value, index) => (
                  <div key={value} className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="size-4 shrink-0 rounded"
                      style={{ backgroundColor: EXAMPLE_COLORS[index] }}
                    />
                    <code className="font-mono text-foreground text-sm">
                      {value}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-border bg-card p-6">
        <h3 className="mb-5 font-semibold text-foreground text-lg">
          {t("about.title")}
        </h3>
        <div className="grid gap-6 md:grid-cols-3">
          {ABOUT_KEYS.map((key) => (
            <div key={key} className="space-y-2.5">
              <h4 className="font-semibold text-foreground text-sm">
                {t(`about.${key}.title`)}
              </h4>
              <ul className="space-y-1.5 text-muted-foreground text-sm leading-relaxed">
                <li>{t(`about.${key}.desc1`)}</li>
                <li>{t(`about.${key}.desc2`)}</li>
                <li>{t(`about.${key}.desc3`)}</li>
                <li>{t(`about.${key}.desc4`)}</li>
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
