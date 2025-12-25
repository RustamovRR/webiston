import { cn } from '@/lib'
import { AlertCircle, AlertTriangle, CheckCircle, Info, Lightbulb } from 'lucide-react'
import { ReactNode } from 'react'

type CalloutType = 'info' | 'warning' | 'error' | 'success' | 'tip' | 'note'

interface CalloutProps {
  children: ReactNode
  type?: CalloutType
  title?: string
  icon?: ReactNode
  className?: string
}

const getCalloutStyles = (type: CalloutType) => {
  switch (type) {
    case 'info':
      return {
        containerClass:
          'dark:bg-[#1e3a8a4d] text-[#bfdbfe] [&_strong]:font-bold [&_strong]:text-[#bfdbfe] border-blue-200 dark:bg-[#1e3a8a4d] dark:border-[#bfdbfe4d]',
        titleClass: 'text-blue-800 dark:text-blue-200',
        textClass: 'text-blue-700 dark:text-blue-200 [&>p]:!m-auto',
        icon: <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />,
      }
    case 'warning':
      return {
        containerClass: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/60',
        titleClass: 'text-amber-800 dark:text-amber-300',
        textClass: 'text-amber-700 dark:text-amber-200',
        icon: <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400" />,
      }
    case 'error':
      return {
        containerClass: 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800/60',
        titleClass: 'text-red-800 dark:text-red-300',
        textClass: 'text-red-700 dark:text-red-200',
        icon: <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />,
      }
    case 'success':
      return {
        containerClass: 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800/60',
        titleClass: 'text-green-800 dark:text-green-300',
        textClass: 'text-green-700 dark:text-green-200',
        icon: <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />,
      }
    case 'tip':
      return {
        containerClass: 'bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800/60',
        titleClass: 'text-purple-800 dark:text-purple-300',
        textClass: 'text-purple-700 dark:text-purple-200',
        icon: <Lightbulb className="h-5 w-5 text-purple-500 dark:text-purple-400" />,
      }
  }
}

export default function Callout({ children, type = 'info', title, icon, className }: CalloutProps) {
  const styles = getCalloutStyles(type)!

  return (
    <div
      className={cn(
        'my-6 rounded-lg border p-4 py-6 pr-12 shadow-sm [&_h2]:!mt-0 [&_h3]:!mt-0 dark:[&_h3_a]:!text-white [&_h4]:!mt-0 dark:[&_h4_a]:!text-white',
        styles.containerClass,
        className
      )}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 pt-0.5">{icon || styles.icon}</div>
        <div>
          <div className={cn('[&_p]:py-2', styles.textClass)}>{children}</div>
        </div>
      </div>
    </div>
  )
}
