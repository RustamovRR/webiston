"use client"

import { Button } from "@webiston/ui/primitives/button"
import { Input } from "@webiston/ui/primitives/input"
import { RefreshCw, Search } from "lucide-react"
import { useTranslations } from "next-intl"
import { useId, useState } from "react"

import { SAMPLE_IPS } from "../constants"
import type { LookupOptions } from "../hooks/useIpLookup"
import type { IpLookupError } from "../types"
import { isIpAddress } from "../utils/address"

/**
 * Look up an address other than your own.
 *
 * Validated HERE, before a request goes anywhere. The form this replaces sent
 * whatever was typed: `hello` came back as a network error, and `10.0.0.1`
 * came back as a confident lookup of the provider's own guess, presented as a
 * fact about the address you asked for. Both are answerable locally.
 *
 * The examples are four public resolvers in four different places, one of them
 * IPv6 — an address form the previous implementation could not parse at all.
 */

interface LookupFormProps {
  onLookup: (ip?: string, options?: LookupOptions) => void
  isLoading: boolean
  error: IpLookupError | null
}

export function LookupForm({ onLookup, isLoading, error }: LookupFormProps) {
  const t = useTranslations("IpInfoPage.lookup")
  const tErrors = useTranslations("IpInfoPage.errors")
  const inputId = useId()
  const [draft, setDraft] = useState("")

  const trimmed = draft.trim()
  const isMalformed = trimmed !== "" && !isIpAddress(trimmed)

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (isMalformed || trimmed === "") return
    onLookup(trimmed)
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-xl border border-border bg-card px-5 py-4"
    >
      <label htmlFor={inputId} className="block text-muted-foreground text-xs">
        {t("label")}
      </label>

      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        <Input
          id={inputId}
          className="w-full max-w-xs font-mono"
          placeholder={t("placeholder")}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          aria-invalid={isMalformed}
          aria-describedby={isMalformed ? `${inputId}-error` : undefined}
          spellCheck={false}
          autoComplete="off"
        />
        <Button
          type="submit"
          size="sm"
          disabled={isLoading || isMalformed || trimmed === ""}
        >
          <Search aria-hidden="true" />
          {t("submit")}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isLoading}
          // The only button that skips the cache. Pressing it twice is what
          // someone does after connecting a VPN, and a cached answer would be
          // exactly the wrong reply to that question.
          onClick={() => {
            setDraft("")
            onLookup(undefined, { force: true })
          }}
        >
          {t("mine")}
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="text-muted-foreground text-xs">{t("examples")}</span>
        {SAMPLE_IPS.map((sample) => (
          <button
            key={sample.ip}
            type="button"
            className="rounded-md border border-border px-2 py-1 font-mono text-foreground text-xs hover:bg-muted"
            onClick={() => {
              setDraft(sample.ip)
              onLookup(sample.ip)
            }}
          >
            {sample.label}
          </button>
        ))}
      </div>

      {/* One place for both failure kinds: the address is malformed (caught
          here) or the lookup came back unusable (reported by the route). */}
      {isMalformed ? (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="mt-3 text-destructive text-sm"
        >
          {tErrors("invalid")}
        </p>
      ) : error ? (
        <div role="alert" className="mt-3">
          <p className="text-destructive text-sm">{tErrors(error.code)}</p>
          {/* Retryable failures get a button. `invalid` and `private` do not:
              nothing about the address changes by asking again, and offering
              a retry that cannot succeed is worse than offering none. */}
          {error.code === "rateLimited" ||
          error.code === "network" ||
          error.code === "noPublicIp" ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              disabled={isLoading}
              onClick={() => onLookup(trimmed || undefined, { force: true })}
            >
              <RefreshCw aria-hidden="true" />
              {t("retry")}
            </Button>
          ) : null}
        </div>
      ) : null}
    </form>
  )
}
