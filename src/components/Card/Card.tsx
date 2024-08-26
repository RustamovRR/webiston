import { FC, ReactNode } from 'react'
import { cn } from '@/lib'
import Link, { LinkProps } from 'next/link'

interface IProps extends Omit<LinkProps, 'href'> {
  title: string
  description: string
  href?: string
  className?: string
}

const Card: FC<IProps> = ({ title, description, href, className, ...props }) => {
  const classNames = cn(
    'relative group transform transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg rounded-lg overflow-hidden border border-[rgba(255,255,255,0.17)] hover:bg-[#ffffff05]',
    className,
  )

  const content = (
    <div className="flex flex-col items-center p-6 text-center">
      <div className="text-center">
        <h3 className="mb-2 text-xl font-semibold">{title}</h3>
        <p className="text-gray-500">{description}</p>
      </div>
    </div>
  )

  return href ? (
    <Link href={href} {...props} className={classNames}>
      {content}
    </Link>
  ) : (
    <div className={classNames}>{content}</div>
  )
}

export default Card
