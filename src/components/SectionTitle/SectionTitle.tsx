import { FC, ReactNode } from 'react'
import { cn } from '@/lib'

interface IProps {
  icon: ReactNode
  title: string
  description: string
  className?: string
}

const SectionTitle: FC<IProps> = ({ icon, title, description, className }) => {
  const classNames = cn('flex items-center gap-4', className)

  return (
    <div className={classNames}>
      {icon}
      <div>
        <h3 className="gradient-text text-xl font-semibold">{title}</h3>
        <p className="text-gray-primary">{description}</p>
      </div>
    </div>
  )
}

export default SectionTitle
