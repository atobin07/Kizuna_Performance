'use client'

import { cn } from '@/lib/utils'

export interface ProgressRingProps {
  value: number
  max?: number
  label?: string
  sublabel?: string
  size?: number
  className?: string
}

/** SVG progress ring — gold arc on a dark track. */
export function ProgressRing({
  value,
  max = 100,
  label,
  sublabel,
  size = 96,
  className,
}: ProgressRingProps) {
  const stroke = Math.max(6, Math.round(size * 0.08))
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const safeMax = max <= 0 ? 1 : max
  const pct = Math.max(0, Math.min(1, value / safeMax))
  const dash = circumference * pct
  const displayLabel = label ?? `${Math.round(pct * 100)}%`

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#C4922A"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          className="transition-[stroke-dasharray] duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span
          className="font-bold leading-none text-washi"
          style={{ fontSize: Math.max(14, size * 0.24) }}
        >
          {displayLabel}
        </span>
        {sublabel && (
          <span className="mt-1 max-w-[80%] text-[10px] uppercase tracking-wider text-muted-foreground">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  )
}

export default ProgressRing
