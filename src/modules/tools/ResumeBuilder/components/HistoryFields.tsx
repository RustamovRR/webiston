"use client"

import { Button } from "@webiston/ui/primitives/button"
import { Input } from "@webiston/ui/primitives/input"
import { Textarea } from "@webiston/ui/primitives/textarea"
import { Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { useId } from "react"

import { Field, FieldSet } from "@/components/shared/Field"

import type { useResume } from "../hooks/useResume"
import { RowShell } from "./RowShell"
import { TagInput } from "./TagInput"

type Resume = ReturnType<typeof useResume>

/**
 * The repeating half of the form: work, study, skills, languages.
 *
 * Sections start EMPTY rather than with one blank row. A first-time CV writer
 * facing a pre-opened "Ish tajribasi 1" with nothing to put in it reads it as
 * a requirement; an "add" button reads as an offer — and a student with no
 * job history should not have to delete something to say so.
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
  const id = useId()

  return (
    <>
      <FieldSet legend={t("experience.legend")}>
        {data.experience.map((entry, index) => (
          <RowShell
            // biome-ignore lint/suspicious/noArrayIndexKey: rows are an
            // order-stable array the visitor reorders by hand; position is
            // the identity, and a content key would remount on every keypress.
            key={index}
            title={t("experience.row")}
            index={index}
            count={data.experience.length}
            onMove={(by) => moveRow("experience", index, by)}
            onRemove={() => removeRow("experience", index)}
          >
            <Field id={`${id}-exp-role-${index}`} label={t("jobRole")}>
              <Input
                id={`${id}-exp-role-${index}`}
                value={entry.role}
                onChange={(event) =>
                  setRow("experience", index, "role", event.target.value)
                }
                placeholder={t("jobRolePlaceholder")}
                autoComplete="off"
              />
            </Field>
            <Field id={`${id}-exp-company-${index}`} label={t("company")}>
              <Input
                id={`${id}-exp-company-${index}`}
                value={entry.company}
                onChange={(event) =>
                  setRow("experience", index, "company", event.target.value)
                }
                placeholder={t("companyPlaceholder")}
                autoComplete="off"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field id={`${id}-exp-from-${index}`} label={t("from")}>
                <Input
                  id={`${id}-exp-from-${index}`}
                  type="month"
                  value={entry.from}
                  onChange={(event) =>
                    setRow("experience", index, "from", event.target.value)
                  }
                />
              </Field>
              <Field id={`${id}-exp-to-${index}`} label={t("to")}>
                <Input
                  id={`${id}-exp-to-${index}`}
                  type="month"
                  value={entry.to}
                  onChange={(event) =>
                    setRow("experience", index, "to", event.target.value)
                  }
                  disabled={entry.current}
                />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-muted-foreground text-xs">
              <input
                type="checkbox"
                checked={entry.current}
                onChange={(event) =>
                  setRow("experience", index, "current", event.target.checked)
                }
                className="size-4 accent-primary"
              />
              {t("current")}
            </label>
            <Field
              id={`${id}-exp-desc-${index}`}
              label={t("achievements")}
              hint={t("achievementsHint")}
            >
              <Textarea
                id={`${id}-exp-desc-${index}`}
                value={entry.description}
                onChange={(event) =>
                  setRow("experience", index, "description", event.target.value)
                }
                placeholder={t("achievementsPlaceholder")}
                rows={4}
              />
            </Field>
          </RowShell>
        ))}
        <AddButton
          label={t("addExperience")}
          onClick={() => addRow("experience")}
        />
      </FieldSet>

      <FieldSet legend={t("education.legend")}>
        {data.education.map((entry, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: same projection.
          <RowShell
            key={index}
            title={t("education.row")}
            index={index}
            count={data.education.length}
            onMove={(by) => moveRow("education", index, by)}
            onRemove={() => removeRow("education", index)}
          >
            <Field id={`${id}-edu-inst-${index}`} label={t("institution")}>
              <Input
                id={`${id}-edu-inst-${index}`}
                value={entry.institution}
                onChange={(event) =>
                  setRow("education", index, "institution", event.target.value)
                }
                placeholder={t("institutionPlaceholder")}
                autoComplete="off"
              />
            </Field>
            <Field id={`${id}-edu-field-${index}`} label={t("fieldOfStudy")}>
              <Input
                id={`${id}-edu-field-${index}`}
                value={entry.field}
                onChange={(event) =>
                  setRow("education", index, "field", event.target.value)
                }
                placeholder={t("fieldOfStudyPlaceholder")}
                autoComplete="off"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field id={`${id}-edu-from-${index}`} label={t("from")}>
                <Input
                  id={`${id}-edu-from-${index}`}
                  type="month"
                  value={entry.from}
                  onChange={(event) =>
                    setRow("education", index, "from", event.target.value)
                  }
                />
              </Field>
              <Field id={`${id}-edu-to-${index}`} label={t("to")}>
                <Input
                  id={`${id}-edu-to-${index}`}
                  type="month"
                  value={entry.to}
                  onChange={(event) =>
                    setRow("education", index, "to", event.target.value)
                  }
                />
              </Field>
            </div>
          </RowShell>
        ))}
        <AddButton
          label={t("addEducation")}
          onClick={() => addRow("education")}
        />
      </FieldSet>

      <FieldSet legend={t("skills.legend")}>
        <Field id={`${id}-skills`} label={t("skills")} hint={t("skillsHint")}>
          <TagInput
            id={`${id}-skills`}
            values={data.skills}
            onChange={(values) => set("skills", values)}
            placeholder={t("skillsPlaceholder")}
          />
        </Field>
      </FieldSet>

      <FieldSet legend={t("languages.legend")}>
        {data.languages.map((entry, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: same projection.
          <RowShell
            key={index}
            title={t("languages.row")}
            index={index}
            count={data.languages.length}
            onMove={(by) => moveRow("languages", index, by)}
            onRemove={() => removeRow("languages", index)}
          >
            <div className="grid grid-cols-2 gap-3">
              <Field id={`${id}-lang-name-${index}`} label={t("language")}>
                <Input
                  id={`${id}-lang-name-${index}`}
                  value={entry.name}
                  onChange={(event) =>
                    setRow("languages", index, "name", event.target.value)
                  }
                  placeholder={t("languagePlaceholder")}
                  autoComplete="off"
                />
              </Field>
              <Field
                id={`${id}-lang-level-${index}`}
                label={t("level")}
                hint={t("levelHint")}
              >
                <Input
                  id={`${id}-lang-level-${index}`}
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
