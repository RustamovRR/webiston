import { FC, ReactNode } from 'react'
import { cn } from '@/lib'
import { Link as I18nLink } from '@/i18n/navigation'
import Link from 'next/link'
interface IProps {
  title: string
  description: string
  href?: string
  className?: string
  disabled?: boolean
  isNextLink?: boolean
  children?: ReactNode // To be safe
  [key: string]: any // For any other props
}

const SimpleCard: FC<IProps> = ({ title, description, href, className, disabled, isNextLink = false, ...props }) => {
  const classNames = cn(
    'relative group transform transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg rounded-lg overflow-hidden border border-zinc-200 hover:bg-zinc-50 select-none dark:border-zinc-800 dark:hover:bg-zinc-900/50',
    {
      'pointer-events-none opacity-50': disabled,
    },
    className
  )

  const content = (
    <div className="flex flex-col items-center p-6 text-center">
      <div className="text-center">
        <h3 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
        <p className="text-zinc-600 dark:text-zinc-400">{description}</p>
      </div>
    </div>
  )

  return href ? (
    isNextLink ? (
      <Link href={href} {...props} className={classNames}>
        {content}
      </Link>
    ) : (
      <I18nLink href={href} {...props} className={classNames}>
        {content}
      </I18nLink>
    )
  ) : (
    <div className={classNames}>{content}</div>
  )
}

export default SimpleCard
