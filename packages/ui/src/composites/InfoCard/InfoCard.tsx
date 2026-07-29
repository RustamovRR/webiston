import React from "react"
import { Card } from "../../primitives/card"
import { cn } from "../../utils/cn"

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
  iconBgColor = "bg-primary/10",
  iconColor = "text-primary"
}) => {
  return (
    <Card
      className={cn("border-border bg-card/80 backdrop-blur-sm", className)}
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
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        </div>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          {description}
        </p>
        <div className="space-y-2 text-sm text-muted-foreground">
          {children}
        </div>
      </div>
    </Card>
  )
}

export default InfoCard
