import { FC, ReactNode } from 'react'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib'

interface IProps {
  variant?: 'primary' | 'secondary' | 'outline'
  children: ReactNode
  href: string
  className?: string
  [key: string]: any // For any other props
}

const ButtonLink: FC<IProps> = ({ children, variant = 'primary', className, ...props }) => {
  const classNames = cn(
    'relative h-12 px-6 py-2 rounded-lg font-medium text-lg transition-colors duration-300 ease-in-out flex items-center justify-center',
    {
      'bg-white text-black hover:bg-[#ccc]': variant === 'primary',
      'bg-primary-black text-white border border-[rgba(255,255,255,0.17)] hover:bg-[rgba(255,255,255,0.12)]':
        variant === 'secondary',
      'bg-transparent text-white border border-white/20 hover:bg-white/10 hover:border-white/30': variant === 'outline',
    },
    className,
  )

  return (
    <Link {...props} className={classNames}>
      {children}
    </Link>
  )
}

export default ButtonLink
