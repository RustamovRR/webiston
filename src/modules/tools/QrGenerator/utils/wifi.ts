/**
 * The WIFI: payload, built from fields.
 *
 * This is the one content type where a form is a compiler, not a convenience:
 * nobody hand-writes `WIFI:T:WPA;S:…;P:…;;`, and a password containing `;`
 * `,` `:` or `\` must be escaped exactly per the de-facto spec (ZXing's) or
 * the phone joins a network that does not exist. URL, text and SMS stay in
 * the plain box on purpose — a form would only slow them down.
 */

export type WifiSecurity = "WPA" | "WEP" | "nopass"

export interface WifiConfig {
  ssid: string
  password: string
  security: WifiSecurity
  /** Networks that do not broadcast their SSID need the H flag to be found. */
  hidden: boolean
}

export const DEFAULT_WIFI: WifiConfig = {
  ssid: "",
  password: "",
  security: "WPA",
  hidden: false
}

/** The five characters the WIFI format reserves, each escaped with `\`. */
function escapeWifiValue(value: string): string {
  return value.replace(/([\\;,:"])/g, "\\$1")
}

/** Empty until there is an SSID — a WiFi code without a network is nothing. */
export function buildWifiPayload(config: WifiConfig): string {
  const ssid = config.ssid.trim()
  if (!ssid) return ""

  const parts = [`T:${config.security}`, `S:${escapeWifiValue(ssid)}`]
  if (config.security !== "nopass" && config.password) {
    parts.push(`P:${escapeWifiValue(config.password)}`)
  }
  if (config.hidden) parts.push("H:true")

  return `WIFI:${parts.join(";")};;`
}
