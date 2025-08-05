import { FC, ReactNode } from 'react'
import { cn } from '@/lib'

interface IProps {
  icon: ReactNode
  title: string | ReactNode
  description: string
  className?: string
  disabled?: boolean
}

const SectionTitle: FC<IProps> = ({ icon, title, description, className, disabled }) => {
  const classNames = cn('flex items-center gap-4', { 'opacity-70': disabled }, className)

  return (
    <div className={classNames}>
      <div className="transition-transform duration-700 ease-in-out group-hover:rotate-180">{icon}</div>
      <div>
        <h3 className="gradient-text text-xl font-semibold">{title}</h3>
        <p className="text-zinc-600 dark:text-zinc-400">{description}</p>
      </div>
    </div>
  )
}

export default SectionTitle
