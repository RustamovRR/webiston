import { NumberTicker } from '@/components/ui/number-ticker'

interface StatItem {
  label: string
  value: number
}

interface StatsDisplayProps {
  stats: StatItem[]
  className?: string
}

export function StatsDisplay({ stats, className = '' }: StatsDisplayProps) {
  return (
    <div className={`flex gap-4 text-sm text-zinc-500 ${className}`}>
      {stats.map((stat, index) => (
        <span key={index} className="flex items-center gap-1">
          <NumberTicker value={stat.value} />
          <span>{stat.label}</span>
        </span>
      ))}
    </div>
  )
}
