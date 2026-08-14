"use client"

import { MonthPicker } from "@webiston/ui/composites/MonthPicker"
import { Input } from "@webiston/ui/primitives/input"
import { Textarea } from "@webiston/ui/primitives/textarea"
import { useLocale, useTranslations } from "next-intl"
import { useId } from "react"

import { Field, FieldSet } from "@/components/shared/Field"

import type { useResume } from "../hooks/useResume"
import { monthLabel } from "../utils/format"

/**
 * Who the CV is about: name, target role, how to reach them, and the summary.
 *
 * The `personal` block is separated and labelled as optional on purpose. The
 * research is clear that Uzbek employers expect a birth date, and equally
 * clear that this is a local convention rather than a requirement — so the
 * form states it and lets the visitor decide, instead of quietly demanding
 * an age the way a hardcoded template would.
 */
export function IdentityFields({
  data,
  set,
  setNested
}: Pick<ReturnType<typeof useResume>, "data" | "set" | "setNested">) {
  const t = useTranslations("ResumePage.form")
  const locale = useLocale()
  const id = useId()

  // Read on render, never at module scope: a module-level `new Date()` is
  // evaluated once during SSR and can disagree with the client across a month
  // boundary — the trap the document family wrote down after hitting it.
  const thisMonth = new Date().toISOString().slice(0, 7)

  return (
    <>
      <FieldSet legend={t("basics.legend")}>
        <Field id={`${id}-name`} label={t("fullName")}>
          <Input
            id={`${id}-name`}
            value={data.fullName}
            onChange={(event) => set("fullName", event.target.value)}
            placeholder={t("fullNamePlaceholder")}
            autoComplete="name"
          />
        </Field>
        <Field id={`${id}-role`} label={t("role")} hint={t("roleHint")}>
          <Input
            id={`${id}-role`}
            value={data.role}
            onChange={(event) => set("role", event.target.value)}
            placeholder={t("rolePlaceholder")}
            autoComplete="organization-title"
          />
        </Field>
        <Field
          id={`${id}-summary`}
          label={t("summary")}
          hint={t("summaryHint")}
        >
          <Textarea
            id={`${id}-summary`}
            value={data.summary}
            onChange={(event) => set("summary", event.target.value)}
            placeholder={t("summaryPlaceholder")}
            rows={4}
          />
        </Field>
      </FieldSet>

      <FieldSet legend={t("contact.legend")}>
        <div className="grid grid-cols-2 gap-3">
          <Field id={`${id}-phone`} label={t("phone")}>
            <Input
              id={`${id}-phone`}
              value={data.contact.phone}
              onChange={(event) =>
                setNested("contact", "phone", event.target.value)
              }
              placeholder="+998 90 123 45 67"
              autoComplete="tel"
              inputMode="tel"
            />
          </Field>
          <Field id={`${id}-city`} label={t("city")}>
            <Input
              id={`${id}-city`}
              value={data.contact.city}
              onChange={(event) =>
                setNested("contact", "city", event.target.value)
              }
              placeholder={t("cityPlaceholder")}
              autoComplete="address-level2"
            />
          </Field>
        </div>
        <Field id={`${id}-email`} label={t("email")}>
          <Input
            id={`${id}-email`}
            type="email"
            value={data.contact.email}
            onChange={(event) =>
              setNested("contact", "email", event.target.value)
            }
            placeholder="ism.familiya@example.com"
            autoComplete="email"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field id={`${id}-telegram`} label={t("telegram")}>
            <Input
              id={`${id}-telegram`}
              value={data.contact.telegram}
              onChange={(event) =>
                setNested("contact", "telegram", event.target.value)
              }
              placeholder="@username"
              autoComplete="off"
            />
          </Field>
          <Field id={`${id}-linkedin`} label={t("linkedin")}>
            <Input
              id={`${id}-linkedin`}
              value={data.contact.linkedin}
              onChange={(event) =>
                setNested("contact", "linkedin", event.target.value)
              }
              placeholder="linkedin.com/in/..."
              autoComplete="off"
            />
          </Field>
        </div>
      </FieldSet>

      <FieldSet legend={t("personal.legend")}>
        <div className="grid grid-cols-2 gap-3">
          <Field
            id={`${id}-birth`}
            label={t("birthDate")}
            hint={t("birthDateHint")}
          >
            {/* The suite's own control, and month precision: the sheet
                prints "1999-yil aprel" and the exact day is nobody's
                business on a CV. */}
            <MonthPicker
              id={`${id}-birth`}
              value={data.personal.birthDate.slice(0, 7)}
              onChange={(value) =>
                setNested("personal", "birthDate", value ? `${value}-01` : "")
              }
              placeholder={t("monthPlaceholder")}
              format={monthLabel}
              locale={locale}
              max={thisMonth}
            />
          </Field>
          <Field id={`${id}-marital`} label={t("maritalStatus")}>
            <Input
              id={`${id}-marital`}
              value={data.personal.maritalStatus}
              onChange={(event) =>
                setNested("personal", "maritalStatus", event.target.value)
              }
              placeholder={t("maritalPlaceholder")}
              autoComplete="off"
            />
          </Field>
        </div>
      </FieldSet>
    </>
  )
}
