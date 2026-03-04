'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function DashboardRedirect() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const checkRole = async () => {
      if (!user) {
        router.push('/')
        return
      }

      const response = await fetch(`/api/users?email=${user.email}`)
      if (response.ok) {
        const users = await response.json()
        const userData = users[0]
        
        if (userData?.role === 'parent') {
          router.push('/dashboard/parent')
        } else if (userData?.role === 'principal') {
          router.push('/dashboard/principal')
        }
      }
    }

    checkRole()
  }, [user, router])

  return null
}
