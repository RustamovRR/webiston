"use client"

import { DatePicker } from "@webiston/ui/composites/DatePicker"
import { Input } from "@webiston/ui/primitives/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@webiston/ui/primitives/select"
import { Textarea } from "@webiston/ui/primitives/textarea"
import { useLocale, useTranslations } from "next-intl"
import { useId } from "react"

import { Field, FieldSet } from "../../components/Field"
import type { DocumentFieldsProps } from "../../types"
import { calendarLocale, documentDate } from "../../utils/locale"
import { STANCES, type Stance, type TushuntirishData } from "./constants"

/**
 * The note's fields, in the order the finished document reads them: who it
 * goes to, who it is from, then what happened and what the writer says about
 * it.
 *
 * The field that is not a plain input is the STANCE — the closing position.
 * It sits last because it is the conclusion, and it is a select rather than
 * free text because the three sentences are the ones that hold up: people
 * copy a template that admits everything without noticing they had a choice.
 */
export function TushuntirishFields({
  data,
  errors,
  update
}: DocumentFieldsProps<TushuntirishData>) {
  const t = useTranslations("TushuntirishPage.form")
  const tShared = useTranslations("DocumentsShared.form")
  const locale = useLocale()
  const tErrors = useTranslations("TushuntirishPage.errors")
  const id = useId()

  const messageFor = (key?: string) => (key ? tErrors(key) : undefined)

  const setField = <K extends keyof TushuntirishData>(
    key: K,
    value: TushuntirishData[K]
  ) => update((current) => ({ ...current, [key]: value }))

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

      <FieldSet legend={t("incident.legend")}>
        <div className="grid grid-cols-2 gap-3">
          <Field id={`${id}-incident-date`} label={t("incidentDate")}>
            <DatePicker
              id={`${id}-incident-date`}
              value={data.incidentDate}
              onChange={(value) => setField("incidentDate", value)}
              placeholder={tShared("datePlaceholder")}
              format={documentDate}
              localeCode={calendarLocale(locale)}
            />
          </Field>
          <Field
            id={`${id}-document-date`}
            label={t("documentDate")}
            error={messageFor(errors.documentDate)}
            hint={t("documentDateHint")}
          >
            <DatePicker
              id={`${id}-document-date`}
              value={data.documentDate}
              onChange={(value) => setField("documentDate", value)}
              placeholder={tShared("datePlaceholder")}
              format={documentDate}
              localeCode={calendarLocale(locale)}
              min={data.incidentDate || undefined}
              aria-invalid={Boolean(errors.documentDate)}
            />
          </Field>
        </div>

        <Field
          id={`${id}-subject`}
          label={t("subject")}
          hint={t("subjectHint")}
          error={messageFor(errors.subject)}
        >
          <Input
            id={`${id}-subject`}
            value={data.subject}
            onChange={(event) => setField("subject", event.target.value)}
            placeholder={t("subjectPlaceholder")}
            aria-invalid={Boolean(errors.subject)}
            autoComplete="off"
          />
        </Field>

        <Field
          id={`${id}-explanation`}
          label={t("explanation")}
          hint={t("explanationHint")}
          error={messageFor(errors.explanation)}
        >
          {/* A textarea, not an input: this is the field the document is FOR,
              and a new line here becomes a new paragraph on the paper. */}
          <Textarea
            id={`${id}-explanation`}
            value={data.explanation}
            onChange={(event) => setField("explanation", event.target.value)}
            placeholder={t("explanationPlaceholder")}
            aria-invalid={Boolean(errors.explanation)}
            rows={6}
          />
        </Field>

        <Field id={`${id}-stance`} label={t("stance")} hint={t("stanceHint")}>
          <Select
            value={data.stance}
            onValueChange={(value) => setField("stance", value as Stance)}
          >
            <SelectTrigger id={`${id}-stance`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STANCES.map((entry) => (
                <SelectItem key={entry.id} value={entry.id}>
                  {t(`stances.${entry.id}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </FieldSet>
    </div>
  )
}
