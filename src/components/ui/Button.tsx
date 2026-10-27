'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  asChild?: boolean
  children: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'font-bold uppercase tracking-wide transition-all duration-300 rounded-lg inline-block'

    const variants = {
      primary:
        'bg-gym-primary hover:bg-gym-accent text-gym-black disabled:opacity-50 disabled:cursor-not-allowed',
      secondary:
        'border-2 border-gym-primary text-gym-primary hover:bg-gym-primary hover:text-gym-black disabled:opacity-50 disabled:cursor-not-allowed',
      ghost:
        'text-gym-primary hover:text-gym-accent underline-offset-4 hover:underline disabled:opacity-50 disabled:cursor-not-allowed',
    }

    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    }

    const buttonClasses = cn(
      baseStyles,
      variants[variant],
      sizes[size],
      className
    )

    if (asChild) {
      return (
        <div className={buttonClasses}>
          {children}
        </div>
      )
    }

    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        className={buttonClasses}
        {...props}
      >
        {isLoading ? 'Loading...' : children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
