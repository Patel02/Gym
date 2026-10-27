'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: 'default' | 'premium' | 'minimal'
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-gym-dark border border-gym-primary/20 rounded-lg p-6',
      premium:
        'bg-gym-dark border-2 border-gym-primary/50 rounded-lg p-8 shadow-lg hover:shadow-[0_0_20px_rgba(201,162,39,0.2)] transition-all duration-300',
      minimal: 'bg-transparent rounded-lg p-4',
    }

    return (
      <div
        ref={ref}
        className={cn(variants[variant], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export default Card
