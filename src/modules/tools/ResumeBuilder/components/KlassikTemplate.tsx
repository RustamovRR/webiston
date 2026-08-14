"use client"

import { useTranslations } from "next-intl"

import type { ResumeData } from "../types"
import { bulletLines, monthLabel, periodLabel } from "../utils/format"

/**
 * „Klassik" — one column, serif, thin rules.
 *
 * Built for the reader it is aimed at: a state organisation or a traditional
 * employer, where a sidebar with a colour block reads as a design exercise
 * and a reverse-chronological single column reads as a CV. The local
 * conventions the research found (photo top-right, birth date) are HERE and
 * optional — an empty field renders nothing at all, so the same template
 * serves someone who would rather not state their age.
 *
 * Every heading comes from the DOCUMENT's language, not the interface's:
 * a visitor reading the site in Russian may well be writing an Uzbek CV.
 */
export function KlassikTemplate({ data }: { data: ResumeData }) {
  const t = useTranslations("ResumePage.sheet")

  const hasPersonal = data.personal.birthDate || data.personal.maritalStatus
  const contactLine = [
    data.contact.phone,
    data.contact.email,
    data.contact.city,
    data.contact.telegram,
    data.contact.linkedin,
    data.contact.website
  ]
    .map((value) => value.trim())
    .filter(Boolean)

  return (
    <div className="text-[15px] leading-[1.6]">
      {/* Header: name and target role carry the page; the photo is optional
          and sits top-right, which is where an Uzbek employer looks for it. */}
      <header className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          {data.fullName.trim() && (
            <h1 className="font-bold text-[26px] leading-tight tracking-[0.01em]">
              {data.fullName}
            </h1>
          )}
          {data.role.trim() && (
            <p className="mt-1 text-[15px] italic">{data.role}</p>
          )}
          {contactLine.length > 0 && (
            <p className="mt-2 text-[13px] leading-[1.7]">
              {contactLine.join("  ·  ")}
            </p>
          )}
          {hasPersonal && (
            <p className="mt-1 text-[13px]">
              {[
                data.personal.birthDate &&
                  `${t("birthDate")}: ${monthLabel(data.personal.birthDate.slice(0, 7))}`,
                data.personal.maritalStatus.trim()
              ]
                .filter(Boolean)
                .join("  ·  ")}
            </p>
          )}
        </div>
        {data.photo && (
          // biome-ignore lint/performance/noImgElement: a dataURL from the
          // visitor's own disk; next/image optimises remote URLs it can fetch,
          // and this one never leaves the browser.
          <img
            src={data.photo}
            alt=""
            className="h-[35mm] w-[28mm] shrink-0 object-cover"
          />
        )}
      </header>

      {data.summary.trim() && (
        <Section title={t("summary")}>
          <p className="text-justify">{data.summary}</p>
        </Section>
      )}

      {data.experience.length > 0 && (
        <Section title={t("experience")}>
          {data.experience.map((entry, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: rows are an
            // order-stable projection of the form's own array; position IS
            // the identity here.
            <article key={index} className="mt-3 first:mt-0">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-bold">{entry.role || entry.company}</h3>
                <span className="shrink-0 text-[13px]">
                  {periodLabel(
                    entry.from,
                    entry.to,
                    entry.current,
                    t("present")
                  )}
                </span>
              </div>
              {entry.role.trim() && entry.company.trim() && (
                <p className="text-[14px] italic">{entry.company}</p>
              )}
              {bulletLines(entry.description).length > 0 && (
                <ul className="mt-1 list-disc pl-5">
                  {bulletLines(entry.description).map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </Section>
      )}

      {data.education.length > 0 && (
        <Section title={t("education")}>
          {data.education.map((entry, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: same projection.
            <article key={index} className="mt-2 first:mt-0">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-bold">{entry.institution}</h3>
                <span className="shrink-0 text-[13px]">
                  {periodLabel(entry.from, entry.to, false, "")}
                </span>
              </div>
              {entry.field.trim() && (
                <p className="text-[14px] italic">{entry.field}</p>
              )}
            </article>
          ))}
        </Section>
      )}

      {data.skills.length > 0 && (
        <Section title={t("skills")}>
          <p>{data.skills.join("  ·  ")}</p>
        </Section>
      )}

      {data.languages.length > 0 && (
        <Section title={t("languages")}>
          <p>
            {data.languages
              .map((entry) =>
                [entry.name, entry.level].filter(Boolean).join(" — ")
              )
              .join("  ·  ")}
          </p>
        </Section>
      )}
    </div>
  )
}

/** A titled block with the hairline rule that gives this template its face. */
function Section({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-5">
      <h2 className="border-current border-b pb-1 font-bold text-[13px] uppercase tracking-[0.14em]">
        {title}
      </h2>
      <div className="mt-2">{children}</div>
    </section>
  )
}
