/**
 * Recognising and classifying an IP address.
 *
 * The tool this replaces validated nothing: it took whatever was typed and
 * handed it to a provider, so `hello` produced a network error and `10.0.0.1`
 * produced a confident lookup of the provider's own guess. Both are answerable
 * before a single byte leaves the page.
 */

/** `0`–`255`, with no leading zeros — `01` is not a valid octet. */
const OCTET = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/

export function isIpv4(value: string): boolean {
  const parts = value.split(".")
  return parts.length === 4 && parts.every((part) => OCTET.test(part))
}

/**
 * IPv6, including the `::` compression form and IPv4-mapped tails.
 *
 * Written out rather than pulled from a package: the rules are small, the
 * package would be a runtime dependency for eight lines, and a regex found on
 * the internet is exactly the kind of thing that accepts `:::1`.
 */
export function isIpv6(value: string): boolean {
  if (!value.includes(":")) return false
  // A zone index (`fe80::1%eth0`) is valid in a URL but never in a lookup.
  if (value.includes("%")) return false

  const doubleColons = value.split("::").length - 1
  if (doubleColons > 1) return false

  let head = value
  let tailGroups = 0

  // An IPv4-mapped address ends in dotted-quad form: ::ffff:192.0.2.1
  const lastColon = value.lastIndexOf(":")
  const tail = value.slice(lastColon + 1)
  if (tail.includes(".")) {
    if (!isIpv4(tail)) return false
    head = value.slice(0, lastColon)
    tailGroups = 2
  }

  const [left, right] = doubleColons === 1 ? head.split("::") : [head, null]
  const leftGroups = left === "" ? [] : left.split(":")
  const rightGroups = right ? right.split(":") : []
  const groups = [...leftGroups, ...rightGroups]

  if (!groups.every((group) => /^[0-9a-fA-F]{1,4}$/.test(group))) return false

  const total = groups.length + tailGroups
  return doubleColons === 1 ? total <= 7 : total === 8
}

export function isIpAddress(value: string): boolean {
  return isIpv4(value) || isIpv6(value)
}

/**
 * Addresses no geolocation provider can place, because they are not on the
 * public internet.
 *
 * Worth catching locally: a provider handed `192.168.1.1` answers with
 * something — usually the requester's own location — and the page would
 * present that as a fact about the address you typed.
 */
export function isPrivateAddress(value: string): boolean {
  if (isIpv4(value)) {
    const [a, b] = value.split(".").map(Number)
    return (
      a === 10 || // 10.0.0.0/8
      a === 127 || // loopback
      a === 0 || // "this network"
      (a === 172 && b >= 16 && b <= 31) || // 172.16.0.0/12
      (a === 192 && b === 168) || // 192.168.0.0/16
      (a === 169 && b === 254) || // link-local
      (a === 100 && b >= 64 && b <= 127) || // carrier-grade NAT
      a >= 224 // multicast and reserved
    )
  }

  const lower = value.toLowerCase()
  return (
    lower === "::" ||
    lower === "::1" || // loopback
    lower.startsWith("fe80") || // link-local
    lower.startsWith("fc") || // unique local
    lower.startsWith("fd") ||
    lower.startsWith("ff") // multicast
  )
}

/**
 * The visitor's address, from whichever proxy header carries it.
 *
 * `x-forwarded-for` is a comma-separated chain and the FIRST entry is the
 * client; every later one is a proxy. Reading the whole header — or the last
 * entry — is the common bug, and it yields the address of our own edge.
 *
 * Spoofable in general, but not on Vercel: it **overwrites** `x-forwarded-for`
 * at the edge and does not forward an external one, specifically to prevent IP
 * spoofing (vercel.com/docs/headers/request-headers). Self-hosted behind a
 * proxy the header is only as trustworthy as that proxy — and the worst case
 * is still only looking up an address the visitor chose, which the tool lets
 * them do by typing it anyway.
 */
export function clientIpFromHeaders(
  get: (name: string) => string | null
): string | null {
  const forwarded = get("x-forwarded-for")
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim()
    if (first && isIpAddress(first)) return first
  }

  for (const header of [
    "x-real-ip",
    "cf-connecting-ip",
    "x-vercel-forwarded-for"
  ]) {
    const value = get(header)?.trim()
    if (value && isIpAddress(value)) return value
  }

  return null
}
