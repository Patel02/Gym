'use client'

import { useState, useEffect } from 'react'
import type { Athlete, ApiResponse } from '@/types'

export function useAthlete(athleteId: string) {
  const [athlete, setAthlete] = useState<Athlete | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!athleteId) {
      return
    }

    const fetchAthlete = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/athletes/${athleteId}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch athlete data')
        }

        const data: ApiResponse<Athlete> = await response.json()
        
        if (data.success && data.data) {
          setAthlete(data.data)
          setError(null)
        } else {
          throw new Error(data.error || 'Unknown error')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setAthlete(null)
      } finally {
        setLoading(false)
      }
    }

    fetchAthlete()
  }, [athleteId])

  return { athlete, loading: athleteId ? loading : false, error }
}
