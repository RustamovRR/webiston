"use client"

import { Input } from "@webiston/ui/primitives/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@webiston/ui/primitives/select"
import { useTranslations } from "next-intl"
import { useId } from "react"

import { Field, FieldSet } from "../../components/Field"
import type { DocumentFieldsProps } from "../../types"
import { formatUzbekDate } from "../../utils/dates"
import { earliestRelease } from "./compose"
import {
  type ArizaData,
  NOTICE_CATEGORIES,
  type NoticeCategory
} from "./constants"

/**
 * The ariza's fields, in the order the finished document reads them: who it
 * goes to, who it is from, then the terms of leaving.
 *
 * The one field that is not a plain input is the release date. It is OPTIONAL,
 * and left empty the document uses the earliest lawful day — so the hint under
 * it shows that day, computed from the notice period the chosen category owes
 * under MK 160. That hint is the tool; everything else is a form.
 */
export function ArizaFields({
  data,
  errors,
  update
}: DocumentFieldsProps<ArizaData>) {
  const t = useTranslations("ArizaPage.form")
  const tErrors = useTranslations("ArizaPage.errors")
  const id = useId()

  const messageFor = (key?: string) => (key ? tErrors(key) : undefined)

  const setField = <K extends keyof ArizaData>(key: K, value: ArizaData[K]) =>
    update((current) => ({ ...current, [key]: value }))

  const earliest = earliestRelease(data.applicationDate, data.category)
  const earliestLabel = formatUzbekDate(earliest)

  return (
    <div className="flex flex-col gap-5">
      <FieldSet legend={t("employer.legend")}>
        <Field
          id={`${id}-organisation`}
          label={t("organisation")}
          error={messageFor(errors.organisation)}
        >
          <Input
            id={`${id}-organisation`}
            value={data.organisation}
            onChange={(event) => setField("organisation", event.target.value)}
            placeholder={t("organisationPlaceholder")}
            aria-invalid={Boolean(errors.organisation)}
            autoComplete="off"
          />
        </Field>
        <Field
          id={`${id}-manager-role`}
          label={t("managerRole")}
          error={messageFor(errors.managerRole)}
        >
          <Input
            id={`${id}-manager-role`}
            value={data.managerRole}
            onChange={(event) => setField("managerRole", event.target.value)}
            placeholder={t("managerRolePlaceholder")}
            aria-invalid={Boolean(errors.managerRole)}
            autoComplete="off"
          />
        </Field>
        <Field
          id={`${id}-manager-name`}
          label={t("managerName")}
          error={messageFor(errors.managerName)}
        >
          <Input
            id={`${id}-manager-name`}
            value={data.managerName}
            onChange={(event) => setField("managerName", event.target.value)}
            placeholder={t("namePlaceholder")}
            aria-invalid={Boolean(errors.managerName)}
            autoComplete="off"
          />
        </Field>
      </FieldSet>

      <FieldSet legend={t("employee.legend")}>
        <Field
          id={`${id}-employee-name`}
          label={t("employeeName")}
          error={messageFor(errors.employeeName)}
        >
          <Input
            id={`${id}-employee-name`}
            value={data.employeeName}
            onChange={(event) => setField("employeeName", event.target.value)}
            placeholder={t("namePlaceholder")}
            aria-invalid={Boolean(errors.employeeName)}
            autoComplete="off"
          />
        </Field>
        <Field
          id={`${id}-position`}
          label={t("position")}
          error={messageFor(errors.position)}
        >
          <Input
            id={`${id}-position`}
            value={data.position}
            onChange={(event) => setField("position", event.target.value)}
            placeholder={t("positionPlaceholder")}
            aria-invalid={Boolean(errors.position)}
            autoComplete="off"
          />
        </Field>
      </FieldSet>

      <FieldSet legend={t("terms.legend")}>
        <Field
          id={`${id}-category`}
          label={t("category")}
          hint={t("categoryHint")}
        >
          {/* The notice period is not one number. MK 160 gives five, by the
              kind of employee, and picking the wrong one is how an ariza comes
              back for rewriting. */}
          <Select
            value={data.category}
            onValueChange={(value) =>
              setField("category", value as NoticeCategory)
            }
          >
            <SelectTrigger id={`${id}-category`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NOTICE_CATEGORIES.map((entry) => (
                <SelectItem key={entry.id} value={entry.id}>
                  {t(`categories.${entry.id}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field id={`${id}-application`} label={t("applicationDate")}>
            <Input
              id={`${id}-application`}
              type="date"
              value={data.applicationDate}
              onChange={(event) =>
                setField("applicationDate", event.target.value)
              }
            />
          </Field>
          <Field
            id={`${id}-release`}
            label={t("releaseDate")}
            error={messageFor(errors.releaseDate)}
            hint={
              earliestLabel
                ? t("releaseHint", { date: earliestLabel })
                : t("releaseHintEmpty")
            }
          >
            <Input
              id={`${id}-release`}
              type="date"
              value={data.releaseDate}
              min={data.applicationDate || undefined}
              onChange={(event) => setField("releaseDate", event.target.value)}
              aria-invalid={Boolean(errors.releaseDate)}
            />
          </Field>
        </div>

        <Field id={`${id}-reason`} label={t("reason")} hint={t("reasonHint")}>
          <Input
            id={`${id}-reason`}
            value={data.reason}
            onChange={(event) => setField("reason", event.target.value)}
            placeholder={t("reasonPlaceholder")}
            autoComplete="off"
          />
        </Field>
      </FieldSet>
    </div>
  )
}
