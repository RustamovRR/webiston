"use client"

import { isValidHex } from "@/lib/utils"

import { DEFAULT_ACCENT, RESUME_PAPER } from "../constants"
import type { SheetLabels } from "../constants/labels"
import type { ResumeData } from "../types"
import { bulletLines, monthLabel, periodLabel } from "../utils/format"

/**
 * „Zamonaviy" — a coloured sidebar and a main column.
 *
 * For the reader „Klassik" is wrong for: an hh.uz recruiter scanning dozens of
 * CVs, who reads the sidebar for "can this person do the job" and the main
 * column for "where have they done it". The colour is one accent, never two —
 * a CV that looks designed loses to a CV that looks organised.
 *
 * The sidebar is a flex column with a printed background, and that background
 * is the one thing that needs saying about printing it: browsers drop
 * background colours from print by default. The visitor ticks "Background
 * graphics" in the dialog, or gets a white sidebar with the text still
 * perfectly readable — which is why the sidebar's own text is the ink colour
 * on a tint, not white on solid.
 */
export function ZamonaviyTemplate({
  data,
  labels
}: {
  data: ResumeData
  labels: SheetLabels
}) {
  // Guarded rather than trusted: `accent` is a free hex now, and a draft
  // written before that change holds a preset ID. `color: "kok"` is not an
  // error the browser reports — it silently inherits, and the template loses
  // the one colour it has. One check covers both that and a corrupt draft.
  const accent = isValidHex(data.accent) ? data.accent : DEFAULT_ACCENT

  const contacts = [
    data.contact.phone,
    data.contact.email,
    data.contact.city,
    data.contact.telegram,
    data.contact.linkedin
  ]
    .map((value) => value.trim())
    .filter(Boolean)

  const personal = [
    data.personal.birthDate &&
      `${labels.birthDate}: ${monthLabel(data.personal.birthDate.slice(0, 7))}`,
    data.personal.maritalStatus.trim()
  ].filter(Boolean)

  return (
    <div
      // `grow`, not `flex-1`: the sheet is a flex column with a 297mm MINIMUM,
      // so this has to fill a short page (or the sidebar tint stops mid-paper)
      // without a `flex-basis: 0` that would fight a long one.
      className="flex grow gap-0 text-[14px] leading-[1.55]"
      style={{ fontFamily: RESUME_PAPER.sansFamily }}
    >
      {/* Sidebar. `print-color-adjust` asks the browser to keep the tint; it
          honours it in Chrome and Safari when backgrounds are enabled. */}
      <aside
        className="flex w-[34%] shrink-0 flex-col gap-5 p-5"
        style={{
          // Mixed against the PAPER constant, not a literal white: the sheet
          // has exactly one background and the sidebar is a tint of it.
          background: `color-mix(in srgb, ${accent} 12%, ${RESUME_PAPER.background})`,
          printColorAdjust: "exact",
          WebkitPrintColorAdjust: "exact"
        }}
      >
        {data.photo && (
          // biome-ignore lint/performance/noImgElement: a dataURL from the
          // visitor's own disk; next/image optimises remote URLs it can fetch,
          // and this one never leaves the browser.
          <img
            src={data.photo}
            alt=""
            className="h-[38mm] w-full rounded-sm object-cover"
          />
        )}

        {contacts.length > 0 && (
          <SideSection title={labels.contact} accent={accent}>
            <ul className="flex flex-col gap-1 break-words">
              {contacts.map((value) => (
                <li key={value}>{value}</li>
              ))}
            </ul>
          </SideSection>
        )}

        {data.skills.length > 0 && (
          <SideSection title={labels.skills} accent={accent}>
            <ul className="flex flex-col gap-1">
              {data.skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </SideSection>
        )}

        {data.languages.length > 0 && (
          <SideSection title={labels.languages} accent={accent}>
            <ul className="flex flex-col gap-1">
              {data.languages.map((entry) => (
                <li key={entry.id}>
                  {[entry.name, entry.level].filter(Boolean).join(" — ")}
                </li>
              ))}
            </ul>
          </SideSection>
        )}

        {personal.length > 0 && (
          <SideSection title={labels.personal} accent={accent}>
            <ul className="flex flex-col gap-1">
              {personal.map((value) => (
                <li key={String(value)}>{value}</li>
              ))}
            </ul>
          </SideSection>
        )}
      </aside>

      <main className="min-w-0 flex-1 p-6">
        {data.fullName.trim() && (
          <h1
            className="font-bold text-[27px] leading-tight"
            style={{ color: accent }}
          >
            {data.fullName}
          </h1>
        )}
        {data.role.trim() && (
          <p className="mt-0.5 text-[15px] text-[color:inherit] opacity-80">
            {data.role}
          </p>
        )}

        {data.summary.trim() && (
          <MainSection title={labels.summary} accent={accent}>
            <p className="text-justify">{data.summary}</p>
          </MainSection>
        )}

        {data.experience.length > 0 && (
          <MainSection title={labels.experience} accent={accent}>
            {data.experience.map((entry) => (
              <article key={entry.id} className="mt-3 first:mt-0">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-semibold">
                    {entry.role || entry.company}
                  </h3>
                  <span className="shrink-0 text-[12px] opacity-70">
                    {periodLabel(
                      entry.from,
                      entry.to,
                      entry.current,
                      labels.present
                    )}
                  </span>
                </div>
                {entry.role.trim() && entry.company.trim() && (
                  <p className="text-[13px] opacity-80">{entry.company}</p>
                )}
                {bulletLines(entry.description).length > 0 && (
                  <ul className="mt-1 list-disc pl-4">
                    {bulletLines(entry.description).map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </MainSection>
        )}

        {data.education.length > 0 && (
          <MainSection title={labels.education} accent={accent}>
            {data.education.map((entry) => (
              <article key={entry.id} className="mt-2 first:mt-0">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-semibold">{entry.institution}</h3>
                  <span className="shrink-0 text-[12px] opacity-70">
                    {periodLabel(entry.from, entry.to, false, "")}
                  </span>
                </div>
                {entry.field.trim() && (
                  <p className="text-[13px] opacity-80">{entry.field}</p>
                )}
              </article>
            ))}
          </MainSection>
        )}
      </main>
    </div>
  )
}

function SideSection({
  title,
  accent,
  children
}: {
  title: string
  accent: string
  children: React.ReactNode
}) {
  return (
    <section className="text-[12.5px]">
      <h2
        className="mb-1.5 font-bold text-[11px] uppercase tracking-[0.12em]"
        style={{ color: accent }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

function MainSection({
  title,
  accent,
  children
}: {
  title: string
  accent: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-5">
      <h2
        className="mb-2 border-b pb-1 font-bold text-[12px] uppercase tracking-[0.12em]"
        style={{ color: accent, borderColor: accent }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}
