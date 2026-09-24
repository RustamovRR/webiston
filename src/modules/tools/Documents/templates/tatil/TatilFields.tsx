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
import { useLocale, useTranslations } from "next-intl"
import { useId } from "react"

import { Field, FieldSet } from "@/components/shared/Field"
import type { DocumentFieldsProps } from "../../types"
import { calendarLocale, documentDate } from "../../utils/locale"
import { leavePeriod } from "./compose"
import { LEAVE_KINDS, type LeaveKind, type TatilData } from "./constants"

/**
 * The ta'til arizasi's fields, in the order the finished document reads them:
 * who it goes to, who it is from, then the leave itself.
 *
 * What is not a plain form here is the line under the dates. It says when the
 * leave ENDS, and names every holiday inside it that moved that day (MK 221) —
 * the arithmetic an HR office does on receipt and the visitor usually does
 * not. That line is the tool; everything else is a form.
 */
export function TatilFields({
  data,
  errors,
  update
}: DocumentFieldsProps<TatilData>) {
  const t = useTranslations("TatilPage.form")
  const tShared = useTranslations("DocumentsShared.form")
  const locale = useLocale()
  const tErrors = useTranslations("TatilPage.errors")
  const id = useId()

  const messageFor = (key?: string) => (key ? tErrors(key) : undefined)

  const setField = <K extends keyof TatilData>(key: K, value: TatilData[K]) =>
    update((current) => ({ ...current, [key]: value }))

  const period = leavePeriod(data)

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
        <Field id={`${id}-kind`} label={t("kind")} hint={t("kindHint")}>
          <Select
            value={data.kind}
            onValueChange={(value) => setField("kind", value as LeaveKind)}
          >
            <SelectTrigger id={`${id}-kind`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEAVE_KINDS.map((kind) => (
                <SelectItem key={kind} value={kind}>
                  {t(`kinds.${kind}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field
            id={`${id}-start`}
            label={t("startDate")}
            error={messageFor(errors.startDate)}
          >
            <DatePicker
              id={`${id}-start`}
              value={data.startDate}
              onChange={(value) => setField("startDate", value)}
              placeholder={tShared("datePlaceholder")}
              format={documentDate}
              localeCode={calendarLocale(locale)}
              aria-invalid={Boolean(errors.startDate)}
            />
          </Field>
          <Field
            id={`${id}-days`}
            label={t("days")}
            error={messageFor(errors.days)}
            hint={t(data.kind === "yillik" ? "daysHint" : "daysHintUnpaid")}
          >
            <Input
              id={`${id}-days`}
              value={data.days}
              onChange={(event) => setField("days", event.target.value)}
              inputMode="numeric"
              aria-invalid={Boolean(errors.days)}
              autoComplete="off"
            />
          </Field>
        </div>

        {/* The computed end, in words — live, so changing the start date or
            the length shows its effect before the visitor reaches the paper.
            `aria-live` because it changes in response to input elsewhere. */}
        <p className="text-muted-foreground text-xs" aria-live="polite">
          {/* An unannounced hayit can only move the end LATER, so when one
              may be missing the date is a lower bound — said as "taxminiy",
              never stated as the fact the paper itself declines to print. */}
          {period
            ? t(period.unknownYear === null ? "period" : "periodTentative", {
                end: documentDate(period.end)
              })
            : t("periodEmpty")}
          {period && period.holidays.length > 0 && (
            <>
              {" "}
              {t("periodHolidays", {
                count: period.holidays.length,
                list: period.holidays
                  .map(
                    (holiday) =>
                      `${documentDate(holiday.date)}, ${t(
                        `holidays.${holiday.id}`
                      )}`
                  )
                  // Semicolons between items: each one already has a comma.
                  .join("; ")
              })}
            </>
          )}
          {period && period.unknownYear !== null && (
            <> {t("periodUnknownHayit", { year: period.unknownYear })}</>
          )}
        </p>

        {data.kind === "haqsiz" && (
          <Field
            id={`${id}-reason`}
            label={t("reason")}
            hint={t("reasonHint")}
            error={messageFor(errors.reason)}
          >
            <Input
              id={`${id}-reason`}
              value={data.reason}
              onChange={(event) => setField("reason", event.target.value)}
              placeholder={t("reasonPlaceholder")}
              aria-invalid={Boolean(errors.reason)}
              autoComplete="off"
            />
          </Field>
        )}

        <Field id={`${id}-application`} label={t("applicationDate")}>
          <DatePicker
            id={`${id}-application`}
            value={data.applicationDate}
            onChange={(value) => setField("applicationDate", value)}
            placeholder={tShared("datePlaceholder")}
            format={documentDate}
            localeCode={calendarLocale(locale)}
          />
        </Field>
      </FieldSet>
    </div>
  )
}
