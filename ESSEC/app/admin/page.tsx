'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/api'

export default function AdminRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new admin dashboard route
    // Check if user is authenticated, if so go to dashboard, otherwise login
    const token = auth.getToken()
    if (token) {
      router.replace('/admin-dashboard')
    } else {
      router.replace('/admin/login')
    }
  }, [router])

  // Show loading state during redirect
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <div>Redirecting...</div>
    </div>
  )
}
