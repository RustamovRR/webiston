import { cn } from "../../utils/cn"
import React from "react"
import { Card } from "../../primitives/card"

interface InfoCardProps {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
  className?: string
  iconBgColor?: string
  iconColor?: string
}

const InfoCard: React.FC<InfoCardProps> = ({
  icon,
  title,
  description,
  children,
  className,
  iconBgColor = "bg-blue-500/20",
  iconColor = "text-blue-400"
}) => {
  return (
    <Card
      className={cn(
        "border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800/30 dark:bg-zinc-900/60",
        className
      )}
    >
      <div className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              iconBgColor
            )}
          >
            {React.isValidElement(icon) &&
              React.cloneElement(icon, {
                className: cn("h-5 w-5", iconColor)
              } as React.HTMLAttributes<HTMLElement>)}
          </div>
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
            {title}
          </h3>
        </div>
        <p className="mb-4 leading-relaxed text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
        <div className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
          {children}
        </div>
      </div>
    </Card>
  )
}

export default InfoCard
