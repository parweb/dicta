/**
 * Component Variants
 * CVA (class-variance-authority) variants for common components
 */

import { cva, type VariantProps } from 'class-variance-authority'

/**
 * Button variants
 */
export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        icon: 'bg-transparent hover:bg-accent rounded-lg'
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

export type ButtonVariants = VariantProps<typeof buttonVariants>

/**
 * Navigation button variants (for Layout)
 */
export const navButtonVariants = cva(
  'flex items-center gap-2 rounded-lg p-3 transition-colors cursor-pointer',
  {
    variants: {
      active: {
        true: 'bg-white text-slate-900 rounded-full',
        false: 'bg-transparent text-gray-200 hover:text-white'
      }
    },
    defaultVariants: {
      active: false
    }
  }
)

export type NavButtonVariants = VariantProps<typeof navButtonVariants>

/**
 * Tab button variants (for Settings)
 */
export const tabButtonVariants = cva(
  'flex items-center gap-2 px-4 py-3 border-b-2 transition-colors cursor-pointer',
  {
    variants: {
      active: {
        true: 'border-white text-white font-medium',
        false: 'border-transparent text-gray-400 hover:text-gray-200'
      }
    },
    defaultVariants: {
      active: false
    }
  }
)

export type TabButtonVariants = VariantProps<typeof tabButtonVariants>

/**
 * Card variants
 */
export const cardVariants = cva(
  'rounded-xl border bg-card text-card-foreground shadow-sm',
  {
    variants: {
      variant: {
        default: 'border-border',
        outline: 'border-2 border-border',
        ghost: 'border-transparent shadow-none'
      },
      padding: {
        default: 'p-6',
        sm: 'p-4',
        lg: 'p-8',
        none: 'p-0'
      }
    },
    defaultVariants: {
      variant: 'default',
      padding: 'default'
    }
  }
)

export type CardVariants = VariantProps<typeof cardVariants>

/**
 * Input variants
 */
export const inputVariants = cva(
  'flex w-full rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-input',
        error: 'border-destructive focus-visible:ring-destructive'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

export type InputVariants = VariantProps<typeof inputVariants>
