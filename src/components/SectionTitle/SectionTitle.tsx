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
      <div className="group-hover:animate-rotate-once">{icon}</div>
      <div>
        <h3 className="gradient-text text-xl font-semibold">{title}</h3>
        <p className="text-gray-primary">{description}</p>
      </div>
    </div>
  )
}

export default SectionTitle
