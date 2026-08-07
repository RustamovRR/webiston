import { useTranslations } from "next-intl"

/**
 * The explanatory prose under the tool — kept for the same reason the JSON
 * formatter keeps its own: it is the page's indexable content. Restyled onto
 * the section identity the rest of the site uses (kicker + label); the twelve
 * differently-coloured bullet dots — six palette hues, each meaning nothing —
 * are now one neutral dot.
 */

const RULES = ["rule1", "rule2", "rule3", "rule4", "rule5", "rule6"] as const
const TIPS = ["tip1", "tip2", "tip3", "tip4", "tip5"] as const
const TYPES = ["random", "memorable", "strong"] as const

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

export function InfoSection() {
  const t = useTranslations("PasswordGeneratorPage.InfoSection")

  return (
    <section className="mt-10 rounded-xl border border-border bg-card p-6">
      <SectionHeading>{t("title")}</SectionHeading>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-3 font-medium text-foreground text-sm">
            {t("securityRulesTitle")}
          </h3>
          <ul className="space-y-2 text-muted-foreground text-sm leading-relaxed">
            {RULES.map((rule) => (
              <li key={rule} className="flex items-start gap-2.5">
                <span
                  aria-hidden="true"
                  className="mt-2 size-1 shrink-0 rounded-full bg-border-strong"
                />
                <span>
                  <strong className="font-medium text-foreground">
                    {t(`${rule}Title`)}
                  </strong>{" "}
                  {t(`${rule}Desc`)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 font-medium text-foreground text-sm">
            {t("professionalTipsTitle")}
          </h3>
          <ul className="space-y-2 text-muted-foreground text-sm leading-relaxed">
            {TIPS.map((tip) => (
              <li key={tip} className="flex items-start gap-2.5">
                <span
                  aria-hidden="true"
                  className="mt-2 size-1 shrink-0 rounded-full bg-border-strong"
                />
                {t(tip)}
              </li>
            ))}
          </ul>

          <p className="mt-4 rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success">
            <strong className="font-medium">{t("recommendation")}</strong>{" "}
            {t("recommendationText")}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {TYPES.map((type) => (
          <div
            key={type}
            className="rounded-lg border border-border bg-muted/40 p-4"
          >
            <div className="mb-1.5 font-medium text-foreground text-sm">
              {t(`${type}Title`)}
            </div>
            <div className="text-muted-foreground text-sm leading-relaxed">
              {t(`${type}Desc`)}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
