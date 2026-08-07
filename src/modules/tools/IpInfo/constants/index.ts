/**
 * Tool-scoped constants.
 */

/**
 * Addresses worth offering as examples.
 *
 * Public resolvers only, and each one is somewhere different — the point of an
 * example is to show the tool working on an address whose answer you can sanity
 * check, not to pad a list. The set this replaces had **six**, four of them
 * DNS resolvers in the same country, including two run by the same operator
 * (`9.9.9.9` and `149.112.112.112` are both Quad9).
 */
export const SAMPLE_IPS: readonly { label: string; ip: string }[] = [
  { label: "Cloudflare DNS", ip: "1.1.1.1" },
  { label: "Google DNS", ip: "8.8.8.8" },
  { label: "Quad9 DNS", ip: "9.9.9.9" },
  // An IPv6 address, because the tool must be shown to handle one — the
  // implementation it replaces accepted neither form correctly.
  { label: "Google DNS (IPv6)", ip: "2001:4860:4860::8888" }
] as const

/**
 * How far the map zooms in on a located address.
 *
 * 10 is roughly city scale. Anything tighter implies a precision the data does
 * not have: a free database places an address at the ISP's registered
 * location, which is regularly a different city and occasionally a different
 * region. The old map used the same zoom while claiming nothing about accuracy.
 */
export const MAP_ZOOM = 10

/** The questions the page both RENDERS and publishes as structured data. */
export const FAQ_KEYS = [
  "accuracy",
  "whatItReveals",
  "vpn",
  "ipv6",
  "changing"
] as const
