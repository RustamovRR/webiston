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

import { Field, FieldSet } from "../../components/Field"
import type { DocumentFieldsProps } from "../../types"
import { calendarLocale, documentDate } from "../../utils/locale"
import { maskAmount, maskPassport, maskPinfl } from "../../utils/mask"
import { normalisePassport } from "../../utils/validate"
import {
  PAYMENT_METHODS,
  type PaymentMethod,
  type TilxatData,
  type TilxatParty
} from "./constants"

/**
 * Every element the legal checklist requires, in the order the document uses
 * them: the borrower first — the tilxat is written in THEIR voice — then the
 * lender, then the loan itself, then the optional witnesses.
 *
 * Validation is the composer's; this component only shows it. Two habits worth
 * naming: identifiers are MASKED on every keystroke, so the field can only ever
 * hold a legal prefix of its format, and the passport NORMALISES itself on blur
 * ("ab1234567" becomes "AB 1234567") so what the visitor sees is what the paper
 * prints.
 */
export function TilxatFields({
  data,
  errors,
  update
}: DocumentFieldsProps<TilxatData>) {
  const t = useTranslations("TilxatPage.form")
  const tShared = useTranslations("DocumentsShared.form")
  const locale = useLocale()
  const tErrors = useTranslations("TilxatPage.errors")
  const id = useId()

  const messageFor = (key?: string) => (key ? tErrors(key) : undefined)

  const setParty = (
    role: "borrower" | "lender",
    key: keyof TilxatParty,
    value: string
  ) =>
    update((current) => ({
      ...current,
      [role]: { ...current[role], [key]: value }
    }))

  const setField = <K extends keyof TilxatData>(key: K, value: TilxatData[K]) =>
    update((current) => ({ ...current, [key]: value }))

  const setWitness = (index: 0 | 1, value: string) =>
    update((current) => {
      const witnesses: [string, string] = [...current.witnesses]
      witnesses[index] = value
      return { ...current, witnesses }
    })

  const party = (role: "borrower" | "lender") => (
    <FieldSet legend={t(`${role}.legend`)}>
      <Field
        id={`${id}-${role}-name`}
        label={t("fullName")}
        error={messageFor(errors[`${role}.fullName`])}
      >
        <Input
          id={`${id}-${role}-name`}
          value={data[role].fullName}
          onChange={(event) => setParty(role, "fullName", event.target.value)}
          placeholder={t("fullNamePlaceholder")}
          aria-invalid={Boolean(errors[`${role}.fullName`])}
          autoComplete="off"
        />
      </Field>
      <Field
        id={`${id}-${role}-passport`}
        label={t("passport")}
        error={messageFor(errors[`${role}.passport`])}
      >
        <Input
          id={`${id}-${role}-passport`}
          value={data[role].passport}
          onChange={(event) =>
            setParty(role, "passport", maskPassport(event.target.value))
          }
          onBlur={(event) =>
            setParty(role, "passport", normalisePassport(event.target.value))
          }
          placeholder="AB 1234567"
          maxLength={10}
          className="font-mono"
          aria-invalid={Boolean(errors[`${role}.passport`])}
          autoComplete="off"
        />
      </Field>
      <Field
        id={`${id}-${role}-pinfl`}
        label={t("pinfl")}
        error={messageFor(errors[`${role}.pinfl`])}
      >
        <Input
          id={`${id}-${role}-pinfl`}
          value={data[role].pinfl}
          onChange={(event) =>
            setParty(role, "pinfl", maskPinfl(event.target.value))
          }
          placeholder="30412900123456"
          inputMode="numeric"
          maxLength={14}
          className="font-mono"
          aria-invalid={Boolean(errors[`${role}.pinfl`])}
          autoComplete="off"
        />
      </Field>
      <Field
        id={`${id}-${role}-address`}
        label={t("address")}
        error={messageFor(errors[`${role}.address`])}
      >
        <Input
          id={`${id}-${role}-address`}
          value={data[role].address}
          onChange={(event) => setParty(role, "address", event.target.value)}
          placeholder={t("addressPlaceholder")}
          aria-invalid={Boolean(errors[`${role}.address`])}
          autoComplete="off"
        />
      </Field>
    </FieldSet>
  )

  return (
    <div className="flex flex-col gap-5">
      {party("borrower")}
      {party("lender")}

      <FieldSet legend={t("loan.legend")}>
        <Field
          id={`${id}-amount`}
          label={t("amount")}
          error={messageFor(errors.amount)}
        >
          <Input
            id={`${id}-amount`}
            value={data.amount}
            onChange={(event) =>
              setField("amount", maskAmount(event.target.value))
            }
            inputMode="decimal"
            placeholder="5 000 000"
            className="font-mono"
            aria-invalid={Boolean(errors.amount)}
            autoComplete="off"
          />
        </Field>

        <Field id={`${id}-method`} label={t("method")}>
          {/* The suite's Radix select — the same control every other tool's
              dropdown uses, not a bare <select> that ignores the theme. */}
          <Select
            value={data.method}
            onValueChange={(value) =>
              setField("method", value as PaymentMethod)
            }
          >
            <SelectTrigger id={`${id}-method`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map((method) => (
                <SelectItem key={method.id} value={method.id}>
                  {t(`methods.${method.id}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field id={`${id}-given`} label={t("givenDate")}>
            <DatePicker
              id={`${id}-given`}
              value={data.givenDate}
              onChange={(value) => setField("givenDate", value)}
              placeholder={tShared("datePlaceholder")}
              format={documentDate}
              localeCode={calendarLocale(locale)}
            />
          </Field>
          <Field
            id={`${id}-return`}
            label={t("returnDate")}
            error={messageFor(errors.returnDate)}
          >
            {/* The calendar cannot even OFFER a day before the loan date;
                the cross-field error stays for a value that arrives another
                way (the sample, a paste, a restored form). */}
            <DatePicker
              id={`${id}-return`}
              value={data.returnDate}
              onChange={(value) => setField("returnDate", value)}
              placeholder={tShared("datePlaceholder")}
              format={documentDate}
              localeCode={calendarLocale(locale)}
              min={data.givenDate || undefined}
              aria-invalid={Boolean(errors.returnDate)}
            />
          </Field>
        </div>

        <Field
          id={`${id}-city`}
          label={t("city")}
          error={messageFor(errors.city)}
        >
          <Input
            id={`${id}-city`}
            value={data.city}
            onChange={(event) => setField("city", event.target.value)}
            placeholder={t("cityPlaceholder")}
            aria-invalid={Boolean(errors.city)}
            autoComplete="off"
          />
        </Field>

        <label className="flex items-start gap-2 text-foreground text-sm">
          <input
            type="checkbox"
            checked={data.interestFree}
            onChange={(event) => setField("interestFree", event.target.checked)}
            className="mt-0.5 size-4 accent-primary"
          />
          <span>{t("interestFree")}</span>
        </label>
      </FieldSet>

      <FieldSet legend={t("witnesses.legend")}>
        <p className="-mt-1 text-muted-foreground text-xs">
          {t("witnesses.hint")}
        </p>
        {([0, 1] as const).map((index) => (
          <Field
            key={index}
            id={`${id}-witness-${index}`}
            label={t("witnesses.name", { number: index + 1 })}
            error={messageFor(errors[`witness.${index}`])}
          >
            <Input
              id={`${id}-witness-${index}`}
              value={data.witnesses[index]}
              onChange={(event) => setWitness(index, event.target.value)}
              aria-invalid={Boolean(errors[`witness.${index}`])}
              autoComplete="off"
            />
          </Field>
        ))}
      </FieldSet>
    </div>
  )
}
