// Client components only. The Server Components in this folder (`DeviceFaq`,
// `PrivacyNote`) are exported from the module root instead, so importing this
// barrel can never pull `next-intl/server` into a client bundle.
export { InfoGroupCard } from "./InfoGroupCard"
