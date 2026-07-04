'use client'

import { motion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

const variants: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 },
  }),
}

export interface RevealProps {
  children: ReactNode
  /** Stagger index — multiplies the delay. */
  index?: number
  className?: string
  as?: 'div' | 'section' | 'li' | 'span'
}

/** Fades + rises its children in when scrolled into view (once). */
export function Reveal({ children, index = 0, className, as = 'div' }: RevealProps) {
  const MotionTag = motion[as]
  return (
    <MotionTag
      className={className}
      custom={index}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
    >
      {children}
    </MotionTag>
  )
}

export default Reveal
