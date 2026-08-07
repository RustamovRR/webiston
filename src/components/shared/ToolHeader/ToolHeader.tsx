import { ArrowLeft } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui"
import { Link } from "@/i18n/navigation"

interface ToolHeaderProps {
  title: string
  description: string
  backUrl?: string
}

export function ToolHeader({
  title,
  description,
  backUrl = "/tools"
}: ToolHeaderProps) {
  const t = useTranslations("Common")

  return (
    <div className="mb-6 sm:mb-8">
      <div className="mb-3 sm:mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link
            href={backUrl}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={16} />
            {t("backToTools")}
          </Link>
        </Button>
      </div>
      {/* A 36px heading and an 18px paragraph pushed the tool itself 600px down
          on a 375px screen — the input was on the first fold and the result was
          not. The desktop sizes are unchanged. */}
      <div className="text-center">
        {/* 30px, not 36. These are utility pages: the panel headings under it
            are 16px, so a 36px h1 opened a 2.25x jump and spent a tenth of the
            first screen on a title nobody came to read. The h1 still has to
            exist — it is the page's one indexable heading — it just does not
            need magazine scale. */}
        <h1 className="mb-3 text-balance font-bold text-2xl text-foreground sm:mb-4 sm:text-3xl">
          {title}
        </h1>
        <p className="text-pretty text-base text-muted-foreground sm:text-lg">
          {description}
        </p>
      </div>
    </div>
  )
}
