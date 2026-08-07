import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  Lightbulb
} from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/lib"

type CalloutType = "info" | "warning" | "error" | "success" | "tip" | "note"

interface CalloutProps {
  children: ReactNode
  type?: CalloutType
  title?: string
  icon?: ReactNode
  className?: string
}

// A callout is a translucent WASH of its status colour with that same colour as
// text on top. So the surface must carry an opacity modifier — `bg-warning` is
// the solid amber, which would render amber text on an amber block.
//
// `tip` has no status token of its own (it is not success/warning/info/error),
// so it uses the brand accent, which is theme-aware and needs no `dark:` variant.
const getCalloutStyles = (type: CalloutType) => {
  switch (type) {
    case "info":
      return {
        containerClass: "bg-info/10 border-info/30",
        titleClass: "text-info",
        textClass: "text-info [&>p]:!m-auto",
        icon: <Info className="h-5 w-5 text-info" />
      }
    case "warning":
      return {
        containerClass: "bg-warning/10 border-warning/30",
        titleClass: "text-warning",
        textClass: "text-warning",
        icon: <AlertTriangle className="h-5 w-5 text-warning" />
      }
    case "error":
      return {
        containerClass: "bg-destructive/10 border-destructive/30",
        titleClass: "text-destructive",
        textClass: "text-destructive",
        icon: <AlertCircle className="h-5 w-5 text-destructive" />
      }
    case "success":
      return {
        containerClass: "bg-success/10 border-success/30",
        titleClass: "text-success",
        textClass: "text-success",
        icon: <CheckCircle className="h-5 w-5 text-success" />
      }
    case "tip":
      return {
        containerClass: "bg-primary/10 border-primary/30",
        titleClass: "text-primary",
        textClass: "text-primary",
        icon: <Lightbulb className="h-5 w-5 text-primary" />
      }
  }
}

export default function Callout({
  children,
  type = "info",
  title,
  icon,
  className
}: CalloutProps) {
  const styles = getCalloutStyles(type)!

  return (
    <div
      className={cn(
        // The heading-link overrides are now unconditional `!text-foreground`
        // instead of `dark:…!text-white`. A dark-only override left callout
        // heading links inheriting the prose link colour in light mode and
        // forcing white in dark — the token does both at once.
        //
        // Do NOT write an arbitrary-variant pattern with a `*` in a comment
        // here: Tailwind v4 scans raw file text, comments included, so a
        // wildcard inside square brackets is harvested as a real utility and
        // emits an invalid selector that fails the CSS parse.
        "my-6 rounded-lg border p-4 py-6 pr-12 shadow-sm [&_h2]:!mt-0 [&_h3]:!mt-0 [&_h3_a]:!text-foreground [&_h4]:!mt-0 [&_h4_a]:!text-foreground",
        styles.containerClass,
        className
      )}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 pt-0.5">{icon || styles.icon}</div>
        <div>
          <div className={cn("[&_p]:py-2", styles.textClass)}>{children}</div>
        </div>
      </div>
    </div>
  )
}
