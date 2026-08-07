// Static sections — Server Components. Imported from their own files rather
// than through components/index.ts so the client barrel never sees them.
export { UuidFaq } from "./components/UuidFaq"
export { UuidReference } from "./components/UuidReference"
export { default, UuidGenerator } from "./UuidGenerator"
