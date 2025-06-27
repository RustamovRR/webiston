import { NumberTicker } from '@/components/ui/number-ticker'

interface StatItem {
  label: string
  value: number | string
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
          {typeof stat.value === 'number' ? (
            <NumberTicker value={stat.value} />
          ) : (
            <span className="font-mono">{stat.value}</span>
          )}
          <span>{stat.label}</span>
        </span>
      ))}
    </div>
  )
}
