import { ShieldAlert } from "lucide-react"
import { getTranslations } from "next-intl/server"

/**
 * What this page is actually demonstrating.
 *
 * Every value on this page was read without asking permission, and together
 * they are a fingerprint — screen size, timezone, language list, core count
 * and colour-scheme preference are precisely the signals a tracker combines to
 * recognise a browser across sites with no cookie at all.
 *
 * A tool that shows you that data and says nothing about it is teaching the
 * wrong lesson, the same way the hash generator's old "password hashing" use
 * case was. It is a Server Component: a warning about JavaScript reading your
 * device should not itself need JavaScript.
 */
export async function PrivacyNote({ locale }: { locale: string }) {
  const t = await getTranslations({
    locale,
    namespace: "DeviceInfoPage.privacy"
  })

  return (
    <section className="mx-auto w-full max-w-[1536px] px-4 pt-6 sm:px-6 lg:px-8">
      <div className="flex gap-3 rounded-xl border border-border bg-muted/40 p-5">
        <ShieldAlert
          size={18}
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-warning"
        />
        <div>
          <h2 className="font-medium text-base text-foreground">
            {t("title")}
          </h2>
          <p className="mt-1 max-w-3xl text-muted-foreground text-sm leading-relaxed">
            {t("body")}
          </p>
        </div>
      </div>
    </section>
  )
}
