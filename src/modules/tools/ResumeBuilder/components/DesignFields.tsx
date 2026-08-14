"use client"

import { SegmentedControl } from "@webiston/ui/composites/SegmentedControl"
import { Button } from "@webiston/ui/primitives/button"
import { ImageUp, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useId, useRef, useState } from "react"

import { Field, FieldSet } from "@/components/shared/Field"
import { contrastRatio, hexToRgb, isValidHex } from "@/lib/utils"

import {
  ACCENT_MIN_CONTRAST,
  ACCENTS,
  DEFAULT_ACCENT,
  DOCUMENT_LANGUAGES,
  DOCUMENT_SCRIPTS,
  RESUME_PAPER,
  TEMPLATES
} from "../constants"
import type { useResume } from "../hooks/useResume"
import type { DocumentLanguage, DocumentScript, TemplateId } from "../types"
import { preparePhoto } from "../utils/photo"

/**
 * How the CV LOOKS: template, accent, photo.
 *
 * First in the form rather than last, because the choice reframes everything
 * under it — a visitor who picks „Zamonaviy" after filling twenty fields has
 * to re-read the whole sheet to see what moved. It is also the cheapest
 * possible demonstration that the tool does something: one click and the paper
 * on the right changes completely.
 */
export function DesignFields({
  data,
  set
}: Pick<ReturnType<typeof useResume>, "data" | "set">) {
  const t = useTranslations("ResumePage.form")
  const id = useId()
  const fileInput = useRef<HTMLInputElement>(null)
  const [photoError, setPhotoError] = useState<string>()

  // Same guard the sheet applies, for the same reason: `accent` is a free hex
  // and an older draft holds a preset id. `<input type="color">` silently
  // snaps an unparseable value to black, which would look like a bug.
  const accent = isValidHex(data.accent) ? data.accent : DEFAULT_ACCENT
  const isPreset = ACCENTS.some((entry) => entry.value === accent)
  const paper = hexToRgb(RESUME_PAPER.background)
  const picked = hexToRgb(accent)
  const accentReadable =
    !paper || !picked || contrastRatio(picked, paper) >= ACCENT_MIN_CONTRAST

  const handlePhoto = async (file: File | undefined) => {
    if (!file) return
    setPhotoError(undefined)
    const { dataUrl, error } = await preparePhoto(file)
    if (error) {
      setPhotoError(t(`photoError.${error}`))
      return
    }
    if (dataUrl) set("photo", dataUrl)
  }

  return (
    <FieldSet legend={t("design.legend")}>
      {/* NOT wrapped in `Field`: neither of these two controls takes an `id`,
          so a `<label htmlFor>` would point at nothing — a label that labels
          no element is worse than none. Both name themselves instead
          (`SegmentedControl`'s own legend, `role="group"` below), and the
          caption is a plain span carrying `Field`'s type styling. */}
      <div className="flex flex-col gap-1.5">
        <span className="text-muted-foreground text-xs">{t("template")}</span>
        <SegmentedControl
          label={t("template")}
          value={data.template}
          onChange={(value) => set("template", value as TemplateId)}
          options={TEMPLATES.map((entry) => ({
            value: entry.id,
            label: t(`templates.${entry.id}`)
          }))}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-muted-foreground text-xs">
          {t("docLanguage")}
        </span>
        <SegmentedControl
          label={t("docLanguage")}
          value={data.language}
          onChange={(value) => set("language", value as DocumentLanguage)}
          options={DOCUMENT_LANGUAGES.map((code) => ({
            value: code,
            label: t(`docLanguages.${code}`)
          }))}
        />
        <p className="text-muted-foreground text-xs">{t("languageHint")}</p>
      </div>

      {/* Uzbek is the only language here with two alphabets; asking for the
          Cyrillic form of "Work experience" would produce «Ворк еxпериенcе».
          This is also the thing no other resume builder offers — the GSC
          «лотин кирилл» family is a real, unserved audience. */}
      {data.language === "uz" && (
        <div className="flex flex-col gap-1.5">
          <span className="text-muted-foreground text-xs">{t("script")}</span>
          <SegmentedControl
            label={t("script")}
            value={data.script}
            onChange={(value) => set("script", value as DocumentScript)}
            options={DOCUMENT_SCRIPTS.map((code) => ({
              value: code,
              label: t(`scripts.${code}`)
            }))}
          />
        </div>
      )}

      {/* Only „Zamonaviy" paints with it; showing a colour picker that does
          nothing is how a form teaches people to distrust it. */}
      {data.template === "zamonaviy" && (
        <div className="flex flex-col gap-1.5">
          <span className="text-muted-foreground text-xs">{t("accent")}</span>
          <div
            role="group"
            aria-label={t("accent")}
            className="flex flex-wrap items-center gap-2"
          >
            {ACCENTS.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => set("accent", entry.value)}
                aria-label={t(`accents.${entry.id}`)}
                aria-pressed={data.accent === entry.value}
                className={
                  data.accent === entry.value
                    ? "size-7 rounded-full ring-2 ring-ring ring-offset-2 ring-offset-background transition-transform"
                    : "size-7 rounded-full transition-transform hover:scale-110"
                }
                style={{ background: entry.value }}
              />
            ))}

            {/* The native swatch IS the control — the same call the QR tool
                made: a bundled colour wheel would be another dependency and a
                worse wheel than the OS already ships. It sits AFTER the
                presets because five curated colours answer the question for
                most people in one click, and this is for the visitor whose
                answer is a specific one. */}
            <label
              className={
                isPreset
                  ? "size-7 cursor-pointer overflow-hidden rounded-full border border-border transition-transform hover:scale-110"
                  : "size-7 cursor-pointer overflow-hidden rounded-full ring-2 ring-ring ring-offset-2 ring-offset-background"
              }
              style={{ background: accent }}
            >
              <span className="sr-only">{t("accentCustom")}</span>
              <input
                type="color"
                value={accent}
                onChange={(event) => set("accent", event.target.value)}
                // Sized past the swatch and pushed off-centre so the OS
                // renders its own preview outside the clip — what shows is
                // the round swatch, what opens is the system picker.
                className="size-12 -translate-x-2 -translate-y-2 cursor-pointer border-0 bg-transparent p-0"
              />
            </label>
          </div>

          {/* States the problem instead of overruling the choice. The accent
              prints the name and every section heading, so a pale one is not
              a taste question — it is a CV a recruiter skims past. */}
          {!accentReadable && (
            <p className="text-destructive text-xs">{t("accentContrast")}</p>
          )}
        </div>
      )}

      <Field
        id={`${id}-photo`}
        label={t("photo")}
        hint={t("photoHint")}
        error={photoError}
      >
        <div className="flex items-center gap-3">
          {data.photo && (
            // biome-ignore lint/performance/noImgElement: a dataURL held in
            // memory; there is no remote URL for next/image to optimise.
            <img
              src={data.photo}
              alt=""
              className="size-14 rounded-md border border-border object-cover"
            />
          )}
          <input
            ref={fileInput}
            id={`${id}-photo`}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              void handlePhoto(event.target.files?.[0])
              // Reset so picking the SAME file again still fires a change.
              event.target.value = ""
            }}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInput.current?.click()}
          >
            <ImageUp className="size-4" aria-hidden="true" />
            {data.photo ? t("photoReplace") : t("photoAdd")}
          </Button>
          {data.photo && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground transition-colors hover:text-destructive"
              onClick={() => set("photo", "")}
              aria-label={t("remove")}
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </Field>
    </FieldSet>
  )
}
