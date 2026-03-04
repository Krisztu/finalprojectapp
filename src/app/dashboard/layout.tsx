'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && user) {
      // Ne irányítson át, ha már a megfelelő útvonalban van
      if (role === 'principal' && !pathname.startsWith('/principal')) {
        router.push('/principal/dashboard')
      } else if (role === 'parent' && !pathname.startsWith('/parent')) {
        router.push('/parent/dashboard')
      }
    }
  }, [user, role, loading, router, pathname])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Betöltés...</div>
  }

  if (!user) {
    router.push('/')
    return null
  }

  return children
}
