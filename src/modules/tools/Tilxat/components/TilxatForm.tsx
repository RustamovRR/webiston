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

import { PAYMENT_METHODS } from "../constants"
import type { TilxatErrors } from "../hooks/useTilxat"
import type { PaymentMethod, TilxatData, TilxatParty } from "../types"
import { maskAmount, maskPassport, maskPinfl } from "../utils/mask"
import { normalisePassport } from "../utils/validate"

interface TilxatFormProps {
  data: TilxatData
  errors: TilxatErrors
  onParty: (
    role: "borrower" | "lender",
    field: keyof TilxatParty,
    value: string
  ) => void
  onField: <
    K extends "amount" | "method" | "city" | "givenDate" | "returnDate"
  >(
    field: K,
    value: TilxatData[K]
  ) => void
  onInterestFree: (interestFree: boolean) => void
  onWitness: (index: 0 | 1, value: string) => void
}

/**
 * One labelled input with its error line. The error is a message KEY from the
 * hook; this component owns turning it into the reader's language.
 */
function Field({
  id,
  label,
  error,
  children
}: {
  id: string
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-muted-foreground text-xs">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-destructive text-xs">
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * Every element the legal checklist requires, in the order the document uses
 * them: the borrower first — the tilxat is written in THEIR voice — then the
 * lender, then the loan itself, then the optional witnesses.
 *
 * Validation is the hook's; this component only shows it. One habit worth
 * naming: the passport field NORMALISES itself on blur ("ab1234567" becomes
 * "AB 1234567"), so what the visitor sees in the field is exactly what the
 * paper will print.
 */
export function TilxatForm({
  data,
  errors,
  onParty,
  onField,
  onInterestFree,
  onWitness
}: TilxatFormProps) {
  const t = useTranslations("TilxatPage.form")
  const tErrors = useTranslations("TilxatPage.errors")
  const id = useId()

  const messageFor = (key?: string) => (key ? tErrors(key) : undefined)

  const party = (role: "borrower" | "lender") => (
    <fieldset className="flex min-w-0 flex-col gap-3">
      <legend className="mb-1.5 font-medium text-foreground text-sm">
        {t(`${role}.legend`)}
      </legend>
      <Field
        id={`${id}-${role}-name`}
        label={t("fullName")}
        error={messageFor(errors[`${role}.fullName`])}
      >
        <Input
          id={`${id}-${role}-name`}
          value={data[role].fullName}
          onChange={(event) => onParty(role, "fullName", event.target.value)}
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
        {/* Masked on every keystroke: the field can only ever hold a legal
            prefix of "AB 1234567", so "asdfasdfad" is impossible rather than
            merely reported. `normalisePassport` on blur still settles the
            written form for anything pasted whole. */}
        <Input
          id={`${id}-${role}-passport`}
          value={data[role].passport}
          onChange={(event) =>
            onParty(role, "passport", maskPassport(event.target.value))
          }
          onBlur={(event) =>
            onParty(role, "passport", normalisePassport(event.target.value))
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
            onParty(role, "pinfl", maskPinfl(event.target.value))
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
          onChange={(event) => onParty(role, "address", event.target.value)}
          placeholder={t("addressPlaceholder")}
          aria-invalid={Boolean(errors[`${role}.address`])}
          autoComplete="off"
        />
      </Field>
    </fieldset>
  )

  return (
    <div className="flex flex-col gap-5">
      {party("borrower")}
      {party("lender")}

      <fieldset className="flex min-w-0 flex-col gap-3">
        <legend className="mb-1.5 font-medium text-foreground text-sm">
          {t("loan.legend")}
        </legend>
        <Field
          id={`${id}-amount`}
          label={t("amount")}
          error={messageFor(errors.amount)}
        >
          <Input
            id={`${id}-amount`}
            value={data.amount}
            onChange={(event) =>
              onField("amount", maskAmount(event.target.value))
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
            onValueChange={(value) => onField("method", value as PaymentMethod)}
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
            {/* Native date inputs, deliberately: on the phones most of this
                audience uses they open the platform's own picker — better
                than any JS calendar — and they cost zero bundle. The
                cross-field rule below is what a picker would not give us. */}
            <Input
              id={`${id}-given`}
              type="date"
              value={data.givenDate}
              onChange={(event) => onField("givenDate", event.target.value)}
            />
          </Field>
          <Field
            id={`${id}-return`}
            label={t("returnDate")}
            error={messageFor(errors.returnDate)}
          >
            <Input
              id={`${id}-return`}
              type="date"
              value={data.returnDate}
              // The browser greys impossible days out; the error line still
              // exists because `min` cannot catch a date typed by keyboard.
              min={data.givenDate || undefined}
              onChange={(event) => onField("returnDate", event.target.value)}
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
            onChange={(event) => onField("city", event.target.value)}
            placeholder={t("cityPlaceholder")}
            aria-invalid={Boolean(errors.city)}
            autoComplete="off"
          />
        </Field>

        <div className="flex items-center gap-2">
          <input
            id={`${id}-interest`}
            type="checkbox"
            checked={data.interestFree}
            onChange={(event) => onInterestFree(event.target.checked)}
            className="size-4 accent-primary"
          />
          <label htmlFor={`${id}-interest`} className="text-foreground text-sm">
            {t("interestFree")}
          </label>
        </div>
      </fieldset>

      <fieldset className="flex min-w-0 flex-col gap-3">
        <legend className="mb-1.5 font-medium text-foreground text-sm">
          {t("witnesses.legend")}
        </legend>
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
              onChange={(event) => onWitness(index, event.target.value)}
              placeholder={t("fullNamePlaceholder")}
              aria-invalid={Boolean(errors[`witness.${index}`])}
              autoComplete="off"
            />
          </Field>
        ))}
      </fieldset>
    </div>
  )
}
