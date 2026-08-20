"use client"

import { MonthPicker } from "@webiston/ui/composites/MonthPicker"
import { Button } from "@webiston/ui/primitives/button"
import { Input } from "@webiston/ui/primitives/input"
import { Textarea } from "@webiston/ui/primitives/textarea"
import { Plus } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useId } from "react"

import { Field, FieldSet } from "@/components/shared/Field"

import type { useResume } from "../hooks/useResume"
import { monthLabel } from "../utils/format"
import { RowList, RowShell } from "./RowShell"
import { TagInput } from "./TagInput"

type Resume = ReturnType<typeof useResume>

/**
 * The repeating half of the form: work, study, skills, languages.
 *
 * Sections start EMPTY rather than with one blank row. A first-time CV writer
 * facing a pre-opened "Ish tajribasi 1" with nothing to put in it reads it as
 * a requirement; an "add" button reads as an offer — and a student with no
 * job history should not have to delete something to say so.
 *
 * Dates are the suite's `MonthPicker`, never `<input type="month">`: the
 * native control is a different widget in every browser, ignores the design
 * system, and in Safari is a bare text box with no picker at all.
 */
export function HistoryFields({
  data,
  setRow,
  addRow,
  removeRow,
  moveRow,
  set
}: Pick<
  Resume,
  "data" | "setRow" | "addRow" | "removeRow" | "moveRow" | "set"
>) {
  const t = useTranslations("ResumePage.form")
  const locale = useLocale()
  const id = useId()

  return (
    <>
      <FieldSet legend={t("experience.legend")}>
        <RowList>
          {data.experience.map((entry, index) => (
            <RowShell
              key={entry.id}
              title={t("experience.row")}
              summary={[entry.role, entry.company].filter(Boolean).join(" · ")}
              index={index}
              count={data.experience.length}
              onMove={(by) => moveRow("experience", index, by)}
              onRemove={() => removeRow("experience", index)}
            >
              <Field id={`${id}-role-${entry.id}`} label={t("jobRole")}>
                <Input
                  id={`${id}-role-${entry.id}`}
                  value={entry.role}
                  onChange={(event) =>
                    setRow("experience", index, "role", event.target.value)
                  }
                  placeholder={t("jobRolePlaceholder")}
                  autoComplete="off"
                />
              </Field>
              <Field id={`${id}-company-${entry.id}`} label={t("company")}>
                <Input
                  id={`${id}-company-${entry.id}`}
                  value={entry.company}
                  onChange={(event) =>
                    setRow("experience", index, "company", event.target.value)
                  }
                  placeholder={t("companyPlaceholder")}
                  autoComplete="off"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field id={`${id}-from-${entry.id}`} label={t("from")}>
                  <MonthPicker
                    id={`${id}-from-${entry.id}`}
                    value={entry.from}
                    onChange={(value) =>
                      setRow("experience", index, "from", value)
                    }
                    placeholder={t("monthPlaceholder")}
                    format={monthLabel}
                    locale={locale}
                    max={entry.current ? undefined : entry.to || undefined}
                  />
                </Field>
                <Field id={`${id}-to-${entry.id}`} label={t("to")}>
                  <MonthPicker
                    id={`${id}-to-${entry.id}`}
                    value={entry.to}
                    onChange={(value) =>
                      setRow("experience", index, "to", value)
                    }
                    placeholder={t("monthPlaceholder")}
                    format={monthLabel}
                    locale={locale}
                    // A job cannot end before it started; the picker simply
                    // does not offer those months.
                    min={entry.from || undefined}
                    disabled={entry.current}
                  />
                </Field>
              </div>
              <label className="flex w-fit cursor-pointer items-center gap-2 text-muted-foreground text-xs">
                <input
                  type="checkbox"
                  checked={entry.current}
                  onChange={(event) => {
                    // Clearing the end date is the point of the checkbox —
                    // leaving a stale one behind would print a contradiction.
                    if (event.target.checked && entry.to) {
                      setRow("experience", index, "to", "")
                    }
                    setRow("experience", index, "current", event.target.checked)
                  }}
                  className="size-4 accent-primary"
                />
                {t("current")}
              </label>
              <Field
                id={`${id}-desc-${entry.id}`}
                label={t("achievements")}
                hint={t("achievementsHint")}
              >
                <Textarea
                  id={`${id}-desc-${entry.id}`}
                  value={entry.description}
                  onChange={(event) =>
                    setRow(
                      "experience",
                      index,
                      "description",
                      event.target.value
                    )
                  }
                  placeholder={t("achievementsPlaceholder")}
                  rows={4}
                />
              </Field>
            </RowShell>
          ))}
        </RowList>
        <AddButton
          label={t("addExperience")}
          onClick={() => addRow("experience")}
        />
      </FieldSet>

      <FieldSet legend={t("education.legend")}>
        <RowList>
          {data.education.map((entry, index) => (
            <RowShell
              key={entry.id}
              title={t("education.row")}
              summary={[entry.institution, entry.field]
                .filter(Boolean)
                .join(" · ")}
              index={index}
              count={data.education.length}
              onMove={(by) => moveRow("education", index, by)}
              onRemove={() => removeRow("education", index)}
            >
              <Field id={`${id}-inst-${entry.id}`} label={t("institution")}>
                <Input
                  id={`${id}-inst-${entry.id}`}
                  value={entry.institution}
                  onChange={(event) =>
                    setRow(
                      "education",
                      index,
                      "institution",
                      event.target.value
                    )
                  }
                  placeholder={t("institutionPlaceholder")}
                  autoComplete="off"
                />
              </Field>
              <Field id={`${id}-field-${entry.id}`} label={t("fieldOfStudy")}>
                <Input
                  id={`${id}-field-${entry.id}`}
                  value={entry.field}
                  onChange={(event) =>
                    setRow("education", index, "field", event.target.value)
                  }
                  placeholder={t("fieldOfStudyPlaceholder")}
                  autoComplete="off"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field id={`${id}-edufrom-${entry.id}`} label={t("from")}>
                  <MonthPicker
                    id={`${id}-edufrom-${entry.id}`}
                    value={entry.from}
                    onChange={(value) =>
                      setRow("education", index, "from", value)
                    }
                    placeholder={t("monthPlaceholder")}
                    format={monthLabel}
                    locale={locale}
                    max={entry.to || undefined}
                  />
                </Field>
                <Field id={`${id}-eduto-${entry.id}`} label={t("to")}>
                  <MonthPicker
                    id={`${id}-eduto-${entry.id}`}
                    value={entry.to}
                    onChange={(value) =>
                      setRow("education", index, "to", value)
                    }
                    placeholder={t("monthPlaceholder")}
                    format={monthLabel}
                    locale={locale}
                    min={entry.from || undefined}
                  />
                </Field>
              </div>
            </RowShell>
          ))}
        </RowList>
        <AddButton
          label={t("addEducation")}
          onClick={() => addRow("education")}
        />
      </FieldSet>

      {/* No `Field` here, and that is the fix for a bug that shipped VISIBLY:
          `t("skills")` resolved to an object (`skills.legend` is nested), so
          next-intl threw INSUFFICIENT_PATH and the form rendered the literal
          text "ResumePage.form.skills" as this field's label. Even correct it
          was noise — one control in a section whose legend already names it —
          so the label moved onto the input as its accessible name. */}
      <FieldSet legend={t("skills.legend")}>
        <TagInput
          id={`${id}-skills`}
          label={t("skills.legend")}
          values={data.skills}
          onChange={(values) => set("skills", values)}
          placeholder={t("skillsPlaceholder")}
        />
        <p className="text-muted-foreground text-xs">{t("skillsHint")}</p>
      </FieldSet>

      <FieldSet legend={t("languages.legend")}>
        <RowList>
          {data.languages.map((entry, index) => (
            <RowShell
              key={entry.id}
              title={t("languages.row")}
              summary={[entry.name, entry.level].filter(Boolean).join(" — ")}
              index={index}
              count={data.languages.length}
              onMove={(by) => moveRow("languages", index, by)}
              onRemove={() => removeRow("languages", index)}
            >
              <div className="grid grid-cols-2 gap-3">
                <Field id={`${id}-lang-${entry.id}`} label={t("language")}>
                  <Input
                    id={`${id}-lang-${entry.id}`}
                    value={entry.name}
                    onChange={(event) =>
                      setRow("languages", index, "name", event.target.value)
                    }
                    placeholder={t("languagePlaceholder")}
                    autoComplete="off"
                  />
                </Field>
                <Field
                  id={`${id}-level-${entry.id}`}
                  label={t("level")}
                  hint={t("levelHint")}
                >
                  <Input
                    id={`${id}-level-${entry.id}`}
                    value={entry.level}
                    onChange={(event) =>
                      setRow("languages", index, "level", event.target.value)
                    }
                    placeholder={t("levelPlaceholder")}
                    autoComplete="off"
                  />
                </Field>
              </div>
            </RowShell>
          ))}
        </RowList>
        <AddButton
          label={t("addLanguage")}
          onClick={() => addRow("languages")}
        />
      </FieldSet>
    </>
  )
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="self-start"
    >
      <Plus className="size-4" aria-hidden="true" />
      {label}
    </Button>
  )
}
