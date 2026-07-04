import { cn } from '@/lib/utils'

export interface LogoProps {
  /** 'mark' = seal only; 'full' = seal + wordmark lockup. */
  variant?: 'mark' | 'full'
  className?: string
  /** Pixel size of the seal mark. */
  size?: number
  /** Animate the seal ring drawing in (hero use). */
  animate?: boolean
}

/**
 * Kizuna hanko-style seal: the 絆 kanji inside an inked maker's-seal ring,
 * rendered as crisp SVG. Gradient ember→gold ink on the ring.
 */
export function LogoMark({
  className,
  size = 40,
  animate = false,
}: Omit<LogoProps, 'variant'>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      role="img"
      aria-label="Kizuna Performance seal"
      className={cn('shrink-0', className)}
    >
      <defs>
        <linearGradient id="kz-ink" x1="10" y1="6" x2="90" y2="94">
          <stop offset="0%" stopColor="#FF6A2B" />
          <stop offset="48%" stopColor="#E7B24C" />
          <stop offset="100%" stopColor="#F6D488" />
        </linearGradient>
      </defs>

      {/* Outer inked ring — broken dashes give a hand-carved hanko feel */}
      <circle
        cx="50"
        cy="50"
        r="46"
        stroke="url(#kz-ink)"
        strokeWidth="3.25"
        strokeLinecap="round"
        strokeDasharray="72 6 120 6 72"
        style={
          animate
            ? {
                // total circumference ~289; animate the draw
                strokeDasharray: 289,
                strokeDashoffset: 289,
                animation: 'draw-seal 1.4s ease-out 0.2s forwards',
              }
            : undefined
        }
      />
      {/* Inner hairline ring */}
      <circle cx="50" cy="50" r="39" stroke="url(#kz-ink)" strokeWidth="1" opacity="0.5" />

      {/* Kanji */}
      <text
        x="50"
        y="50"
        dy="0.35em"
        textAnchor="middle"
        fontSize="46"
        fontFamily="'Noto Sans JP','Inter',sans-serif"
        fontWeight={700}
        fill="url(#kz-ink)"
      >
        絆
      </text>
    </svg>
  )
}

export function Logo({ variant = 'full', className, size = 40, animate }: LogoProps) {
  if (variant === 'mark') {
    return <LogoMark className={className} size={size} animate={animate} />
  }
  return (
    <span className={cn('flex items-center gap-3', className)}>
      <LogoMark size={size} animate={animate} />
      <span className="flex flex-col leading-none">
        <span className="font-display text-base font-bold uppercase tracking-[0.22em] text-washi">
          Kizuna
        </span>
        <span className="text-[0.6rem] font-medium uppercase tracking-[0.4em] text-kin">
          Performance
        </span>
      </span>
    </span>
  )
}

export default Logo
