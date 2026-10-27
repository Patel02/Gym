import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge Tailwind CSS classes intelligently
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * DOTS (Defeat The Odds Squared) Calculator
 * Calculates relative strength score for powerlifters
 * @param bodyweight - Athlete's bodyweight in kg
 * @param total - Total lifted weight (squat + bench + deadlift) in kg
 * @returns DOTS score
 */
export function calculateDOTS(bodyweight: number, total: number): number {
  // DOTS coefficients (male formula - can be adjusted for female)
  const dotsCoefficients = {
    a: -307.75076,
    b: 24.0900756,
    c: -0.1093119,
    d: 0.00077068,
  }

  const denominator = 
    dotsCoefficients.a +
    dotsCoefficients.b * bodyweight +
    dotsCoefficients.c * Math.pow(bodyweight, 2) +
    dotsCoefficients.d * Math.pow(bodyweight, 3)

  return Math.round((total / denominator) * 100)
}

/**
 * Wilks Score Calculator
 * Another popular relative strength formula
 * @param bodyweight - Athlete's bodyweight in lbs
 * @param total - Total lifted weight in lbs
 * @returns Wilks score
 */
export function calculateWilks(bodyweight: number, total: number): number {
  const wilksCoefficients = {
    a: -216.0475144,
    b: 16.2606339,
    c: -0.002388645,
    d: -0.00000053,
  }

  const denominator =
    wilksCoefficients.a +
    wilksCoefficients.b * bodyweight +
    wilksCoefficients.c * Math.pow(bodyweight, 2) +
    wilksCoefficients.d * Math.pow(bodyweight, 3)

  return Math.round((total / denominator) * 100)
}

/**
 * Format number to currency
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj)
}

/**
 * Delay function for async operations
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Convert kg to lbs
 */
export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462)
}

/**
 * Convert lbs to kg
 */
export function lbsToKg(lbs: number): number {
  return Math.round(lbs / 2.20462)
}
