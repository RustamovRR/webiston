import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'

interface ToolHeaderProps {
  title: string
  description: string
  backUrl?: string
}

export function ToolHeader({ title, description, backUrl = '/tools' }: ToolHeaderProps) {
  const t = useTranslations('Common')

  return (
    <div className="mb-8">
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link
            href={backUrl}
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            <ArrowLeft size={16} />
            {t('backToTools')}
          </Link>
        </Button>
      </div>
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-zinc-900 dark:text-zinc-100">{title}</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">{description}</p>
      </div>
    </div>
  )
}
