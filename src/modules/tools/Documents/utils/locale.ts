import { formatUzbekDate } from "./dates"

/**
 * How a date is WRITTEN on a document, for the picker's trigger.
 *
 * Always Uzbek, on every locale, and deliberately so: the tool produces Uzbek
 * documents. A `/ru` visitor still gets a sheet that says "2026-yil 13-avgust",
 * so a trigger reading "13.08.2026" would be showing them a different date
 * format than the one they are about to print.
 */
export function documentDate(iso: string): string {
  return formatUzbekDate(iso) ?? iso
}

/**
 * Which language the CALENDAR speaks — the interface, not the document.
 *
 * The opposite decision to `documentDate`, for the opposite reason: month and
 * weekday names are UI, and a Russian-reading visitor should not have to parse
 * "Sentabr" to pick a day.
 */
export function calendarLocale(locale: string): "uz" | "en" | "ru" {
  return locale === "en" || locale === "ru" ? locale : "uz"
}
